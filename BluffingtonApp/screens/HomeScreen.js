import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://192.168.0.102'); // Change to your backend server address if needed

const HomeScreen = ({ navigation }) => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');

    const createRoom = () => {
        socket.emit('createRoom', roomCode, playerName);
        navigation.navigate('Game', { roomCode, playerName });
    };

    const joinRoom = () => {
        socket.emit('joinRoom', roomCode, playerName);
        navigation.navigate('Game', { roomCode, playerName });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Imposter Challenge</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Enter Room Code" 
                value={roomCode} 
                onChangeText={setRoomCode} 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Enter Your Name" 
                value={playerName} 
                onChangeText={setPlayerName} 
            />
            <TouchableOpacity style={styles.button} onPress={createRoom}>
                <Text style={styles.buttonText}>Create Room</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={joinRoom}>
                <Text style={styles.buttonText}>Join Room</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: 250, padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 },
    button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginBottom: 10 },
    buttonText: { color: 'white', fontSize: 16 }
});

export default HomeScreen;
