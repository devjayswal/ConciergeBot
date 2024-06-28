[
    {
        "type": "function",
        "function": {
            "name": "checkUserStatus",
            "description": "Check if the user is new or returning",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "collectUserInfo",
            "description": "Collect user information for new users",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    },
                    "name": {
                        "type": "string",
                        "description": "User's name."
                    },
                    "dob": {
                        "type": "string",
                        "description": "User's date of birth."
                    },
                    "email": {
                        "type": "string",
                        "description": "User's email."
                    },
                    "addresses": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "User's addresses."
                    },
                    "food_choices": {
                        "type": "string",
                        "description": "User's food choices."
                    },
                    "food_preferences": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "User's food preferences."
                    },
                    "health_conditions": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "User's health conditions."
                    },
                    "allergies": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "User's allergies."
                    },
                    "non_veg_days": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "User's non-veg days."
                    }
                },
                "required": ["phone_number", "name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "initiateOrder",
            "description": "Ask the user what they want to order",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "classifyOrderRequest",
            "description": "Classify the user's order request",
            "parameters": {
                "type": "object",
                "properties": {
                    "request": {
                        "type": "string",
                        "description": "User's order request."
                    }
                },
                "required": ["request"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "fetchDishes",
            "description": "Fetch dishes from the restaurant database",
            "parameters": {
                "type": "object",
                "properties": {
                    "classified_request": {
                        "type": "string",
                        "description": "Classified order request."
                    }
                },
                "required": ["classified_request"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "sortDishesByDistance",
            "description": "Sort dishes by distance from the user's location",
            "parameters": {
                "type": "object",
                "properties": {
                    "dishes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dish_name": {
                                    "type": "string"
                                },
                                "quantity": {
                                    "type": "integer"
                                },
                                "price": {
                                    "type": "number"
                                },
                                "pic": {
                                    "type": "string"
                                }
                            }
                        },
                        "description": "List of dishes."
                    },
                    "user_location": {
                        "type": "string",
                        "description": "User's location."
                    }
                },
                "required": ["dishes", "user_location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "displayDishes",
            "description": "Display dishes in a 2x2 grid",
            "parameters": {
                "type": "object",
                "properties": {
                    "dishes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dish_name": {
                                    "type": "string"
                                },
                                "quantity": {
                                    "type": "integer"
                                },
                                "price": {
                                    "type": "number"
                                },
                                "pic": {
                                    "type": "string"
                                }
                            }
                        },
                        "description": "List of dishes."
                    }
                },
                "required": ["dishes"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "viewMoreDishes",
            "description": "Handle 'View More' action",
            "parameters": {
                "type": "object",
                "properties": {
                    "dishes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dish_name": {
                                    "type": "string"
                                },
                                "quantity": {
                                    "type": "integer"
                                },
                                "price": {
                                    "type": "number"
                                },
                                "pic": {
                                    "type": "string"
                                }
                            }
                        },
                        "description": "List of dishes."
                    },
                    "current_index": {
                        "type": "integer",
                        "description": "Current index in the dish list."
                    }
                },
                "required": ["dishes", "current_index"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "parseOrderSelection",
            "description": "Parse the user's dish selection",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_response": {
                        "type": "string",
                        "description": "User's response containing dish selection."
                    }
                },
                "required": ["user_response"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "updateTempOrder",
            "description": "Update the temporary order table",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    },
                    "selected_dishes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dish_name": {
                                    "type": "string"
                                },
                                "quantity": {
                                    "type": "integer"
                                },
                                "price": {
                                    "type": "number"
                                }
                            }
                        },
                        "description": "List of selected dishes."
                    }
                },
                "required": ["phone_number", "selected_dishes"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "confirmOrder",
            "description": "Confirm the order with the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "editOrder",
            "description": "Handle order edits",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recommendAdditionalDishes",
            "description": "Recommend additional dishes based on the user's selection",
            "parameters": {
                "type": "object",
                "properties": {
                    "selected_dishes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dish_name": {
                                    "type": "string"
                                },
                                "quantity": {
                                    "type": "integer"
                                },
                                "price": {
                                    "type": "number"
                                }
                            }
                        },
                        "description": "List of selected dishes."
                    }
                },
                "required": ["selected_dishes"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "handleRecommendations",
            "description": "Handle additional selections based on recommendations",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    },
                    "recommendations": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dish_name": {
                                    "type": "string"
                                },
                                "quantity": {
                                    "type": "integer"
                                },
                                "price": {
                                    "type": "number"
                                }
                            }
                        },
                        "description": "List of recommended dishes."
                    }
                },
                "required": ["phone_number", "recommendations"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generateOrderSummary",
            "description": "Generate a text summary of the order",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "confirmFinalOrder",
            "description": "Ask for final confirmation or edits",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generatePaymentQR",
            "description": "Generate a QR code for payment",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_total": {
                        "type": "number",
                        "description": "Total amount of the order."
                    }
                },
                "required": ["order_total"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "trackPaymentStatus",
            "description": "Track the UPI payment status",
            "parameters": {
                "type": "object",
                "properties": {
                    "payment_id": {
                        "type": "string",
                        "description": "Payment ID."
                    }
                },
                "required": ["payment_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "handlePaymentFailure",
            "description": "Handle payment failures",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    },
                    "payment_id": {
                        "type": "string",
                        "description": "Payment ID."
                    }
                },
                "required": ["phone_number", "payment_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generateInvoice",
            "description": "Create a PDF invoice",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    },
                    "order_details": {
                        "type": "object",
                        "properties": {
                            "order_id": {
                                "type": "string"
                            },
                            "total_amount": {
                                "type": "number"
                            },
                            "order_date": {
                                "type": "string"
                            },
                            "status": {
                                "type": "string"
                            },
                            "dish_details": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "dish_name": {
                                            "type": "string"
                                        },
                                        "quantity": {
                                            "type": "integer"
                                        },
                                        "price": {
                                            "type": "number"
                                        },
                                        "pic": {
                                            "type": "string"
                                        }
                                    }
                                }
                            },
                            "customer_details": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "email": {
                                        "type": "string"
                                    },
                                    "phone": {
                                        "type": "string"
                                    },
                                    "delivery_address": {
                                        "type": "object",
                                        "properties": {
                                            "address": {
                                                "type": "string"
                                            },
                                            "tag": {
                                                "type": "string"
                                            },
                                            "google_pin": {
                                                "type": "string"
                                            }
                                        }
                                    }
                                }
                            },
                            "restaurant_details": {
                                "type": "object",
                                "properties": {
                                    "resto_name": {
                                        "type": "string"
                                    },
                                    "address": {
                                        "type": "string"
                                    },
                                    "google_pin": {
                                        "type": "string"
                                    },
                                    "branches": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "address": {
                                                    "type": "string"
                                                },
                                                "google_pin": {
                                                    "type": "string"
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "distance_kms": {
                                "type": "number"
                            },
                            "upi_acknowledgement_id": {
                                "type": "string"
                            },
                            "upi_status": {
                                "type": "string"
                            },
                            "timestamp": {
                                "type": "string"
                            }
                        }
                    }
                },
                "required": ["phone_number", "order_details"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "handleUserLatency",
            "description": "Handle user latency",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "promptForCompletion",
            "description": "Prompt the user for order completion",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone_number": {
                        "type": "string",
                        "description": "User's phone number."
                    }
                },
                "required": ["phone_number"]
            }
        }
    }
]
