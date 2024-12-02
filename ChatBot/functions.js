import { User, Order, Restaurant } from './Schema.js';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

const { ObjectId } = mongoose.Types;

// Create a new user
async function createUser(data) {
  try {
    const newUser = new User(data);
    await newUser.save();
    console.log("User created successfully");
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Get user by phone number
async function getUser(phone_number) {
  try {
    const userInfo = await User.findOne({ phone_number });
    if (!userInfo) {
      return { message: "User not found" };
    }
    console.log("User retrieved successfully");
    return userInfo;
  } catch (error) {
    console.error("Error retrieving user:", error);
    throw error;
  }
}

// Create a restaurant
async function createRestaurant(data) {
  try {
    const newRestaurant = new Restaurant(data);
    await newRestaurant.save();
    console.log("Restaurant created successfully");
    return newRestaurant;
  } catch (error) {
    console.error("Error creating restaurant:", error);
    throw error;
  }
}

// Get restaurant by ID
async function getRestaurant(restaurantId) {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { message: "Restaurant not found" };
    }
    console.log("Restaurant retrieved successfully");
    return restaurant;
  } catch (error) {
    console.error("Error retrieving restaurant:", error);
    throw error;
  }
}

// Create an order
async function createOrder(data) {
  try {
    const newOrder = new Order(data);
    await newOrder.save();
    console.log("Order created successfully");
    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

// Get order by ID
async function getOrder(orderId) {
  try {
    const order = await Order.findById(orderId).populate('user_id', 'name phone_number');
    if (!order) {
      return { message: "Order not found" };
    }
    console.log("Order retrieved successfully");
    return order;
  } catch (error) {
    console.error("Error retrieving order:", error);
    throw error;
  }
}

// Get all orders for a user
async function getOrdersByUser(userId) {
  try {
    const orders = await Order.find({ user_id: userId });
    console.log("Orders retrieved successfully");
    return orders;
  } catch (error) {
    console.error("Error retrieving orders:", error);
    throw error;
  }
}

// Generate payment QR code for an order
async function generatePaymentQR(orderId) {
  try {
    const order = await Order.findOne({ order_id: orderId });
    if (!order) {
      throw new Error("Order not found");
    }

    const amount = order.total_amount;
    const upiUrl = `upi://pay?pa=merchant@upi&am=${amount}`;
    const qrCode = await QRCode.toDataURL(upiUrl);
    console.log("Payment QR generated successfully");
    return qrCode;
  } catch (error) {
    console.error("Error generating payment QR:", error);
    throw error;
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.status = status;
    await order.save();
    console.log(`Order status updated to ${status}`);
    return order;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

// Delete a user
async function deleteUser(userId) {
  try {
    await User.findByIdAndDelete(userId);
    console.log("User deleted successfully");
    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Delete an order
async function deleteOrder(orderId) {
  try {
    await Order.findByIdAndDelete(orderId);
    console.log("Order deleted successfully");
    return { message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

export {
  createUser,
  getUser,
  createRestaurant,
  getRestaurant,
  createOrder,
  getOrder,
  getOrdersByUser,
  generatePaymentQR,
  updateOrderStatus,
  deleteUser,
  deleteOrder,
};
