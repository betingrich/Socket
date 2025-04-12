const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'], // Critical for Heroku
    pingInterval: 25000,
    pingTimeout: 60000
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (Required for Render)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  socket.on('add user', (username) => {
    if (addedUser) return;
    
    socket.username = username;
    ++numUsers;
    addedUser = true;
    
    socket.emit('login', { numUsers });
    socket.broadcast.emit('user joined', { 
      username: socket.username, 
      numUsers 
    });
  });

  socket.on('new message', (message) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message
    });
  });

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
