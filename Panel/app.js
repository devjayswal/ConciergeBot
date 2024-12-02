const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const { user, restaurant, Order } = require("./Schema.js");
const { 
  get_user_info, 
  initiateOrder, 
  fetchDishes, 
  updateTempOrder, 
  confirmOrder,  
  generatePaymentQR 
} = require('./functions.js');


const app = express();
const port = 3000;

// MongoDB connection
const uri = process.env.MONGO_DB_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// GET routes
app.get("/api/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const users = await user
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const restaurants = await restaurant
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(restaurants);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});


// POST routes
app.post("/api/users", async (req, res) => {
  try {
    const newuser = new user(req.body);
    await newuser.save();
    res.status(201).json(newuser);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/restaurants", async (req, res) => {
  try {
    const newrestaurants = new restaurants(req.body);
    await newrestaurants.save();
    res.status(201).json(newrestaurants);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).send(error);
  }
});








app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
