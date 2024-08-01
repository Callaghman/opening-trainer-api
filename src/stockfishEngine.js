const stockfish = require('stockfish/src/stockfish-nnue-16');

class StockfishEngine {
  constructor() {
    this.engine = stockfish();
    this.engine.onmessage = this.onMessage.bind(this);
    this.isReady = false;
    this.queue = [];
  }

  onMessage(event) {
    console.log(`Stockfish says: ${event}`);

    if (event.includes('uciok')) {
      this.isReady = true;
      this.processQueue();
    } else if (event.startsWith('bestmove')) {
      const match = event.match(/bestmove\s([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (match) {
        const bestMove = match[1];
        console.log(`Best move: ${bestMove}`);
        if (this.onBestMove) this.onBestMove(bestMove);
      }
    }
  }

  sendCommand(command) {
    if (this.isReady) {
      console.log(`Sending command: ${command}`);
      this.engine.postMessage(command);
    } else {
      this.queue.push(command);
    }
  }

  processQueue() {
    while (this.queue.length > 0) {
      const command = this.queue.shift();
      this.sendCommand(command);
    }
  }

  startNewGame() {
    this.sendCommand('uci');
    this.sendCommand('ucinewgame');
    this.sendCommand('isready');
  }

  makeMove(algebraicNotation) {
    this.sendCommand(`position startpos moves ${algebraicNotation}`);
    this.sendCommand('go movetime 1000'); // Adjust time as needed
  }

  onBestMove(callback) {
    this.onBestMove = callback;
  }
}

module.exports = StockfishEngine;

