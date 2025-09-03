// screens/PaymentGatewayScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    ScrollView,
    Image,
    Animated,
    Dimensions,
    Platform,
    Alert,
    Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth'; // Tu AuthContext
import api from '../services/api'; // Tu cliente de API (axios)


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- COMPONENTES UI MEJORADOS ---

const AnimatedSummaryLineItem = ({ label, value, isTotal = false, delay = 0, icon = null }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
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
    }, [delay, fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.summaryLine,
                isTotal && styles.summaryTotalLine,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.summaryLabelContainer}>
                {icon && (
                    <View style={styles.summaryIcon}>
                        <Feather name={icon} size={16} color={isTotal ? "#FDB813" : "#A0A0A0"} />
                    </View>
                )}
                <Text style={[styles.summaryLabel, isTotal && styles.summaryTotalLabel]}>
                    {label}
                </Text>
            </View>
            <Text style={[styles.summaryValue, isTotal && styles.summaryTotalValue]}>
                {value}
            </Text>
        </Animated.View>
    );
};

const PlanCard = ({ plan, delay = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();

            // Shimmer effect
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, scaleAnim, fadeAnim, shimmerAnim]);

    const getPlanColor = (planName) => {
        if (planName.includes('Completo')) return ['#FDB813', '#F59E0B'];
        if (planName.includes('NexFactura')) return ['#6366F1', '#4F46E5'];
        if (planName.includes('NextManager')) return ['#10B981', '#059669'];
        return ['#FDB813', '#F59E0B'];
    };

    const gradient = getPlanColor(plan.product);

    return (
        <Animated.View
            style={[
                styles.planCard,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: fadeAnim,
                }
            ]}
        >
            <LinearGradient
                colors={[...gradient, 'rgba(0,0,0,0.1)']}
                style={styles.planCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
                        {
                            opacity: shimmerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.1],
                            }),
                        }
                    ]}
                />
                
                <View style={styles.planCardContent}>
                    <View style={styles.planCardHeader}>
                        <View style={styles.planBadge}>
                            <Feather name="check-circle" size={16} color="#FFFFFF" />
                            <Text style={styles.planBadgeText}>SELECCIONADO</Text>
                        </View>
                        {plan.period === 'annually' && (
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsBadgeText}>AHORRO 15%</Text>
                            </View>
                        )}
                    </View>
                    
                    <Text style={styles.planName}>{plan.product}</Text>
                    <Text style={styles.planPeriod}>
                        Plan {plan.period === 'annually' ? 'Anual' : 'Mensual'}
                    </Text>
                    
                    <View style={styles.planPriceContainer}>
                        <Text style={styles.planCurrency}>$</Text>
                        <Text style={styles.planPrice}>{plan.price.toLocaleString()}</Text>
                        <Text style={styles.planPeriodText}>
                            /{plan.period === 'annually' ? 'año' : 'mes'}
                        </Text>
                    </View>

                    {plan.period === 'annually' && (
                        <View style={styles.planHighlight}>
                            <MaterialCommunityIcons name="trending-up" size={16} color="#10B981" />
                            <Text style={styles.planHighlightText}>
                                ¡Mejor opción! Ahorras $1,324 al año
                            </Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const PaymentMethodCard = ({ delay = 0 }) => {
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
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
    }, [delay, fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.paymentMethodCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.paymentMethodHeader}>
                <View style={styles.securePaymentBadge}>
                    <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                    <Text style={styles.securePaymentText}>PAGO SEGURO</Text>
                </View>
            </View>

            <View style={styles.paymentMethodContainer}>
                <Image 
                    source={{ uri: 'https://logolook.net/wp-content/uploads/2021/07/Mercado-Pago-Logo-2016.png' }} 
                    style={styles.paymentLogo}
                    resizeMode="contain"
                />
                <Text style={styles.paymentMethodDescription}>
                    Procesado de forma segura por Mercado Pago
                </Text>
            </View>

            <View style={styles.paymentFeatures}>
                <View style={styles.paymentFeature}>
                    <Feather name="shield" size={16} color="#10B981" />
                    <Text style={styles.paymentFeatureText}>Encriptación SSL</Text>
                </View>
                <View style={styles.paymentFeature}>
                    <Feather name="credit-card" size={16} color="#10B981" />
                    <Text style={styles.paymentFeatureText}>Tarjetas principales</Text>
                </View>
                <View style={styles.paymentFeature}>
                    <Feather name="smartphone" size={16} color="#10B981" />
                    <Text style={styles.paymentFeatureText}>Pago móvil</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const ProcessingModal = ({ isVisible }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();

            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, scaleAnim, rotateAnim, pulseAnim]);

    if (!isVisible) return null;

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.modalOverlay}>
            <Animated.View
                style={[
                    styles.processingModal,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <LinearGradient
                    colors={['#1e1e1e', '#2a2a2a']}
                    style={styles.processingModalContent}
                >
                    <Animated.View
                        style={[
                            styles.loadingSpinner,
                            { 
                                transform: [
                                    { rotate: spin },
                                    { scale: pulseAnim }
                                ] 
                            }
                        ]}
                    >
                        <MaterialCommunityIcons name="loading" size={32} color="#FDB813" />
                    </Animated.View>
                    <Text style={styles.processingTitle}>Procesando Pago</Text>
                    <Text style={styles.processingText}>
                        Te estamos redirigiendo a Mercado Pago de forma segura...
                    </Text>
                    <View style={styles.processingSteps}>
                        <Text style={styles.processingStep}>• Verificando datos</Text>
                        <Text style={styles.processingStep}>• Estableciendo conexión segura</Text>
                        <Text style={styles.processingStep}>• Preparando checkout</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

// --- COMPONENTE PRINCIPAL ---
const PaymentGatewayScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth(); // Obtenemos la información del usuario logueado

    
    const [isProcessing, setIsProcessing] = useState(false);
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    
    // Animaciones
    const headerFadeAnim = useRef(new Animated.Value(0)).current;
    const headerSlideAnim = useRef(new Animated.Value(-50)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const buttonGlowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animación de entrada del header
        Animated.parallel([
            Animated.timing(headerFadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(headerSlideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Efecto de brillo en el botón
        Animated.loop(
            Animated.sequence([
                Animated.timing(buttonGlowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonGlowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Con fallback mejorado para desarrollo
    const { selectedPlan } = route.params || {
        selectedPlan: {
            product: 'Paquete Completo',
            name: 'Plan Anual',
            price: 7500,
            period: 'annually',
            planId: 'completo'
        }
    };

    const handlePayment = async () => {
    // 1. Prevenir múltiples clics
    if (isProcessing) return;

    // 2. Extraer datos necesarios del plan y del usuario
    const planId = selectedPlan?.planId;
    const billingCycle = selectedPlan?.period;
    const userId = user?.id;

    // 3. Validar que tengamos toda la información
    if (!planId || !billingCycle || !userId) {
        Alert.alert("Error", "Falta información del plan o del usuario para poder continuar. Por favor, vuelve a intentarlo.");
        return;
    }

    // 4. Iniciar estado de carga y feedback visual/táctil
    setIsProcessing(true);
    setShowProcessingModal(true);
    if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
        // --- INICIO DE LA LÓGICA DE PAGO REAL ---
        
        // 5. Llamar a nuestro backend para crear la preferencia de pago
        console.log(`[Payment] Creando preferencia para plan: ${planId}, ciclo: ${billingCycle}`);
        const response = await api.post('/payments/create-preference', {
            planId: planId,
            billingCycle: billingCycle,
            userId: userId,
            origin: 'mobile_app_onboarding'
        });

        // 6. Verificar la respuesta del backend
        if (response.data.success && response.data.init_point) {
            const paymentUrl = response.data.init_point;
            console.log('[Payment] Redirigiendo a Mercado Pago:', paymentUrl);

            // 7. Abrir la URL de pago en el navegador externo del teléfono
            const supported = await Linking.canOpenURL(paymentUrl);
            if (supported) {
                await Linking.openURL(paymentUrl);
            } else {
                throw new Error(`No se puede abrir esta URL: ${paymentUrl}`);
            }

            // 8. Navegar a una pantalla de espera mientras el pago se procesa externamente
            navigation.replace('PaymentPending', { selectedPlan });

        } else {
            throw new Error(response.data.message || 'No se pudo obtener la URL de pago desde el servidor.');
        }

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al iniciar el proceso de pago. Inténtalo de nuevo.';
        console.error('[Payment] Error:', error);
        if (Platform.OS === 'ios') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert('Error en el pago', errorMessage);
    } finally {
        // 9. Limpiar el estado de carga al finalizar
        setIsProcessing(false);
        setShowProcessingModal(false);
    }
};

    const handleGoBack = async () => {
        if (Platform.OS === 'ios') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.goBack();
    };

    const showHelp = () => {
        Alert.alert(
            'Ayuda',
            'Si tienes problemas con tu pago o necesitas asistencia, contacta nuestro soporte técnico.',
            [
                { 
                    text: 'Contactar Soporte',
                    onPress: () => {
                        // Aquí podrías abrir chat, email o teléfono
                        console.log('Abriendo soporte...');
                    },
                    style: 'default'
                },
                { text: 'Cerrar', style: 'cancel' }
            ]
        );
    };

    // Cálculos mejorados para el resumen
    const isAnnual = selectedPlan.period === 'annually';
    const discountPercent = isAnnual ? 0.15 : 0;
    const subtotal = isAnnual ? Math.round(selectedPlan.price / (1 - discountPercent)) : selectedPlan.price;
    const discount = subtotal - selectedPlan.price;
    const monthlyEquivalent = isAnnual ? Math.round(selectedPlan.price / 12) : selectedPlan.price;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" translucent />
            
            <LinearGradient 
                colors={['#1a1a1a', '#121212', '#0f0f0f']} 
                locations={[0, 0.7, 1]}
                style={styles.gradient}
            >
                {/* Header */}
                <Animated.View 
                    style={[
                        styles.header,
                        {
                            opacity: headerFadeAnim,
                            transform: [{ translateY: headerSlideAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity 
                        onPress={handleGoBack} 
                        style={styles.backButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        activeOpacity={0.7}
                    >
                        <Feather name="arrow-left" size={24} color="#FDB813" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Confirmar Compra</Text>
                        <Text style={styles.headerSubtitle}>Revisa los detalles antes de proceder</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.helpButton}
                        onPress={showHelp}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        activeOpacity={0.7}
                    >
                        <Feather name="help-circle" size={24} color="#A0A0A0" />
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Plan Seleccionado */}
                    <PlanCard plan={selectedPlan} delay={200} />

                    {/* Resumen de Costos */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <MaterialCommunityIcons name="calculator" size={20} color="#FDB813" />
                            <Text style={styles.summaryTitle}>Resumen de Pago</Text>
                        </View>
                        
                        <AnimatedSummaryLineItem 
                            label="Subtotal" 
                            value={`$${subtotal.toLocaleString()}`}
                            icon="tag"
                            delay={400}
                        />
                        
                        {discount > 0 && (
                            <AnimatedSummaryLineItem 
                                label={`Descuento Anual (${Math.round(discountPercent * 100)}%)`}
                                value={`-$${discount.toLocaleString()}`}
                                icon="percent"
                                delay={500}
                            />
                        )}
                        
                        <AnimatedSummaryLineItem 
                            label="Total a Pagar" 
                            value={`$${selectedPlan.price.toLocaleString()}`}
                            isTotal={true}
                            icon="credit-card"
                            delay={600}
                        />
                        
                        {isAnnual && (
                            <View style={styles.monthlyEquivalent}>
                                <MaterialCommunityIcons name="calendar-month" size={16} color="#10B981" />
                                <Text style={styles.monthlyEquivalentText}>
                                    Equivale a ${monthlyEquivalent.toLocaleString()}/mes
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Método de Pago */}
                    <PaymentMethodCard delay={700} />

                    {/* Garantías */}
                    <View style={styles.guaranteeCard}>
                        <View style={styles.guaranteeHeader}>
                            <MaterialCommunityIcons name="shield-star" size={20} color="#10B981" />
                            <Text style={styles.guaranteeTitle}>Tu Compra Está Protegida</Text>
                        </View>
                        
                        <View style={styles.guaranteeFeatures}>
                            <View style={styles.guaranteeFeature}>
                                <View style={styles.guaranteeFeatureIcon}>
                                    <Feather name="refresh-cw" size={16} color="#10B981" />
                                </View>
                                <Text style={styles.guaranteeFeatureText}>
                                    Garantía de devolución 30 días
                                </Text>
                            </View>
                            <View style={styles.guaranteeFeature}>
                                <View style={styles.guaranteeFeatureIcon}>
                                    <Feather name="headphones" size={16} color="#10B981" />
                                </View>
                                <Text style={styles.guaranteeFeatureText}>
                                    Soporte técnico incluido
                                </Text>
                            </View>
                            <View style={styles.guaranteeFeature}>
                                <View style={styles.guaranteeFeatureIcon}>
                                    <Feather name="zap" size={16} color="#10B981" />
                                </View>
                                <Text style={styles.guaranteeFeatureText}>
                                    Activación inmediata
                                </Text>
                            </View>
                        </View>

                        <View style={styles.trustIndicators}>
                            <View style={styles.trustIndicator}>
                                <MaterialCommunityIcons name="bank" size={18} color="#FDB813" />
                                <Text style={styles.trustIndicatorText}>Respaldado por bancos</Text>
                            </View>
                            <View style={styles.trustIndicator}>
                                <MaterialCommunityIcons name="account-group" size={18} color="#FDB813" />
                                <Text style={styles.trustIndicatorText}>+10,000 empresas confían</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Footer fijo con CTA */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <Animated.View 
                            style={[
                                styles.buttonContainer,
                                { transform: [{ scale: buttonScaleAnim }] }
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.payButton,
                                    isProcessing && styles.payButtonDisabled
                                ]}
                                onPress={handlePayment}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={isProcessing ? ['#888', '#666'] : ['#FDB813', '#F59E0B']}
                                    style={styles.payButtonGradient}
                                >
                                    <Animated.View
                                        style={[
                                            styles.buttonGlow,
                                            {
                                                opacity: buttonGlowAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 0.3],
                                                }),
                                            }
                                        ]}
                                    />
                                    
                                    {isProcessing ? (
                                        <View style={styles.payButtonContent}>
                                            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                                            <Text style={styles.payButtonText}>Procesando...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.payButtonContent}>
                                            <MaterialCommunityIcons name="lock-check" size={20} color="#121212" />
                                            <View style={styles.payButtonTextContainer}>
                                                <Text style={styles.payButtonText}>Pagar Ahora</Text>
                                                <Text style={styles.payButtonAmount}>
                                                    ${selectedPlan.price.toLocaleString()}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                        
                        <View style={styles.securityInfo}>
                            <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                            <Text style={styles.securityText}>
                                Transacción protegida con encriptación SSL de 256 bits
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
            
            {/* Modal de procesamiento */}
            <ProcessingModal isVisible={showProcessingModal} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#121212',
    },
    gradient: { 
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
        paddingBottom: 20,
    },
    backButton: { 
        padding: 12,
        borderRadius: 24,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.2)',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#FFFFFF',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#A0A0A0',
        textAlign: 'center',
        marginTop: 4,
    },
    helpButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: { 
        paddingHorizontal: 20,
        paddingBottom: 220,
    },
    
    // Plan Card Styles
    planCard: {
        borderRadius: 20,
        marginBottom: 16,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    planBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    savingsBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    savingsBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    planName: { 
        color: '#FFFFFF', 
        fontSize: 24, 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    planPeriod: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    planPriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 12,
    },
    planCurrency: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    planPrice: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    planPeriodText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        marginLeft: 4,
    },
    planHighlight: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    planHighlightText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8,
    },
    
    // Summary Card Styles
    summaryCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: { 
        color: '#FFFFFF', 
        fontSize: 18, 
        fontWeight: 'bold',
        marginLeft: 12,
    },
    summaryLine: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    summaryIcon: {
        marginRight: 12,
    },
    summaryLabel: { 
        color: '#A0A0A0', 
        fontSize: 16,
        fontWeight: '500',
    },
    summaryValue: { 
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: '600',
    },
    summaryTotalLine: { 
        borderTopWidth: 1, 
        borderTopColor: 'rgba(255, 255, 255, 0.1)', 
        marginTop: 12, 
        paddingTop: 16,
        backgroundColor: 'rgba(253, 184, 19, 0.05)',
        marginHorizontal: -12,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    summaryTotalLabel: { 
        fontWeight: 'bold', 
        color: '#FDB813',
        fontSize: 17,
    },
    summaryTotalValue: { 
        fontWeight: 'bold', 
        color: '#FDB813',
        fontSize: 18,
    },
    monthlyEquivalent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    monthlyEquivalentText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    
    // Payment Method Card Styles
    paymentMethodCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    paymentMethodHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    securePaymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    securePaymentText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    paymentMethodContainer: { 
        alignItems: 'center', 
        paddingVertical: 20,
        marginBottom: 20,
    },
    paymentLogo: { 
        width: 180, 
        height: 50,
        marginBottom: 12,
    },
    paymentMethodDescription: {
        color: '#A0A0A0',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    paymentFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    paymentFeature: {
        alignItems: 'center',
        flex: 1,
    },
    paymentFeatureText: {
        color: '#A0A0A0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 16,
    },

    // Guarantee Card Styles
    guaranteeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    guaranteeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    guaranteeTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    guaranteeFeatures: {
        marginBottom: 20,
    },
    guaranteeFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)',
    },
    guaranteeFeatureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    guaranteeFeatureText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        lineHeight: 20,
    },
    trustIndicators: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    trustIndicator: {
        alignItems: 'center',
        flex: 1,
    },
    trustIndicatorText: {
        color: '#FDB813',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 16,
    },

    // Footer Styles
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    buttonContainer: {
        marginBottom: 16,
    },
    payButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FDB813',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },
    payButtonDisabled: {
        shadowOpacity: 0.1,
        shadowColor: '#888',
    },
    payButtonGradient: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    buttonGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        backgroundColor: '#FDB813',
        borderRadius: 18,
        zIndex: -1,
    },
    payButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonTextContainer: {
        alignItems: 'center',
        marginLeft: 12,
    },
    payButtonText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    payButtonAmount: {
        color: '#121212',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
        marginTop: 2,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    securityText: {
        color: '#A0A0A0',
        fontSize: 12,
        textAlign: 'center',
        marginLeft: 8,
        lineHeight: 16,
    },

    // Processing Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    processingModal: {
        width: screenWidth * 0.85,
        maxWidth: 320,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 30,
    },
    processingModalContent: {
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    loadingSpinner: {
        marginBottom: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    processingTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    processingText: {
        color: '#A0A0A0',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    processingSteps: {
        alignSelf: 'stretch',
    },
    processingStep: {
        color: '#10B981',
        fontSize: 12,
        marginBottom: 8,
        paddingLeft: 8,
        lineHeight: 18,
    },
});

export default PaymentGatewayScreen;