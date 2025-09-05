// screens/ErrorScreens.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// --- COMPONENTES COMPARTIDOS ---
const AnimatedIcon = ({ iconName, iconLibrary = 'Feather', size = 100, color, delay = 0 }) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);
    const rotateAnim = new Animated.Value(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ]).start();

            // Animación de flotación continua
            const floatAnimation = Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ]);
            
            Animated.loop(floatAnimation).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : 
                        iconLibrary === 'Ionicons' ? Ionicons : Feather;

    return (
        <Animated.View
            style={[
                styles.iconContainer,
                {
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { rotate: iconLibrary === 'Feather' && iconName === 'compass' ? rotation : '0deg' }
                    ]
                }
            ]}
        >
            <View style={[styles.iconBackground, { backgroundColor: `${color}20` }]}>
                <LinearGradient
                    colors={[`${color}30`, `${color}10`]}
                    style={styles.iconGradient}
                >
                    <IconComponent name={iconName} size={size} color={color} />
                </LinearGradient>
            </View>
        </Animated.View>
    );
};

const AnimatedText = ({ children, style, delay = 0 }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(30);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
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
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
            }}
        >
            <Text style={style}>{children}</Text>
        </Animated.View>
    );
};

const AnimatedButton = ({ onPress, children, style, textStyle, delay = 0, variant = 'primary' }) => {
    const [isPressed, setIsPressed] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(40);
    const scaleAnim = new Animated.Value(1);

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

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
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

    const handlePress = () => {
        if (Platform.OS === 'ios') {
            try {
                const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
                impactAsync(ImpactFeedbackStyle.Medium);
            } catch (error) {
                console.log('Haptics not available');
            }
        }
        onPress();
    };

    const buttonVariants = {
        primary: {
            gradientColors: ['#FDB813', '#F59E0B'],
            textColor: '#000000'
        },
        secondary: {
            gradientColors: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
            textColor: '#FFFFFF'
        },
        danger: {
            gradientColors: ['#EF4444', '#DC2626'],
            textColor: '#FFFFFF'
        }
    };

    const currentVariant = buttonVariants[variant] || buttonVariants.primary;

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={[styles.animatedButton, style]}
            >
                <BlurView intensity={15} tint="dark" style={styles.buttonBlur}>
                    <LinearGradient
                        colors={currentVariant.gradientColors}
                        style={styles.buttonGradient}
                    >
                        <Text style={[styles.buttonText, { color: currentVariant.textColor }, textStyle]}>
                            {children}
                        </Text>
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- SCREEN: NOT FOUND ---
export function NotFoundScreen({ navigation }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Manejar botón de retroceso en Android
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.replace('Dashboard');
            return true;
        });

        return () => backHandler.remove();
    }, [navigation]);

    const handleGoHome = () => {
        navigation.replace('Dashboard');
    };

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.replace('Dashboard');
        }
    };

    if (!mounted) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient 
                colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.content}>
                    <AnimatedIcon 
                        iconName="compass" 
                        iconLibrary="Feather"
                        size={80} 
                        color="#FDB813" 
                        delay={200}
                    />

                    <View style={styles.textContainer}>
                        <AnimatedText style={styles.errorCode} delay={600}>
                            404
                        </AnimatedText>
                        
                        <AnimatedText style={styles.title} delay={800}>
                            Página no Encontrada
                        </AnimatedText>
                        
                        <AnimatedText style={styles.subtitle} delay={1000}>
                            Parece que te has perdido en el espacio digital. 
                            No te preocupes, te ayudamos a encontrar el camino de vuelta.
                        </AnimatedText>
                    </View>

                    <View style={styles.suggestionContainer}>
                        <AnimatedText style={styles.suggestionTitle} delay={1200}>
                            ¿Qué puedes hacer?
                        </AnimatedText>
                        
                        <View style={styles.suggestionList}>
                            <AnimatedText style={styles.suggestionItem} delay={1300}>
                                • Verificar la URL que ingresaste
                            </AnimatedText>
                            <AnimatedText style={styles.suggestionItem} delay={1400}>
                                • Regresar a la página anterior
                            </AnimatedText>
                            <AnimatedText style={styles.suggestionItem} delay={1500}>
                                • Ir al dashboard principal
                            </AnimatedText>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <AnimatedButton 
                            onPress={handleGoHome}
                            variant="primary"
                            delay={1600}
                        >
                            Ir al Dashboard
                        </AnimatedButton>
                        
                        <AnimatedButton 
                            onPress={handleGoBack}
                            variant="secondary"
                            delay={1700}
                            style={styles.secondaryButton}
                        >
                            Regresar
                        </AnimatedButton>
                    </View>
                </View>

                {/* Elementos decorativos */}
                <View style={styles.decorativeElements}>
                    <View style={[styles.floatingElement, styles.element1]} />
                    <View style={[styles.floatingElement, styles.element2]} />
                    <View style={[styles.floatingElement, styles.element3]} />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

// --- SCREEN: SERVER ERROR ---
export function ServerErrorScreen({ onRetry, navigation }) {
    const [mounted, setMounted] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRetry = async () => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        try {
            // Simular reintento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (onRetry) {
                onRetry();
            }
        } catch (error) {
            console.log('Retry failed:', error);
        } finally {
            setIsRetrying(false);
        }
    };

    const handleContactSupport = () => {
        // Aquí podrías abrir un modal de contacto o navegar a una pantalla de soporte
        console.log('Contact support');
    };

    const handleGoHome = () => {
        if (navigation) {
            navigation.replace('Dashboard');
        }
    };

    if (!mounted) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient 
                colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.content}>
                    <AnimatedIcon 
                        iconName="cloud-off" 
                        iconLibrary="Feather"
                        size={80} 
                        color="#EF4444" 
                        delay={200}
                    />

                    <View style={styles.textContainer}>
                        <AnimatedText style={styles.errorCode} delay={600}>
                            500
                        </AnimatedText>
                        
                        <AnimatedText style={styles.title} delay={800}>
                            Error del Servidor
                        </AnimatedText>
                        
                        <AnimatedText style={styles.subtitle} delay={1000}>
                            Algo salió mal en nuestros servidores. Nuestro equipo técnico 
                            ya ha sido notificado y está trabajando para solucionarlo.
                        </AnimatedText>
                    </View>

                    <View style={styles.errorDetailsContainer}>
                        <AnimatedText style={styles.errorDetailsTitle} delay={1200}>
                            Detalles del Error
                        </AnimatedText>
                        
                        <View style={styles.errorDetailsList}>
                            <AnimatedText style={styles.errorDetailItem} delay={1300}>
                                • Tiempo estimado de resolución: 5-10 min
                            </AnimatedText>
                            <AnimatedText style={styles.errorDetailItem} delay={1400}>
                                • Intentos de reconexión: {retryCount}
                            </AnimatedText>
                            <AnimatedText style={styles.errorDetailItem} delay={1500}>
                                • Estado del sistema: En mantenimiento
                            </AnimatedText>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <AnimatedButton 
                            onPress={handleRetry}
                            variant="danger"
                            delay={1600}
                            style={isRetrying && styles.buttonDisabled}
                        >
                            {isRetrying ? 'Reintentando...' : 'Reintentar Conexión'}
                        </AnimatedButton>
                        
                        <AnimatedButton 
                            onPress={handleContactSupport}
                            variant="secondary"
                            delay={1700}
                            style={styles.secondaryButton}
                        >
                            Contactar Soporte
                        </AnimatedButton>

                        {navigation && (
                            <AnimatedButton 
                                onPress={handleGoHome}
                                variant="secondary"
                                delay={1800}
                                style={styles.tertiaryButton}
                            >
                                Ir al Dashboard
                            </AnimatedButton>
                        )}
                    </View>
                </View>

                {/* Elementos decorativos con tema de error */}
                <View style={styles.decorativeElements}>
                    <View style={[styles.floatingElement, styles.errorElement1]} />
                    <View style={[styles.floatingElement, styles.errorElement2]} />
                    <View style={[styles.floatingElement, styles.errorElement3]} />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    errorCode: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FDB813',
        marginBottom: 16,
        letterSpacing: -2,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
    },
    suggestionContainer: {
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    suggestionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    suggestionList: {
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: 300,
    },
    suggestionItem: {
        fontSize: 14,
        color: '#D1D5DB',
        marginBottom: 8,
        lineHeight: 20,
    },
    errorDetailsContainer: {
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    errorDetailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    errorDetailsList: {
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: 300,
    },
    errorDetailItem: {
        fontSize: 14,
        color: '#D1D5DB',
        marginBottom: 8,
        lineHeight: 20,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    animatedButton: {
        width: '100%',
        maxWidth: 280,
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonBlur: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        maxWidth: 200,
    },
    tertiaryButton: {
        maxWidth: 180,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    decorativeElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    floatingElement: {
        position: 'absolute',
        borderRadius: 50,
        opacity: 0.1,
    },
    element1: {
        width: 100,
        height: 100,
        backgroundColor: '#FDB813',
        top: '10%',
        right: '10%',
    },
    element2: {
        width: 60,
        height: 60,
        backgroundColor: '#10B981',
        top: '60%',
        left: '5%',
    },
    element3: {
        width: 80,
        height: 80,
        backgroundColor: '#8B5CF6',
        bottom: '20%',
        right: '5%',
    },
    errorElement1: {
        width: 100,
        height: 100,
        backgroundColor: '#EF4444',
        top: '10%',
        right: '10%',
    },
    errorElement2: {
        width: 60,
        height: 60,
        backgroundColor: '#F59E0B',
        top: '60%',
        left: '5%',
    },
    errorElement3: {
        width: 80,
        height: 80,
        backgroundColor: '#DC2626',
        bottom: '20%',
        right: '5%',
    },
});

export default { NotFoundScreen, ServerErrorScreen };