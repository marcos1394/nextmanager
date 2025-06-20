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

// screens/TasksAndLogbookStyles.js (o al final de cada archivo correspondiente)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    listContainer: { padding: 20, paddingBottom: 100 },
    emptyText: { color: '#A9A9A9', textAlign: 'center', marginTop: 50 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FDB813',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },

    // Estilos de TasksScreen
    tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#2a2a2a', borderRadius: 12, padding: 4 },
    tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8 },
    tabButtonActive: { backgroundColor: '#121212' },
    tabText: { color: '#A9A9A9', textAlign: 'center', fontWeight: '600' },
    tabTextActive: { color: '#FDB813' },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    taskCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#888',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
    },
    taskText: { fontSize: 16, color: '#FFFFFF', flexWrap: 'wrap' },
    taskTextCompleted: { textDecorationLine: 'line-through', color: '#888' },
    taskAssignee: { fontSize: 12, color: '#A9A9A9', marginTop: 4 },
    priorityIndicator: { width: 4, height: '80%', borderRadius: 2, marginLeft: 'auto' },

    // Estilos de LogbookScreen
    logCard: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    logAuthor: { color: '#FFFFFF', fontWeight: '600' },
    logTimestamp: { color: '#888', fontSize: 12 },
    logText: { color: '#A9A9A9', fontSize: 15, lineHeight: 22, marginBottom: 12 },
    logCategoryBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    logCategoryText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});

// Exporta las pantallas para ser usadas en tu navegador
export { TasksScreen, LogbookScreen };
