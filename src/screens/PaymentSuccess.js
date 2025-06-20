// screens/PaymentSuccessScreen.js
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * PaymentSuccessScreen - Rediseñada como una celebración y un "launchpad" para el usuario.
 * * Estrategia de UX/UI:
 * 1.  Experiencia Inmersiva: Se utiliza un diseño de pantalla completa en lugar de una tarjeta,
 * manteniendo al usuario inmerso en la estética premium y profesional de la aplicación.
 * 2.  Animación de Deleite: Un ícono de check grande con una animación de "sello" proporciona un
 * feedback visual gratificante y celebra la decisión de compra del usuario.
 * 3.  Refuerzo de Valor: Se incluye una tarjeta de resumen que confirma el plan adquirido. Esto
 * añade transparencia y combate cualquier posible remordimiento de comprador.
 * 4.  Jerarquía de Acción Clara: Se presenta un botón de acción principal y prominente para guiar
 * al usuario al siguiente paso lógico, complementado con una opción secundaria menos visible para
 * darle una sensación de control.
 */
const PaymentSuccessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const darkMode = true; // Hardcodeado para mantener la estética de NextManager

    // Animación del check
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                })
            )
        ]).start();
    }, [scaleAnim, pulseAnim]);
    
    const pulseStyle = {
        opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.2, 0] }),
        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
    };

    // Usamos fallback por si se accede a la pantalla sin parámetros
    const { selectedPlan } = route.params || {
        selectedPlan: { product: 'Paquete Completo', name: 'Anual' }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.content}>
                    <View style={styles.animationContainer}>
                        <Animated.View style={[styles.pulseCircle, pulseStyle]} />
                        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                            <View style={styles.iconWrapper}>
                                <Feather name="check" size={70} color="#10B981" />
                            </View>
                        </Animated.View>
                    </View>

                    <Text style={styles.title}>¡Pago Completado!</Text>
                    <Text style={styles.subtitle}>
                        Felicidades. Tu plan ha sido activado y estás listo para llevar tu negocio al siguiente nivel.
                    </Text>

                    <View style={styles.planCard}>
                         <MaterialCommunityIcons name="rocket-launch-outline" size={24} color="#A9A9A9" />
                         <View style={styles.planTextContainer}>
                             <Text style={styles.planCardTitle}>Plan Activado</Text>
                             <Text style={styles.planCardName}>{selectedPlan.product} ({selectedPlan.name})</Text>
                         </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.primaryButton} 
                        onPress={() => navigation.navigate('RestaurantConfig')}
                    >
                        <Text style={styles.primaryButtonText}>Comenzar Configuración</Text>
                        <Feather name="arrow-right" size={20} color="#121212" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryButton} 
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <Text style={styles.secondaryButtonText}>Ir al Dashboard más tarde</Text>
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
        alignItems: 'center',
    },
    content: {
        width: '85%',
        alignItems: 'center',
    },
    animationContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    pulseCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 75,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#A9A9A9',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    planCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        marginBottom: 32,
    },
    planTextContainer: {
        marginLeft: 16,
    },
    planCardTitle: {
        color: '#A9A9A9',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    planCardName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 4,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: '#FDB813',
        paddingVertical: 18,
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    secondaryButton: {
        marginTop: 24,
        padding: 10,
    },
    secondaryButtonText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PaymentSuccessScreen;
