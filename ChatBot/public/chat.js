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

    const userName = 'User Name'; // Replace this with the logic to fetch or input the user's name

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, userName })
        });
        const data = await response.json();
        appendMessage('AI', formatResponse(data.response), 'ai'); // Changed from data.message to data.response
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

function formatResponse(response) {
    // Check if the response contains options formatted as a list
    if (response.includes("1. **") || response.includes("2. **")) {
        return formatListResponse(response);
    }
    // Otherwise, return the response as plain text
    return `<p>${response}</p>`;
}

function formatListResponse(response) {
    // Split the response into lines
    const lines = response.split('\n');
    let formattedResponse = "<p>" + lines[0] + "</p><ol>";
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].match(/^\d+\.\s\*\*(.*)\*\*:/)) {
            // Format list item
            formattedResponse += `<li>${lines[i].replace(/^\d+\.\s\*\*(.*)\*\*:/, '<strong>$1:</strong>')}</li>`;
        } else {
            // Format additional text
            formattedResponse += `<p>${lines[i]}</p>`;
        }
    }
    formattedResponse += "</ol>";
    return formattedResponse;
}
