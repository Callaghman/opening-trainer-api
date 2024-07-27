const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
  res.send('Hello From The Project');
});

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send a JSON message to the client
  ws.send(JSON.stringify({ message: 'PWelcome to chess socket!' }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      console.log(`Move received: from ${data.move.from} to ${data.move.to}, FEN: ${data.move.fen}`);
      // Handle the move received from the client (if needed)
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server is running on port 8000!');
});

