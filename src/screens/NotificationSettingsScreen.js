// screens/NotificationSettingsScreen.js
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView, 
    ScrollView, 
    Switch, 
    StatusBar, 
    Platform,
    Animated,
    Haptics
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// --- COMPONENTES MEJORADOS ---
const NotificationToggle = ({ 
    label, 
    description, 
    value, 
    onValueChange, 
    icon, 
    accentColor = '#FDB813',
    disabled = false
}) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePress = () => {
        if (disabled) return;
        
        // Feedback háptico suave
        Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Animación de escala
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onValueChange();
    };

    return (
        <Animated.View style={[styles.toggleRow, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={handlePress}
                style={styles.toggleContent}
                disabled={disabled}
            >
                <View style={styles.toggleLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
                        <Feather name={icon} size={20} color={accentColor} />
                    </View>
                    <View style={styles.toggleTextContainer}>
                        <Text style={[styles.toggleLabel, disabled && styles.disabledText]}>
                            {label}
                        </Text>
                        <Text style={[styles.toggleDescription, disabled && styles.disabledText]}>
                            {description}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={value}
                    onValueChange={handlePress}
                    trackColor={{ 
                        false: '#2a2a2a', 
                        true: `${accentColor}40` 
                    }}
                    thumbColor={value ? accentColor : '#666'}
                    ios_backgroundColor="#2a2a2a"
                    disabled={disabled}
                    style={styles.switch}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

const SectionHeader = ({ title, subtitle }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
);

const NotificationCard = ({ children, style }) => (
    <View style={[styles.notificationCard, style]}>
        <LinearGradient
            colors={['#1e1e1e', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
        >
            {children}
        </LinearGradient>
    </View>
);

/**
 * NotificationSettingsScreen - Configuración moderna y profesional de notificaciones
 * 
 * Mejoras implementadas:
 * 1. **Diseño Visual Moderno**: Uso de gradientes, glassmorphism y sombras sutiles
 * 2. **Microinteracciones**: Animaciones suaves y feedback háptico para mejor UX
 * 3. **Jerarquía Visual Clara**: Iconos categorizados, espaciado consistente y tipografía mejorada
 * 4. **Estados Inteligentes**: Deshabilitación inteligente de opciones cuando "Todas" está off
 * 5. **Feedback Visual**: Estados hover, pressed y disabled claramente diferenciados
 * 6. **Accesibilidad**: Áreas de toque ampliadas y contraste mejorado
 */

const NotificationSettingsScreen = ({ navigation }) => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const contentAnim = useRef(new Animated.Value(0)).current;

    // Carga las preferencias del usuario al iniciar la pantalla
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/auth/notifications/settings');
                if (response.data.success) {
                    const fetchedSettings = response.data.settings;
                    const individualSettings = ['salesAlerts', 'weeklySummary', 'promotions', 'reminders'];
                    const allEnabled = individualSettings.every(setting => fetchedSettings[setting]);
                    setSettings({ ...fetchedSettings, all: allEnabled, security: true });
                } else {
                    throw new Error(response.data.message || "Error al cargar las preferencias.");
                }
            } catch (err) {
                setError(err.message);
                console.error("Error cargando preferencias:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
        
        Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    // Guarda las preferencias en el backend cada vez que cambian
    const handleToggle = useCallback(async (key) => {
        const getNextState = (prevState) => {
            const newSettings = { ...prevState };
            if (key === 'all') {
                const newValue = !prevState.all;
                Object.keys(newSettings).forEach(k => { newSettings[k] = newValue; });
            } else {
                newSettings[key] = !newSettings[key];
            }
            newSettings.security = true; // Forzar que las de seguridad siempre estén activas
            const individualSettings = ['salesAlerts', 'weeklySummary', 'promotions', 'reminders'];
            newSettings.all = individualSettings.every(s => newSettings[s]);
            return newSettings;
        };
        
        const newSettings = getNextState(settings);
        setSettings(newSettings);

        try {
            const { all, security, ...settingsToSave } = newSettings;
            await api.put('/auth/notifications/settings', settingsToSave);
        } catch (error) {
            console.error("Error guardando preferencias:", error);
            Alert.alert("Error", "No se pudieron guardar tus cambios.");
        }
    }, [settings]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient colors={['#1e1e1e', '#121212', '#0a0a0a']} style={styles.gradient}>
                <BlurView intensity={20} style={styles.headerBlur}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <View style={styles.backButtonInner}>
                                <Feather name="arrow-left" size={22} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>Notificaciones</Text>
                            <Text style={styles.headerSubtitle}>Personaliza tus alertas</Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </BlurView>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#FDB813" style={{ flex: 1 }} />
                ) : error ? (
                    <View style={styles.centeredContainer}><Text style={styles.errorText}>Error: {error}</Text></View>
                ) : settings && (
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <SectionHeader 
                            title="Control Principal"
                            subtitle="Gestiona todas las notificaciones de una vez"
                        />
                        
                        <NotificationCard style={styles.masterCard}>
                            <NotificationToggle
                                icon="bell"
                                label="Todas las Notificaciones"
                                description="Activa o desactiva todas las alertas de la aplicación"
                                value={settings.all}
                                onValueChange={() => handleToggle('all')}
                                accentColor="#FDB813"
                            />
                        </NotificationCard>

                        <SectionHeader 
                            title="Negocio y Ventas"
                            subtitle="Mantente informado sobre el rendimiento"
                        />
                        
                        <NotificationCard>
                            <NotificationToggle
                                icon="trending-up"
                                label="Alertas de Ventas"
                                description="Recibe notificaciones sobre cambios importantes en ventas"
                                value={settings.salesAlerts}
                                onValueChange={() => handleToggle('salesAlerts')}
                                accentColor="#22C55E"
                                disabled={!settings.all}
                            />
                            <View style={styles.divider} />
                            <NotificationToggle
                                icon="bar-chart-2"
                                label="Resumen Semanal"
                                description="Reporte detallado del rendimiento cada lunes"
                                value={settings.weeklySummary}
                                onValueChange={() => handleToggle('weeklySummary')}
                                accentColor="#3B82F6"
                                disabled={!settings.all}
                            />
                            <View style={styles.divider} />
                            <NotificationToggle
                                icon="clock"
                                label="Recordatorios"
                                description="Tareas pendientes y fechas importantes"
                                value={settings.reminders}
                                onValueChange={() => handleToggle('reminders')}
                                accentColor="#8B5CF6"
                                disabled={!settings.all}
                            />
                        </NotificationCard>

                        <SectionHeader 
                            title="Marketing y Seguridad"
                            subtitle="Promociones y alertas de seguridad"
                        />
                        
                        <NotificationCard>
                            <NotificationToggle
                                icon="gift"
                                label="Promociones y Novedades"
                                description="Nuevas funciones, ofertas y contenido exclusivo"
                                value={settings.promotions}
                                onValueChange={() => handleToggle('promotions')}
                                accentColor="#F59E0B"
                                disabled={!settings.all}
                            />
                            <View style={styles.divider} />
                            <NotificationToggle
                                icon="shield"
                                label="Alertas de Seguridad"
                                description="Notificaciones importantes sobre tu cuenta"
                                value={settings.security}
                                onValueChange={() => handleToggle('security')}
                                accentColor="#EF4444"
                                disabled={true} 
                            />
                        </NotificationCard>

                        <View style={styles.infoCard}>
                            <Feather name="info" size={16} color="#888" />
                            <Text style={styles.infoText}>
                                Las notificaciones de seguridad no se pueden desactivar por tu protección.
                            </Text>
                        </View>
                    </ScrollView>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

// --- ESTILOS MODERNOS Y PROFESIONALES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    gradient: {
        flex: 1,
    },
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 16,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#A9A9A9',
        marginTop: 2,
    },
    headerRight: {
        width: 44,
    },
    scrollContainer: {
        paddingTop: Platform.OS === 'ios' ? 120 : 100,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        marginTop: 32,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#A9A9A9',
        lineHeight: 20,
    },
    notificationCard: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardGradient: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
    },
    masterCard: {
        shadowColor: '#FDB813',
        shadowOpacity: 0.2,
    },
    toggleRow: {
        overflow: 'hidden',
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        minHeight: 76,
    },
    toggleLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
        lineHeight: 20,
    },
    toggleDescription: {
        fontSize: 13,
        color: '#A9A9A9',
        lineHeight: 18,
    },
    disabledText: {
        opacity: 0.5,
    },
    switch: {
        marginLeft: 16,
        transform: [{ scale: 1.1 }],
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginLeft: 76,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(136, 136, 136, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: 'rgba(136, 136, 136, 0.2)',
    },
    infoText: {
        fontSize: 13,
        color: '#A9A9A9',
        marginLeft: 12,
        flex: 1,
        lineHeight: 18,
    },
});

export default NotificationSettingsScreen;