const router = require('express').Router();
const Book = require('../models/Book');
const { protect, adminOnly } = require('../middleware/auth');


router.get('/', async (req, res, next) => {
  try {
    const { search, category, author, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (author) filter.author = author;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate('author', 'name')
        .populate('category', 'name')
        .sort(sort.split(',').join(' '))
        .skip((page - 1) * limit)
        .limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), count: books.length, books });
  } catch (err) { next(err); }
});


router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').populate('category');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
});


router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    res.status(201).json(await Book.create(req.body));
  } catch (err) { next(err); }
});


router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
});


router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
