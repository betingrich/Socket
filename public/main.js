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
    const authError = document.getElementById('authError');

    // Initialize Socket.io connection
    const socket = io('https://mariselriom-9fc58eef44e8.herokuapp.com/', {
        reconnection: true,
        reconnectionAttempts: Infinity,
        transports: ['websocket']
    });

    // Authentication Flow
    loginButton.addEventListener('click', handleLogin);

    // Allow login with Enter key
    loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    async function handleLogin() {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        try {
            setLoading(true);
            
            // For demo purposes - in production, make actual API call
            const isAuthenticated = await mockAuthCheck(username, password);
            
            if (isAuthenticated) {
                loginContainer.classList.remove('active');
                chatContainer.style.display = 'flex';
                messageInput.focus();
                
                // Notify server
                socket.emit('add user', username);
                addSystemMessage('You joined the chat');
            } else {
                showError('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Mock authentication (replace with real API call)
    function mockAuthCheck(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demo: Accept any non-empty credentials
                resolve(username.length > 0 && password.length > 0);
            }, 1000);
        });
    }

    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loginButton.classList.toggle('loading', isLoading);
        loginButton.textContent = isLoading ? 'VERIFYING...' : 'VERIFY IDENTITY';
    }

    function showError(message) {
        authError.textContent = message;
        setTimeout(() => {
            authError.textContent = '';
        }, 3000);
    }

    // Socket Events
    socket.on('connect', () => {
        connectionStatus.textContent = 'CONNECTED';
        connectionStatus.style.background = '#00cc88';
    });

    socket.on('disconnect', () => {
        connectionStatus.textContent = 'DISCONNECTED';
        connectionStatus.style.background = '#ff5555';
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        showError('Connection failed. Please refresh.');
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
        const timeString = new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
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
