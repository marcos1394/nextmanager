// screens/PaymentPendingScreen.js
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// --- SUBCOMPONENTES DE UI ---

const IndeterminateProgressBar = () => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, [progressAnim]);

    const translateX = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 400], // Asumiendo un ancho de contenedor de 300
    });

    return (
        <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={['#FDB813', '#FFAA00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
};

/**
 * PaymentPendingScreen - Rediseñada para ser una experiencia tranquilizadora y profesional.
 * * Estrategia de UX/UI:
 * 1.  Diseño Inmersivo: Se utiliza una vista de pantalla completa para enfocar al usuario en el
 * proceso actual, eliminando distracciones y transmitiendo la seriedad de la transacción.
 * 2.  Animación Sofisticada: Se reemplaza el emoji estático por un ícono profesional con círculos
 * pulsantes. Esto crea una metáfora visual de "procesamiento seguro" y mantiene la pantalla viva.
 * 3.  Loader Indeterminado: La barra de progreso con animación de barrido es el patrón de UX correcto
 * para una espera de duración desconocida, gestionando mejor las expectativas del usuario.
 * 4.  Copywriting de Confianza: El texto es claro, directo y refuerza la instrucción más crítica
 * ("no cierres la aplicación"), ayudando a prevenir errores del usuario.
 */
const PaymentPendingScreen = () => {
    // Animaciones para los círculos pulsantes
    const pulseAnim1 = useRef(new Animated.Value(0)).current;
    const pulseAnim2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createPulseAnimation = (animation) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animation, { toValue: 1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(animation, { toValue: 0, duration: 2000, useNativeDriver: true }),
                ])
            );
        };
        
        const animation1 = createPulseAnimation(pulseAnim1);
        const animation2 = setTimeout(() => createPulseAnimation(pulseAnim2).start(), 1000);

        animation1.start();

        return () => {
            animation1.stop();
            clearTimeout(animation2);
        };
    }, [pulseAnim1, pulseAnim2]);

    const pulse1Style = {
        opacity: pulseAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
        transform: [{ scale: pulseAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
    };
    const pulse2Style = {
        opacity: pulseAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
        transform: [{ scale: pulseAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.content}>
                    <View style={styles.animationContainer}>
                        <Animated.View style={[styles.pulseCircle, pulse1Style]} />
                        <Animated.View style={[styles.pulseCircle, pulse2Style]} />
                        <View style={styles.iconWrapper}>
                            <Feather name="clock" size={60} color="#FDB813" />
                        </View>
                    </View>

                    <Text style={styles.title}>Procesando tu Pago</Text>
                    <Text style={styles.subtitle}>
                        Estamos confirmando tu transacción de forma segura. Esto puede tardar unos segundos.
                    </Text>
                    <Text style={styles.warningText}>
                        Por favor, no cierres ni actualices la aplicación.
                    </Text>

                    <IndeterminateProgressBar />
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
        alignItems: 'center',
    },
    content: {
        width: '85%',
        alignItems: 'center',
    },
    animationContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    pulseCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 100,
        backgroundColor: 'rgba(253, 184, 19, 0.5)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#A9A9A9',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 16,
    },
    warningText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 32,
    },
    progressBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: '#2a2a2a',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        width: '50%',
    },
});

export default PaymentPendingScreen;
