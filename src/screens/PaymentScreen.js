// screens/PaymentGatewayScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    ScrollView,
    Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// Asumiendo que tienes un contexto de tema, si no, puedes quitarlo.
// import { useThemeContext } from '../context/ThemeContext';

// --- SUBCOMPONENTES DE UI ---
const SummaryLineItem = ({ label, value, isTotal = false }) => (
    <View style={[styles.summaryLine, isTotal && styles.summaryTotalLine]}>
        <Text style={[styles.summaryLabel, isTotal && styles.summaryTotalLabel]}>{label}</Text>
        <Text style={[styles.summaryValue, isTotal && styles.summaryTotalValue]}>{value}</Text>
    </View>
);

/**
 * PaymentGatewayScreen - Rediseñada para máxima confianza y claridad en el checkout.
 * * Estrategia de UX/UI:
 * 1.  Layout de Resumen de Orden: La pantalla está estructurada como un resumen de compra profesional,
 * lo que es familiar para el usuario y transmite seriedad.
 * 2.  Transparencia Financiera: Se desglosan los costos (subtotal, descuentos, total) de forma clara
 * para eliminar cualquier duda o ambigüedad antes del pago.
 * 3.  Señales de Confianza Explícitas: Se muestra prominentemente el logo del procesador de pagos
 * (Mercado Pago) y se añade un footer con un ícono de candado para reforzar la seguridad.
 * 4.  Jerarquía de Acciones Clara: El botón principal es grande, llamativo y su texto indica claramente
 * la acción siguiente ("Continuar a Pago Seguro"), mientras que la opción de cancelar es secundaria.
 */
const PaymentGatewayScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // const { darkMode } = useThemeContext(); // Descomentar si usas un contexto de tema

    const [isProcessing, setIsProcessing] = useState(false);

    // Con fallback para poder diseñar la pantalla de forma aislada
    const { selectedPlan } = route.params || {
        selectedPlan: {
            product: 'Paquete Completo',
            name: 'Anual',
            price: 7500,
            period: 'año'
        }
    };

    const handlePayment = () => {
        setIsProcessing(true);
        console.log('Iniciando pago para el plan:', selectedPlan.product);
        // --- LÓGICA SIMULADA ---
        setTimeout(() => {
            console.log('Redirigiendo a pasarela externa (simulado)...');
            // En una app real, aquí iría el Linking.openURL(initPoint)
            // Para la demo, navegamos a la pantalla de éxito.
            navigation.navigate('PaymentSuccess');
            setIsProcessing(false);
        }, 2000);
    };

    // Cálculos para el resumen de la orden
    const discount = selectedPlan.period === 'año' ? selectedPlan.price * 0.15 : 0;
    const subtotal = selectedPlan.price + discount;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Resumen de tu Orden</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Tarjeta del Plan Seleccionado */}
                    <View style={styles.card}>
                        <Text style={styles.cardSubtitle}>PLAN SELECCIONADO</Text>
                        <Text style={styles.planName}>{selectedPlan.product} ({selectedPlan.name})</Text>
                    </View>

                    {/* Resumen de Costos */}
                    <View style={styles.card}>
                        <Text style={styles.cardSubtitle}>RESUMEN DE PAGO</Text>
                        <SummaryLineItem label="Subtotal" value={`$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} />
                        {discount > 0 && (
                            <SummaryLineItem label="Ahorro Anual (15%)" value={`-$${discount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} />
                        )}
                        <SummaryLineItem label="Total a Pagar" value={`$${selectedPlan.price.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} isTotal />
                    </View>

                    {/* Método de Pago */}
                    <View style={styles.card}>
                        <Text style={styles.cardSubtitle}>PAGO SEGURO CON</Text>
                        <View style={styles.paymentMethodContainer}>
                           <Image 
                                source={{ uri: 'https://logolook.net/wp-content/uploads/2021/07/Mercado-Pago-Logo-2016.png' }} 
                                style={styles.paymentLogo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </ScrollView>
                
                {/* Footer con botón de acción */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.payButton}
                        onPress={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#121212" />
                        ) : (
                            <Text style={styles.payButtonText}>Continuar a Pago Seguro</Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.securityInfo}>
                        <MaterialCommunityIcons name="lock-check" size={16} color="#888" />
                        <Text style={styles.securityText}>Transacción 100% segura y encriptada.</Text>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
        height: 100,
    },
    backButton: { padding: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    scrollContainer: { paddingHorizontal: 24, paddingBottom: 150 },
    card: {
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a'
    },
    cardSubtitle: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
    planName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    summaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    summaryLabel: { color: '#A9A9A9', fontSize: 16 },
    summaryValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
    summaryTotalLine: { borderTopWidth: 1, borderTopColor: '#2a2a2a', marginTop: 8, paddingTop: 16 },
    summaryTotalLabel: { fontWeight: 'bold', color: '#FFFFFF' },
    summaryTotalValue: { fontWeight: 'bold', color: '#FFFFFF' },
    paymentMethodContainer: { alignItems: 'center', paddingVertical: 20 },
    paymentLogo: { width: 150, height: 40 },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: '#1e1e1e',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a'
    },
    payButton: { backgroundColor: '#FDB813', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    payButtonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
    securityInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 8 },
    securityText: { color: '#888', fontSize: 12 },
});

export default PaymentGatewayScreen;
