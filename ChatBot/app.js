import express, { response } from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import {
  FunctionDeclarationSchemaType,
  VertexAI,
} from "@google-cloud/vertexai";
import {
  get_user_info,
  initiateOrder,
  fetchDishes,
  updateTempOrder,
  confirmOrder,
  generatePaymentQR,
} from "./functions.js";
import { user, restaurant, Order, Chat } from "./Schema.js";
import axios from "axios";

dotenv.config();
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

const temporaryOrders = {}; // Store temporary orders
const chatHistories = {};
const chatSessions = {};

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

// Handling function calls
async function handleFunctionCall(name, parameters) {
  switch (name) {
    case "get_user_info":
      const user1 = await get_user_info(parameters.phone_number);
      return [
        {
          functionResponse: {
            name: "get_user_info",
            response: { name: "get_user_info", content: user1 },
          },
        },
      ];
    case "initiateOrder":
      const orderInitiation = await initiateOrder(parameters.phone_number);
      return [
        {
          functionResponse: {
            name: "initiateOrder",
            response: { name: "initiateOrder", content: orderInitiation },
          },
        },
      ];
    case "fetchDishes":
      const dishes1 = await fetchDishes();
      return [
        {
          functionResponse: {
            name: "fetchDishes",
            response: { name: "fetchDishes", content: dishes1 },
          },
        },
      ];
    case "updateTempOrder":
      const updatedOrder = await updateTempOrder(
        parameters.phone_number,
        parameters.selectedDishes
      );
      return [
        {
          functionResponse: {
            name: "updateTempOrder",
            response: { name: "updateTempOrder", content: updatedOrder },
          },
        },
      ];
    case "confirmOrder":
      const order_id = await confirmOrder(parameters.phone_number);
      return [
        {
          functionResponse: {
            name: "confirmOrder",
            response: { name: "confirmOrder", content: order_id },
          },
        },
      ];
    case "generatePaymentQR":
      const paymentQR = await generatePaymentQR(parameters.order_id);
      return [
        {
          functionResponse: {
            name: "generatePaymentQR",
            response: { name: "generatePaymentQR", content: paymentQR },
          },
        },
      ];
    default:
      throw new Error(`Unknown function call: ${name}`);
  }
}

// Function Declarations
const functionDeclarations = [
  {
    function_declarations: [
      {
        name: "get_user_info",
        description:
          "Get user information like name, email, addresses, food_choices, food_preference, allergies etc by phone number",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            phone_number: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Phone number of the user",
            },
          },
          required: ["phone_number"],
        },
      },
      {
        name: "initiateOrder",
        description:
          "Initiate an order for a user to store temporary order details",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            phone_number: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Phone number of the user",
            },
          },
          required: ["phone_number"],
        },
      },
      {
        name: "fetchDishes",
        description:
          "Fetch all available dishes in all restaurants with dishname, pic , portion size and price and suggest user  them some of them according to there ask or interest /choice",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {},
        },
      },
      {
        name: "updateTempOrder",
        description:
          "Update the temporary order with selected dishes and quantities",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            phone_number: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Phone number of the user",
            },
            selectedDishes: {
              type: FunctionDeclarationSchemaType.ARRAY,
              description: "Array of selected dishes with quantities",
              items: {
                type: FunctionDeclarationSchemaType.OBJECT,
                properties: {
                  dishName: {
                    type: FunctionDeclarationSchemaType.STRING,
                    description: "Name of the dish",
                  },
                  quantity: {
                    type: FunctionDeclarationSchemaType.INTEGER,
                    description: "Quantity of the dish",
                  },
                  price: {
                    type: FunctionDeclarationSchemaType.INTEGER,
                    description: "Price of the dish",
                  },
                },
                required: ["dishName", "quantity", "price"],
              },
            },
          },
          required: ["phone_number", "selectedDishes"],
        },
      },
      {
        name: "confirmOrder",
        description:
          "Confirm the order with the user and store the order in the database with a new order_id",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            phone_number: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Phone number of the user",
            },
          },
          required: ["phone_number"],
        },
      },
      {
        name: "generatePaymentQR",
        description: "Generate a QR code for payment",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            order_id: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Order ID of the confirmed order",
            },
          },
          required: ["order_id"],
        },
      },
    ],
  },
];



// Vertex AI configuration
const PROJECT_id = process.env.PROJECT_id;
const location = process.env.LOCATION;
const model = process.env.MODEL;

const vertexAI = new VertexAI({ project: PROJECT_id, location: location });

const generativeModel = vertexAI.getGenerativeModel({
  model: model,
});

const chat = generativeModel.startChat({
  systemInstruction: {
    parts: [
      {
        text: "You are an Era Concierge Bot. Your mission is to help the user order food from a restaurant.you can use hindi , english and hinglish as per the your chat request.fetch user details and iniciate order at start.fetch all dishes using the fetchDishes function  before interacation and suggest some dishes based on the user information.  Be polite and helpful. You have function-calling capabilities and must call appropriate functions in sequence to complete the order. Your first response, sent by the web server, should include a hello message and the user's phone number. Use the get_user_info function to fetch user information. Your first response should be: 'Hello, I am the Era Concierge AI of FOODNESTS. What would you like to order today?' The function call sequence is: get_user_info, initiateOrder, updateTempOrder, confirmOrder, generatePaymentQR. Once the user makes their choice, update the temporary order using the updateTempOrder function. Then, confirm the order using the confirmOrder function and provide the user with an order_id. Finally, to make a payment, pass the order_id to the generatePaymentQR function to get a QR code for payment.",
      },
    ],
  },
  tools: functionDeclarations,
});

const chatInput1 = "hello my phone number is +919589883539";

const result1 = await chat.sendMessage(chatInput1);
console.log(
  "Response: ",
  JSON.stringify(result1.response.candidates[0].content.parts[0])
);
await result1.response;
if (result1.response.candidates[0].content.functionCall) {
  console.log("Function call detected");
  console.log(
    "Function call: ",
    result1.response.candidates[0].content.parts[0].functionCall
  );
  const { name, args } = result1.response.candidates[0].content.functionCall;
  const functionResponse1 = await handleFunctionCall(name, args);
  console.log("Function response: ", functionResponse1);
  // Send a follow up message with a FunctionResponse
  const result2 = await chat.sendMessage(functionResponse1);
  const response2 = await result2.response;
  console.log(response2.candidates[0].content.parts[0].text);
}

// Function to process incoming chat messages
async function processMessage(phone_number, message) {
  const userId = phone_number;

  try {
    const result = await chat.sendMessage(message);
    const resultResponse = result?.response;

    if (
      resultResponse &&
      resultResponse.candidates[0]?.content?.parts[0]?.functionCall
    ) {
      console.log("Function call detected");
      console.log(
        "Function call: ",
        resultResponse.candidates[0].content.parts[0].functionCall
      );

      const { name, args } =
        resultResponse.candidates[0].content.parts[0].functionCall;
      const functionResponse1 = await handleFunctionCall(name, args);

      console.log("Function call response: ", functionResponse1);

      const functionResult = await chat.sendMessage(functionResponse1);
      const functionResultResponse = functionResult?.response;

      if (functionResultResponse) {
        console.log(
          "AI response after function response: ",
          functionResultResponse.candidates[0].content.parts[0].text
        );
        return functionResultResponse.candidates[0].content.parts[0].text;
      } else {
        console.error(
          "Unexpected functionResult response structure:",
          JSON.stringify(functionResult)
        );
      }
    } else {
      console.error("Unexpected response structure:", resultResponse);
    }

    if (!chatHistories[userId]) {
      chatHistories[userId] = { messages: [] };
    }

    chatHistories[userId].messages.push({
      role: "system",
      content: resultResponse.candidates[0].content.parts[0].text,
    });

    console.log(
      "Response: ",
      resultResponse.candidates[0].content.parts[0].text
    );
    return resultResponse;
  } catch (error) {
    console.error("Error in processMessage:", error);
  }
}

// API route for chatbot messages
// POST route to handle incoming chat messages
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const phone_number = "+919589883539";
  const userId = phone_number;
  console.log(req.body);
  console.log(message);

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await processMessage(phone_number, message);
    res.json({ response });
  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ error: "Error processing chat message" });
  }
});

// Route to render the chat page
app.get("/chat", async (req, res) => {
  const phone_number = "+919589883539";
  try {
    // const initialResponse = await initializeChat(phone_number);
    res.sendFile(path.join(__dirname, "public", "chat.html"));
    // console.log({ response: initialResponse });
  } catch (error) {
    console.error("Error initializing chat:", error);
    res.status(500).json({ error: "Error initializing chat" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/chat`);
});

// Function to initialize the chat and send the initial message
// async function initializeChat(phone_number) {
//   const userId = phone_number;
//   if (!chatHistories[userId]) {
//     chatHistories[userId] = { messages: [] };
//   }
//   const first_chat = `hello my phone number is ${phone_number}`;
//   let aggregatedResponse = "";

//   try {
//     let result1st = await chat.sendMessageStream(first_chat);

//     for await (const item of result1st.stream) {
//       if (
//         item.candidates &&
//         item.candidates[0] &&
//         item.candidates[0].content &&
//         item.candidates[0].content.parts &&
//         item.candidates[0].content.parts[0]
//       ) {
//         const chunk = item.candidates[0].content.parts[0].text;
//         console.log("Stream chunk: ", chunk);
//         aggregatedResponse += chunk;
//       } else {
//         console.error("Unexpected response structure:", JSON.stringify(item));
//       }
//     }
//   } catch (error) {
//     console.error("Error in initializeChat:", error);
//     aggregatedResponse = "An error occurred during initialization.";
//   }

//   console.log("Aggregated response: ", aggregatedResponse);

//   // Add the bot response to the chat history
//   chatHistories[userId].messages.push({
//     role: "system",
//     content: aggregatedResponse,
//   });

//   return aggregatedResponse;
// }
// API route for chatbot messages
// app.post('/api/chat', async (req, res) => {
//   const { message, userName } = req.body;

//   console.log(req.body);
//   console.log(message);

//   if (!message) {
//     return res.status(400).json({ error: 'No message provided' });
//   }

//   // Define a temporary user for testing purposes
//   const tempUser = {
//     id: 'testUserId',
//     name: userName || 'Test User',
//   };

//   try {
//     const response = await processMessage(tempUser, message);
//     res.json({ response });
//     console.log(response);
//   } catch (error) {
//     console.error("Error processing chat message:", error);
//     res.status(500).json({ error: 'Error processing chat message' });
//   }
// });

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
// (async () => {
//   try {
//     console.log(await get_user_info('+919589883539'));

//     await initiateOrder('+919589883539');
//     console.log('Order initiated');

//     await fetchDishes();

//     updateTempOrder('+919589883539', [
//       { dishName: 'Pizza', portionSize: 'Large', price: 500, quantity: 2 },
//     ]);

//     const order_id = await confirmOrder('+919589883539');
//     console.log(order_id);

//     console.log(await generatePaymentQR(order_id));
//   } catch (error) {
//     console.error('Error in test functions:', error);
//   }
// })();

//function Responses
// const functionResponseParts = [
//   {
//     functionResponse: {
//       name: "get_user_info",
//       response: {
//         userInfo: {
//           name: "Rahul Mehta",
//           DOB: "1992-11-30",
//           email: "rahul.mehta@example.com",
//           Addresses: [
//             { address: "789 Residency Road, Mumbai, Maharashtra", tag: "Home" },
//             {
//               address: "456 Corporate Avenue, Mumbai, Maharashtra",
//               tag: "Office",
//             },
//           ],
//           food_choices: "Non Veg",
//           food_preferences: ["Mughlai", "Chinese"],
//           health_conditions: ["none"],
//           allergies: ["none"],
//           non_veg_days: ["Tuesday", "Friday"],
//           phone_number: "+919589883539",
//         },
//       },
//     },
//   },
//   {
//     functionResponse: {
//       name: "initiateOrder",
//       response: { message: "Order initiated" },
//     },
//   },
//   {
//     functionResponse: {
//       name: "fetchDishes",
//       response: {
//         dishes: [
//           { dishName: "Pizza", portionSize: "Large", price: 500, quantity: 2 },
//         ],
//       },
//     },
//   },
//   {
//     functionResponse: {
//       name: "updateTempOrder",
//       response: { message: "Temporary order updated" },
//     },
//   },
//   {
//     functionResponse: {
//       name: "confirmOrder",
//       response: { order_id: "new_order_id" },
//     },
//   },
//   {
//     functionResponse: {
//       name: "generatePaymentQR",
//       response: { qrCode: "data:image/png;base64,iVBOR..." },
//     },
//   },
// ];