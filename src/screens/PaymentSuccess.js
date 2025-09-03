// screens/PaymentSuccessScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Animated,
    Dimensions,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';



const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- COMPONENTES ANIMADOS ---

const SuccessAnimation = () => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Secuencia de animación de entrada
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(checkAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Animación de pulso continua
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Animación de destellos
        Animated.loop(
            Animated.sequence([
                Animated.timing(sparkleAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(sparkleAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Feedback háptico de éxito
        if (Platform.OS === 'ios') {
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 500);
        }
    }, []);

    const pulseStyle = {
        opacity: pulseAnim.interpolate({ 
            inputRange: [0, 0.5, 1], 
            outputRange: [0, 0.15, 0] 
        }),
        transform: [{ 
            scale: pulseAnim.interpolate({ 
                inputRange: [0, 1], 
                outputRange: [1, 2.2] 
            }) 
        }],
    };

    const checkStyle = {
        opacity: checkAnim,
        transform: [{ 
            scale: checkAnim.interpolate({
                inputRange: [0, 0.6, 1],
                outputRange: [0, 1.1, 1],
            })
        }],
    };

    const sparkleRotation = sparkleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.animationContainer}>
            {/* Círculos de pulso */}
            <Animated.View style={[styles.pulseCircle, styles.pulseOuter, pulseStyle]} />
            <Animated.View style={[styles.pulseCircle, styles.pulseMiddle, pulseStyle]} />
            
            {/* Destellos rotatorios */}
            <Animated.View 
                style={[
                    styles.sparkleContainer,
                    { transform: [{ rotate: sparkleRotation }] }
                ]}
            >
                <View style={[styles.sparkle, styles.sparkleTop]} />
                <View style={[styles.sparkle, styles.sparkleRight]} />
                <View style={[styles.sparkle, styles.sparkleBottom]} />
                <View style={[styles.sparkle, styles.sparkleLeft]} />
            </Animated.View>

            {/* Ícono principal */}
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.iconGradient}
                >
                    <Animated.View style={checkStyle}>
                        <MaterialCommunityIcons name="check-bold" size={48} color="#FFFFFF" />
                    </Animated.View>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

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

    const getPlanIcon = (planName) => {
        if (planName.includes('Completo')) return 'rocket-launch';
        if (planName.includes('NexFactura')) return 'receipt';
        if (planName.includes('NextManager')) return 'cog';
        return 'star';
    };

    const getPlanColor = (planName) => {
        if (planName.includes('Completo')) return ['#FDB813', '#F59E0B'];
        if (planName.includes('NexFactura')) return ['#6366F1', '#4F46E5'];
        if (planName.includes('NextManager')) return ['#10B981', '#059669'];
        return ['#FDB813', '#F59E0B'];
    };

    const planIcon = getPlanIcon(plan.product);
    const gradientColors = getPlanColor(plan.product);

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
                            <MaterialCommunityIcons name={planIcon} size={24} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    
                    <View style={styles.planInfo}>
                        <View style={styles.planBadge}>
                            <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                            <Text style={styles.planBadgeText}>ACTIVADO</Text>
                        </View>
                        <Text style={styles.planName}>{plan.product}</Text>
                        <Text style={styles.planPeriod}>
                            Plan {plan.period === 'annually' ? 'Anual' : 'Mensual'}
                        </Text>
                    </View>

                    <View style={styles.planPriceContainer}>
                        <Text style={styles.planPrice}>
                            ${plan.price?.toLocaleString() || '0'}
                        </Text>
                        <Text style={styles.planPeriodText}>
                            /{plan.period === 'annually' ? 'año' : 'mes'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const FeatureHighlight = ({ icon, title, description, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

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
    }, [delay]);

    return (
        <Animated.View
            style={[
                styles.featureItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name={icon} size={20} color="#FDB813" />
            </View>
            <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </Animated.View>
    );
};

// --- COMPONENTE PRINCIPAL ---
const PaymentSuccessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [isNavigating, setIsNavigating] = useState(false);

    // Animaciones para los botones
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const contentFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animación de entrada del contenido
        Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    // Usamos fallback por si se accede a la pantalla sin parámetros
    const { selectedPlan } = route.params || {
        selectedPlan: {
            product: 'Paquete Completo',
            name: 'Plan Anual',
            price: 7500,
            period: 'annually',
            planId: 'completo'
        }
    };

    const handlePrimaryAction = async () => {
        if (isNavigating) return;
        
        setIsNavigating(true);
        
        // Feedback háptico
        if (Platform.OS === 'ios') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        // Animación del botón
        Animated.sequence([
            Animated.timing(buttonScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            navigation.navigate('RestaurantConfig');
            setIsNavigating(false);
        }, 200);
    };

    const handleSecondaryAction = async () => {
        if (Platform.OS === 'ios') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('Dashboard');
    };

    const handleSupportAction = () => {
        // Aquí podrías abrir el soporte, FAQ, etc.
        console.log('Abriendo soporte...');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" translucent />
            
            <LinearGradient 
                colors={['#1a1a1a', '#121212', '#0f0f0f']} 
                locations={[0, 0.6, 1]}
                style={styles.gradient}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Animación de éxito */}
                    <SuccessAnimation />

                    {/* Título y subtítulo */}
                    <Animated.View style={[styles.textContainer, { opacity: contentFadeAnim }]}>
                        <Text style={styles.title}>¡Pago Completado!</Text>
                        <Text style={styles.subtitle}>
                            Felicidades. Tu plan ha sido activado exitosamente y estás listo 
                            para llevar tu negocio al siguiente nivel.
                        </Text>
                    </Animated.View>

                    {/* Resumen del plan */}
                    <PlanSummaryCard plan={selectedPlan} delay={1200} />

                    {/* Características destacadas */}
                    <Animated.View style={[styles.featuresContainer, { opacity: contentFadeAnim }]}>
                        <View style={styles.featuresHeader}>
                            <MaterialCommunityIcons name="star-circle" size={20} color="#FDB813" />
                            <Text style={styles.featuresTitle}>Lo que tienes ahora</Text>
                        </View>
                        
                        <FeatureHighlight
                            icon="flash"
                            title="Activación Inmediata"
                            description="Tu cuenta está lista para usar ahora mismo"
                            delay={1400}
                        />
                        <FeatureHighlight
                            icon="shield-check"
                            title="Garantía de 30 días"
                            description="Si no estás satisfecho, te devolvemos tu dinero"
                            delay={1600}
                        />
                        <FeatureHighlight
                            icon="headphones"
                            title="Soporte Premium"
                            description="Acceso prioritario a nuestro equipo de expertos"
                            delay={1800}
                        />
                    </Animated.View>

                    {/* Métricas de confianza */}
                    <Animated.View style={[styles.trustMetrics, { opacity: contentFadeAnim }]}>
                        <View style={styles.trustMetric}>
                            <MaterialCommunityIcons name="account-group" size={24} color="#10B981" />
                            <Text style={styles.trustMetricNumber}>+10,000</Text>
                            <Text style={styles.trustMetricLabel}>Empresas activas</Text>
                        </View>
                        <View style={styles.trustMetricDivider} />
                        <View style={styles.trustMetric}>
                            <MaterialCommunityIcons name="star" size={24} color="#FDB813" />
                            <Text style={styles.trustMetricNumber}>4.9</Text>
                            <Text style={styles.trustMetricLabel}>Calificación promedio</Text>
                        </View>
                        <View style={styles.trustMetricDivider} />
                        <View style={styles.trustMetric}>
                            <MaterialCommunityIcons name="clock-fast" size={24} color="#6366F1" />
                            <Text style={styles.trustMetricNumber}>24/7</Text>
                            <Text style={styles.trustMetricLabel}>Disponibilidad</Text>
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Footer con botones de acción */}
                <Animated.View style={[styles.footer, { opacity: contentFadeAnim }]}>
                    <View style={styles.footerContent}>
                        {/* Botón principal */}
                        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    isNavigating && styles.primaryButtonDisabled
                                ]}
                                onPress={handlePrimaryAction}
                                disabled={isNavigating}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#FDB813', '#F59E0B']}
                                    style={styles.primaryButtonGradient}
                                >
                                    <MaterialCommunityIcons name="rocket-launch" size={20} color="#121212" />
                                    <Text style={styles.primaryButtonText}>
                                        {isNavigating ? 'Iniciando...' : 'Comenzar Configuración'}
                                    </Text>
                                    <Feather name="arrow-right" size={20} color="#121212" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Opciones secundarias */}
                        <View style={styles.secondaryActions}>
                            <TouchableOpacity 
                                style={styles.secondaryButton} 
                                onPress={handleSecondaryAction}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="view-dashboard" size={16} color="#A0A0A0" />
                                <Text style={styles.secondaryButtonText}>Ir al Dashboard</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.secondaryButton} 
                                onPress={handleSupportAction}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="help-circle" size={16} color="#A0A0A0" />
                                <Text style={styles.secondaryButtonText}>¿Necesitas ayuda?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>
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
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 40 : 80,
        paddingHorizontal: 20,
        paddingBottom: 200,
        alignItems: 'center',
    },

    // Animation Styles
    animationContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    pulseCircle: {
        position: 'absolute',
        borderRadius: 100,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    pulseOuter: {
        width: 180,
        height: 180,
    },
    pulseMiddle: {
        width: 140,
        height: 140,
    },
    sparkleContainer: {
        position: 'absolute',
        width: 160,
        height: 160,
    },
    sparkle: {
        position: 'absolute',
        width: 4,
        height: 4,
        backgroundColor: '#FDB813',
        borderRadius: 2,
    },
    sparkleTop: { top: 0, left: '50%', marginLeft: -2 },
    sparkleRight: { right: 0, top: '50%', marginTop: -2 },
    sparkleBottom: { bottom: 0, left: '50%', marginLeft: -2 },
    sparkleLeft: { left: 0, top: '50%', marginTop: -2 },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
        zIndex: 1,
    },
    iconGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Text Styles
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: screenWidth * 0.85,
    },

    // Plan Card Styles
    planCard: {
        width: '100%',
        marginBottom: 32,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    planCardGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    planCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    planIconContainer: {
        marginRight: 16,
    },
    planIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    planBadgeText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    planName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    planPeriod: {
        color: '#A0A0A0',
        fontSize: 14,
        fontWeight: '500',
    },
    planPriceContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        color: '#FDB813',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    planPeriodText: {
        color: '#A0A0A0',
        fontSize: 12,
        fontWeight: '500',
    },

    // Features Styles
    featuresContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    featuresHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    featuresTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingVertical: 8,
    },
    featureIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureTextContainer: {
        flex: 1,
        paddingTop: 2,
    },
    featureTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDescription: {
        color: '#A0A0A0',
        fontSize: 14,
        lineHeight: 20,
    },

    // Trust Metrics Styles
    trustMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    trustMetric: {
        alignItems: 'center',
        flex: 1,
    },
    trustMetricDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 16,
    },
    trustMetricNumber: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    trustMetricLabel: {
        color: '#A0A0A0',
        fontSize: 12,
        textAlign: 'center',
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
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#FDB813',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },
    primaryButtonDisabled: {
        shadowOpacity: 0.1,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    primaryButtonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 12,
        letterSpacing: 0.5,
    },
    secondaryActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    secondaryButtonText: {
        color: '#A0A0A0',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default PaymentSuccessScreen;