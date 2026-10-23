const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');


module.exports = (Model, label) => {
  const r = express.Router();

  r.get('/', async (req, res, next) => {
    try { res.json(await Model.find().sort('name')); } catch (e) { next(e); }
  });

  r.get('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: `${label} not found` });
      res.json(doc);
    } catch (e) { next(e); }
  });

  r.post('/', protect, adminOnly, async (req, res, next) => {
    try { res.status(201).json(await Model.create(req.body)); } catch (e) { next(e); }
  });

  r.put('/:id', protect, adminOnly, async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true,
      });
      if (!doc) return res.status(404).json({ message: `${label} not found` });
      res.json(doc);
    } catch (e) { next(e); }
  });

  r.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: `${label} not found` });
      res.json({ message: `${label} deleted` });
    } catch (e) { next(e); }
  });

  return r;
};
