// screens/ReportsScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from "react-native-gifted-charts"; // Ejemplo usando una librería popular

// --- DATOS DE MUESTRA Y SIMULACIÓN ---
const mockReportData = {
    sales: {
        kpis: { total: 125430, transactions: 852, average: 147.22 },
        chartData: [
            {value: 3500, label: 'Lun'}, {value: 4200, label: 'Mar'}, {value: 5000, label: 'Mié'},
            {value: 4800, label: 'Jue'}, {value: 6800, label: 'Vie'}, {value: 8500, label: 'Sáb'}, {value: 7900, label: 'Dom'}
        ],
        tableData: [
            { id: '1', day: 'Sábado, 14 Jun', total: 8500, transactions: 75 },
            { id: '2', day: 'Viernes, 13 Jun', total: 6800, transactions: 62 },
            { id: '3', day: 'Jueves, 12 Jun', total: 4800, transactions: 55 },
        ]
    }
    // Aquí podrían ir los datos para 'products', 'waiters', etc.
};


// --- SUBCOMPONENTES DE UI ---
const DateRangePicker = ({ selectedRange, onSelect }) => {
    const ranges = ['Día', 'Semana', 'Mes'];
    return (
        <View style={styles.datePickerContainer}>
            {ranges.map(range => (
                <TouchableOpacity key={range} onPress={() => onSelect(range)} style={[styles.dateButton, selectedRange === range && styles.dateButtonActive]}>
                    <Text style={[styles.dateButtonText, selectedRange === range && styles.dateButtonTextActive]}>{range}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const KpiCard = ({ label, value }) => (
    <View style={styles.kpiCard}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
    </View>
);

/**
 * ReportsScreen - Un centro de inteligencia de negocios interactivo y visual.
 * * Estrategia de UX/UI:
 * 1.  Interactividad Total: La adición de selectores de tipo de reporte y rango de fechas transforma la
 * pantalla de una vista estática a una herramienta de exploración dinámica. El usuario tiene el control.
 * 2.  Visualización Primero: Se priorizan los gráficos para presentar la información de la forma más
 * digerible posible. Las tendencias y comparaciones se vuelven obvias de un solo vistazo.
 * 3.  De lo General a lo Específico: La estructura sigue un flujo lógico: KPIs de resumen, gráfico de
 * tendencias y, finalmente, la tabla con el detalle granular. Esto permite una comprensión progresiva.
 * 4.  Diseño Accionable y Profesional: La inclusión de un botón "Exportar" y una estética consistente
 * con el resto de la app elevan la pantalla a una herramienta de nivel profesional.
 */
const ReportsScreen = () => {
    const [activeReport, setActiveReport] = useState('sales');
    const [activeDateRange, setActiveDateRange] = useState('Semana');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulación de carga de datos al cambiar los filtros
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setData(mockReportData[activeReport]);
            setIsLoading(false);
        }, 1000); // Simula una llamada de red
        return () => clearTimeout(timer);
    }, [activeReport, activeDateRange]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Reportes</Text>
                    <TouchableOpacity style={styles.exportButton}>
                        <Feather name="download" size={20} color="#FDB813" />
                        <Text style={styles.exportButtonText}>Exportar</Text>
                    </TouchableOpacity>
                </View>

                <DateRangePicker selectedRange={activeDateRange} onSelect={setActiveDateRange} />

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#FDB813" style={{ marginTop: 100 }} />
                    ) : data ? (
                        <>
                            {/* Gráfico Principal */}
                            <View style={styles.chartContainer}>
                                <Text style={styles.sectionTitle}>Ventas de la Última {activeDateRange}</Text>
                                <BarChart
                                    data={data.chartData}
                                    barWidth={22}
                                    spacing={25}
                                    roundedTop
                                    frontColor={'#FDB813'}
                                    gradientColor={'#FFAA00'}
                                    yAxisTextStyle={{color: '#888'}}
                                    xAxisLabelTextStyle={{color: '#888', marginTop: 10}}
                                    noOfSections={4}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                />
                            </View>

                            {/* KPIs */}
                            <View style={styles.kpiGrid}>
                                <KpiCard label="Ingresos Totales" value={`$${data.kpis.total.toLocaleString()}`} />
                                <KpiCard label="Transacciones" value={data.kpis.transactions.toLocaleString()} />
                                <KpiCard label="Ticket Promedio" value={`$${data.kpis.average.toFixed(2)}`} />
                            </View>

                            {/* Tabla de Datos */}
                            <View style={styles.tableContainer}>
                                <Text style={styles.sectionTitle}>Desglose de Ventas</Text>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.tableHeaderText}>Día</Text>
                                    <Text style={styles.tableHeaderText}>Venta Total</Text>
                                </View>
                                {data.tableData.map(item => (
                                    <View key={item.id} style={styles.tableRow}>
                                        <Text style={styles.tableCellPrimary}>{item.day}</Text>
                                        <Text style={styles.tableCellSecondary}>${item.total.toLocaleString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text style={styles.errorText}>No se pudieron cargar los datos.</Text>
                    )}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    exportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    exportButtonText: { color: '#FDB813', marginLeft: 8, fontWeight: '600' },
    datePickerContainer: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 20, marginVertical: 16, backgroundColor: '#1e1e1e', alignSelf: 'center', borderRadius: 20 },
    dateButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16 },
    dateButtonActive: { backgroundColor: '#FDB813' },
    dateButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    dateButtonTextActive: { color: '#121212' },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
    chartContainer: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 20, marginBottom: 20 },
    kpiGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
    kpiCard: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 16, padding: 16, alignItems: 'center' },
    kpiLabel: { color: '#A9A9A9', fontSize: 12, marginBottom: 4 },
    kpiValue: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    tableContainer: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 20 },
    tableHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#2a2a2a', paddingBottom: 12, marginBottom: 8 },
    tableHeaderText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    tableCellPrimary: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
    tableCellSecondary: { color: '#A9A9A9', fontSize: 14 },
    errorText: { color: '#FF6B6B', textAlign: 'center', marginTop: 50 },
});

export default ReportsScreen;
