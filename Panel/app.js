const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const port = 3000;

// MongoDB connection
const uri = process.env.MONGO_DB_URI;

mongoose.connect(uri)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  
  }
});

// Define the schema for a restaurants branch
const branchSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  google_pin: {
    type: String,
    required: true
  }
});

// Define the main users schema
const userschema = new Schema({
  name: {
    type: String,
    required: true
  },
  DOB: {
    type: Date,
    required: true
  },
  email: {
    type: String,
  },
  phone_number: {
    type: String,
    required: true,
    match: /^\+91\d{10}$/
  },
  Addresses: [addressSchema],
  food_choices: {
    type: String,
  },
  food_preferences: {
    type: [String],
    default: []
  },
  health_conditions: {
    type: [String],
    default: []
  },
  allergies: {
    type: [String],
    default: []
  },
  non_veg_days: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: []
  }
});


// Define the schema for a menu item
const menuItemSchema = new Schema({
  Dish: {
    type: String,
    required: true
  },
  PortionSize: {
    type: String,
    required: true
  },
  Price: {
    type: Number,
    required: true
  },
  Pic: {
    type: String,
    required: true
  }
});



// Define the main restaurants schema
const restaurantSchema = new Schema({
  RestoName: {
    type: String,
    required: true
  },
  Menu: {
    type: [menuItemSchema],
    required: true
  },
  Address: {
    type: String,
    required: true
  },
  GooglePinLocation: {
    type: String,
    required: true
  },
  Branches: {
    type: [branchSchema],
    required: true
  }
});


// Define the schema for a dish detail
const dishDetailSchema = new Schema({
  dish_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  pic: {
    type: String,
    required: true
  }
});

// Define the schema for the delivery address
const deliveryAddressSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  google_pin: {
    type: String,
    required: true
  }
});

// Define the schema for the customer details
const customerDetailSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/
  },
  phone: {
    type: String,
    required: true,
    match: /^\+\d{1,15}$/
  },
  delivery_address: deliveryAddressSchema
});




// Define the schema for the restaurants details
const restaurantDetailSchema = new Schema({
  resto_name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  google_pin: {
    type: String,
    required: true
  },
  branches: {
    type: [branchSchema],
    required: true
  },
  distance_kms: {
    type: Number,
    required: true
  }
});

// Define the main order schema
const orderschema = new Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  order_details: {
    total_amount: {
      type: Number,
      required: true
    },
    order_date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed']
    },
    dish_details: {
      type: [dishDetailSchema],
      required: true
    }
  },
  customer_details: customerDetailSchema,
  restaurant_details: restaurantDetailSchema,
  upi_acknowledgement_id: {
    type: String,
    required: true
  },
  upi_status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Failed']
  },
  timestamp: {
    type: Date,
    required: true
  }
});



const user = mongoose.model('user', userschema);
const restaurant = mongoose.model('restaurant', restaurantSchema);
const Order = mongoose.model('Order', orderschema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET routes
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const users = await user.find().skip((page - 1) * limit).limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const restaurants = await restaurant.find().skip((page - 1) * limit).limit(limit);
    res.json(restaurants);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const orders = await Order.find().skip((page - 1) * limit).limit(limit);
    res.json(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// POST routes
app.post('/api/users', async (req, res) => {
  try {
    const newuser = new user(req.body);
    await newuser.save();
    res.status(201).json(newuser);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/restaurants', async (req, res) => {
  try {
    const newrestaurants = new restaurants(req.body);
    await newrestaurants.save();
    res.status(201).json(newrestaurants);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
