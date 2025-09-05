// screens/PaymentFailureScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    ScrollView,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// --- COMPONENTES MEJORADOS ---
const AnimatedSuggestionItem = ({ text, delay = 0 }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(30);

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
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={[
                styles.suggestionItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.bulletPoint}>
                <View style={styles.bulletDot} />
            </View>
            <Text style={styles.suggestionText}>{text}</Text>
        </Animated.View>
    );
};

const PulsingIcon = () => {
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        const pulseAnimation = Animated.loop(
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
                })
            ])
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                styles.iconWrapper,
                { transform: [{ scale: pulseAnim }] }
            ]}
        >
            <View style={styles.iconBackground}>
                <MaterialCommunityIcons 
                    name="credit-card-off-outline" 
                    size={60} 
                    color="#FF6B6B" 
                />
            </View>
            <View style={styles.iconRing} />
            <View style={styles.iconRingOuter} />
        </Animated.View>
    );
};

const AnimatedButton = ({ onPress, children, style, textStyle, icon }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View
                style={[
                    style,
                    {
                        transform: [{ scale: scaleAnim }],
                        shadowOpacity: isPressed ? 0.1 : 0.3,
                    }
                ]}
            >
                {icon && <View style={styles.buttonIcon}>{icon}</View>}
                <Text style={textStyle}>{children}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
 * PaymentFailureScreen Mejorado - Experiencia premium y empática
 * 
 * Mejoras implementadas:
 * 1. Animaciones fluidas y microinteracciones que reducen la ansiedad
 * 2. Jerarquía visual mejorada con tipografía y espaciado optimizado
 * 3. Iconografía más contextual (tarjeta deshabilitada vs alerta genérica)
 * 4. Diseño glassmorphism para mayor modernidad
 * 5. Botones con feedback táctil mejorado
 * 6. Sistema de colores más sofisticado
 * 7. Animaciones escalonadas para mejor percepción de carga
 */
const PaymentFailureScreen = () => {
    const navigation = useNavigation();
    const [contentAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

     const handleRetry = () => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Medium);
        }
        
        // --- CORRECCIÓN CLAVE ---
        // En lugar de ir al inicio, volvemos a la pantalla de pago,
        // pasándole de nuevo el plan que el usuario ya había elegido.
        if (selectedPlan) {
            navigation.navigate('PaymentGateway', { selectedPlan });
        } else {
            // Como fallback, si no tenemos los datos del plan, lo mandamos al principio.
            navigation.navigate('PlanSelection');
        }
    };

    const handleContactSupport = () => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Light);
        }
        navigation.navigate('Contact');
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Fondo con gradiente mejorado */}
            <LinearGradient 
                colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header con botón de regreso */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            { opacity: contentAnim }
                        ]}
                    >
                        {/* Icono animado mejorado */}
                        <PulsingIcon />

                        {/* Contenido principal */}
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Pago no procesado</Text>
                            <Text style={styles.subtitle}>
                                Tu información está segura. Verifica estos detalles y vuelve a intentarlo.
                            </Text>
                        </View>

                        {/* Card con glassmorphism */}
                        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                style={styles.cardGradient}
                            >
                                <View style={styles.cardHeader}>
                                    <MaterialCommunityIcons 
                                        name="shield-check-outline" 
                                        size={24} 
                                        color="#4ADE80" 
                                    />
                                    <Text style={styles.cardTitle}>Puntos a verificar</Text>
                                </View>
                                
                                <View style={styles.suggestionsContainer}>
                                    <AnimatedSuggestionItem 
                                        text="Datos de la tarjeta: número, vencimiento y CVV"
                                        delay={200}
                                    />
                                    <AnimatedSuggestionItem 
                                        text="Fondos disponibles o límite de crédito"
                                        delay={300}
                                    />
                                    <AnimatedSuggestionItem 
                                        text="Habilitación para compras online"
                                        delay={400}
                                    />
                                    <AnimatedSuggestionItem 
                                        text="Autorización bancaria requerida"
                                        delay={500}
                                    />
                                </View>
                            </LinearGradient>
                        </BlurView>

                        {/* Botones mejorados */}
                        <View style={styles.buttonsContainer}>
                            <AnimatedButton
                                onPress={handleRetry}
                                style={styles.primaryButton}
                                textStyle={styles.primaryButtonText}
                                icon={<Feather name="refresh-cw" size={20} color="#000000" />}
                            >
                                Reintentar pago
                            </AnimatedButton>

                            <AnimatedButton
                                onPress={handleContactSupport}
                                style={styles.secondaryButton}
                                textStyle={styles.secondaryButtonText}
                                icon={<MaterialCommunityIcons name="message-outline" size={18} color="#FDB813" />}
                            >
                                Contactar soporte
                            </AnimatedButton>
                        </View>

                        {/* Footer informativo */}
                        <View style={styles.footer}>
                            <MaterialCommunityIcons name="lock-outline" size={16} color="#6B7280" />
                            <Text style={styles.footerText}>
                                Tus datos están protegidos con encriptación de nivel bancario
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    gradient: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    content: {
        alignItems: 'center',
        paddingTop: 20,
    },
    iconWrapper: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    iconRing: {
        position: 'absolute',
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 2,
        borderColor: 'rgba(255, 107, 107, 0.3)',
        zIndex: 2,
    },
    iconRingOuter: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.1)',
        zIndex: 1,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 16,
        maxWidth: width * 0.9,
    },
    glassCard: {
        width: '100%',
        borderRadius: 20,
        marginBottom: 40,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardGradient: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    suggestionsContainer: {
        gap: 16,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletPoint: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FDB813',
    },
    suggestionText: {
        color: '#D1D5DB',
        fontSize: 15,
        marginLeft: 16,
        lineHeight: 22,
        flex: 1,
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: '#FDB813',
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#FDB813',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#000000',
        fontSize: 17,
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    secondaryButtonText: {
        color: '#FDB813',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 13,
        marginLeft: 8,
        textAlign: 'center',
    },
});

export default PaymentFailureScreen;