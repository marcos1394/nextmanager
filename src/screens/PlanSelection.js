import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import api from '../services/api'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 20;

// --- COMPONENTE: TARJETA DE PLAN ---
const PlanCard = ({ plan, billingCycle, onSelect, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    
    // 1. Determinar precio según el ciclo
    const price = billingCycle === 'annually' ? plan.price_annually : plan.price_monthly;
    
    // 2. Calcular precio mensual equivalente (para mostrar "X al mes")
    const displayMonthlyPrice = billingCycle === 'annually' ? (price / 12) : price;

    // 3. Calcular ahorro si es anual (comparado con pagar mensual x 12)
    const yearlyCostIfMonthly = plan.price_monthly * 12;
    const savingPercent = billingCycle === 'annually' 
        ? Math.round(((yearlyCostIfMonthly - plan.price_annually) / yearlyCostIfMonthly) * 100) 
        : 0;

    // 4. Colores dinámicos según el plan (puedes ajustarlos o traerlos del backend si los agregas)
    const getGradient = (name) => {
        if (name.includes('Manager')) return ['#10B981', '#059669']; // Verde
        if (name.includes('Factura')) return ['#6366F1', '#4F46E5']; // Azul/Indigo
        if (name.includes('Completo')) return ['#FDB813', '#F59E0B']; // Gold (Destacado)
        return ['#333', '#111']; // Default
    };

    const gradientColors = getGradient(plan.name);
    const isHighlighted = plan.isHighlighted || plan.name.includes('Completo');

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
            delay: index * 100
        }).start();
    }, []);

    const handlePress = () => {
        Haptics.selectionAsync();
        onSelect(plan);
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={handlePress}
                style={[styles.cardTouchable, isHighlighted && styles.highlightedBorder]}
            >
                <LinearGradient
                    colors={gradientColors}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header: Nombre y Badge */}
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <Text style={styles.planTagline}>{plan.tagline}</Text>
                        </View>
                        {isHighlighted && (
                            <View style={styles.popularBadge}>
                                <Feather name="star" size={12} color="#000" />
                                <Text style={styles.popularText}>POPULAR</Text>
                            </View>
                        )}
                    </View>

                    {/* Precio */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.currency}>$</Text>
                        <Text style={styles.price}>{displayMonthlyPrice.toFixed(0)}</Text>
                        <Text style={styles.period}>/mes</Text>
                    </View>
                    
                    {billingCycle === 'annually' && (
                        <View style={styles.billingInfoContainer}>
                            <Text style={styles.billingInfoText}>
                                Facturado ${price.toLocaleString()} al año
                            </Text>
                            {savingPercent > 0 && (
                                <View style={styles.savingBadge}>
                                    <Text style={styles.savingText}>Ahorra {savingPercent}%</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Lista de Features */}
                    <View style={styles.featuresContainer}>
                        {/* Timbres (Feature especial) */}
                        <View style={styles.featureRow}>
                            <MaterialCommunityIcons name="ticket-confirmation" size={20} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.featureText}>
                                {plan.timbres > 0 ? `${plan.timbres} Timbres incluidos` : 'Sin facturación'}
                            </Text>
                        </View>

                        {/* Features dinámicos del JSON */}
                        {plan.features && plan.features.map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Feather name="check" size={18} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.featureText}>
                                    {typeof feature === 'string' ? feature : feature.text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Botón CTA */}
                    <View style={styles.ctaButton}>
                        <Text style={[styles.ctaText, { color: gradientColors[1] }]}>
                            Seleccionar Plan
                        </Text>
                    </View>

                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- PANTALLA PRINCIPAL ---
const PlanSelectionScreen = ({ navigation }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annually'
    const [error, setError] = useState(null);

    // Cargar planes al montar
    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            // Usamos el endpoint que ya existe en api.js o llamamos directo
            const response = await api.get('/payments/plans');
            
            if (response.data.success) {
                // Ordenamos: primero los destacados, luego por precio
                const sortedPlans = response.data.plans.sort((a, b) => a.price_monthly - b.price_monthly);
                setPlans(sortedPlans);
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('[PlansScreen] Error:', err);
            setError('No pudimos cargar los planes. Revisa tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        // Preparamos el objeto para la siguiente pantalla (Checkout)
        const selectedData = {
            planId: plan.id,
            name: plan.name,
            price: billingCycle === 'annually' ? plan.price_annually : plan.price_monthly,
            period: billingCycle, // 'monthly' o 'annually'
            features: plan.features,
            timbres: plan.timbres
        };

        // Navegar al Checkout (PaymentGatewayScreen)
        navigation.navigate('Payment', { selectedPlan: selectedData });
    };

    // --- RENDERIZADO DE CARGA ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <ActivityIndicator size="large" color="#FDB813" />
                <Text style={styles.loadingText}>Cargando planes...</Text>
            </View>
        );
    }

    // --- RENDERIZADO PRINCIPAL ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000000', '#121212']} style={styles.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Elige tu Plan</Text>
                <Text style={styles.headerSubtitle}>
                    Potencia tu restaurante con las herramientas adecuadas.
                </Text>
            </View>

            {/* Selector de Ciclo (Mensual/Anual) */}
            <View style={styles.toggleContainer}>
                <View style={styles.toggleWrapper}>
                    <TouchableOpacity 
                        style={[styles.toggleOption, billingCycle === 'monthly' && styles.toggleActive]}
                        onPress={() => { Haptics.selectionAsync(); setBillingCycle('monthly'); }}
                    >
                        <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>Mensual</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.toggleOption, billingCycle === 'annually' && styles.toggleActive]}
                        onPress={() => { Haptics.selectionAsync(); setBillingCycle('annually'); }}
                    >
                        <Text style={[styles.toggleText, billingCycle === 'annually' && styles.toggleTextActive]}>Anual</Text>
                        {/* Badge de Ahorro en el Toggle */}
                        <View style={styles.toggleBadge}>
                            <Text style={styles.toggleBadgeText}>-15%</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Lista de Planes (Scroll Horizontal) */}
            {error ? (
                <View style={styles.errorContainer}>
                    <Feather name="wifi-off" size={48} color="#666" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchPlans}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Renderizamos las tarjetas en vertical para móviles, es mejor UX que horizontal si son pocas */}
                    {plans.map((plan, index) => (
                        <PlanCard 
                            key={plan.id} 
                            plan={plan} 
                            billingCycle={billingCycle} 
                            onSelect={handleSelectPlan}
                            index={index}
                        />
                    ))}
                    
                    <View style={styles.footerNote}>
                        <Feather name="lock" size={14} color="#666" />
                        <Text style={styles.footerText}>Pagos seguros procesados por MercadoPago</Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        marginTop: 10,
    },
    
    // Header
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        marginBottom: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        lineHeight: 24,
    },

    // Toggle
    toggleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    toggleWrapper: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 30,
        padding: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    toggleOption: {
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleActive: {
        backgroundColor: '#333',
    },
    toggleText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 14,
    },
    toggleTextActive: {
        color: '#FFF',
    },
    toggleBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    toggleBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Scroll
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: 'center', // Centrar tarjetas
    },

    // Tarjetas
    cardContainer: {
        width: '100%',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    cardTouchable: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    highlightedBorder: {
        borderColor: '#FDB813',
        borderWidth: 2,
    },
    cardGradient: {
        padding: 24,
        minHeight: 200,
    },
    
    // Contenido Tarjeta
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    planName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    planTagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB813',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    popularText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },

    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    currency: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        marginRight: 4,
    },
    price: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: -1,
    },
    period: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 4,
    },

    billingInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    billingInfoText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    savingBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    savingText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },

    // Features
    featuresContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 20,
        marginBottom: 20,
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        color: '#FFF',
        fontSize: 15,
        flex: 1,
    },

    // Botón dentro de la tarjeta
    ctaButton: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Footer General
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        opacity: 0.6,
    },
    footerText: {
        color: '#FFF',
        fontSize: 12,
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#333',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default PlanSelectionScreen;