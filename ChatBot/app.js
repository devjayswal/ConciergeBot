import express, { response } from "express";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
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
} from "./functions.js";
import {  User, Order, Restaurant, Chat  } from "./Schema.js";
import axios from "axios";
import OpenAI from "openai";
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 4000;

// MongoDB connection
const uri = process.env.MONGO_DB_URI;
const openai = new OpenAI({apiKey : process.env.OPEN_API_KEY});

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

  const temporaryOrders = {}; // Store temporary orders
  const chatHistories = {}; // Store chat histories
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
        const confirmedOrder  = await confirmOrder(phone_number);
        res.status(201).json({ message: "Order created successfully", confirmedOrder  });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error });
    }
    });
    
async function handleFunctionCall(name, parameters) {
      console.log(`Function call detected: ${name}`);
      console.log(`Function parameters:`, JSON.stringify(parameters, null, 2)); // Pretty-print JSON parameters
  
      switch (name) {
          case "createUser":
              const newUser = await createUser(parameters.data);
              return [
                  {
                      functionResponse: {
                          name: "createUser",
                          response: { name: "createUser", content: newUser },
                      },
                  },
              ];
          case "getUser":
              const user = await getUser(parameters.phone_number);
              return [
                  {
                      functionResponse: {
                          name: "getUser",
                          response: { name: "getUser", content: user },
                      },
                  },
              ];
          case "createRestaurant":
              const newRestaurant = await createRestaurant(parameters.data);
              return [
                  {
                      functionResponse: {
                          name: "createRestaurant",
                          response: { name: "createRestaurant", content: newRestaurant },
                      },
                  },
              ];
          case "getRestaurant":
              const restaurant = await getRestaurant(parameters.restaurantId);
              return [
                  {
                      functionResponse: {
                          name: "getRestaurant",
                          response: { name: "getRestaurant", content: restaurant },
                      },
                  },
              ];
          case "createOrder":
              const newOrder = await createOrder(parameters.data);
              return [
                  {
                      functionResponse: {
                          name: "createOrder",
                          response: { name: "createOrder", content: newOrder },
                      },
                  },
              ];
          case "getOrder":
              const order = await getOrder(parameters.orderId);
              return [
                  {
                      functionResponse: {
                          name: "getOrder",
                          response: { name: "getOrder", content: order },
                      },
                  },
              ];
          case "getOrdersByUser":
              const orders = await getOrdersByUser(parameters.userId);
              return [
                  {
                      functionResponse: {
                          name: "getOrdersByUser",
                          response: { name: "getOrdersByUser", content: orders },
                      },
                  },
              ];
          case "generatePaymentQR":
              const qrCode = await generatePaymentQR(parameters.order_id);
              return [
                  {
                      functionResponse: {
                          name: "generatePaymentQR",
                          response: { name: "generatePaymentQR", content: qrCode },
                      },
                  },
              ];
          case "updateOrderStatus":
              const updatedOrder = await updateOrderStatus(parameters.orderId, parameters.status);
              return [
                  {
                      functionResponse: {
                          name: "updateOrderStatus",
                          response: { name: "updateOrderStatus", content: updatedOrder },
                      },
                  },
              ];
          case "deleteUser":
              const deleteUserResponse = await deleteUser(parameters.userId);
              return [
                  {
                      functionResponse: {
                          name: "deleteUser",
                          response: { name: "deleteUser", content: deleteUserResponse },
                      },
                  },
              ];
          case "deleteOrder":
              const deleteOrderResponse = await deleteOrder(parameters.orderId);
              return [
                  {
                      functionResponse: {
                          name: "deleteOrder",
                          response: { name: "deleteOrder", content: deleteOrderResponse },
                      },
                  },
              ];
          default:
              console.error(`Unknown function call: ${name}`);
              throw new Error(`Unknown function call: ${name}`);
      }
  }
  
  const tools = [
    {
        "type": "function",
        "function": {
            name: "createUser",
            description: "Create a new user with the given details.",
            parameters: {
                type: "object",
                properties: {
                    data: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                            phone_number: { type: "string" },
                            addresses: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        address: { type: "string" },
                                        tag: { type: "string" },
                                    },
                                    required: ["address", "tag"],
                                },
                            },
                        },
                        required: ["name", "email", "phone_number"],
                    },
                },
                required: ["data"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "getUser",
            description: "Retrieve user details based on their phone number.",
            parameters: {
                type: "object",
                properties: {
                    phone_number: { type: "string" },
                },
                required: ["phone_number"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "createRestaurant",
            description: "Create a new restaurant with the given details.",
            parameters: {
                type: "object",
                properties: {
                    data: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            address: { type: "string" },
                            google_pin: { type: "string" },
                            menu: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        dish: { type: "string" },
                                        price: { type: "number" },
                                    },
                                    required: ["dish", "price"],
                                },
                            },
                        },
                        required: ["name", "address", "google_pin"],
                    },
                },
                required: ["data"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "getRestaurant",
            description: "Retrieve restaurant details by restaurant ID.",
            parameters: {
                type: "object",
                properties: {
                    restaurantId: { type: "string" },
                },
                required: ["restaurantId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "createOrder",
            description: "Create a new order with the given details.",
            parameters: {
                type: "object",
                properties: {
                    data: {
                        type: "object",
                        properties: {
                            user_id: { type: "string" },
                            dishes: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        quantity: { type: "integer" },
                                        price: { type: "number" },
                                    },
                                    required: ["name", "quantity", "price"],
                                },
                            },
                            total_amount: { type: "number" },
                            status: { type: "string" },
                        },
                        required: ["user_id", "dishes", "total_amount", "status"],
                    },
                },
                required: ["data"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "getOrder",
            description: "Retrieve order details by order ID.",
            parameters: {
                type: "object",
                properties: {
                    orderId: { type: "string" },
                },
                required: ["orderId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "getOrdersByUser",
            description: "Retrieve all orders associated with a specific user.",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "string" },
                },
                required: ["userId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "generatePaymentQR",
            description: "Generate a payment QR code for the specified order.",
            parameters: {
                type: "object",
                properties: {
                    order_id: { type: "string" },
                },
                required: ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "updateOrderStatus",
            description: "Update the status of a specific order.",
            parameters: {
                type: "object",
                properties: {
                    orderId: { type: "string" },
                    status: { type: "string" },
                },
                required: ["orderId", "status"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "deleteUser",
            description: "Delete a user by their user ID.",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "string" },
                },
                required: ["userId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            name: "deleteOrder",
            description: "Delete an order by its order ID.",
            parameters: {
                type: "object",
                properties: {
                    orderId: { type: "string" },
                },
                required: ["orderId"],
            },
        },
    },
];

function formatFunctionResponse(functionName, response) {
      if (Array.isArray(response) && response[0]?.functionResponse) {
          const content = response[0].functionResponse.response.content;
          if (content?.message) {
              return `Function "${functionName}" executed: ${content.message}`;
          }
          return `Function "${functionName}" executed successfully.`;
      }
      return `Function "${functionName}" executed but no details were provided.`;
  }

async function processMessage(phone_number, message) {
    const userId = phone_number;

    // Initialize chat history if not present
    if (!chatHistories[userId]) {
        chatHistories[userId] = [
            { role: "system", content: "You are a food ordering bot  you  need to help user to  order the food , register themselves" },
            { role: "system", content: "you need to very lovely, flirty and talks with user to get their attention" },

        ];
    }

    // Log the incoming user message
    console.log(`User (${userId}) message:`, message);

    // Add the user's message to chat history
    chatHistories[userId].push({ role: "user", content: message });

    // Log chat history before sending to OpenAI
    console.log(`Chat history before OpenAI call:`, JSON.stringify(chatHistories[userId], null, 2));

    try {
        const result = await openai.chat.completions.create({
            model: "gpt-4",
            messages: chatHistories[userId], // Provide the entire chat history
            tools: tools,
        });

        const choice = result.choices[0]?.message;

        // Log the assistant's response
        console.log(`Assistant response:`, choice?.content);

        // Add the assistant's response to chat history
        if (choice?.content) {
            chatHistories[userId].push({ role: "assistant", content: choice.content });
        }

        // Handle tool calls if present
        if (choice?.tool_calls) {
            for (const toolCall of choice.tool_calls) {
                const { function: func } = toolCall;
                if (!func) continue;

                console.log(`Function call detected:`, JSON.stringify(func, null, 2));

                const { name, arguments: parameters } = func;

                // Parse parameters if they're in JSON string format
                let parsedParameters;
                try {
                    parsedParameters = JSON.parse(parameters);
                } catch (parseError) {
                    console.error("Failed to parse function parameters:", parseError);
                    throw new Error("Invalid function parameters format");
                }

                // Call the function handler
                const functionResponse = await handleFunctionCall(name, parsedParameters);

                const formattedResponse = formatFunctionResponse(name, functionResponse);

                // Add formatted response to chat history
                chatHistories[userId].push({
                    role: "assistant",
                    content: formattedResponse,
                });

                // Return formatted response
                return formattedResponse;
            }
        }

        // Log the updated chat history
        console.log(`Chat history after OpenAI call:`, JSON.stringify(chatHistories[userId], null, 2));

        return choice?.content;
    } catch (error) {
        console.error("Error processing message:", error);
        throw error;
    }
}

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    const phone_number = "+919589883539";

    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }

    try {
        console.log(`Incoming message from ${phone_number}:`, message);
        const response = await processMessage(phone_number, message);
        res.json({ response });
    } catch (error) {
        console.error("Error processing chat message:", error);
        res.status(500).json({ error: "Error processing chat message" });
    }
});
    
app.get("/chat", async (req, res) => {
      const phone_number = "+919589883539";
  
      // Ensure chat history exists for the user
      if (!chatHistories[phone_number]) {
          chatHistories[phone_number] = [
              { role: "system", content: "" },
          ];
      }
  
      try {
          res.sendFile(path.join(__dirname, "public", "chat.html"));
      } catch (error) {
          console.error("Error initializing chat:", error);
          res.status(500).json({ error: "Error initializing chat" });
      }
  });
  
    
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/chat`);
});
