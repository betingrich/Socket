document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginContainer = document.querySelector('.login-container');
    const chatContainer = document.querySelector('.chat-container');
    const loginButton = document.getElementById('loginButton');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messageArea = document.getElementById('messageArea');
    const connectionStatus = document.querySelector('.connection-status');

    // Connect to Socket.io server
    const socket = io('https://your-heroku-or-render-url.com', {
        reconnection: true,
        reconnectionAttempts: Infinity,
        transports: ['websocket']
    });

    // Authentication
    loginButton.addEventListener('click', () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();
        
        if (username && password) {
            // In production, you would verify credentials with your backend
            socket.emit('authenticate', { username, password });
            
            // For demo, we'll just proceed
            loginContainer.classList.remove('active');
            chatContainer.style.display = 'flex';
            messageInput.focus();
            
            // Set username and show welcome message
            socket.emit('add user', username);
            addSystemMessage('You joined the chat');
        }
    });

    // Socket Events
    socket.on('connect', () => {
        connectionStatus.textContent = 'CONNECTED';
        connectionStatus.style.background = '#00cc88';
    });

    socket.on('disconnect', () => {
        connectionStatus.textContent = 'DISCONNECTED';
        connectionStatus.style.background = '#ff5555';
    });

    socket.on('new message', (data) => {
        addMessage(data.username, data.message, data.timestamp);
    });

    socket.on('user joined', (data) => {
        addSystemMessage(`${data.username} joined the chat`);
    });

    socket.on('user left', (data) => {
        addSystemMessage(`${data.username} left the chat`);
    });

    // Message Handling
    function addMessage(username, message, timestamp) {
        const timeString = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-info">
                <span class="username">${username}</span>
                <span class="timestamp">${timeString}</span>
            </div>
            <div class="message-content">${message}</div>
        `;
        
        messageArea.appendChild(messageElement);
        scrollToBottom();
    }

    function addSystemMessage(message) {
        const systemElement = document.createElement('div');
        systemElement.className = 'message system';
        systemElement.innerHTML = `
            <div class="message-content">${message}</div>
        `;
        messageArea.appendChild(systemElement);
        scrollToBottom();
    }

    function scrollToBottom() {
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    // Send Message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('new message', message);
            messageInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Auto-scroll when new messages arrive
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(messageArea, { childList: true });
});
