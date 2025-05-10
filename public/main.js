const socket = io();

// Receive previous messages and display them
socket.on('previous messages', (messages) => {
  messages.forEach((msg) => {
    const messageElement = document.createElement('li');
    messageElement.textContent = `[${msg.timestamp}] ${msg.message}`;
    document.getElementById('messages').appendChild(messageElement);
});

// Send a new message
document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.getElementById('m').value;
  socket.emit('chat message', msg);
  document.getElementById('m').value = '';
});
