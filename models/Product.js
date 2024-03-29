const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  isActive: { type: String, default: true },
});

module.exports = mongoose.model("Product", ProductSchema);
