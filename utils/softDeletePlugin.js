const mongoose = require('mongoose');

function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  const types = ['find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany', 'countDocuments'];

  types.forEach((type) => {
    schema.pre(type, function () {
      if (this.getFilter().withDeleted) {
        delete this.getFilter().withDeleted;
        return;
      }
      this.where({ isDeleted: { $ne: true } });
    });
  });

  schema.methods.softDelete = function (userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (userId) this.deletedBy = userId;
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };
}

module.exports = softDeletePlugin;
