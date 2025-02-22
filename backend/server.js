// Backend: server.js (Node.js + Express + Socket.io)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let rooms = {}; // Store game rooms and player info
const questions = [
    { normal: "What would be your prison death row meal?", imposter: "If the world was ending, what food would you stock up on?" },
    { normal: "What's your most embarrassing moment?", imposter: "What’s something you wish you could forget?" }
];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomCode) => {
        rooms[roomCode] = { players: [], imposter: null, question: {}, answers: [], votes: {} };
        socket.join(roomCode);
        console.log(`Room created: ${roomCode}`);
    });

    socket.on('joinRoom', (roomCode, playerName) => {
        if (rooms[roomCode]) {
            rooms[roomCode].players.push({ id: socket.id, name: playerName });
            socket.join(roomCode);
            io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
        }
    });

    socket.on('startGame', (roomCode) => {
        const players = rooms[roomCode].players;
        if (players.length < 2) {
            console.log("Not enough players to start the game!");
            return;
        }

        const imposterIndex = Math.floor(Math.random() * players.length);
        rooms[roomCode].imposter = players[imposterIndex].id;
        const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
        rooms[roomCode].question = selectedQuestion;

        players.forEach(player => {
            const isImposter = player.id === rooms[roomCode].imposter;
            io.to(player.id).emit('gameStarted', {
                question: isImposter ? selectedQuestion.imposter : selectedQuestion.normal,
                imposterQuestion: selectedQuestion.imposter,
                isImposter
            });
        });
    });

    socket.on('submitAnswer', ({ roomCode, playerName, answer }) => {
        if (rooms[roomCode]) {
            rooms[roomCode].answers.push({ player: playerName, answer });
            if (rooms[roomCode].answers.length === rooms[roomCode].players.length) {
                io.to(roomCode).emit('allAnswersSubmitted', {
                    answers: rooms[roomCode].answers,
                    revealedQuestion: rooms[roomCode].question.normal
                });
            }
        }
    });

    socket.on('voteImposter', ({ roomCode, player }) => {
        if (!rooms[roomCode]) return;
        
        if (!rooms[roomCode].votes) {
            rooms[roomCode].votes = {};
        }

        if (!rooms[roomCode].votes[player]) {
            rooms[roomCode].votes[player] = 1;
        } else {
            rooms[roomCode].votes[player] += 1;
        }

        console.log(`Votes in room ${roomCode}:`, rooms[roomCode].votes);

        if (Object.keys(rooms[roomCode].votes).length === rooms[roomCode].players.length) {
            let maxVotes = 0;
            let suspectedImposter = null;

            Object.keys(rooms[roomCode].votes).forEach((votedPlayer) => {
                if (rooms[roomCode].votes[votedPlayer] > maxVotes) {
                    maxVotes = rooms[roomCode].votes[votedPlayer];
                    suspectedImposter = votedPlayer;
                }
            });

            let actualImposter = rooms[roomCode].players.find(p => p.id === rooms[roomCode].imposter).name;
            let imposterCaught = suspectedImposter === actualImposter;

            console.log(`Imposter identified as ${suspectedImposter}. Actual imposter: ${actualImposter}`);

            io.to(roomCode).emit('votingResults', {
                suspectedImposter,
                actualImposter,
                imposterCaught
            });

            delete rooms[roomCode].votes;
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));


