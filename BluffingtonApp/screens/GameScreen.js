import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://192.168.0.102');

const GameScreen = ({ route, navigation }) => {
    const { roomCode, playerName } = route.params;
    const [gameStarted, setGameStarted] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isImposter, setIsImposter] = useState(false);

    useEffect(() => {
        socket.on('gameStarted', (data) => {
            setGameStarted(true);
            setQuestion(data.question);
            setIsImposter(data.isImposter);
        });

        socket.on('allAnswersSubmitted', (data) => {
            navigation.navigate('Result', { ...data, isImposter });
        });
    }, []);

    const submitAnswer = () => {
        socket.emit('submitAnswer', { roomCode, playerName, answer });
    };

    return (
        <View style={styles.container}>
            {gameStarted ? (
                <>
                    <Text style={styles.title}>Question:</Text>
                    <Text>{question}</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Enter Your Answer" 
                        value={answer} 
                        onChangeText={setAnswer} 
                    />
                    <TouchableOpacity style={styles.button} onPress={submitAnswer}>
                        <Text style={styles.buttonText}>Submit Answer</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <TouchableOpacity style={styles.button} onPress={() => socket.emit('startGame', roomCode)}>
                    <Text style={styles.buttonText}>Start Game</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold' },
    input: { width: 250, padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 },
    button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16 }
});

export default GameScreen;
