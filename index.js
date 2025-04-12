const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Track users
let numUsers = 0;

io.on('connection', (socket) => {
  console.log('New connection'); // Debug log
  let addedUser = false;

  socket.on('add user', (username) => {
    console.log('Add user attempt:', username); // Debug log
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    
    socket.emit('login', {
      numUsers: numUsers
    });
    
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

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

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
