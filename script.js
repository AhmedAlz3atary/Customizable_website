// API Key configuration
const API_KEY = 'AIzaSyBNzXhp_EQ4jCLQaa0FGWinKheBr1J30ZA';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// DOM Elements
const chatbotContainer = document.getElementById('chatbot-container');
const toggleChat = document.getElementById('toggle-chat');
const chatInterface = document.getElementById('chat-interface');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendMessage = document.getElementById('send-message');
const refreshChat = document.getElementById('refresh-chat');

// Draggable functionality
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Make chatbot draggable
chatbotContainer.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    if (e.target.closest('#chatbot-header')) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        setTranslate(currentX, currentY, chatbotContainer);
    }
}

function dragEnd() {
    isDragging = false;
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    // Add transition during drag
    el.style.transition = isDragging ? 'none' : 'transform 0.3s ease-out';
}

// Initialize chatbot in minimized state
document.addEventListener('DOMContentLoaded', () => {
    chatbotContainer.classList.add('minimized');
    chatInterface.classList.add('hidden');
});

// Toggle chat interface
toggleChat.addEventListener('click', () => {
    chatbotContainer.classList.toggle('minimized');
    if (!chatbotContainer.classList.contains('minimized')) {
        // When maximizing
        setTimeout(() => {
            chatInterface.classList.remove('hidden');
        }, 300); // Match transition duration
    } else {
        // When minimizing
        chatInterface.classList.add('hidden');
    }
});

// Handle sending messages
sendMessage.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

function addMessage(message, isUser = false, isCommand = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    if (!isUser) {
        messageDiv.classList.add(isCommand ? 'command-response' : 'ai-response');
    }
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add smooth scroll behavior when new messages are added
chatMessages.style.scrollBehavior = 'smooth';

function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';

    // Process the message and customize the website
    processMessage(message);
}

async function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // First, try to handle website customization commands
    if (handleCustomizationCommand(lowerMessage)) {
        return;
    }

    try {
        // If not a customization command, send to Gemini API
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage(aiResponse);
        } else {
            throw new Error('Invalid API response format');
        }

    } catch (error) {
        console.error('Error:', error);
        addMessage("I apologize, but I'm having trouble connecting to my AI service at the moment. You can still use my website customization features! Try saying 'help' to see what I can do.");
    }
}

function handleCustomizationCommand(lowerMessage) {
    switch(lowerMessage.trim()) {
        case 'change bg color':
            const bgColors = [
                '#f5f7fa', '#e8f4f8', '#f8e8e8', '#f0f8e8', '#f8e8f8', 
                '#e6f3ff', '#fff0f0', '#f0fff0', '#fff5e6', '#f0f0ff',
                '#e6ffe6', '#ffe6e6', '#e6e6ff', '#fff2cc', '#ebf5fb'
            ];
            const randomBgColor = bgColors[Math.floor(Math.random() * bgColors.length)];
            document.documentElement.style.setProperty('--background-color', randomBgColor);
            addMessage(`I've changed the background color to a new shade!`, false, true);
            return true;

        case 'change font family':
            const fonts = [
                'Arial', 'Verdana', 'Georgia', 'Tahoma', 'Trebuchet MS', 
                'Helvetica', 'Times New Roman', 'Courier New', 'Palatino',
                'Garamond', 'Bookman', 'Comic Sans MS', 'Impact', 'Arial Narrow',
                'Lucida Sans', 'Century Gothic'
            ];
            const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
            document.body.style.fontFamily = randomFont;
            addMessage(`I've changed the font to ${randomFont}!`, false, true);
            return true;

        case 'change font size':
            const sizes = [14, 15, 16, 17, 18, 19, 20, 21, 22, 24];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            document.body.style.fontSize = `${randomSize}px`;
            addMessage(`I've changed the font size to ${randomSize}px!`, false, true);
            return true;

        case 'change card style':
            const cardColors = ['#ffffff', '#f8f9fa', '#e9ecef', '#fff5f5', '#f0f7ff'];
            const randomCardColor = cardColors[Math.floor(Math.random() * cardColors.length)];
            document.documentElement.style.setProperty('--card-bg', randomCardColor);
            addMessage(`I've changed the card background color!`, false, true);
            return true;

        case 'change button style':
            const buttonColors = ['#4a90e2', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
            const randomButtonColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];
            document.documentElement.style.setProperty('--button-color', randomButtonColor);
            addMessage(`I've changed the button color!`, false, true);
            return true;

        case 'help':
            addMessage(`I can help you customize the website! Try these commands:
- "change bg color" - Changes the background color
- "change font family" - Changes the font style
- "change font size" - Changes the text size
- "change card style" - Changes the card background
- "change button style" - Changes the button color
- "reset" - Resets all styles to default

You can also use these additional commands:
- Change background color to [color]
- Change text color to [color]
- Change theme color to [color]

You can specify colors using common names (like 'blue', 'red') or hex codes (like '#ff0000')!`, false, true);
            return true;

        case 'reset':
            document.documentElement.style.setProperty('--background-color', '#f5f7fa');
            document.documentElement.style.setProperty('--primary-color', '#4a90e2');
            document.documentElement.style.setProperty('--text-color', '#333');
            document.documentElement.style.setProperty('--card-bg', '#ffffff');
            document.documentElement.style.setProperty('--button-color', '#4a90e2');
            document.body.style.fontSize = '16px';
            document.body.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
            addMessage(`I've reset all styles to their defaults!`, false, true);
            return true;
    }

    // Color commands with specific colors
    if (lowerMessage.includes('color')) {
        const userColor = extractColor(lowerMessage);
        
        if (lowerMessage.includes('background')) {
            const color = userColor || getRandomColor(['#f5f7fa', '#e8f4f8', '#f8e8e8', '#f0f8e8', '#f8e8f8']);
            document.documentElement.style.setProperty('--background-color', color);
            addMessage(`I've changed the background color${userColor ? ` to ${color}` : ' to a new shade'}!`, false, true);
            return true;
        } 
        else if (lowerMessage.includes('text')) {
            const color = userColor || getRandomColor(['#333333', '#444444', '#555555', '#666666', '#000000']);
            document.documentElement.style.setProperty('--text-color', color);
            addMessage(`I've changed the text color${userColor ? ` to ${color}` : ''}!`, false, true);
            return true;
        }
        else if (lowerMessage.includes('theme')) {
            const color = userColor || getRandomColor(['#4a90e2', '#e24a4a', '#4ae24a', '#e2e24a', '#4a4ae2']);
            document.documentElement.style.setProperty('--primary-color', color);
            addMessage(`I've changed the theme color${userColor ? ` to ${color}` : ''}!`, false, true);
            return true;
        }
    }

    return false;
}

// Add refresh button functionality
refreshChat.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    // Re-add initial greeting
    setTimeout(() => {
        addMessage("Hello! I'm your AI assistant. Try these commands: 'change bg color', 'change font family', 'change font size', or type 'help' for more options!", false, true);
    }, 100);
});

function getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

function extractColor(message) {
    // Check for hex color
    const hexMatch = message.match(/#[0-9a-f]{3,6}/i);
    if (hexMatch) return hexMatch[0];

    // Check for common color names
    const colorNames = {
        'red': '#ff0000',
        'blue': '#0000ff',
        'green': '#00ff00',
        'yellow': '#ffff00',
        'purple': '#800080',
        'pink': '#ffc0cb',
        'orange': '#ffa500',
        'black': '#000000',
        'white': '#ffffff',
        'gray': '#808080',
        'brown': '#a52a2a',
        'cyan': '#00ffff',
        'magenta': '#ff00ff',
        'lime': '#00ff00',
        'teal': '#008080',
        'indigo': '#4b0082',
        'violet': '#ee82ee',
        'maroon': '#800000',
        'navy': '#000080',
        'olive': '#808000'
    };

    for (const [colorName, hexValue] of Object.entries(colorNames)) {
        if (message.includes(colorName)) {
            return hexValue;
        }
    }

    return null;
}

// Update notification function
function showCustomNotification(message, duration = 3000) {
    // Remove any existing notifications
    const existingNotif = document.querySelector('.custom-notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    // Auto dismiss after duration
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Update click event for customizable button
document.querySelector('.customizable-button').addEventListener('click', () => {
    showCustomNotification('This is a custom notification from the AI Website! 🎉');
});

// Initial greeting
setTimeout(() => {
    addMessage("Hello! I'm your AI assistant. Try these commands: 'change bg color', 'change font family', 'change font size', or type 'help' for more options!");
}, 1000);
