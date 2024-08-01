const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Game } = require('js-chess-engine');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    let game = new Game();
  console.log('New client connected');
  ws.send(JSON.stringify({ message: 'Welcome to the chess socket!' }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      console.log(`Move received: ${data.move}`);

      try {
        // Make the move in the game engine
        console.log(data.move.from.toUpperCase(), data.move.to);
        game.move(data.move.from.toUpperCase(), data.move.to.toUpperCase());

        // Get the best move from the engine
        const bestMove = game.aiMove();
        const [from, to] = Object.entries(bestMove)[0]; // Extract the first (and only) entry
        const formattedMove = { from, to: to.toUpperCase() }; // Ensure the target square is in uppercase

        console.log(`Best move: ${JSON.stringify(formattedMove)}`);

        // Respond with the best move
        ws.send(JSON.stringify({
          type: 'bestMove',
          bestMove: formattedMove
        }));
      } catch (error) {
        console.error('Invalid move:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid move'
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server is running on port 8000!');
});

