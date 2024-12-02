import mongoose from 'mongoose';
const { Schema } = mongoose;

// Simplified Address Schema
const addressSchema = new Schema({
  address: { type: String, required: true },
  tag: { type: String, required: true },
});

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true, match: /^\+91\d{10}$/ },
  addresses: [addressSchema], // User can have multiple addresses
});

// Dish Schema
const dishSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Order Schema
const orderSchema = new Schema({
  order_id: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user
  dishes: [dishSchema], // List of ordered dishes
  total_amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'] },
  timestamp: { type: Date, default: Date.now }, // Order creation timestamp
});

// Restaurant Schema
const restaurantSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  google_pin: { type: String, required: true },
  menu: [
    {
      dish: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

// Chat Schema (Optional, for support purposes)
const chatSchema = new Schema({
  message: String,
  reply: String,
  timestamp: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Chat = mongoose.model('Chat', chatSchema);

export { User, Order, Restaurant, Chat };
