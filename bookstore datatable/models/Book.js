const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    publisher: String,
    publishedYear: Number,
    language: { type: String, default: 'English' },
    coverImage: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
