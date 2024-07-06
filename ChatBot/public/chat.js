document.addEventListener('DOMContentLoaded', async function() {
    const initialMessage = await fetchInitialMessage(); // Fetch initial message from backend
    appendMessage('AI', initialMessage, 'ai'); // Append the entire initial message
});

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', function (e) {
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
        const data = await response.json();
        const aiResponse = data.response.candidates[0].content.parts[0].text; // Extract AI response text
        appendMessage('AI', aiResponse, 'ai'); // Append AI response
    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('Error', 'Failed to send message', 'ai');
    }
}
async function fetchInitialMessage() {
    try {
        const response = await fetch('/api/chat/initial'); // Endpoint to fetch initial message
        const data = await response.json();
        return data.initialMessage; // Return the entire initial message
    } catch (error) {
        console.error('Error fetching initial message:', error);
        return 'Hello!'; // Default initial message in case of error
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
