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
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// ------------------------------------------------------------------
// --- LÓGICA DE TRADUCCIÓN DE ERRORES MERCADO PAGO ---
// ------------------------------------------------------------------

const getErrorMessage = (statusDetail) => {
    switch (statusDetail) {
        case 'cc_rejected_bad_filled_card_number':
            return 'Revisa el número de tarjeta.';
        case 'cc_rejected_bad_filled_date':
            return 'Revisa la fecha de vencimiento.';
        case 'cc_rejected_bad_filled_security_code':
            return 'Revisa el código de seguridad (CVV).';
        case 'cc_rejected_bad_filled_other':
            return 'Revisa los datos de la tarjeta.';
        case 'cc_rejected_call_for_authorize':
            return 'Debes autorizar el pago con tu banco.';
        case 'cc_rejected_card_disabled':
            return 'Llama a tu banco para activar tu tarjeta.';
        case 'cc_rejected_duplicated_payment':
            return 'Ya hiciste un pago por ese valor.';
        case 'cc_rejected_high_risk':
            return 'El pago fue rechazado por seguridad.';
        case 'cc_rejected_insufficient_amount':
            return 'Tu tarjeta no tiene fondos suficientes.';
        case 'cc_rejected_max_attempts':
            return 'Llegaste al límite de intentos permitidos.';
        default:
            return 'No pudimos procesar tu pago. Por favor, intenta con otro medio.';
    }
};

// ------------------------------------------------------------------
// --- COMPONENTES UI AUXILIARES ---
// ------------------------------------------------------------------

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

// ------------------------------------------------------------------
// --- PANTALLA PRINCIPAL: PAYMENT FAILURE ---
// ------------------------------------------------------------------

const PaymentFailureScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // 1. Obtener parámetros de Mercado Pago y datos locales
    const { 
        status_detail = 'unknown_error', 
        payment_id,
        plan = {} 
    } = route.params || {};

    const errorMessage = getErrorMessage(status_detail);

    // Animaciones
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Feedback háptico de error (vibración fuerte)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Bloquear botón atrás físico para forzar a usar los botones de la UI
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // Secuencia: Aparecer -> Sacudida (Shake Effect)
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
                ]),
                { iterations: 2 } // Solo sacude 2 veces
            )
        ]).start();

        return () => backHandler.remove();
    }, []);

    const handleRetry = () => {
        // Volver a la pasarela de pago (PaymentGateway) pasando el mismo plan
        // Usamos replace para sacar esta pantalla de error del stack
        navigation.replace('Payment', { selectedPlan: plan });
    };

    const handleCancel = () => {
        // Volver a la selección de planes o al dashboard
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Monitor' }], // O 'Plans' si prefieres
            })
        );
    };

    const handleContactSupport = () => {
        Linking.openURL('https://wa.me/521XXXXXXXXXX?text=Ayuda%20mi%20pago%20fue%20rechazado');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            {/* Fondo Rojo Sutil */}
            <LinearGradient 
                colors={['#1a0505', '#000000']} 
                style={StyleSheet.absoluteFillObject} 
                start={{x: 0, y: 0}} 
                end={{x: 0, y: 0.5}}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 1. Icono de Error (Con animación Shake) */}
                <View style={styles.iconContainer}>
                    <Animated.View style={[styles.iconWrapper, { transform: [{ translateX: shakeAnim }] }]}>
                        <LinearGradient
                            colors={['#EF4444', '#B91C1C']} // Rojo Intenso
                            style={styles.iconGradient}
                        >
                            <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FFF" />
                        </LinearGradient>
                        {/* Brillo rojo detrás */}
                        <View style={styles.glowEffect} />
                    </Animated.View>
                </View>

                {/* 2. Mensaje Principal */}
                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
                    <Text style={styles.title}>Pago Rechazado</Text>
                    <Text style={styles.subtitle}>
                        {errorMessage}
                    </Text>
                </Animated.View>

                {/* 3. Tarjeta de Detalles del Error */}
                <Animated.View 
                    style={[
                        styles.errorCard, 
                        { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                    ]}
                >
                    <BlurView intensity={10} tint="dark" style={styles.blurContainer}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Resumen del Intento</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        {plan?.name && (
                            <DetailRow label="Plan Intentado" value={plan.name} />
                        )}
                        {plan?.price && (
                            <DetailRow label="Monto" value={`$${(plan.price * 1.16).toLocaleString('es-MX')} MXN`} />
                        )}
                        {payment_id && (
                            <DetailRow label="Referencia" value={`#${payment_id}`} />
                        )}
                        
                        <View style={styles.suggestionBox}>
                            <Feather name="credit-card" size={16} color="#EF4444" style={{marginTop: 2}} />
                            <Text style={styles.suggestionText}>
                                Te sugerimos intentar con otra tarjeta o contactar a tu banco para autorizar la operación.
                            </Text>
                        </View>
                    </BlurView>
                </Animated.View>

            </ScrollView>

            {/* 4. Botones de Acción */}
            <View style={styles.footer}>
                {/* Botón Principal: Reintentar */}
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={handleRetry}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#FFF', '#E5E5E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.retryButtonText}>Intentar con otra tarjeta</Text>
                        <Feather name="refresh-cw" size={18} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Botón Secundario: Cancelar/Salir */}
                <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancel}
                >
                    <Text style={styles.cancelButtonText}>Cancelar y volver al inicio</Text>
                </TouchableOpacity>

                {/* Link de Soporte */}
                <TouchableOpacity onPress={handleContactSupport} style={styles.supportLink}>
                    <Text style={styles.supportText}>Contactar Soporte</Text>
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
        paddingTop: 60,
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
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
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
        backgroundColor: '#EF4444',
        opacity: 0.3,
        transform: [{ scale: 1.3 }],
        zIndex: 1,
    },

    // Texto
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
        paddingHorizontal: 20,
    },

    // Card
    errorCard: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)', // Borde rojo sutil
        backgroundColor: 'rgba(239, 68, 68, 0.05)', // Fondo rojo muy transparente
    },
    blurContainer: {
        padding: 20,
    },
    cardHeader: {
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
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
    
    // Suggestion Box
    suggestionBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        gap: 10,
    },
    suggestionText: {
        color: '#F87171', // Rojo claro legible
        fontSize: 13,
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
    retryButton: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    buttonGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    retryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelButtonText: {
        color: '#CCC',
        fontSize: 15,
        fontWeight: '500',
    },
    supportLink: {
        alignItems: 'center',
        padding: 8,
    },
    supportText: {
        color: '#666',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
});

export default PaymentFailureScreen;