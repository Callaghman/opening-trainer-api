const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Game } = require('js-chess-engine');
const { Chess } = require('chess.js');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

    let currentOpening = "";
    let theOpening = null;
    let moveNumber = 0;
    let game = new Game();
    let chessGame = new Chess();
    let openingMoves = []; 

    console.log('New client connected');
    ws.send(JSON.stringify({ message: 'Welcome to the chess socket!' }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log("message received", data.type)
        
        if (data.type === 'selectOpening') {
            console.log('Opening Received. Initialising with' + data.data)
            currentOpening = data.data
            const data2 = require('./eco_formatted.json');
            data2.forEach((item) => {
                if (item.name === currentOpening){
                    console.log("We have hit the opening");
                    theOpening = item;
                }
            });

            let openingMovesString = theOpening.moves;
            openingMovesString = openingMovesString.split(" ");
            openingMovesString.forEach((item) => {
                if (!item.includes('.')){
                    openingMoves.push(item)
                }
            });
        }
        else if (data.type === 'getOpenings'){
            const data = require('./eco_formatted.json')
            let names = []
            data.forEach((item) => {
                names.push(item.name);
            });
            ws.send(JSON.stringify({ type: 'openingList', names} ));
        }
        else if (data.type === 'selectOpening'){
            currentOpening = data.opening;
            const data2 = require('./eco_formatted.json');
            data2.forEach((item) => {
                if (item.name === currentOpening){
                    console.log("We have hit the opening");
                    theOpening = item;
                }
            });
        }

        else if (data.type === 'move') {
            try {
                // Make the move in the game engine
                if (currentOpening != "" && moveNumber < openingMoves.length){
                    console.log("We are using an opening", currentOpening);
                    console.log(theOpening);
                    console.log(openingMoves[moveNumber], data.move.moveNotation);
                     
                    game.move(data.move.from.toUpperCase(), data.move.to.toUpperCase());

                    chessGame.move(data.move.moveNotation);
                    moveNumber += 1;
                    const openingMove = openingMoves[moveNumber];
                    const gameMove = chessGame.move(openingMove);
                    const computerMove = {            
                        from: gameMove.from,
                        to: gameMove.to,
                    };
                    console.log(computerMove);
                    game.move(computerMove.from.toUpperCase(), computerMove.to.toUpperCase())
                    moveNumber += 1;

                    ws.send(JSON.stringify({
                        type: 'openingMove',
                        san: gameMove.san
                    }));
                }
                else{
                    game.move(data.move.from.toUpperCase(), data.move.to.toUpperCase());
                    moveNumber += 1;
                    const bestMove = game.aiMove();
                    moveNumber += 1;
                    const [from, to] = Object.entries(bestMove)[0]; // Extract the first (and only) entry
                    const formattedMove = { from, to: to.toUpperCase() }; // Ensure the target square is in uppercase
                    ws.send(JSON.stringify({
                        type: 'bestMove',
                        bestMove: formattedMove
                    }));
                }
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

