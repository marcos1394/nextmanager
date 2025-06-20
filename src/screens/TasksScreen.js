// screens/TasksScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// --- DATOS DE MUESTRA ---
const mockTasks = [
    { id: '1', text: 'Realizar inventario de bebidas frías', assignedTo: 'Ana L.', status: 'pending', priority: 'high' },
    { id: '2', text: 'Limpiar filtros de la freidora #2', assignedTo: 'Juan G.', status: 'pending', priority: 'medium' },
    { id: '3', text: 'Confirmar reservación de la mesa 12', assignedTo: 'Sofía M.', status: 'pending', priority: 'low' },
    { id: '4', text: 'Revisar cuadre de caja del turno anterior', assignedTo: 'Carlos M.', status: 'completed', priority: 'high' },
];

// --- SUBCOMPONENTES ---
const TaskCard = ({ task, onToggleStatus }) => {
    const priorityColors = {
        high: '#FF6B6B',
        medium: '#FDB813',
        low: '#10B981',
    };
    return (
        <View style={styles.taskCard}>
            <TouchableOpacity onPress={onToggleStatus} style={styles.taskCheckbox}>
                {task.status === 'completed' && <Feather name="check" size={18} color="#121212" />}
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.taskText, task.status === 'completed' && styles.taskTextCompleted]}>{task.text}</Text>
                <Text style={styles.taskAssignee}>Asignado a: {task.assignedTo}</Text>
            </View>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[task.priority] }]} />
        </View>
    );
};

const TasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState(mockTasks);
    const [activeTab, setActiveTab] = useState('pending');

    const toggleTaskStatus = (taskId) => {
        setTasks(currentTasks =>
            currentTasks.map(task =>
                task.id === taskId
                    ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
                    : task
            )
        );
    };

    const filteredTasks = tasks.filter(task => task.status === activeTab);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Gestor de Tareas</Text>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setActiveTab('pending')} style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}>
                        <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pendientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('completed')} style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}>
                        <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completadas</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredTasks}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <TaskCard task={item} onToggleStatus={() => toggleTaskStatus(item.id)} />}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay tareas en esta sección.</Text>}
                />

                <TouchableOpacity style={styles.fab}>
                    <Feather name="plus" size={30} color="#121212" />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
};

// ... Estilos al final

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
