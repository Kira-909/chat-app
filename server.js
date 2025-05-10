const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sqlite3 = require('better-sqlite3'); // Using better-sqlite3 instead of sqlite3

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Create or open the SQLite database
const db = new sqlite3('./chat-app.db', { verbose: console.log });

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Emit previous messages when a new user connects
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous messages to the user
  const rows = db.prepare('SELECT message, timestamp FROM messages ORDER BY timestamp').all();
  socket.emit('previous messages', rows); // Send all previous messages

  // Save chat messages to DB and broadcast
  socket.on('chat message', (msg) => {
    // Save the message
    const insert = db.prepare('INSERT INTO messages (message) VALUES (?)');
    insert.run(msg);
    
    // Broadcast to all users
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
