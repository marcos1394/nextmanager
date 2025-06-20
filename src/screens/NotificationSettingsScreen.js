// screens/NotificationSettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- SUBCOMPONENTES ---
const NotificationToggle = ({ label, description, value, onValueChange }) => (
    <View style={styles.toggleRow}>
        <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleLabel}>{label}</Text>
            <Text style={styles.toggleDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#2a2a2a', true: '#FDB813' }}
            thumbColor={value ? '#FFFFFF' : '#888'}
            ios_backgroundColor="#2a2a2a"
        />
    </View>
);

/**
 * NotificationSettingsScreen - Empodera al usuario dándole control total sobre las notificaciones.
 * * Estrategia de UX/UI:
 * 1.  Claridad y Contexto: Cada opción de notificación va acompañada de una descripción clara. El
 * usuario entiende exactamente qué está activando o desactivando.
 * 2.  Control Granular: Se ofrecen interruptores para categorías específicas, permitiendo una
 * personalización detallada. El "interruptor maestro" ofrece una solución rápida y conveniente.
 * 3.  Uso de Componentes Nativos: El uso del componente `Switch` estándar de la plataforma crea una
 * experiencia familiar e intuitiva para el usuario.
 * 4.  Feedback Instantáneo: El estado visual del interruptor cambia al instante, confirmando la
 * acción del usuario sin demoras.
 */
const NotificationSettingsScreen = () => {
    const navigation = useNavigation();
    const [settings, setSettings] = useState({
        all: true,
        salesAlerts: true,
        weeklySummary: true,
        promotions: false,
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleToggleAll = () => {
        const newValue = !settings.all;
        setSettings({
            all: newValue,
            salesAlerts: newValue,
            weeklySummary: newValue,
            promotions: newValue,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notificaciones</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.sectionCard}>
                        <NotificationToggle
                            label="Todas las Notificaciones"
                            description="Activa o desactiva todas las alertas."
                            value={settings.all}
                            onValueChange={handleToggleAll}
                        />
                    </View>
                    
                    <View style={[styles.sectionCard, { marginTop: 20 }]}>
                        <NotificationToggle
                            label="Alertas de Ventas"
                            description="Recibe alertas sobre picos o caídas en las ventas."
                            value={settings.salesAlerts}
                            onValueChange={() => handleToggle('salesAlerts')}
                        />
                        <View style={styles.divider} />
                        <NotificationToggle
                            label="Resumen Semanal"
                            description="Un reporte con el rendimiento de tu negocio cada lunes."
                            value={settings.weeklySummary}
                            onValueChange={() => handleToggle('weeklySummary')}
                        />
                         <View style={styles.divider} />
                        <NotificationToggle
                            label="Novedades y Promociones"
                            description="Entérate de nuevas funciones y ofertas especiales."
                            value={settings.promotions}
                            onValueChange={() => handleToggle('promotions')}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

// --- ESTILOS (COMBINADOS PARA AMBAS PANTALLAS PARA BREVEDAD) ---
const styles = StyleSheet.create({
    // Estilos Comunes
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    scrollContainer: { padding: 24 },
    // Estilos de SettingsScreen
    profileHeader: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FDB813', marginBottom: 12 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    userEmail: { fontSize: 16, color: '#A9A9A9' },
    section: { marginBottom: 24 },
    sectionTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 8 },
    sectionCard: { backgroundColor: '#1e1e1e', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    rowTextContainer: { flex: 1, marginLeft: 16 },
    rowLabel: { fontSize: 16, fontWeight: '500' },
    rowDescription: { fontSize: 12, color: '#A9A9A9', marginTop: 2 },
    // Estilos de NotificationSettingsScreen
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10, height: 100 },
    backButton: { padding: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    toggleTextContainer: { flex: 1, marginRight: 16 },
    toggleLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
    toggleDescription: { fontSize: 12, color: '#A9A9A9', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#2a2a2a', marginLeft: 16 },
});


export { SettingsScreen, NotificationSettingsScreen }; // Exportar ambas
