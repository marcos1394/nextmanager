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
    BackHandler
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

// Tarjeta de Resumen del Plan (Versión corregida y segura)
const PlanSummaryCard = ({ plan, delay = 0 }) => {
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    // Fallback seguro para el nombre del plan
    const planName = plan?.name || plan?.product || 'Plan NextManager';
    
    // Lógica visual simple basada en el nombre
    const isPro = planName.includes('Completo') || planName.includes('Pro');
    const iconName = isPro ? 'rocket-launch' : 'star';
    const gradientColors = isPro ? ['#FDB813', '#F59E0B'] : ['#6366F1', '#4F46E5'];

    return (
        <Animated.View
            style={[
                styles.planCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.planCardGradient}
            >
                <View style={styles.planCardContent}>
                    <View style={styles.planIconContainer}>
                        <LinearGradient
                            colors={gradientColors}
                            style={styles.planIconGradient}
                        >
                            <MaterialCommunityIcons name={iconName} size={24} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    
                    <View style={styles.planInfo}>
                        <View style={styles.planBadge}>
                            <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                            <Text style={styles.planBadgeText}>ACTIVADO</Text>
                        </View>
                        <Text style={styles.planName}>{planName}</Text>
                        <Text style={styles.planPeriod}>
                            Plan {plan?.period === 'annually' ? 'Anual' : 'Mensual'}
                        </Text>
                    </View>

                    <View style={styles.planPriceContainer}>
                        <Text style={styles.planPrice}>
                            ${(plan?.price || 0).toLocaleString('es-MX')}
                        </Text>
                        <Text style={styles.planPeriodText}>
                            /{plan?.period === 'annually' ? 'año' : 'mes'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const DetailRow = ({ label, value, copyable }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.detailValue}>{value}</Text>
            {copyable && <Feather name="copy" size={12} color="#666" style={{ marginLeft: 6 }} />}
        </View>
    </View>
);

// ------------------------------------------------------------------
// --- PANTALLA PRINCIPAL: PAYMENT SUCCESS ---
// ------------------------------------------------------------------

const PaymentSuccessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // 1. Obtener parámetros de la navegación (Mercado Pago + Datos Locales)
    // Nota: 'payment_id' y 'status' suelen venir de la respuesta de MP o del Deep Link.
    // 'plan' lo pasamos nosotros desde PaymentGatewayScreen para mostrar el resumen.
    const { 
        payment_id = 'N/A', 
        status = 'approved', 
        collection_id, 
        plan = {} // Objeto del plan comprado
    } = route.params || {};

    const transactionId = payment_id !== 'N/A' ? payment_id : (collection_id || Math.floor(Math.random() * 1000000000));
    
    // Animaciones
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Feedback háptico de éxito al montar
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Bloquear botón atrás (Hardware) para evitar volver al carrito pagado
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // Secuencia de animación de entrada
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();

        return () => backHandler.remove();
    }, []);

    const handleContinue = () => {
        // Resetear la navegación para que el usuario no pueda volver atrás.
        // Lo mandamos al Dashboard (Monitor).
        // Como ya pagó, el Monitor debería detectar que ya tiene plan (aunque quizás le falte configurar restaurante)
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Monitor' }, // O 'RestaurantConfig' si tienes esa pantalla lista
                ],
            })
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            {/* Fondo */}
            <LinearGradient colors={['#000000', '#111111']} style={StyleSheet.absoluteFillObject} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 1. Icono de Éxito Animado */}
                <View style={styles.successIconContainer}>
                    <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.iconGradient}
                        >
                            <MaterialCommunityIcons name="check-decagram" size={64} color="#FFF" />
                        </LinearGradient>
                        {/* Efecto de brillo detrás */}
                        <View style={styles.glowEffect} />
                    </Animated.View>
                </View>

                {/* 2. Mensajes de Texto */}
                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <Text style={styles.title}>¡Pago Exitoso!</Text>
                    <Text style={styles.subtitle}>
                        Tu suscripción ha sido activada correctamente.{"\n"}Gracias por confiar en NextManager.
                    </Text>
                </Animated.View>

                {/* 3. Tarjeta del Plan (Lo que compró) */}
                <View style={styles.sectionContainer}>
                    <PlanSummaryCard plan={plan} delay={300} />
                </View>

                {/* 4. Detalles de la Transacción (Recibo) */}
                <Animated.View 
                    style={[
                        styles.receiptCard, 
                        { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                    ]}
                >
                    <BlurView intensity={10} tint="dark" style={styles.blurContainer}>
                        <View style={styles.receiptHeader}>
                            <Text style={styles.receiptTitle}>Detalles de Transacción</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>APROBADO</Text>
                            </View>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <DetailRow label="ID Referencia" value={`#${transactionId}`} copyable />
                        <DetailRow label="Fecha" value={new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} />
                        <DetailRow label="Método" value="Mercado Pago" />
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Pagado</Text>
                            <Text style={styles.totalValue}>
                                {/* Calculamos el total aproximado si no viene en params, sumando IVA al precio base */}
                                ${((plan?.price || 0) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </Text>
                        </View>
                    </BlurView>
                </Animated.View>

            </ScrollView>

            {/* 5. Botón de Acción Principal */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleContinue}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#FDB813', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Continuar al Dashboard</Text>
                        <Feather name="arrow-right" size={20} color="#000" />
                    </LinearGradient>
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
        paddingBottom: 100, // Espacio para el footer
        alignItems: 'center',
    },
    
    // Icono Éxito
    successIconContainer: {
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
        shadowColor: "#10B981",
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
        backgroundColor: '#10B981',
        opacity: 0.3,
        transform: [{ scale: 1.3 }],
        zIndex: 1,
    },

    // Textos
    title: {
        fontSize: 32,
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
    },

    // Sección
    sectionContainer: {
        width: '100%',
        marginBottom: 20,
    },

    // Plan Card (Estilos específicos del componente interno)
    planCard: {
        borderRadius: 16,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: '#1A1A1A',
    },
    planCardGradient: {
        padding: 20,
    },
    planCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planIconContainer: {
        marginRight: 16,
    },
    planIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    planBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
        letterSpacing: 0.5,
    },
    planName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    planPeriod: {
        fontSize: 14,
        color: '#A0A0A0',
    },
    planPriceContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    planPeriodText: {
        fontSize: 12,
        color: '#888',
    },

    // Recibo Card
    receiptCard: {
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
    receiptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    receiptTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    statusBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#10B981',
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
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    totalLabel: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        color: '#FDB813',
        fontSize: 20,
        fontWeight: 'bold',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 10 : 24,
        backgroundColor: 'transparent', 
    },
    actionButton: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#FDB813',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    buttonGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentSuccessScreen;