const router = require('express').Router();
const Order = require('../models/Order');
const Book = require('../models/Book');
const { protect, adminOnly } = require('../middleware/auth');


router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'Order must contain at least one item' });

    const orderItems = [];
    let totalAmount = 0;
    const reserved = [];

    try {
      for (const it of items) {
        const qty = Number(it.quantity);
        if (!Number.isInteger(qty) || qty < 1)
          throw Object.assign(new Error('Invalid quantity'), { status: 400 });

        
        const book = await Book.findOneAndUpdate(
          { _id: it.book, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
        if (!book)
          throw Object.assign(new Error(`Book unavailable or insufficient stock: ${it.book}`), { status: 400 });

        reserved.push({ id: book._id, qty });
        orderItems.push({ book: book._id, quantity: qty, price: book.price });
        totalAmount += book.price * qty;
      }

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        totalAmount,
        shippingAddress: shippingAddress || req.user.address,
        paymentMethod,
      });
      res.status(201).json(order);
    } catch (err) {
   
      await Promise.all(reserved.map((r) => Book.findByIdAndUpdate(r.id, { $inc: { stock: r.qty } })));
      throw err;
    }
  } catch (err) { next(err); }
});


router.get('/my', protect, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).populate('items.book', 'title price').sort('-createdAt'));
  } catch (err) { next(err); }
});


router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    res.json(await Order.find().populate('user', 'name email').populate('items.book', 'title').sort('-createdAt'));
  } catch (err) { next(err); }
});


router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.book', 'title price');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not allowed' });
    res.json(order);
  } catch (err) { next(err); }
});


router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});


router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== String(req.user._id))
      return res.status(403).json({ message: 'Not allowed' });
    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });

    await Promise.all(order.items.map((i) => Book.findByIdAndUpdate(i.book, { $inc: { stock: i.quantity } })));
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router;
