const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    country: { type: String, default: '' },
    birthYear: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Author', authorSchema);
