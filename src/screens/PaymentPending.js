import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
    ScrollView,
    BackHandler,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// ------------------------------------------------------------------
// --- COMPONENTES UI AUXILIARES ---
// ------------------------------------------------------------------

const DetailRow = ({ label, value, copyable }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.detailValue}>{value}</Text>
            {copyable && <Feather name="copy" size={12} color="#888" style={{ marginLeft: 6 }} />}
        </View>
    </View>
);

// Reutilizamos una versión simplificada de la tarjeta de plan para contexto visual
const MiniPlanCard = ({ planName, price }) => (
    <View style={styles.miniCard}>
        <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.miniCardContent}
        >
            <View style={styles.miniIconBox}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.miniCardLabel}>Suscripción Solicitada</Text>
                <Text style={styles.miniCardTitle}>{planName || 'Plan NextManager'}</Text>
            </View>
            <Text style={styles.miniCardPrice}>${price?.toLocaleString('es-MX')}</Text>
        </LinearGradient>
    </View>
);

// ------------------------------------------------------------------
// --- PANTALLA PRINCIPAL: PAYMENT PENDING ---
// ------------------------------------------------------------------

const PaymentPendingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // 1. Obtener parámetros de Mercado Pago
    // 'payment_type' nos ayuda a saber si fue Ticket (Oxxo) o Tarjeta
    const { 
        payment_id = 'Pendiente', 
        status = 'in_process', 
        payment_type, 
        plan = {} 
    } = route.params || {};

    // Animaciones
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Feedback háptico de advertencia (suave)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        // Bloquear botón atrás físico (Android)
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // Animación de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Animación de pulso continuo para el reloj
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();

        return () => backHandler.remove();
    }, []);

    const handleContinue = () => {
        // Redirigimos al Monitor. El backend eventualmente actualizará el estado del usuario
        // vía Webhook cuando el pago se concrete.
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Monitor' }],
            })
        );
    };

    const handleHelp = () => {
        // Opción para contactar soporte si tarda mucho
        Linking.openURL('https://wa.me/521XXXXXXXXXX?text=Tengo%20un%20problema%20con%20mi%20pago%20pendiente');
    };

    // Mensaje dinámico según el tipo de pago
    const getMessage = () => {
        if (payment_type === 'ticket' || payment_type === 'bank_transfer') {
            return "Tu referencia de pago ha sido generada. Una vez que realices el depósito, tu plan se activará automáticamente.";
        }
        return "Estamos procesando tu pago con el banco. Esto puede tomar unos minutos. No es necesario que vuelvas a pagar.";
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000000', '#111111']} style={StyleSheet.absoluteFillObject} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 1. Icono de Pendiente (Reloj de Arena) */}
                <View style={styles.iconContainer}>
                    <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
                        <LinearGradient
                            colors={['#F59E0B', '#D97706']} // Naranja/Ámbar
                            style={styles.iconGradient}
                        >
                            <MaterialCommunityIcons name="timer-sand" size={56} color="#FFF" />
                        </LinearGradient>
                        {/* Brillo naranja */}
                        <View style={styles.glowEffect} />
                    </Animated.View>
                </View>

                {/* 2. Textos Principales */}
                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
                    <Text style={styles.title}>Pago en Proceso</Text>
                    <Text style={styles.subtitle}>
                        {getMessage()}
                    </Text>
                </Animated.View>

                {/* 3. Tarjeta Resumen */}
                <Animated.View style={{ opacity: fadeAnim, width: '100%', marginBottom: 20 }}>
                    <MiniPlanCard planName={plan?.name} price={plan?.price} />
                </Animated.View>

                {/* 4. Detalles Técnicos */}
                <Animated.View 
                    style={[
                        styles.detailsCard, 
                        { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                    ]}
                >
                    <BlurView intensity={10} tint="dark" style={styles.blurContainer}>
                        <View style={styles.detailsHeader}>
                            <Text style={styles.detailsTitle}>Estatus del Pedido</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>PENDIENTE</Text>
                            </View>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <DetailRow label="Referencia" value={`#${payment_id}`} copyable />
                        <DetailRow label="Fecha" value={new Date().toLocaleDateString('es-MX')} />
                        <DetailRow label="Método" value="Mercado Pago" />
                        
                        <View style={styles.infoBox}>
                            <Feather name="info" size={14} color="#F59E0B" style={{marginTop: 2}} />
                            <Text style={styles.infoText}>
                                Te enviaremos un correo electrónico cuando el pago sea confirmado.
                            </Text>
                        </View>
                    </BlurView>
                </Animated.View>

            </ScrollView>

            {/* 5. Footer con Acciones */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleContinue}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#333', '#444']} // Botón neutro, no de éxito todavía
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Ir al Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleHelp} style={styles.helpLink}>
                    <Text style={styles.helpText}>¿Tienes problemas? Contáctanos</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
        alignItems: 'center',
    },
    
    // Icono
    iconContainer: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        position: 'relative',
    },
    iconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
    },
    glowEffect: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
        borderRadius: 50,
        backgroundColor: '#F59E0B',
        opacity: 0.3,
        transform: [{ scale: 1.3 }],
        zIndex: 1,
    },

    // Textos
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 10,
    },

    // Mini Plan Card
    miniCard: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#1A1A1A',
    },
    miniCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    miniIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    miniCardLabel: {
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    miniCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    miniCardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F59E0B',
    },

    // Detalles Card
    detailsCard: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    blurContainer: {
        padding: 20,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    statusBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)', // Fondo naranja transparente
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#F59E0B', // Texto naranja
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        color: '#888',
        fontSize: 14,
    },
    detailValue: {
        color: '#DDD',
        fontSize: 14,
        fontWeight: '500',
    },
    
    // Info Box
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        gap: 8,
    },
    infoText: {
        color: '#F59E0B',
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 10 : 24,
    },
    actionButton: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
    },
    buttonGradient: {
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpLink: {
        alignItems: 'center',
        padding: 10,
    },
    helpText: {
        color: '#666',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default PaymentPendingScreen;