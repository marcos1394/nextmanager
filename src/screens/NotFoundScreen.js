// screens/NotFoundScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export function NotFoundScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.errorContainer}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.errorContent}>
                    <Feather name="compass" size={80} color="#FDB813" />
                    <Text style={styles.errorTitle}>Página no Encontrada</Text>
                    <Text style={styles.errorSubtitle}>Parece que te has perdido. Volvamos a un lugar seguro.</Text>
                    <TouchableOpacity style={styles.errorButton} onPress={() => navigation.replace('Dashboard')}>
                        <Text style={styles.errorButtonText}>Ir al Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

// screens/ServerErrorScreen.js
export function ServerErrorScreen() {
    return (
        <SafeAreaView style={styles.errorContainer}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.errorContent}>
                    <Feather name="cloud-off" size={80} color="#FF6B6B" />
                    <Text style={styles.errorTitle}>Ups, algo salió mal</Text>
                    <Text style={styles.errorSubtitle}>Hubo un problema de nuestro lado. Nuestro equipo ya ha sido notificado.</Text>
                    <TouchableOpacity style={styles.errorButton} onPress={() => { /* Lógica para reiniciar la app o reintentar */ }}>
                        <Text style={styles.errorButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
