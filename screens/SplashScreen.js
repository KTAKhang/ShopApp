import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import SvgIcon from './SvgIcon';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My App</Text>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    loader: {
        marginTop: 20,
    },
});