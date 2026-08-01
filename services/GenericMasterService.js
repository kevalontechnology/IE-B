const mongoose = require('mongoose');
const MASTER_CONFIG = require('../config/master.config');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class GenericMasterService {
  getModel(masterType) {
    const config = MASTER_CONFIG[masterType];
    if (!config) {
      const error = new Error(`Invalid master module type: '${masterType}'`);
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    return {
      model: mongoose.model(config.modelName),
      config,
    };
  }

  async getAll(masterType, query) {
    const { model, config } = this.getModel(masterType);
    const { page = 1, limit = 10, search = '', status, sortBy, sortOrder = 'asc', withDeleted = false } = query;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = config.searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }

    const sortField = sortBy || Object.keys(config.defaultSort)[0];
    const sortOptions = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const findQuery = model.find(filter).sort(sortOptions).skip(skip).limit(Number(limit));
    if (withDeleted) findQuery.where({ withDeleted: true });

    const [items, total] = await Promise.all([findQuery, model.countDocuments(filter)]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      config,
    };
  }

  async getById(masterType, id) {
    const { model } = this.getModel(masterType);
    const item = await model.findById(id);
    if (!item) {
      const error = new Error('Master record not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return item;
  }

  async create(masterType, data, req) {
    const { model, config } = this.getModel(masterType);
    const nameValue = data[config.nameField];

    // Uniqueness validation check
    const existing = await model.findOne({ [config.nameField]: nameValue });
    if (existing) {
      const error = new Error(`Record with ${config.nameField} '${nameValue}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const record = await model.create({
      ...data,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await createAuditLog(req, {
      action: 'CREATE_MASTER',
      module: config.displayName,
      description: `Created ${config.singularName} '${nameValue}'`,
      recordId: record._id.toString(),
    });

    return record;
  }

  async update(masterType, id, data, req) {
    const { model, config } = this.getModel(masterType);
    const record = await model.findById(id);

    if (!record) {
      const error = new Error('Master record not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const updated = await model.findByIdAndUpdate(
      id,
      { ...data, updatedBy: req.user._id },
      { new: true }
    );

    await createAuditLog(req, {
      action: 'UPDATE_MASTER',
      module: config.displayName,
      description: `Updated ${config.singularName} '${updated[config.nameField]}'`,
      recordId: updated._id.toString(),
    });

    return updated;
  }

  async toggleStatus(masterType, id, req) {
    const { model, config } = this.getModel(masterType);
    const record = await model.findById(id);

    if (!record) {
      const error = new Error('Master record not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const newStatus = record.status === 'Active' ? 'Inactive' : 'Active';
    record.status = newStatus;
    record.updatedBy = req.user._id;
    await record.save();

    await createAuditLog(req, {
      action: 'TOGGLE_MASTER_STATUS',
      module: config.displayName,
      description: `Toggled status for '${record[config.nameField]}' to ${newStatus}`,
      recordId: record._id.toString(),
    });

    return record;
  }

  async softDelete(masterType, id, req) {
    const { model, config } = this.getModel(masterType);
    const record = await model.findById(id);

    if (!record) {
      const error = new Error('Master record not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // MASTER DEPENDENCY VALIDATION CHECK
    if (config.dependencyModels && config.dependencyModels.length > 0) {
      for (const dep of config.dependencyModels) {
        try {
          const DepModel = mongoose.model(dep.model);
          const count = await DepModel.countDocuments({ [dep.path]: id });
          if (count > 0) {
            const error = new Error('This record is already in use and cannot be deleted.');
            error.statusCode = HTTP_STATUS.CONFLICT;
            throw error;
          }
        } catch (err) {
          if (err.statusCode) throw err;
        }
      }
    }

    await record.softDelete(req.user._id);

    await createAuditLog(req, {
      action: 'DELETE_MASTER',
      module: config.displayName,
      description: `Soft-deleted ${config.singularName} '${record[config.nameField]}'`,
      recordId: record._id.toString(),
    });

    return record;
  }

  async restore(masterType, id, req) {
    const { model, config } = this.getModel(masterType);
    const record = await model.findOne({ _id: id, withDeleted: true });

    if (!record) {
      const error = new Error('Deleted master record not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    await record.restore();

    await createAuditLog(req, {
      action: 'RESTORE_MASTER',
      module: config.displayName,
      description: `Restored ${config.singularName} '${record[config.nameField]}'`,
      recordId: record._id.toString(),
    });

    return record;
  }
}

module.exports = new GenericMasterService();
