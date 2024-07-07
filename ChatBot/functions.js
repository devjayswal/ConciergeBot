import { user, restaurant, Order } from "./Schema.js";
import { mongoose } from "mongoose";
import QRCode from "qrcode";

const { ObjectId } = mongoose.Types;
const temporaryOrders = {}; // Store temporary orders

// Function to get user info by phone number
async function get_user_info(phone_number) {
  try {
    const userInfo = await user.findOne({ phone_number });
    if (!userInfo) {
      return { message: "User not found" };
    }
    console.log("User info retrieved successfully");
    return userInfo;
  } catch (error) {
    console.error("Error retrieving user info", error);
    return { message: "Error retrieving user info", error };
  }
}

// Function to initiate an order
const initiateOrder = async (phone_number) => {
  try {
    const userRecord = await user.findOne({ phone_number });
    if (!userRecord) {
      throw new Error("User not found");
    }

    temporaryOrders[phone_number] = {
      user: userRecord,
      items: [],
      totalAmount: 0,
    };
    console.log(`Order initiated for user: ${phone_number}`);
  } catch (error) {
    console.error("Error initiating order:", error);
    throw error;
  }
};

// Function to fetch all dishes
const fetchDishes = async () => {
  try {
    const dishes = await restaurant.aggregate([
      { $unwind: "$Menu" },
      {
        $project: {
          _id: 0,
          dishName: "$Menu.Dish",
          portionSize: "$Menu.PortionSize",
          price: "$Menu.Price",
          restaurantName: "$RestoName",
          pic: "$Menu.Pic",
          google_pin: "486771",
        },
      },
    ]);
    console.log("Dishes fetched successfully");
    return dishes;
  } catch (error) {
    console.error("Error fetching dishes:", error);
    throw error;
  }
};

// Function to update the temporary order
const updateTempOrder = (phone_number, selectedDishes) => {
  const tempOrder = temporaryOrders[phone_number];
  if (!tempOrder) {
    throw new Error("No order initiated for this user.");
  }
  selectedDishes.forEach((dish) => {
    tempOrder.items.push({
      dish_name: dish.dishName,
      quantity: dish.quantity,
      price: dish.price,
      pic: "this is pic", // Include 'pic' field from schema
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
      throw new Error("No order initiated for this user.");
    }

    const userRecord = tempOrder.user;
    const newOrder = new Order({
      order_id: new ObjectId().toString(),
      order_details: {
        total_amount: tempOrder.totalAmount,
        order_date: new Date(),
        status: "Confirmed",
        dish_details: tempOrder.items,
      },
      customer_details: {
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone_number,
        delivery_address: {
          ...userRecord.Addresses[0], // Assuming this contains necessary fields
          google_pin: "486771", // Add the necessary field
        }, // Assuming the first address is used
      },
      restaurant_details: {
        resto_name: "Example Restaurant",
        address: "Example Address",
        google_pin: "Example Pin",
        branches: [],
        distance_kms: 0,
      },
      upi_acknowledgement_id: "this_is_upi_ack_id",
      upi_status: "Completed",
      timestamp: new Date(),
    });

    await newOrder.save();
    delete temporaryOrders[phone_number];
    console.log(`Order confirmed for user: ${phone_number}`);
    return newOrder.order_id;
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
};

const generatePaymentQR = async (order_id) => {
  try {
    order_id = "ORD987654321"
    const order = await Order.findOne({order_id});

    const amount = 100;
    const upiUrl = `upi://pay?pa=rdssjayswal@ibl&am=${amount}`;
    const qrCode = await QRCode.toDataURL(upiUrl); 
    console.log("Payment QR generated successfully");
    return qrCode;
  } catch (error) {
    console.error("Error generating payment QR:", error);
    throw error;
  }
};




export {
  get_user_info,
  initiateOrder,
  fetchDishes,
  updateTempOrder,
  confirmOrder,
  generatePaymentQR,
};





















// import { user, restaurant, Order } from './Schema.js';
// const temporaryOrders = {};

// // Function to create a new user with individual parameters
// async function create_user_info(
//     name, DOB, email, phone_number, Addresses, food_choices,
//     food_preferences, health_conditions, allergies, non_veg_days
//   ) {
//     try {
//       const user = new User({
//         name,
//         DOB,
//         email,
//         phone_number,
//         Addresses,
//         food_choices,
//         food_preferences,
//         health_conditions,
//         allergies,
//         non_veg_days,
//       });
//       await user.save();
//       return { message: 'User created successfully', user: user };
//     } catch (error) {
//       return { message: 'Error creating user', error: error };
//     }
//   }
// // Function to check if user exists by phone number
// async function check_user_status(phone_number) {
//     try {
//       const user = await User.findOne({ phone_number: phone_number });
//       if (user) {
//         return { exists: true, user: user };
//       } else {
//         return { exists: false };
//       }
//     } catch (error) {
//       return { message: 'Error checking user status', error: error };
//     }
//   }

// const calculateDistance = (pin1, pin2) => {
//     // Implement the actual distance calculation here
//     return Math.random() * 20; // Returns a random distance for simulation
// };

// // Function to get user info by phone number
// async function get_user_info(phone_number) {
//     try {
//       const user = await user.findOne({ phone_number: phone_number });
//       if (!user) {
//         return { message: 'User not found' };
//       }
//       return user;
//     } catch (error) {
//       return { message: 'Error retrieving user info', error: error };
//     }
//   }

// // Function to initiate an order
// const initiateOrder = async (phone_number) => {
//     const userRecord = await user.findOne({ phone_number });
//     if (!userRecord) {
//       throw new Error('User not found');
//     }

//     temporaryOrders[phone_number] = {
//       user: userRecord,
//       items: [],
//       totalAmount: 0
//     };
//     console.log(`Order initiated for user: ${phone_number}`);
//   };

// // Function to classify the user's order request
// const classifyOrderRequest = (request) => {
//     // Implement classification logic here (e.g., using NLP)
//     console.log(`Classifying order request: ${request}`);
//     return 'parsed request'; // Placeholder
//   };

// // Main function to fetch dishes
// const fetchDishes = async (keywords, userPin) => {
//     try {
//       // Find dishes that match any of the keywords
//       const regex = new RegExp(keywords.join('|'), 'i');
//       const matchedDishes = await mongoose.model('restaurant').aggregate([
//         { $unwind: '$Menu' },
//         { $match: { 'Menu.Dish': regex } },
//         {
//           $project: {
//             _id: 0,
//             dishName: '$Menu.Dish',
//             portionSize: '$Menu.PortionSize',
//             price: '$Menu.Price',
//             pic: '$Menu.Pic',
//             restaurantId: '$_id',
//           }
//         }
//       ]);

//       return initialDishes;
//     } catch (error) {
//       console.error('Error fetching dishes:', error);
//       throw error;
//     }
//   };

// // Function to sort dishes by distance from the user
// const sortDishesByDistance = async (dishes, userPin) => {
//     for (let dish of dishes) {
//       const restaurant = await mongoose.model('restaurant').findById(dish.restaurantId); // Assuming each dish has a restaurantId
//       dish.distance = calculateDistance(userPin, restaurant.GooglePinLocation);
//     }
//     dishes.sort((a, b) => a.distance - b.distance);
//     return dishes;
//   };

//   const displayDishes = (dishes) => {
//     return dishes.slice(0, 4); // Send first 4 dishes to frontend
//   };

// // Function to view more dishes
// const viewMoreDishes = (dishes, currentIndex) => {
//     return dishes.slice(currentIndex, currentIndex + 4);
//     currentIndex=currentIndex+4;
//   };

//   const parseOrderSelection = (userResponse) => {
//     // Implement parsing logic here
//     console.log(`Parsing user response: ${userResponse}`);
//     return { dishName: 'Example Dish', quantity: 1, price: 10 }; // Placeholder
//   };

// // Function to update the temporary order
// const updateTempOrder = (phone_number, selectedDishes) => {
//     const tempOrder = temporaryOrders[phone_number];
//     if (!tempOrder) {
//       throw new Error('No order initiated for this user.');
//     }
//     selectedDishes.forEach(dish => {
//       tempOrder.items.push(dish);
//       tempOrder.totalAmount += dish.price * dish.quantity;
//     });
//     console.log(`Temporary order updated for user: ${phone_number}`);
//   };

// // Function to confirm the order with the user
// const confirmOrder = async (phone_number) => {
//     const tempOrder = temporaryOrders[phone_number];
//     if (!tempOrder) {
//       throw new Error('No order initiated for this user.');
//     }

//     const userRecord = tempOrder.user;
//     const newOrder = new order({
//       order_id: mongoose.Types.ObjectId().toString(),
//       order_details: {
//         total_amount: tempOrder.totalAmount,
//         order_date: new Date(),
//         status: 'Pending',
//         dish_details: tempOrder.items,
//       },
//       customer_details: {
//         name: userRecord.name,
//         email: userRecord.email,
//         phone: userRecord.phone_number,
//         delivery_address: userRecord.Addresses[0], // Assuming the first address is used
//       },
//       restaurant_details: {
//         resto_name: 'Example Restaurant',
//         address: 'Example Address',
//         google_pin: 'Example Pin',
//         branches: [],
//         distance_kms: 0,
//       },
//       upi_acknowledgement_id: '',
//       upi_status: 'Pending',
//       timestamp: new Date(),
//     });

//     await newOrder.save();
//     delete temporaryOrders[phone_number];
//     console.log(`Order confirmed for user: ${phone_number}`);
//     return newOrder;
//   };

// // Function to handle order edits
// const editOrder = (phone_number) => {
//     // Implement edit logic here
//     console.log(`Editing order for user: ${phone_number}`);
//   };

// // Function to recommend additional dishes
// const recommendAdditionalDishes = (selectedDishes) => {
//   // Implement recommendation logic here
//   console.log(`Recommending additional dishes based on: ${selectedDishes}`);
//   return ['Additional Dish 1', 'Additional Dish 2']; // Placeholder
// };

// // Function to handle additional selections based on recommendations
// const handleRecommendations = (phone_number, recommendations) => {
//   // Implement handling logic here
//   console.log(`Handling recommendations for user: ${phone_number}`);
// };

// // Function to generate order summary
// const generateOrderSummary = async (phone_number) => {
//     const tempOrder = temporaryOrders[phone_number];
//     if (!tempOrder) {
//       throw new Error('No order initiated for this user.');
//     }

//     const summary = {
//       name: tempOrder.user.name,
//       phone_number: tempOrder.user.phone_number,
//       address: tempOrder.user.Addresses[0], // Assuming the first address is used
//       dishes: tempOrder.items.map(dish => ({
//         dishName: dish.dishName,
//         portionSize: dish.portionSize,
//         price: dish.price,
//         quantity: dish.quantity
//       })),
//       totalAmount: tempOrder.totalAmount
//     };

//     return summary;
//   };

// // Function to confirm the final order
// const confirmFinalOrder = async (phone_number, order_id) => {
//   const order = await Order.findOne({ 'customer_details.phone': phone_number, order_id });
//   if (!order) {
//     throw new Error('Order not found or phone number mismatch');
//   }
//   order.order_details.status = 'Confirmed';
//   await order.save();
//   return 'Order confirmed';
// };

// // Function to generate a random QR code for payment
// const generatePaymentQR = async (phone_number, order_id) => {
//     const order = await Order.findOne({ 'customer_details.phone': phone_number, order_id });
//     if (!order || order.order_details.status !== 'Confirmed') {
//       throw new Error('Order not found or not confirmed');
//     }

//     const qrCode = await QRCode.toDataURL('https://example.com/payment'); // Replace with actual payment link in production
//     return qrCode;
//   };

// // Function to track payment status
// const trackPaymentStatus = async (payment_id) => {
//     const order = await Order.findOne({ upi_acknowledgement_id: payment_id });
//     if (!order) {
//       throw new Error('Payment not found');
//     }

//     if (order.upi_status === 'Completed') {
//       return 'Your payment is successful';
//     } else {
//       return 'Payment is still pending';
//     }
//   };

// // Function to handle payment failure
// const handlePaymentFailure = async (payment_id) => {
//     const order = await Order.findOne({ upi_acknowledgement_id: payment_id });
//     if (!order) {
//       throw new Error('Payment not found');
//     }

//     if (order.upi_status === 'Failed') {
//       return 'Your payment has failed';
//     } else {
//       return 'Payment is still pending';
//     }
//   };

// // Function to generate invoice
// const generateInvoice = async (phone_number, order_id) => {
//     const order = await Order.findOne({ 'customer_details.phone': phone_number, order_id });
//     if (!order || order.upi_status !== 'Completed') {
//       throw new Error('Order not found or payment not completed');
//     }

//     const invoice = {
//       orderSummary: {
//         name: order.customer_details.name,
//         phone_number: order.customer_details.phone,
//         address: order.customer_details.delivery_address,
//         dishes: order.order_details.dish_details,
//         totalAmount: order.order_details.total_amount
//       },
//       upi_transaction_id: order.upi_acknowledgement_id,
//       status: order.upi_status,
//       orderStatus: order.order_details.status
//     };

//     return invoice;
//   };

// function handleUserLatency(phone_number) {
//     // Code to handle user latency
// }

// function promptForCompletion(phone_number) {
//     // Code to prompt the user for order completion
// }

// export {
//     create_user_info,
//     check_user_status,
//     get_user_info,
//     initiateOrder,
//     classifyOrderRequest,
//     fetchDishes,
//     sortDishesByDistance,
//     displayDishes,
//     viewMoreDishes,
//     parseOrderSelection,
//     updateTempOrder,
//     confirmOrder,
//     editOrder,
//     recommendAdditionalDishes,
//     handleRecommendations,
//     generateOrderSummary,
//     confirmFinalOrder,
//     generatePaymentQR,
//     trackPaymentStatus,
//     handlePaymentFailure,
//     generateInvoice,
//     handleUserLatency,
//     promptForCompletion
// };
