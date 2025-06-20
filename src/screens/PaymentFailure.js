// screens/PaymentFailureScreen.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { motion } from 'framer-motion/native';

// --- SUBCOMPONENTES DE UI ---
const SuggestionItem = ({ text }) => (
    <View style={styles.suggestionItem}>
        <Feather name="chevrons-right" size={16} color="#FDB813" />
        <Text style={styles.suggestionText}>{text}</Text>
    </View>
);

/**
 * PaymentFailureScreen - Diseñada para convertir un momento de frustración en una guía útil.
 * * Estrategia de UX/UI:
 * 1.  Comunicación Empática: El lenguaje ("Hubo un inconveniente") y el diseño evitan culpar al
 * usuario, reduciendo la ansiedad y enfocándose en la solución.
 * 2.  Guía de Diagnóstico: En lugar de un mensaje de error genérico, se proporciona una lista de
 * posibles causas que el usuario puede verificar. Esto le devuelve el control y lo empodera.
 * 3.  Rutas de Solución Claras: Se ofrece una acción primaria obvia ("Reintentar") y una secundaria
 * de escape ("Contactar a Soporte"), asegurando que el usuario nunca se sienta atrapado.
 * 4.  Consistencia de Marca: La pantalla mantiene la estética premium de la app, reforzando la
 * confianza y el profesionalismo incluso durante un flujo de error.
 */
const PaymentFailureScreen = () => {
    const navigation = useNavigation();

    const handleRetry = () => {
        // Navega de vuelta a la pantalla de selección de planes o a la pasarela de pago.
        // PlanSelection es a menudo más seguro si el estado de la pasarela se perdió.
        navigation.navigate('PlanSelection');
    };

    const handleContactSupport = () => {
        // Navega a la pantalla de contacto que ya diseñamos
        navigation.navigate('Contact');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                 <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        <View style={styles.content}>
                            <View style={styles.iconWrapper}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#FF6B6B" />
                            </View>

                            <Text style={styles.title}>Hubo un inconveniente con tu pago</Text>
                            <Text style={styles.subtitle}>
                                No te preocupes, no se ha realizado ningún cargo. Por favor, revisa los siguientes puntos y vuelve a intentarlo.
                            </Text>

                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Qué puedes verificar:</Text>
                                <SuggestionItem text="Que el número de tarjeta, fecha de vencimiento y CVV sean correctos." />
                                <SuggestionItem text="Que la tarjeta tenga fondos suficientes." />
                                <SuggestionItem text="Que la tarjeta esté habilitada para compras en línea." />
                                <SuggestionItem text="Si tu banco requiere autorización para esta compra." />
                            </View>

                            <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
                                <Feather name="refresh-cw" size={18} color="#121212" />
                                <Text style={styles.primaryButtonText}>Reintentar Pago</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryButton} onPress={handleContactSupport}>
                                <Text style={styles.secondaryButtonText}>Contactar a Soporte</Text>
                            </TouchableOpacity>
                        </View>
                    </motion.div>
                 </ScrollView>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 32,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
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
    card: {
        width: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    suggestionText: {
        color: '#A9A9A9',
        fontSize: 14,
        marginLeft: 10,
        lineHeight: 20,
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
        marginLeft: 10,
    },
    secondaryButton: {
        marginTop: 20,
        padding: 10,
    },
    secondaryButtonText: {
        color: '#FDB813',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PaymentFailureScreen;
