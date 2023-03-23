const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Get Cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (cart && cart.items.length > 0) return res.json(cart);
    return res.json({ msg: " Your cart is empty" });
  } catch (e) {
    return res.json({ e, msg: "No cart found" });
  }
});

// Add to Cart
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.isAdmin) return res.json({ msg: "You cannot shop" });
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    const cart = await Cart.findOne({ user: req.user._id });

    if (quantity > product.quantity) {
      return res.json({ msg: "Cannot exceed quantity available" });
    }

    // If Cart is Empty
    if (cart === null) {
      const myCart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity,
            subtotal: product.price * quantity,
          },
        ],
        total: product.price * quantity,
      });
      await myCart.save();
      return res.json({ msg: "Product added to cart successfully", myCart });
    }

    if (cart) {
      const foundItem = cart.items.find((item) => item.product == productId);
      if (foundItem) {
        foundItem.quantity += quantity;
        if (foundItem.quantity > product.quantity)
          return res.json({ msg: "Cannot exceed available quantity" });

        //foundItem.subtotal += quantity * product.price;
        // RECALCULATE SUBTOTAL
        foundItem.subtotal = foundItem.quantity * product.price;
        let total = 0;
        cart.total = cart.items.map((p) => (total += p.subtotal));
        cart.total = total;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          subtotal: product.price * quantity,
        });
        cart.total += product.price * quantity;
      }
      await cart.save();
      return res.json({ msg: "Added to cart successfully", cart });
    }
  } catch (e) {
    return res.json({ e, msg: "Cannot add to cart" });
  }
});

// DELETE A SPECIFIC ITEM IN THE CART
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ msg: "No such product exist" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    cart.items = cart.items.filter((item) => item.product != req.params.id);
    let total = 0;
    cart.items.map((p) => (total += p.subtotal));
    cart.total = total;

    await cart.save();
    return res.json({ msg: "Cart Item Removed", cart });
  } catch (e) {
    return res.json({ e, msg: "Unable to Remove Item in Cart" });
  }
});

// DELETE THE CART IF THE LOGGED IN USER OWNS THE CART
router.delete("/", auth, async (req, res) => {
  try {
    // FIND CART USING BY THE USER IF WHO IS LOGGED IN ID THEY OWN THAT CART DELETE THE CART
    //  IF NOT RETURN A RESPONSE THAT SAYS "NOT ALLOWED or UNAUTHORIZED"

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.json({ msg: "No cart found" });

    if (cart.user != req.user._id) return res.json({ msg: "Unauthorized" });

    let deleteCart = await Cart.findByIdAndDelete(cart._id);
    return res.json({ msg: "Cart Deleted Successfully", deleteCart });
  } catch (e) {
    return res.json({ e, msg: "Unable to Delete Cart" });
  }
});

module.exports = router;
