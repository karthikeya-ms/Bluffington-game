// Frontend: React.js (Web-based UI for Imposter Challenge Game)
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState([]);
    const [inRoom, setInRoom] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [question, setQuestion] = useState('');
    const [imposterQuestion, setImposterQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [isImposter, setIsImposter] = useState(false);
    const [revealedQuestion, setRevealedQuestion] = useState('');
    const [voted, setVoted] = useState(false);
    const [votes, setVotes] = useState({});
    const [gameResult, setGameResult] = useState(null);
    
    useEffect(() => {
        socket.on('updatePlayers', (players) => {
            setPlayers(players);
        });

        socket.on('gameStarted', (data) => {
            setGameStarted(true);
            setQuestion(data.question);
            setIsImposter(data.isImposter);
            if (data.isImposter) setImposterQuestion(data.imposterQuestion);
        });

        socket.on('allAnswersSubmitted', (data) => {
            setAnswers(data.answers);
            setRevealedQuestion(data.revealedQuestion);
        });

        socket.on('votingResults', (data) => {
            setVotes({});
            setGameResult(data);
        });
    }, []);

    const createRoom = () => {
        socket.emit('createRoom', roomCode);
        setInRoom(true);
    };

    const joinRoom = () => {
        socket.emit('joinRoom', roomCode, playerName);
        setInRoom(true);
    };

    const startGame = () => {
        socket.emit('startGame', roomCode);
    };

    const submitAnswer = () => {
        socket.emit('submitAnswer', { roomCode, playerName, answer });
    };

    const voteForImposter = (player) => {
        if (!voted) {
            socket.emit('voteImposter', { roomCode, player });
            setVoted(true);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            {!inRoom ? (
                <div>
                    <h2>Imposter Challenge</h2>
                    <input 
                        type="text" 
                        placeholder="Enter Room Code" 
                        value={roomCode} 
                        onChange={(e) => setRoomCode(e.target.value)} 
                    />
                    <br /><br />
                    <input 
                        type="text" 
                        placeholder="Enter Your Name" 
                        value={playerName} 
                        onChange={(e) => setPlayerName(e.target.value)} 
                    />
                    <br /><br />
                    <button onClick={createRoom}>Create Room</button>
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            ) : !gameStarted ? (
                <div>
                    <h3>Room Code: {roomCode}</h3>
                    <h4>Players:</h4>
                    <ul>
                        {players.map((player, index) => (
                            <li key={index}>{player.name}</li>
                        ))}
                    </ul>
                    <button onClick={startGame}>Start Game</button>
                </div>
            ) : gameResult ? (
                <div>
                    <h3>{gameResult.imposterCaught ? "The Imposter was caught!" : "The Imposter got away!"}</h3>
                    <p>The real imposter was: <strong>{gameResult.actualImposter}</strong></p>
                    {isImposter && (
                        <div>
                            <h4>Your actual question was:</h4>
                            <p><strong>{imposterQuestion}</strong></p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h3>{isImposter ? "Try to Blend In!" : "Answer the Question"}</h3>
                    <p><strong>Question:</strong> {question}</p>
                    <input 
                        type="text" 
                        placeholder="Enter Your Answer" 
                        value={answer} 
                        onChange={(e) => setAnswer(e.target.value)} 
                    />
                    <br /><br />
                    <button onClick={submitAnswer}>Submit Answer</button>
                    {answers.length > 0 && (
                        <div>
                            <h3>Revealed Question: {revealedQuestion}</h3>
                            <h4>Answers:</h4>
                            <ul>
                                {answers.map((ans, index) => (
                                    <li key={index}>{ans.player}: {ans.answer}</li>
                                ))}
                            </ul>
                            <h3>Vote for the Imposter:</h3>
                            <ul>
                                {players.map((player, index) => (
                                    <li key={index}>
                                        {player.name} 
                                        <button onClick={() => voteForImposter(player.name)} disabled={voted}>
                                            Vote
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;


