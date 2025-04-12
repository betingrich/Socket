$(function() {
  const FADE_TIME = 150;
  const $window = $(window);
  const $usernameInput = $('.usernameInput');
  const $messages = $('.messages');
  const $inputMessage = $('.inputMessage');
  const $loginPage = $('.login.page');
  const $chatPage = $('.chat.page');

  // Connect to server
  const socket = io('http://localhost:3000', {
    reconnectionAttempts: 5
  });

  // Debugging events
  socket.on('connect', () => console.log('Connected to server'));
  socket.on('connect_error', (err) => console.log('Connection error:', err));
  socket.on('disconnect', () => console.log('Disconnected'));

  let username = '';
  let connected = false;

  const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());
    console.log('Setting username:', username); // Debug log

    if (username) {
      $loginPage.removeClass('active');
      $chatPage.addClass('active');
      $inputMessage.focus();
      socket.emit('add user', username);
    }
  };

  const cleanInput = (input) => {
    return $('<div/>').text(input).html();
  };

  // Keyboard events
  $window.keydown(event => {
    if (event.which === 13) { // Enter key
      if (!username) {
        setUsername();
      }
    }
  });

  // Socket events
  socket.on('login', (data) => {
    console.log('Login successful', data); // Debug log
    connected = true;
    addMessage('Welcome to the chat');
  });

  socket.on('new message', (data) => {
    addMessage(`${data.username}: ${data.message}`);
  });

  socket.on('user joined', (data) => {
    addMessage(`${data.username} joined the chat`);
  });

  socket.on('user left', (data) => {
    addMessage(`${data.username} left the chat`);
  });

  function addMessage(message) {
    const $message = $('<li>').text(message);
    $messages.append($message);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }
});
