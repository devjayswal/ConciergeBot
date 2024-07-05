import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from 'dotenv';
dotenv.config();
import {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";

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
  promptForCompletion,
} from "./functions.js";
import { user, restaurant, Order, Chat } from "./Schema.js";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4000;

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

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
  const {
    name,
    DOB,
    email,
    phone_number,
    Addresses,
    food_choices,
    food_preferences,
    health_conditions,
    allergies,
    non_veg_days,
  } = req.body;
  try {
    const result = await create_user_info(
      name,
      DOB,
      email,
      phone_number,
      Addresses,
      food_choices,
      food_preferences,
      health_conditions,
      allergies,
      non_veg_days
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
});

app.post("/api/restaurants", async (req, res) => {
  const newRestaurant = new restaurant(req.body);
  try {
    await newRestaurant.save();
    res
      .status(201)
      .json({ message: "Restaurant created successfully", newRestaurant });
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

const project = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const textModel = process.env.MODEL;

const vertexAI = new VertexAI({ project: project, location: location });

const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  systemInstruction:{
 parts:[
      {text: "you are a helpful assistant (name era) of company FOODNESTS. you mission is to work as conciergebot.you need to ask user from their foody mood(like you want to eat some chinese , south indian ,korian etc) 'what he want to eat', according to their mood suggest them dishes, once user select dishes you need to  assist user so that he can take more dishes, after he confirm the order you need to  generate a random upi and ask them to  pay  money  to upi  and once user daid he paid , then you need to thank you to user. "},
      {text: "you should be polite and helpful to user. you should be able to understand user mood and suggest them dishes according to their mood. you should be able to assist user to take more dishes. you should be able to generate a random upi and ask user to pay money to upi. you should be able to thank user once he paid money."},
      {text: "image of a restaurant with a variety of dishes with its price and portion size. help user to pick and place the order and take payment. "},
      {text:"provide dish and  all other information in structured format or list with numberical points with maximum 5 points. and ask user to he want more or not"},
 ],
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: { maxOutputTokens: 256 },
});

const chatHistories = {};
const chatSessions = {};
const chat = generativeModel.startChat();
async function processMessage(user, message) {
  const userId = user.id;

  if (!chatHistories[userId]) {
    chatHistories[userId] = {
      messages: [],
      name: user.name
    };
  }

  // Add the new user message to the chat history
  chatHistories[userId].messages.push({ role: 'user', content: message });

  // Create a new chat instance

  let result = await chat.sendMessageStream(message);

  let aggregatedResponse = "";
  for await (const item of result.stream) {
    const chunk = item.candidates[0].content.parts[0].text;
    console.log("Stream chunk: ", chunk);
    aggregatedResponse += chunk;
  }

  console.log("Aggregated response: ", aggregatedResponse);

  // Add the bot response to the chat history
  chatHistories[userId].messages.push({ role: 'system', content: aggregatedResponse });

  return aggregatedResponse;
}

// API route for chatbot messages
app.post('/api/chat', async (req, res) => {
  const { message, userName } = req.body;

  console.log(req.body);
  console.log(message);

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  // Define a temporary user for testing purposes
  const tempUser = {
    id: 'testUserId',
    name: userName || 'Test User',
  };

  try {
    const response = await processMessage(tempUser, message);
    res.json({ response });
    console.log(response);
  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ error: 'Error processing chat message' });
  }
});

// API route for chatbot messages
// POST route to handle incoming chat messages
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  console.log(req.body);
  console.log(message);

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // Define a temporary user for testing purposes
  const tempUser = {
    id: "9589883539",
    name: "Dev",
  };

  try {
    const response = await processMessage(tempUser, message);
    res.json({ response });
    console.log(response);
  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ error: "Error processing chat message" });
  }
});

// Route to render the chat page
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/chat`);
});

// // Whats"3App Business API configuration
// const whatsappAccessToken = process.env.whatsappAccessToken;
// const whatsappPhoneNumberId = process.env.whatsappPhoneNumberId;

// // Webhook verification endpoint
// app.get("/webhook", (req, res) => {
//   console.log('Webhook verification request:', req.query);

//   let mode = req.query["hub.mode"];
//   let token = req.query["hub.verify_token"];
//   let challenge = req.query["hub.challenge"];

//   if (mode && token) {
//     if (mode === "subscribe" && token === "my_verify_token") {
//       console.log("WEBHOOK_VERIFIED");
//       res.status(200).send(challenge);
//     } else {
//       console.log("WEBHOOK_VERIFICATION_FAILED");
//       res.sendStatus(403);
//     }
//   } else {
//     console.log("WEBHOOK_VERIFICATION_FAILED");
//     res.sendStatus(403);
//   }
// });

// // Webhook endpoint to receive messages from WhatsApp
// app.post("/webhook", async (req, res) => {
//   const message = req.body;

//   if (message.object) {
//       if (message.entry && message.entry[0].changes && message.entry[0].changes[0].value.messages && message.entry[0].changes[0].value.messages[0]) {
//           const phone_number_id = message.entry[0].changes[0].value.metadata.phone_number_id;
//           const from = message.entry[0].changes[0].value.messages[0].from; // extract the phone number from the payload
//           const msg_body = message.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the payload

//           console.log("Incoming message from:", from);
//           console.log("Message text:", msg_body);

//           // Pass the message text to the chatbot and get the response
//           const chatbotResponse = await processMessage(msg_body);

//           // Send the chatbot response back to the customer
//           await sendMessage(from, chatbotResponse);

//           console.log("Outgoing message to:", from);
//           console.log("Message text:", chatbotResponse);
//       }
//       res.sendStatus(200);
//   } else {
//       res.sendStatus(404);
//   }
// });

// // Function to send a message using the WhatsApp Business API
// async function sendMessage(to, message) {
//   const url = `https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`;
//   const data = {
//       messaging_product: "whatsapp",
//       to: to,
//       text: { body: message }
//   };
//   const headers = {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${whatsappAccessToken}`
//   };

//   try {
//       await axios.post(url, data, { headers });
//   } catch (error) {
//       console.error("Error sending message:", error.response.data);
//   }
// }
