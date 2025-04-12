$(function() {
  const $window = $(window);
  const $usernameInput = $('.usernameInput');
  const $messages = $('.messages');
  const $inputMessage = $('.inputMessage');
  const $loginPage = $('.login.page');
  const $chatPage = $('.chat.page');
  const $submitButton = $('.submitButton');

  // Dynamic connection URL
  const socketUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;

  const socket = io(socketUrl, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'] // Fallback for Heroku
  });

  let username = '';

  const setUsername = () => {
    username = $usernameInput.val().trim();
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $inputMessage.focus();
      socket.emit('add user', username);
    }
  };

  // Event listeners
  $submitButton.click(setUsername);
  $window.keydown(e => e.which === 13 && !username && setUsername());

  // Socket events
  socket.on('login', () => addMessage('You joined the chat', 'system'));
  socket.on('new message', (data) => addMessage(`${data.username}: ${data.message}`));
  socket.on('user joined', (data) => addMessage(`${data.username} joined`, 'system'));
  socket.on('user left', (data) => addMessage(`${data.username} left`, 'system'));

  function addMessage(message, type = 'message') {
    const $msg = $(`<li class="${type}">`).text(message);
    $messages.append($msg);
    $messages.scrollTop($messages[0].scrollHeight);
  }
});
