// screens/MonitorScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { motion } from 'framer-motion/native'; // Para animaciones sutiles si se desea

// --- DATOS DE MUESTRA Y SIMULACIÓN ---
const initialWaitersData = [
    { id: '1', name: 'Ana López', avatar: 'AL', sales: 1250.50, tables: 8 },
    { id: '2', name: 'Juan García', avatar: 'JG', sales: 1890.00, tables: 11 },
    { id: '3', name: 'Sofía Martínez', avatar: 'SM', sales: 980.75, tables: 6 },
    { id: '4', name: 'Carlos Rodríguez', avatar: 'CR', sales: 2150.00, tables: 12 },
    { id: '5', name: 'Laura Hernández', avatar: 'LH', sales: 1540.25, tables: 9 },
];

// --- SUBCOMPONENTES DE UI ---

const StatCard = ({ icon, label, value }) => (
    <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon} size={28} color="#A9A9A9" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const WaiterRankItem = ({ item, rank, maxSales }) => {
    const progressWidth = (item.sales / maxSales) * 100;
    return (
        <View style={styles.itemContainer}>
            <View style={styles.rankContainer}>
                <Text style={styles.rankText}>{rank}</Text>
            </View>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.avatar}</Text>
            </View>
            <View style={styles.waiterInfo}>
                <Text style={styles.waiterName}>{item.name}</Text>
                <View style={styles.progressBarBackground}>
                    <LinearGradient
                        colors={['#FDB813', '#FFAA00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBar, { width: `${progressWidth}%` }]}
                    />
                </View>
            </View>
            <View style={styles.salesInfo}>
                <Text style={styles.salesText}>${item.sales.toFixed(2)}</Text>
                <Text style={styles.tablesText}>{item.tables} mesas</Text>
            </View>
        </View>
    );
};

/**
 * MonitorScreen - Rediseñada como un Dashboard de Operaciones en Vivo.
 * * Estrategia de UX/UI:
 * 1.  Jerarquía de Información: La pantalla presenta KPIs de alto nivel (Ventas, Mesas) en la parte
 * superior para una visión general rápida, y un desglose detallado debajo.
 * 2.  Leaderboard Dinámico: La lista se convierte en una tabla de clasificación que se reordena
 * automáticamente, permitiendo al gerente identificar al personal de mayor rendimiento al instante.
 * 3.  Visualización de Datos Comparativa: Las barras de progreso relativas en cada fila permiten una
 * comparación visual e instantánea del rendimiento de los meseros, sin necesidad de leer cada número.
 * 4.  Simulación de Tiempo Real: Se utiliza un `useEffect` con `setInterval` para simular un flujo de
 * datos constante, permitiendo diseñar y probar una experiencia de usuario verdaderamente "en vivo".
 */
const MonitorScreen = () => {
    const [liveData, setLiveData] = useState(initialWaitersData);
    
    // Simulación de datos en tiempo real
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveData(currentData => {
                // Crear una copia para no mutar el estado directamente
                const newData = currentData.map(waiter => ({ ...waiter }));

                // Elegir un mesero al azar para actualizar
                const randomIndex = Math.floor(Math.random() * newData.length);
                const randomSaleAmount = Math.random() * 200 + 50; // Venta entre 50 y 250

                // Actualizar los datos del mesero
                newData[randomIndex].sales += randomSaleAmount;
                newData[randomIndex].tables += 1;
                
                // Reordenar la lista por ventas (leaderboard)
                newData.sort((a, b) => b.sales - a.sales);

                return newData;
            });
        }, 2000); // Actualiza cada 2 segundos

        return () => clearInterval(interval);
    }, []);

    const totalSales = liveData.reduce((sum, waiter) => sum + waiter.sales, 0);
    const totalTables = liveData.reduce((sum, waiter) => sum + waiter.tables, 0);
    const averageTicket = totalSales / (totalTables || 1);
    const maxSales = Math.max(...liveData.map(w => w.sales), 1); // Evitar división por cero

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>Operaciones en Vivo</Text>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>EN VIVO</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <StatCard icon="cash-multiple" label="Ventas del Turno" value={`$${totalSales.toFixed(2)}`} />
                <StatCard icon="table-chair" label="Mesas Abiertas" value={totalTables.toString()} />
                <StatCard icon="chart-bar" label="Ticket Promedio" value={`$${averageTicket.toFixed(2)}`} />
            </View>

            <FlatList
                data={liveData}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <WaiterRankItem item={item} rank={index + 1} maxSales={maxSales} />
                )}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(45, 212, 191, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
    liveText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    statCard: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
    statLabel: { fontSize: 12, color: '#A9A9A9', marginTop: 2 },
    listContainer: { paddingHorizontal: 20, paddingTop: 10 },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    rankContainer: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: { fontSize: 16, fontWeight: 'bold', color: '#A9A9A9' },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    avatarText: { color: '#FDB813', fontSize: 16, fontWeight: 'bold' },
    waiterInfo: { flex: 1 },
    waiterName: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#2a2a2a',
        borderRadius: 3,
        marginTop: 6,
        overflow: 'hidden',
    },
    progressBar: { height: '100%', borderRadius: 3 },
    salesInfo: { alignItems: 'flex-end', width: 90 },
    salesText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
    tablesText: { fontSize: 12, color: '#A9A9A9', marginTop: 2 },
});

export default MonitorScreen;
