import json

# Load the JSON data
with open('tuneing.json', 'r') as file:
    data = json.load(file)

# Function to convert JSON to JSONL format
def json_to_jsonl(data, output_file):
    with open(output_file, 'w') as file:
        for message in data['messages']:
            json.dump(message, file)
            file.write('\n')

# Create JSONL files
json_to_jsonl(data, 'training_file.jsonl')
json_to_jsonl(data, 'validation_file.jsonl')
