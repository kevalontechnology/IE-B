const jwt = require('jsonwebtoken');
const useragent = require('useragent');
const userRepo = require('../repositories/userRepo');
const LoginHistory = require('../models/LoginHistory');
const Notification = require('../models/Notification');
const { createAuditLog } = require('../middleware/auditMiddleware');
const { ROLES, USER_STATUS } = require('../constants/roles');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class AuthService {
  generateTokens(user) {
    const payload = { id: user._id, role: user.role, email: user.email, fullName: user.fullName };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET || 'export_crm_jwt_access_secret_key_2026_secure_key',
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'export_crm_jwt_refresh_secret_key_2026_secure_key',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    return { accessToken, refreshToken };
  }

  async registerUser(data, req) {
    // Enforce role restriction: Admin accounts CANNOT be registered from UI
    if (data.role === ROLES.ADMIN) {
      const error = new Error('Admin accounts cannot be registered. Contact system administrator.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('User with this email already exists.');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const newUser = await userRepo.create({
      fullName: data.fullName,
      companyName: data.companyName,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      role: data.role,
      status: USER_STATUS.PENDING, // Every newly registered user has PENDING status
    });

    // Notify all Admins of new pending registration
    await Notification.create({
      recipient: null, // Admin broadcast
      targetRole: ROLES.ADMIN,
      type: 'NEW_REGISTRATION',
      title: 'New User Registration',
      message: `${newUser.fullName} (${newUser.companyName}) registered as ${newUser.role} and requires approval.`,
      link: '/admin/users',
    });

    await createAuditLog(req, {
      action: 'USER_REGISTER',
      module: 'AUTH',
      description: `User ${newUser.email} registered with status Pending`,
      recordId: newUser._id.toString(),
    });

    return {
      message: 'Your account is waiting for Admin Approval.',
      status: USER_STATUS.PENDING,
    };
  }

  async login(email, password, req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const agent = useragent.parse(req.headers['user-agent']);
    const browser = `${agent.family} ${agent.major}`;
    const os = agent.os.toString();
    const device = agent.device.toString();

    const user = await userRepo.findByEmail(email);

    if (!user) {
      await LoginHistory.create({
        email,
        ipAddress,
        browser,
        os,
        device,
        status: 'Failed',
        failureReason: 'Invalid email or password',
      });
      const error = new Error('Invalid email or password.');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await LoginHistory.create({
        user: user._id,
        email,
        ipAddress,
        browser,
        os,
        device,
        status: 'Failed',
        failureReason: 'Invalid password',
      });
      const error = new Error('Invalid email or password.');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // Check Approval Status
    if (user.status === USER_STATUS.PENDING) {
      await LoginHistory.create({
        user: user._id,
        email,
        ipAddress,
        browser,
        os,
        device,
        status: 'Pending',
        failureReason: 'Waiting for Admin Approval',
      });
      const error = new Error('Your account is waiting for Admin Approval.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    if (user.status === USER_STATUS.BLOCKED || user.status === USER_STATUS.DEACTIVATED || user.status === USER_STATUS.REJECTED) {
      await LoginHistory.create({
        user: user._id,
        email,
        ipAddress,
        browser,
        os,
        device,
        status: 'Blocked',
        failureReason: `Account is ${user.status}`,
      });
      const error = new Error(`Your account has been ${user.status.toLowerCase()}. Please contact Admin.`);
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Login successful
    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await LoginHistory.create({
      user: user._id,
      email,
      ipAddress,
      browser,
      os,
      device,
      status: 'Success',
    });

    req.user = user;
    await createAuditLog(req, {
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${user.email} logged in successfully`,
      recordId: user._id.toString(),
    });

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        companyName: user.companyName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh Token is required.');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'export_crm_jwt_refresh_secret_key_2026_secure_key'
      );
      const user = await userRepo.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        const error = new Error('Invalid or expired refresh token.');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      const tokens = this.generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (err) {
      const error = new Error('Invalid refresh token.');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }
  }

  async updateUserStatus(userId, status, req) {
    const user = await userRepo.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (user.role === ROLES.ADMIN) {
      const error = new Error('Admin status cannot be modified.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    // Create notification for user
    await Notification.create({
      recipient: user._id,
      type: 'USER_STATUS_CHANGE',
      title: 'Account Status Updated',
      message: `Your account status has been updated to ${status}.`,
    });

    await createAuditLog(req, {
      action: 'UPDATE_USER_STATUS',
      module: 'USER',
      description: `Admin updated status for ${user.email} from ${previousStatus} to ${status}`,
      recordId: user._id.toString(),
    });

    return user;
  }
}

module.exports = new AuthService();
