const express = require("express");
const app = express();
const PORT = 5127;
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { DB_HOST, DB_NAME, DB_PORT } = process.env;
//  Local DB COnnection
// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

// Online DB Connection
mongoose.connect(
  "mongodb://mongo:E0RqLrKjNcIWRvUEkbty@containers-us-west-189.railway.app:7871/test"
);

app.use(cors());
app.use(express.json());

app.use("/users", require("./api/users"));
app.use("/products", require("./api/products"));
app.use("/carts", require("./api/carts"));
app.use("/orders", require("./api/orders"));

app.listen(PORT, () => console.log("Server is running on port: " + PORT));
mongoose.connection.once("open", () => console.log("Connected to MongoDB"));
