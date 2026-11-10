const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  { key: { type: String, unique: true, required: true }, data: { type: mongoose.Schema.Types.Mixed, default: {} } },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
