$(function() {
  // DOM Elements
  const $window = $(window);
  const $usernameInput = $('.usernameInput');
  const $messages = $('.messages');
  const $inputMessage = $('.inputMessage');
  const $loginPage = $('.login.page');
  const $chatPage = $('.chat.page');
  const $submitButton = $('.submitButton');

  // Connect to server
  const socket = io();

  let username = '';
  let connected = false;

  // Set username function
  const setUsername = () => {
    username = $usernameInput.val().trim();
    
    if (username) {
      // Switch pages
      $loginPage.removeClass('active');
      $chatPage.addClass('active');
      
      // Focus on message input
      $inputMessage.focus();
      
      // Tell server the username
      socket.emit('add user', username);
      
      // Add welcome message
      addMessage('You joined the chat');
    } else {
      // Show error if no username entered
      alert('Please enter a nickname');
      $usernameInput.focus();
    }
  };

  // Add message to chat
  const addMessage = (message, isSystem = false) => {
    const $message = $('<li>').addClass(isSystem ? 'system' : 'message');
    $message.text(message);
    $messages.append($message);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  // Event Listeners
  $submitButton.click(setUsername);

  $window.keydown(event => {
    // Enter key pressed
    if (event.which === 13) {
      if (!username) {
        setUsername();
      } else {
        // Send message if already logged in
        const message = $inputMessage.val();
        if (message) {
          socket.emit('new message', message);
          addMessage(`You: ${message}`);
          $inputMessage.val('');
        }
      }
    }
  });

  // Socket Events
  socket.on('login', (data) => {
    connected = true;
  });

  socket.on('new message', (data) => {
    addMessage(`${data.username}: ${data.message}`);
  });

  socket.on('user joined', (data) => {
    addMessage(`${data.username} joined the chat`, true);
  });

  socket.on('user left', (data) => {
    addMessage(`${data.username} left the chat`, true);
  });

  // Initial focus
  $usernameInput.focus();
});
