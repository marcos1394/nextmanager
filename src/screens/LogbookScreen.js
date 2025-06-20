// screens/LogbookScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// --- DATOS DE MUESTRA ---
const mockLogEntries = [
    { id: '1', text: 'Cliente de la mesa 12 reportó que el aire acondicionado estaba muy fuerte. Se ajustó la temperatura.', author: 'Carlos M.', timestamp: '20:15 - Hoy', category: 'Cliente' },
    { id: '2', text: 'Se recibió el pedido de vinos. Faltó una caja de Malbec. Se notificó al proveedor.', author: 'Ana L.', timestamp: '17:30 - Hoy', category: 'Inventario' },
    { id: '3', text: 'Falla en la máquina de hielo. Se llamó a servicio técnico, llegarán mañana a las 9am.', author: 'Carlos M.', timestamp: '15:00 - Hoy', category: 'Mantenimiento' },
];

const LogEntryCard = ({ entry }) => {
    const categoryColors = {
        'Cliente': '#3B82F6',
        'Inventario': '#10B981',
        'Mantenimiento': '#FDB813',
    };
    return (
        <View style={styles.logCard}>
            <View style={styles.logHeader}>
                <Text style={styles.logAuthor}>{entry.author}</Text>
                <Text style={styles.logTimestamp}>{entry.timestamp}</Text>
            </View>
            <Text style={styles.logText}>{entry.text}</Text>
            <View style={[styles.logCategoryBadge, { backgroundColor: categoryColors[entry.category] || '#888' }]}>
                <Text style={styles.logCategoryText}>{entry.category}</Text>
            </View>
        </View>
    );
};

const LogbookScreen = ({ navigation }) => {
    const [entries, setEntries] = useState(mockLogEntries);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Bitácora del Gerente</Text>
                </View>

                 <FlatList
                    data={entries}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <LogEntryCard entry={item} />}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay entradas en la bitácora.</Text>}
                />

                 <TouchableOpacity style={styles.fab}>
                    <Feather name="plus" size={30} color="#121212" />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
};
