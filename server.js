const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sqlite3 = require('sqlite3').verbose();  // Add SQLite

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const db = new sqlite3.Database('./chat-app.db');  // Create a database

// Create table if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Emit previous messages when a new user connects
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous messages to the user
  db.all("SELECT message, timestamp FROM messages ORDER BY timestamp", (err, rows) => {
    if (err) {
      console.error('Error retrieving messages from DB:', err);
    } else {
      socket.emit('previous messages', rows);  // Send all previous messages
    }
  });

  // Save chat messages to DB and broadcast
  socket.on('chat message', (msg) => {
    // Save the message
    db.run("INSERT INTO messages (message) VALUES (?)", [msg], function(err) {
      if (err) {
        console.error('Error saving message to DB:', err);
      }
    });
    
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
