$(function() {
  const FADE_TIME = 150;
  const TYPING_TIMER_LENGTH = 400;
  const COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  const $window = $(window);
  const $usernameInput = $('.usernameInput');
  const $messages = $('.messages');
  const $inputMessage = $('.inputMessage');
  const $loginPage = $('.login.page');
  const $chatPage = $('.chat.page');

  const socket = io();

  let username = '';
  let connected = false;
  let typing = false;
  let lastTypingTime;
  let $currentInput = $usernameInput.focus();

  const addParticipantsMessage = (data) => {
    const message = data.numUsers === 1 
      ? "there's 1 participant" 
      : `there are ${data.numUsers} participants`;
    log(message);
  };

  const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    if (username) {
      $loginPage.removeClass('active');
      $chatPage.addClass('active');
      $currentInput = $inputMessage.focus();
      socket.emit('add user', username);
    }
  };

  const sendMessage = () => {
    const message = cleanInput($inputMessage.val());
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({ username, message });
      socket.emit('new message', message);
    }
  };

  const log = (message, options) => {
    const $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  };

  const addChatMessage = (data, options = {}) => {
    const $typingMessages = getTypingMessages(data);
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    const $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    const $messageBodyDiv = $('<span class="messageBody">').text(data.message);

    const $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  };

  const addMessageElement = (el, options) => {
    const $el = $(el);
    if (!options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    $messages.append($el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  const cleanInput = (input) => {
    return $('<div/>').text(input).html();
  };

  $window.keydown(event => {
    if (event.which === 13) {
      if (username) {
        sendMessage();
      } else {
        setUsername();
      }
    }
  });

  socket.on('login', (data) => {
    connected = true;
    log('Welcome to Socket.IO Chat');
    addParticipantsMessage(data);
  });

  socket.on('new message', (data) => {
    addChatMessage(data);
  });

  socket.on('user joined', (data) => {
    log(`${data.username} joined`);
    addParticipantsMessage(data);
  });

  socket.on('user left', (data) => {
    log(`${data.username} left`);
    addParticipantsMessage(data);
  });
});
