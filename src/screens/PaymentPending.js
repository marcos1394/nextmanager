// screens/PaymentPendingScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth'; // Asegúrate de importar esto

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- COMPONENTES ANIMADOS MEJORADOS ---

const EnhancedProgressBar = () => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animación principal de la barra
        Animated.loop(
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();

        // Efecto shimmer
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateX = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-120, screenWidth * 0.85 + 20],
    });

    const shimmerTranslateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, screenWidth * 0.85 + 100],
    });

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
                <Animated.View 
                    style={[
                        styles.progressBarFill, 
                        { transform: [{ translateX }] }
                    ]}
                >
                    <LinearGradient
                        colors={['#FDB813', '#F59E0B', '#FDB813']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressGradient}
                    />
                </Animated.View>
                
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
                        { transform: [{ translateX: shimmerTranslateX }] }
                    ]}
                />
            </View>
            
            <View style={styles.progressDots}>
                {[0, 1, 2].map((index) => (
                    <ProgressDot key={index} delay={index * 400} />
                ))}
            </View>
        </View>
    );
};

const ProgressDot = ({ delay }) => {
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0.5,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Animated.View
            style={[
                styles.progressDot,
                { transform: [{ scale: scaleAnim }] }
            ]}
        />
    );
};

const ProcessingAnimation = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulse1Anim = useRef(new Animated.Value(0)).current;
    const pulse2Anim = useRef(new Animated.Value(0)).current;
    const pulse3Anim = useRef(new Animated.Value(0)).current;
    const iconScaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Rotación del anillo exterior
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // Pulsos escalonados
        const createPulse = (anim, delay) => {
            setTimeout(() => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 2000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 2000,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            }, delay);
        };

        createPulse(pulse1Anim, 0);
        createPulse(pulse2Anim, 700);
        createPulse(pulse3Anim, 1400);

        // Pulso del ícono
        Animated.loop(
            Animated.sequence([
                Animated.timing(iconScaleAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(iconScaleAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const createPulseStyle = (anim) => ({
        opacity: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.15, 0],
        }),
        transform: [{
            scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2.5],
            })
        }],
    });

    return (
        <View style={styles.animationContainer}>
            {/* Pulsos concéntricos */}
            <Animated.View style={[styles.pulseCircle, styles.pulse1, createPulseStyle(pulse1Anim)]} />
            <Animated.View style={[styles.pulseCircle, styles.pulse2, createPulseStyle(pulse2Anim)]} />
            <Animated.View style={[styles.pulseCircle, styles.pulse3, createPulseStyle(pulse3Anim)]} />

            {/* Anillo rotatorio */}
            <Animated.View
                style={[
                    styles.rotatingRing,
                    { transform: [{ rotate: rotation }] }
                ]}
            >
                <View style={styles.ringSegment} />
                <View style={[styles.ringSegment, styles.ringSegment2]} />
                <View style={[styles.ringSegment, styles.ringSegment3]} />
            </Animated.View>

            {/* Contenedor del ícono */}
            <Animated.View
                style={[
                    styles.iconContainer,
                    { transform: [{ scale: iconScaleAnim }] }
                ]}
            >
                <LinearGradient
                    colors={['#2a2a2a', '#1e1e1e']}
                    style={styles.iconBackground}
                >
                    <MaterialCommunityIcons 
                        name="shield-check" 
                        size={48} 
                        color="#FDB813" 
                    />
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

const ProcessingSteps = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

    const steps = [
        { icon: 'shield-search', text: 'Verificando datos de seguridad' },
        { icon: 'bank-transfer', text: 'Procesando con el banco' },
        { icon: 'check-circle', text: 'Confirmando transacción' },
    ];

    useEffect(() => {
        const cycleSteps = () => {
            steps.forEach((_, index) => {
                setTimeout(() => {
                    setCurrentStep(index);
                    Animated.timing(fadeAnims[index], {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }).start(() => {
                        if (index < steps.length - 1) {
                            Animated.timing(fadeAnims[index], {
                                toValue: 0.3,
                                duration: 500,
                                useNativeDriver: true,
                            }).start();
                        }
                    });
                }, index * 2500);
            });
        };

        cycleSteps();
        const interval = setInterval(cycleSteps, steps.length * 2500);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.stepItem,
                        {
                            opacity: fadeAnims[index],
                            backgroundColor: currentStep === index 
                                ? 'rgba(253, 184, 19, 0.1)' 
                                : 'transparent',
                        }
                    ]}
                >
                    <View style={styles.stepIcon}>
                        <MaterialCommunityIcons
                            name={step.icon}
                            size={16}
                            color={currentStep === index ? '#FDB813' : '#A0A0A0'}
                        />
                    </View>
                    <Text
                        style={[
                            styles.stepText,
                            {
                                color: currentStep === index ? '#FFFFFF' : '#A0A0A0',
                                fontWeight: currentStep === index ? '600' : '400',
                            }
                        ]}
                    >
                        {step.text}
                    </Text>
                </Animated.View>
            ))}
        </View>
    );
};

// --- COMPONENTE PRINCIPAL ---
const PaymentPendingScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { verifySession } = useAuth();

    const [timeElapsed, setTimeElapsed] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const { purchaseId } = route.params;

    useEffect(() => {
        if (!purchaseId) {
            navigation.navigate('Dashboard');
            return;
        }

        // --- LÓGICA DE POLLING ---
        const interval = setInterval(async () => {
            try {
                const response = await api.get(`/payments/purchase-status/${purchaseId}`);
                const data = await response.data;

                if (data.success && data.status === 'active') {
                    clearInterval(interval);
                    await verifySession();
                    navigation.replace('PaymentSuccess');
                } else if (data.success && data.status === 'rejected') {
                    clearInterval(interval);
                    navigation.replace('PaymentFailure');
                }
            } catch (error) {
                console.error("Error verificando estado de pago:", error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [purchaseId, navigation, verifySession]);


    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCancel = () => {
        // Aquí podrías mostrar un modal de confirmación
        // y manejar la cancelación del pago si es posible
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" translucent />
            
            <LinearGradient 
                colors={['#1a1a1a', '#121212', '#0f0f0f']} 
                locations={[0, 0.6, 1]}
                style={styles.gradient}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Indicador de tiempo */}
                    <View style={styles.timeIndicator}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#A0A0A0" />
                        <Text style={styles.timeText}>
                            Tiempo transcurrido: {formatTime(timeElapsed)}
                        </Text>
                    </View>

                    {/* Animación principal */}
                    <ProcessingAnimation />

                    {/* Contenido textual */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Procesando tu Pago</Text>
                        <Text style={styles.subtitle}>
                            Estamos confirmando tu transacción de forma segura con nuestros 
                            proveedores de pago. Este proceso puede tomar hasta 3 minutos.
                        </Text>
                        
                        <View style={styles.warningContainer}>
                            <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                Por favor, mantén la aplicación abierta durante el proceso
                            </Text>
                        </View>
                    </View>

                    {/* Barra de progreso mejorada */}
                    <EnhancedProgressBar />

                    {/* Steps del proceso */}
                    <ProcessingSteps />

                    {/* Información de seguridad */}
                    <View style={styles.securityInfo}>
                        <View style={styles.securityBadge}>
                            <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                            <Text style={styles.securityText}>Transacción Segura SSL</Text>
                        </View>
                        
                        <View style={styles.securityFeatures}>
                            <View style={styles.securityFeature}>
                                <MaterialCommunityIcons name="bank" size={14} color="#A0A0A0" />
                                <Text style={styles.securityFeatureText}>Procesado por bancos certificados</Text>
                            </View>
                            <View style={styles.securityFeature}>
                                <MaterialCommunityIcons name="lock" size={14} color="#A0A0A0" />
                                <Text style={styles.securityFeatureText}>Encriptación de extremo a extremo</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Footer con información de contacto */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        ¿Tienes problemas? Contacta nuestro soporte
                    </Text>
                    <TouchableOpacity style={styles.supportButton}>
                        <MaterialCommunityIcons name="headphones" size={16} color="#FDB813" />
                        <Text style={styles.supportButtonText}>Soporte 24/7</Text>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    content: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },

    // Time Indicator
    timeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeText: {
        color: '#A0A0A0',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 8,
    },

    // Animation Styles
    animationContainer: {
        width: 220,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    pulseCircle: {
        position: 'absolute',
        borderRadius: 110,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
    },
    pulse1: { width: 200, height: 200 },
    pulse2: { width: 160, height: 160 },
    pulse3: { width: 120, height: 120 },
    rotatingRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
    },
    ringSegment: {
        position: 'absolute',
        width: 4,
        height: 20,
        backgroundColor: '#FDB813',
        borderRadius: 2,
        top: 0,
        left: '50%',
        marginLeft: -2,
    },
    ringSegment2: {
        transform: [{ rotate: '120deg' }],
    },
    ringSegment3: {
        transform: [{ rotate: '240deg' }],
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        zIndex: 1,
        shadowColor: '#FDB813',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },
    iconBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },

    // Text Styles
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
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
        marginBottom: 20,
        maxWidth: screenWidth * 0.85,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
        marginLeft: 12,
        flex: 1,
        textAlign: 'center',
    },

    // Progress Bar Styles
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    progressBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    progressBarFill: {
        height: '100%',
        width: 120,
    },
    progressGradient: {
        flex: 1,
        borderRadius: 3,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        width: 50,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FDB813',
    },

    // Steps Styles
    stepsContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    stepText: {
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },

    // Security Info Styles
    securityInfo: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    securityText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    securityFeatures: {
        alignItems: 'center',
        gap: 8,
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    securityFeatureText: {
        color: '#A0A0A0',
        fontSize: 12,
        marginLeft: 8,
        textAlign: 'center',
    },

    // Footer Styles
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    footerText: {
        color: '#A0A0A0',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 12,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.2)',
    },
    supportButtonText: {
        color: '#FDB813',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default PaymentPendingScreen;