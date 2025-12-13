import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    ScrollView,
    Linking,
    Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { createPaymentPreference } from '../services/api'; // Tu servicio existente

const { width } = Dimensions.get('window');

// --- COMPONENTES UI ---

const DetailRow = ({ label, value, isBold, isTotal, color }) => (
    <View style={[styles.row, isTotal && styles.totalRow]}>
        <Text style={[
            styles.rowLabel, 
            isBold && styles.boldText, 
            isTotal && styles.totalText
        ]}>
            {label}
        </Text>
        <Text style={[
            styles.rowValue, 
            isBold && styles.boldText, 
            isTotal && styles.totalText,
            color && { color }
        ]}>
            {value}
        </Text>
    </View>
);

const SecurityBadge = () => (
    <View style={styles.securityContainer}>
        <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
        <Text style={styles.securityText}>Pago 100% Seguro encriptado con SSL</Text>
    </View>
);

// --- PANTALLA PRINCIPAL ---

const PaymentGatewayScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    
    // 1. Recibir datos del plan seleccionado
    const { selectedPlan } = route.params || {};

    const [isLoading, setIsLoading] = useState(false);

    // Validación de seguridad por si llegan params vacíos
    useEffect(() => {
        if (!selectedPlan) {
            Alert.alert("Error", "No se seleccionó ningún plan.");
            navigation.goBack();
        }
    }, [selectedPlan]);

    if (!selectedPlan) return null;

    // 2. Cálculos Financieros (Subtotal, IVA, Total)
    // Asumimos que el precio base es Subtotal. Si tus precios ya incluyen IVA, ajusta la lógica.
    const subtotal = Number(selectedPlan.price);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    // 3. Manejo del Pago
    const handlePayment = async () => {
        setIsLoading(true);
        if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Construimos el payload para tu backend
            const paymentData = {
                title: `Plan ${selectedPlan.name} (${selectedPlan.period === 'annually' ? 'Anual' : 'Mensual'})`,
                quantity: 1,
                price: total, // Enviamos el total ya con impuestos
                planId: selectedPlan.planId, // ID del plan para referencia futura
                billingCycle: selectedPlan.period
            };

            // Llamada al Endpoint existente
            console.log('[Payment] Creando preferencia...', paymentData);
            const response = await createPaymentPreference(paymentData);

            if (response.success && response.init_point) {
                // Abrir Mercado Pago (Navegador o App)
                const supported = await Linking.canOpenURL(response.init_point);
                if (supported) {
                    await Linking.openURL(response.init_point);
                    // Opcional: Redirigir a una pantalla de "Esperando Confirmación" 
                    // o esperar a que el Deep Link nos traiga de vuelta.
                } else {
                    Alert.alert("Error", "No se puede abrir el enlace de pago.");
                }
            } else {
                throw new Error("No se recibió el link de pago.");
            }

        } catch (error) {
            console.error('[Payment] Error:', error);
            Alert.alert("Error de Pago", "No pudimos iniciar el proceso de pago. Intenta de nuevo.");
            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            {/* Fondo Sutil */}
            <LinearGradient colors={['#000000', '#111111']} style={StyleSheet.absoluteFillObject} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resumen de Compra</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 1. Tarjeta del Plan Seleccionado */}
                <View style={styles.planCard}>
                    <LinearGradient
                        colors={['#1A1A1A', '#222']}
                        style={styles.planCardGradient}
                    >
                        <View style={styles.planHeader}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="crown" size={24} color="#FDB813" />
                            </View>
                            <View>
                                <Text style={styles.planLabel}>Plan Seleccionado</Text>
                                <Text style={styles.planName}>{selectedPlan.name}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <Feather name="calendar" size={16} color="#888" />
                                <Text style={styles.featureText}>
                                    Facturación: <Text style={{color:'#FFF'}}>{selectedPlan.period === 'annually' ? 'Anual' : 'Mensual'}</Text>
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Feather name="check-circle" size={16} color="#888" />
                                <Text style={styles.featureText}>
                                    Acceso completo al Dashboard
                                </Text>
                            </View>
                            {selectedPlan.timbres > 0 && (
                                <View style={styles.featureItem}>
                                    <Feather name="check-circle" size={16} color="#888" />
                                    <Text style={styles.featureText}>
                                        {selectedPlan.timbres} Timbres de facturación
                                    </Text>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. Desglose de Precios (Recibo) */}
                <View style={styles.receiptContainer}>
                    <Text style={styles.sectionTitle}>Detalle del Pago</Text>
                    
                    <View style={styles.receiptBox}>
                        <DetailRow label="Subtotal" value={`$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} />
                        <DetailRow label="IVA (16%)" value={`$${iva.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} />
                        
                        <View style={styles.dividerLight} />
                        
                        <DetailRow 
                            label="Total a Pagar" 
                            value={`$${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} 
                            isTotal 
                            color="#FDB813"
                        />
                    </View>
                </View>

                {/* 3. Información de Seguridad */}
                <SecurityBadge />

                <Text style={styles.termsText}>
                    Al continuar, aceptas que se realizará un cargo único o recurrente según el plan seleccionado. Puedes cancelar en cualquier momento.
                </Text>

            </ScrollView>

            {/* Footer con Botón de Acción */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.payButton, isLoading && styles.buttonDisabled]} 
                    onPress={handlePayment}
                    disabled={isLoading}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#009EE3', '#007eb5']} // Color azul Mercado Pago
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.payButtonText}>Pagar con Mercado Pago</Text>
                                <FontAwesome5 name="hand-holding-usd" size={20} color="#FFF" />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                <View style={styles.mpLogoContainer}>
                    <Text style={styles.poweredBy}>Procesado por</Text>
                    <FontAwesome5 name="store" size={12} color="#888" style={{marginLeft: 5, marginRight: 5}} /> 
                    <Text style={[styles.poweredBy, {fontWeight: 'bold', color: '#009EE3'}]}>Mercado Pago</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120, // Espacio para el footer
    },
    
    // Plan Card
    planCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)', // Borde sutil dorado
    },
    planCardGradient: {
        padding: 20,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(253, 184, 19, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    planLabel: {
        color: '#888',
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 2,
    },
    planName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 15,
    },
    featuresList: {
        gap: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        color: '#CCC',
        fontSize: 14,
    },

    // Receipt
    receiptContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    receiptBox: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    totalRow: {
        marginTop: 5,
        marginBottom: 0,
    },
    rowLabel: {
        color: '#888',
        fontSize: 15,
    },
    rowValue: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500',
    },
    boldText: {
        fontWeight: '600',
        color: '#FFF',
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    dividerLight: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 15,
        borderStyle: 'dashed', // Estilo ticket si fuera soportado, en RN nativo necesita librería svg, usamos linea
    },

    // Security
    securityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    securityText: {
        color: '#10B981',
        fontSize: 13,
        fontWeight: '500',
    },
    termsText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    payButton: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 56,
        marginBottom: 10,
        shadowColor: "#009EE3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    mpLogoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    poweredBy: {
        color: '#666',
        fontSize: 12,
    }
});

export default PaymentGatewayScreen;