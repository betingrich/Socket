const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

let numUsers = 0;

io.on('connection', (socket) => {
    console.log('New connection');
    let addedUser = false;

    // Authentication handler
    socket.on('add user', (username) => {
        if (addedUser) return;

        // Store username and update count
        socket.username = username;
        ++numUsers;
        addedUser = true;
        
        // Send login success to client
        socket.emit('login', {
            numUsers: numUsers
        });
        
        // Broadcast new user joined
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // Message handler
    socket.on('new message', (message) => {
        if (!socket.username) return;
        
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: message,
            timestamp: Date.now()
        });
    });

    // Disconnection handler
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
