const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/all', async (req, res) => {
  const Shop = mongoose.model('Shop');
  try {
    const shops = await Shop.find({});
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;