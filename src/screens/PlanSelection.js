// screens/PlanSelectionScreen.js
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Animated,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- DATOS REFACTORIZADOS Y SIMPLIFICADOS ---
const plansData = [
    {
        id: 'factura',
        name: 'NexFactura',
        description: 'Ideal para quienes solo necesitan facturación automática y eficiente.',
        price: { monthly: 450, annually: 4150 },
        features: [
            'Facturación automática',
            'Portal de auto-facturación',
            'Reportes de facturación',
            'Soporte estándar',
        ],
        isHighlighted: false,
    },
    {
        id: 'completo',
        name: 'Paquete Completo',
        description: 'La solución definitiva con todo el poder de facturación y gestión.',
        price: { monthly: 800, annually: 7500 },
        features: [
            'Todo lo de NexFactura',
            'Dashboard de ventas en tiempo real',
            'Análisis de tendencias y productos',
            'Soporte prioritario 24/7',
            'Capacitación inicial incluida',
        ],
        isHighlighted: true,
    },
    {
        id: 'manager',
        name: 'NextManager',
        description: 'Perfecto para gerentes que buscan análisis y control total de sus ventas.',
        price: { monthly: 430, annually: 3950 },
        features: [
            'Dashboard de ventas en tiempo real',
            'Análisis de tendencias',
            'Exportación de datos',
            'Soporte estándar',
        ],
        isHighlighted: false,
    },
];

// --- SUBCOMPONENTES DE UI ---

const BillingToggle = ({ billingCycle, setBillingCycle }) => (
    <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={() => setBillingCycle('monthly')} style={[styles.toggleButton, billingCycle === 'monthly' && styles.toggleButtonActive]}>
            <Text style={[styles.toggleButtonText, billingCycle === 'monthly' && styles.toggleButtonTextActive]}>Mensual</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setBillingCycle('annually')} style={[styles.toggleButton, billingCycle === 'annually' && styles.toggleButtonActive]}>
            <Text style={[styles.toggleButtonText, billingCycle === 'annually' && styles.toggleButtonTextActive]}>Anual</Text>
            <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>AHORRA 15%</Text>
            </View>
        </TouchableOpacity>
    </View>
);

const PlanCard = ({ plan, billingCycle, onSelect }) => {
    const pricePerMonth = billingCycle === 'annually' ? (plan.price.annually / 12) : plan.price.monthly;
    
    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={plan.isHighlighted ? ['#FDB813', '#FFAA00'] : ['#2a2a2a', '#1e1e1e']}
                style={[styles.planCard, plan.isHighlighted && styles.highlightedCard]}
            >
                {plan.isHighlighted && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
                    </View>
                )}
                <Text style={[styles.planName, plan.isHighlighted && {color: '#121212'}]}>{plan.name}</Text>
                <Text style={[styles.planDescription, plan.isHighlighted && {color: '#444'}]}>{plan.description}</Text>
                
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceAmount, plan.isHighlighted && {color: '#121212'}]}>${pricePerMonth.toFixed(0)}</Text>
                    <Text style={[styles.pricePeriod, plan.isHighlighted && {color: '#444'}]}>/mes</Text>
                </View>
                {billingCycle === 'annually' && <Text style={[styles.billingNotice, plan.isHighlighted && {color: '#444'}]}>Facturado anualmente por ${plan.price.annually}</Text>}

                <View style={styles.featuresList}>
                    {plan.features.map(feature => (
                        <View key={feature} style={styles.featureItem}>
                            <Feather name="check" size={16} color={plan.isHighlighted ? '#10B981' : '#10B981'} />
                            <Text style={[styles.featureText, plan.isHighlighted && {color: '#444'}]}>{feature}</Text>
                        </View>
                    ))}
                </View>
                
                <TouchableOpacity style={[styles.selectButton, plan.isHighlighted ? styles.selectButtonHighlighted : {}]} onPress={onSelect}>
                    <Text style={[styles.selectButtonText, plan.isHighlighted ? styles.selectButtonTextHighlighted : {}]}>Seleccionar Plan</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

/**
 * PlanSelectionScreen - Rediseñada para una comparación clara y una decisión simple.
 * * Estrategia de UX/UI:
 * 1.  Comparación Directa: Se eliminan las pestañas y se presentan los 3 planes clave en un carrusel
 * horizontal (FlatList), el patrón ideal para comparación en móviles.
 * 2.  Decisión Simplificada: Un único interruptor "Mensual/Anual" controla todos los precios, haciendo
 * la elección principal del usuario simple y clara, mientras destaca el ahorro.
 * 3.  Jerarquía Visual Fuerte: El plan recomendado se destaca con un color diferente y una insignia,
 * guiando al usuario hacia la opción de mayor valor.
 * 4.  Valor y Precio Conectados: Las características de cada plan están listadas directamente en su
 * tarjeta, justificando el costo y facilitando la decisión.
 */
const PlanSelectionScreen = () => {
    const navigation = useNavigation();
    const [billingCycle, setBillingCycle] = useState('annually');
    const scrollX = useRef(new Animated.Value(0)).current;

    const handlePlanSelect = (plan) => {
        const selectedOption = {
            product: plan.name,
            name: `Plan ${billingCycle === 'monthly' ? 'Mensual' : 'Anual'}`,
            price: plan.price[billingCycle],
            period: billingCycle,
        };
        navigation.navigate('PaymentGateway', { selectedPlan: selectedOption });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <Text style={styles.title}>Elige tu Plan</Text>
                    <Text style={styles.subtitle}>Soluciones flexibles para impulsar tu crecimiento.</Text>
                </View>
                
                <View style={styles.toggleWrapper}>
                    <BillingToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
                </View>

                <Animated.FlatList
                    data={plansData}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    renderItem={({ item }) => (
                        <PlanCard
                            plan={item}
                            billingCycle={billingCycle}
                            onSelect={() => handlePlanSelect(item)}
                        />
                    )}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
    subtitle: { fontSize: 16, color: '#A9A9A9', marginTop: 8, textAlign: 'center' },
    toggleWrapper: { alignItems: 'center', marginBottom: 24 },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#2a2a2a', borderRadius: 20, padding: 4 },
    toggleButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 16, position: 'relative' },
    toggleButtonActive: { backgroundColor: '#FDB813' },
    toggleButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    toggleButtonTextActive: { color: '#121212' },
    savingsBadge: { position: 'absolute', top: -8, right: -12, backgroundColor: '#10B981', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
    savingsBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
    cardContainer: { width: width, alignItems: 'center', paddingHorizontal: 20 },
    planCard: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        minHeight: 500,
        alignItems: 'center',
    },
    highlightedCard: {},
    popularBadge: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: 16,
    },
    popularBadgeText: { color: '#121212', fontSize: 12, fontWeight: 'bold' },
    planName: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    planDescription: { color: '#A9A9A9', fontSize: 14, textAlign: 'center', marginTop: 8, minHeight: 40 },
    priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 20 },
    priceAmount: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' },
    pricePeriod: { color: '#A9A9A9', fontSize: 16, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
    billingNotice: { color: '#A9A9A9', fontSize: 12, marginTop: -15, marginBottom: 20 },
    featuresList: { alignSelf: 'stretch', marginVertical: 16 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featureText: { color: '#FFFFFF', fontSize: 15, marginLeft: 10 },
    selectButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FDB813',
        marginTop: 'auto',
    },
    selectButtonHighlighted: {
        backgroundColor: '#121212',
        borderColor: '#121212',
    },
    selectButtonText: { color: '#FDB813', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    selectButtonTextHighlighted: { color: '#FFFFFF' },
});

export default PlanSelectionScreen;
