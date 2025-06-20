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
