import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResultScreen = ({ route }) => {
    const { revealedQuestion, answers, isImposter } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Revealed Question:</Text>
            <Text>{revealedQuestion}</Text>
            <Text style={styles.title}>Answers:</Text>
            {answers.map((ans, index) => (
                <Text key={index}>{ans.player}: {ans.answer}</Text>
            ))}
            {isImposter && <Text style={styles.imposterText}>You were the Imposter!</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold' },
    imposterText: { fontSize: 18, fontWeight: 'bold', color: 'red' }
});

export default ResultScreen;
