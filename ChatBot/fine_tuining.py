import vertexai
from vertexai.generative_models import (
    Content,
    FunctionDeclaration,
    GenerativeModel,
    Part,
    Tool,
    GenerationConfig,
)

# Initialize Vertex AI
project_id = 'dulcet-equinox-428417-j7'
vertexai.init(project=project_id, location="us-central1")

# Initialize Gemini model
model = GenerativeModel(model_name="gemini-1.0-pro-001")

# Define the user's prompt in a Content object that we can reuse in model calls
user_prompt_content = Content(
    role="user",
    parts=[
        Part.from_text("Give me details of the user with phone number +919589883539"),
    ],
)

# Define the function
function_name = "fetch_user"
fetch_user_func = FunctionDeclaration(
    name=function_name,
    description="Get the user details from the database server",
    parameters={
        "type": "object",
        "properties": {
            "phone_number": {
                "type": "string",
                "description": "Parameter is an Indian phone number with format +91<10 digits>",
            }
        },
        "required": ["phone_number"]
    },
)

# Define tools
tools = Tool(
    function_declarations=[fetch_user_func],
)

# Send the prompt and instruct the model to generate content using the Tool object that you just created
response = model.generate_content(
    user_prompt_content,
    generation_config=GenerationConfig(temperature=0),
    tools=[tools],
)

# Get the response content
response_content = response.candidates[0].content

# Assuming the response will include function calling information
# This is a simplified example, you might need to adjust it based on your actual response structure
if "fetch_user" in response_content:
    # Parse the response to extract function call details
    function_call_details = response_content.get("fetch_user", {})
    phone_number = function_call_details.get("phone_number")
    
    # Simulate function execution (replace with actual function call)
    user_details = {
        "exists": True,
        "user": {
            "name": "John Doe",
            "DOB": "1990-01-01",
            "email": "john@example.com",
            "phone_number": phone_number,
            "Addresses": ["123 Main St"],
            "food_choices": "Veg",
            "food_preferences": ["Chinese"],
            "health_conditions": ["Diabetes"],
            "allergies": ["Peanuts"],
            "non_veg_days": ["Friday"]
        }
    }
    
    # Print user details
    print(user_details)
