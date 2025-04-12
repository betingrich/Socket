const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  // When client emits 'add user'
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

  // When client sends message
  socket.on('new message', (message) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: message
    });
  });

  // When user disconnects
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
  console.log(`Server running at http://localhost:${PORT}`);
});
