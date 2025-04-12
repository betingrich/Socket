// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Track users
let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  // When client emits 'add user'
  socket.on('add user', (username) => {
    if (addedUser) return;

    // Store username
    socket.username = username;
    ++numUsers;
    addedUser = true;
    
    // Send login event to client
    socket.emit('login', {
      numUsers
    });
    
    // Broadcast user joined
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers
    });
  });

  // When client emits 'new message'
  socket.on('new message', (message) => {
    // Broadcast message
    socket.broadcast.emit('new message', {
      username: socket.username,
      message
    });
  });

  // When client emits 'typing'
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // When client emits 'stop typing'
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // On disconnect
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;
      // Broadcast user left
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
