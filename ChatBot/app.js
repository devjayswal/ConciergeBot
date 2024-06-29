import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import https from 'https';
import fs from 'fs';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    create_user_info,
    check_user_status,
    get_user_info,
    initiateOrder,
    classifyOrderRequest,
    fetchDishes,
    sortDishesByDistance,
    displayDishes,
    viewMoreDishes,
    parseOrderSelection,
    updateTempOrder,
    confirmOrder,
    editOrder,
    recommendAdditionalDishes,
    handleRecommendations,
    generateOrderSummary,
    confirmFinalOrder,
    generatePaymentQR,
    trackPaymentStatus,
    handlePaymentFailure,
    generateInvoice,
    handleUserLatency,
    promptForCompletion
} from "./functions.js";
import { 
  user,
  restaurant,
  Order
} from "./Schema.js";
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4000;

// MongoDB connection
const uri ="mongodb+srv://devjayswal:Dev%40958988@foodnest.tttt5kq.mongodb.net/FOODNEST?retryWrites=true&w=majority&appName=foodnest";

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

// WhatsApp Business API configuration
const whatsappAccessToken = "EAAQJUElvmugBO1cZAVZAQcqyKGlhmM4HPKgZC8hdrZClyJxTdsfyjHP5Uh3bu9mdPtzZBCcCYTkSg0xww5Fomp7ptcRWNUi45IaZBeT6b8HNTpxJoHOsjO11n8zGJqQDcOZB91BtKw4DnHUUe6A6ILgGajE4K2DvSc6g9XXXHrukA9rdFoPFWthOAB1GfvyfoHSmkzx2AMxBHmnbFZAULS0ZD";
const whatsappPhoneNumberId = "325724163964641";

// Webhook verification endpoint
app.get("/webhook", (req, res) => {
  console.log('Webhook verification request:', req.query);

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === "my_verify_token") {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      console.log("WEBHOOK_VERIFICATION_FAILED");
      res.sendStatus(403);
    }
  } else {
    console.log("WEBHOOK_VERIFICATION_FAILED");
    res.sendStatus(403);
  }
});


// Webhook endpoint to receive messages from WhatsApp
app.post("/webhook", async (req, res) => {
  const message = req.body;

  if (message.object) {
      if (message.entry && message.entry[0].changes && message.entry[0].changes[0].value.messages && message.entry[0].changes[0].value.messages[0]) {
          const phone_number_id = message.entry[0].changes[0].value.metadata.phone_number_id;
          const from = message.entry[0].changes[0].value.messages[0].from; // extract the phone number from the payload
          const msg_body = message.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the payload

          console.log("Incoming message from:", from);
          console.log("Message text:", msg_body);

          // Pass the message text to the chatbot and get the response
          const chatbotResponse = await processMessage(msg_body);

          // Send the chatbot response back to the customer
          await sendMessage(from, chatbotResponse);

          console.log("Outgoing message to:", from);
          console.log("Message text:", chatbotResponse);
      }
      res.sendStatus(200);
  } else {
      res.sendStatus(404);
  }
});

async function processMessage(message) {
  // Implement your chatbot logic here
  // For now, just echo the incoming message
  return `You said: ${message}`;
}

// Function to send a message using the WhatsApp Business API
async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`;
  const data = {
      messaging_product: "whatsapp",
      to: to,
      text: { body: message }
  };
  const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${whatsappAccessToken}`
  };

  try {
      await axios.post(url, data, { headers });
  } catch (error) {
      console.error("Error sending message:", error.response.data);
  }
}

// GET routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await user.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving restaurants", error });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders", error });
  }
});

// POST routes
app.post("/api/users", async (req, res) => {
  const { name, DOB, email, phone_number, Addresses, food_choices, food_preferences, health_conditions, allergies, non_veg_days } = req.body;
  try {
      const result = await create_user_info(name, DOB, email, phone_number, Addresses, food_choices, food_preferences, health_conditions, allergies, non_veg_days);
      res.json(result);
  } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
  }
});

app.post("/api/restaurants", async (req, res) => {
  const newRestaurant = new restaurant(req.body);
  try {
      await newRestaurant.save();
      res.status(201).json({ message: "Restaurant created successfully", newRestaurant });
  } catch (error) {
      res.status(500).json({ message: "Error creating restaurant", error });
  }
});

app.post("/api/orders", async (req, res) => {
  const { phone_number, selectedDishes } = req.body;
  try {
      await initiateOrder(phone_number);
      await updateTempOrder(phone_number, selectedDishes);
      const Order = await confirmOrder(phone_number);
      res.status(201).json({ message: "Order created successfully", Order });
  } catch (error) {
      res.status(500).json({ message: "Error creating order", error });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});




const httpsServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname,'cert' ,'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert','cert.pem')),
},
app);

httpsServer.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on https://localhost:${port}`);
// });

/*
import MistralClient from '@mistralai/mistralai';

const apiKey = '7w6ow7caqk7qWr6CH9D5vs61uWj6vsIF';

const client = new MistralClient(apiKey);

const chatResponse = await client.chat({
  model: 'mistral-large-latest',
  messages: [{role: 'user', content: 'Inida ka P.M. kaun hai?'}],
});

console.log('Chat:', chatResponse.choices[0].message.content);

*/
