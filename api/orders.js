const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

//  CHECKOUT
router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      let myCart = await Order.create({
        user: req.user._id,
        items: cart.items,
        total: cart.total,
      });

      await myCart.save();

      //then empty the cart
      await Cart.findByIdAndDelete(cart._id);
      return res.json({ msg: "Checkout Successfully" });
    } else {
      return res.json({ msg: "Your cart is empty" });
    }
  } catch (e) {
    return res.json({ e, msg: "No cart found" });
  }
});

// Get Orders
router.get("/", auth, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user._id });
    if (orders && orders.length >= 1) return res.json(orders);
    return res.json({ msg: "Order is empty" });
  } catch (e) {
    return res.json({ e, msg: "No orders found" });
  }
});

module.exports = router;
