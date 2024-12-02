document.addEventListener('DOMContentLoaded', function() {
    appendMessage('AI', "Hello! This is Era, A Concierge AI of GOODNESTS", 'ai');
});

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message === '') return;

    appendMessage('You', message, 'user');

    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const aiResponse = data.response;

        console.log(aiResponse);

        // Check if the AI response is an object
        if (typeof aiResponse !== 'string' && aiResponse && aiResponse.candidates && aiResponse.candidates.length > 0) {
            const firstCandidate = aiResponse.candidates[0];
            if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
                const firstPart = firstCandidate.content.parts[0];
                if (firstPart.text) {
                    // let processedString = processInput(firstPart.text);
                    appendMessage('AI', firstPart.text, 'ai');
                } else {
                    // let processedString = processInput(firstPart);
                    appendMessage('AI', JSON.stringify(firstPart), 'ai');
                }
            } else {
                // let processedString = processInput(firstCandidate);
                appendMessage('AI', JSON.stringify(firstCandidate), 'ai');
            }
        } else {
            // let processedString = processInput(aiResponse);
            // If aiResponse is a string, append it directly
            appendMessage('AI', aiResponse, 'ai');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('Error', 'Failed to send message', 'ai');
    }
}

function appendMessage(sender, message, type) {
    const chatHistory = document.getElementById('chat-history');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong><br>${message}`;
    messageElement.className = `message ${type}`;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}


// function processInput(input) {
//     // Regular expression to find content between triple backticks
//     const regex = /```(.*?)```/g;
//     let match;

//     // Loop through all matches
//     while ((match = regex.exec(input)) !== null) {
//         const content = match[1];

//         // Check if the content starts with data:image/png
//         if (content.startsWith('data:image/png')) {
//             // Create a new img element
//             const img = document.createElement('img');
//             img.src = content;
//             img.alt = 'Payment QR Code';

//             // Append the img element to the div with id 'chat-history'
//             const chatHistoryDiv = document.getElementById('chat-history');
//             chatHistoryDiv.appendChild(img);
//         }

//         // Remove the triple backticks and their content from the input string
//         input = input.replace(match[0], '');
//     }

//     // Return the processed input string
//     return input;
// }

