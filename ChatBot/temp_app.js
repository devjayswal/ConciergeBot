import fs from 'fs';
import MistralClient from '@mistralai/mistralai';

const apiKey = '7w6ow7caqk7qWr6CH9D5vs61uWj6vsIF';
const client = new MistralClient(apiKey);

async function uploadFile(filePath) {
    try {
        const file = fs.readFileSync(filePath);
        console.log(`File content read from ${filePath}:`, file.toString()); // Log file content for verification

        // Make sure the file is included correctly in the request payload
        const formData = {
            file: {
                value: file,
                options: {
                    filename: filePath,
                    contentType: 'application/jsonl'
                }
            }
        };

        const fileData = await client.files.create({ file: formData });
        console.log(`File uploaded successfully: ${filePath}`);
        return fileData.id;
    } catch (error) {
        console.error(`Failed to upload file: ${filePath}`, error);
        throw error;
    }
}

async function main() {
    try {
        const trainingFilePath = 'training_file.jsonl';
        const validationFilePath = 'validation_file.jsonl';

        const trainingFileId = await uploadFile(trainingFilePath);
        const validationFileId = await uploadFile(validationFilePath);

        const fineTuneResponse = await client.fineTunes.create({
            training_file: trainingFileId,
            validation_file: validationFileId,
            model: 'your-base-model-id', // Replace with your base model ID
            hyperparams: {
                epochs: 5, // Adjust the number of epochs as needed
                learning_rate: 0.001 // Adjust the learning rate as needed
            }
        });

        console.log('Fine-tuning initiated. Job ID:', fineTuneResponse.id);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
