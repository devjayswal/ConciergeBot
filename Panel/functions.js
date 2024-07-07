const { user, restaurant, Order } = require('./Schema.js');
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const { ObjectId } = mongoose.Types;
const temporaryOrders = {}; // Store temporary orders

// Function to get user info by phone number
async function get_user_info(phone_number) {
  try {
    const userInfo = await user.findOne({ phone_number });
    if (!userInfo) {
      return { message: 'User not found' };
    }
    console.log(userInfo);
    return userInfo;
  } catch (error) {
    console.error('Error retrieving user info', error);
    return { message: 'Error retrieving user info', error };
  }
}

// Function to initiate an order
const initiateOrder = async (phone_number) => {
  try {
    const userRecord = await user.findOne({ phone_number });
    if (!userRecord) {
      throw new Error('User not found');
    }

    temporaryOrders[phone_number] = {
      user: userRecord,
      items: [],
      totalAmount: 0,
    };
    console.log(`Order initiated for user: ${phone_number}`);
  } catch (error) {
    console.error('Error initiating order:', error);
    throw error;
  }
};

// Function to fetch all dishes
const fetchDishes = async () => {
  try {
    const dishes = await restaurant.aggregate([
      { $unwind: '$Menu' },
      {
        $project: {
          _id: 0,
          dishName: '$Menu.Dish',
          portionSize: '$Menu.PortionSize',
          price: '$Menu.Price',
          restaurantName: '$RestoName',
          pic: '$Menu.Pic',
          google_pin: '486771',
        }
      }
    ]);
    console.log(dishes);
    return dishes;
  } catch (error) {
    console.error('Error fetching dishes:', error);
    throw error;
  }
};

// Function to update the temporary order
const updateTempOrder = (phone_number, selectedDishes) => {
  const tempOrder = temporaryOrders[phone_number];
  if (!tempOrder) {
    throw new Error('No order initiated for this user.');
  }
  selectedDishes.forEach(dish => {
    tempOrder.items.push({
            dish_name: dish.dishName,
            quantity: dish.quantity,
            price: dish.price,
            pic: 'this is pic', // Include 'pic' field from schema
    });
    tempOrder.totalAmount += dish.price * dish.quantity;
  });
  console.log(`Temporary order updated for user: ${phone_number}`);
};

// Function to confirm the order with the user
const confirmOrder = async (phone_number) => {
  try {
    const tempOrder = temporaryOrders[phone_number];
    if (!tempOrder) {
      throw new Error('No order initiated for this user.');
    }

    const userRecord = tempOrder.user;
    const newOrder = new Order({
      order_id: new ObjectId().toString(),
      order_details: {
        total_amount: tempOrder.totalAmount,
        order_date: new Date(),
        status: 'Confirmed',
        dish_details: tempOrder.items,
      },
      customer_details: {
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone_number,
        delivery_address: {
            ...userRecord.Addresses[0], // Assuming this contains necessary fields
            google_pin: '486771', // Add the necessary field
          }, // Assuming the first address is used
      },
      restaurant_details: {
        resto_name: 'Example Restaurant',
        address: 'Example Address',
        google_pin: 'Example Pin',
        branches: [],
        distance_kms: 0,
      },
      upi_acknowledgement_id: 'this_is_upi_ack_id',
      upi_status: 'Completed',
      timestamp: new Date(),
    });

    await newOrder.save();
    delete temporaryOrders[phone_number];
    console.log(`Order confirmed for user: ${phone_number}`);
    return newOrder.order_id;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};



// Function to generate a random QR code for payment
const generatePaymentQR = async (phone_number, order_id) => {
  try {
    const order = await Order.findOne({ 'customer_details.phone': phone_number, order_id });
    if (!order || order.order_details.status !== 'Confirmed') {
      throw new Error('Order not found or not confirmed');
    }

    const qrCode = await QRCode.toDataURL('https://example.com/payment'); // Replace with actual payment link in production
    console.log(qrCode);
    return qrCode;
  } catch (error) {
    console.error('Error generating payment QR:', error);
    throw error;
  }
};





module.exports = {
  get_user_info,
  initiateOrder,
  fetchDishes,
  updateTempOrder,
  confirmOrder,
  generatePaymentQR,
};
