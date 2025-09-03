// screens/PlanSelectionScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Animated,
    Dimensions,
    SafeAreaView,
    FlatList,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';



const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_SPACING = 20;

useEffect(() => {
    // --- LÓGICA DE CARGA DE DATOS ---
    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            setError(null); // Limpiar errores anteriores
            
            // NOTA: Usa la IP de tu servidor para pruebas. En producción, será tu dominio.
            const response = await fetch('https://192.168.0.200/api/payments/plans');
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'No se pudieron cargar los planes.');
            }

            setPlans(data.plans);

        } catch (err) {
            console.error("Error al cargar los planes:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Llamamos a la función para que se ejecute
    fetchPlans();

    // --- LÓGICA DE ANIMACIÓN (sin cambios) ---
    // La animación de entrada del header se ejecuta en paralelo a la carga de datos
    Animated.parallel([
        Animated.timing(headerFadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
        }),
    ]).start();

}, []); // El array de dependencias vacío asegura que se ejecute solo una vez al cargar la pantalla
// --- COMPONENTES UI MEJORADOS ---

const AnimatedBillingToggle = ({ billingCycle, setBillingCycle }) => {
    const slideAnim = useRef(new Animated.Value(billingCycle === 'monthly' ? 0 : 1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: billingCycle === 'monthly' ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [billingCycle, slideAnim]);

    const handleToggle = (cycle) => {
        if (cycle !== billingCycle) {
            setBillingCycle(cycle);
            
            // Animación de feedback
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
            
            if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }
    };

    const toggleWidth = 220;
    const knobWidth = toggleWidth / 2 - 4;

    return (
        <View style={styles.toggleWrapper}>
            <Animated.View 
                style={[
                    styles.toggleContainer,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <Animated.View
                    style={[
                        styles.toggleKnob,
                        {
                            transform: [{
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [2, knobWidth + 2],
                                })
                            }],
                            width: knobWidth,
                        }
                    ]}
                />
                
                <TouchableOpacity
                    style={[styles.toggleOption, { width: knobWidth + 4 }]}
                    onPress={() => handleToggle('monthly')}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.toggleText,
                        billingCycle === 'monthly' && styles.toggleTextActive
                    ]}>
                        Mensual
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.toggleOption, { width: knobWidth + 4 }]}
                    onPress={() => handleToggle('annually')}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.toggleText,
                        billingCycle === 'annually' && styles.toggleTextActive
                    ]}>
                        Anual
                    </Text>
                    {billingCycle === 'annually' && (
                        <View style={styles.savingsBadge}>
                            <Text style={styles.savingsBadgeText}>-15%</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
            
            {billingCycle === 'annually' && (
                <Animated.View 
                    style={styles.savingsInfo}
                    entering="fadeInUp"
                >
                    <Feather name="trending-down" size={16} color="#10B981" />
                    <Text style={styles.savingsText}>
                        Ahorra hasta $1,300 al año
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

const FeatureItem = ({ feature, isHighlighted, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.featureItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={[
                styles.featureIcon,
                { backgroundColor: isHighlighted ? 'rgba(18, 18, 18, 0.15)' : 'rgba(16, 185, 129, 0.15)' }
            ]}>
                <Feather 
                    name={feature.icon} 
                    size={14} 
                    color={isHighlighted ? '#121212' : '#10B981'} 
                />
            </View>
            <Text style={[
                styles.featureText,
                isHighlighted && styles.featureTextHighlighted
            ]}>
                {feature.text}
            </Text>
        </Animated.View>
    );
};

const PlanCard = ({ plan, billingCycle, onSelect, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isPressed, setIsPressed] = useState(false);
    
    const currentPrice = plan.price[billingCycle];
    const originalPrice = plan.originalPrice[billingCycle];
    const pricePerMonth = billingCycle === 'annually' ? Math.round(currentPrice / 12) : currentPrice;
    const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }, index * 150);

        return () => clearTimeout(timer);
    }, [index, scaleAnim, fadeAnim]);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            tension: 200,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 200,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const handleSelect = () => {
        const selectedOption = {
            product: plan.name,
            name: `Plan ${billingCycle === 'monthly' ? 'Mensual' : 'Anual'}`,
            price: currentPrice,
            period: billingCycle,
            planId: plan.id,
        };
        
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        onSelect(selectedOption);
    };

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: fadeAnim,
                }
            ]}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.cardTouchable}
            >
                <LinearGradient
                    colors={plan.gradient}
                    style={[
                        styles.planCard,
                        plan.isHighlighted && styles.highlightedCard
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header con badge y descuento */}
                    <View style={styles.cardHeader}>
                        {plan.badge && (
                            <View style={styles.popularBadge}>
                                <Feather name="star" size={12} color="#121212" />
                                <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                            </View>
                        )}
                        
                        {discount > 0 && billingCycle === 'annually' && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </View>
                        )}
                    </View>

                    {/* Información del plan */}
                    <View style={styles.planInfo}>
                        <Text style={styles.planTagline}>{plan.tagline}</Text>
                        <Text style={[
                            styles.planName,
                            plan.isHighlighted && styles.planNameHighlighted
                        ]}>
                            {plan.name}
                        </Text>
                        <Text style={[
                            styles.planDescription,
                            plan.isHighlighted && styles.planDescriptionHighlighted
                        ]}>
                            {plan.description}
                        </Text>
                    </View>

                    {/* Precios */}
                    <View style={styles.pricingSection}>
                        <View style={styles.priceContainer}>
                            <Text style={[
                                styles.currency,
                                plan.isHighlighted && styles.currencyHighlighted
                            ]}>
                                $
                            </Text>
                            <Text style={[
                                styles.priceAmount,
                                plan.isHighlighted && styles.priceAmountHighlighted
                            ]}>
                                {pricePerMonth.toLocaleString()}
                            </Text>
                            <Text style={[
                                styles.pricePeriod,
                                plan.isHighlighted && styles.pricePeriodHighlighted
                            ]}>
                                /mes
                            </Text>
                        </View>
                        
                        {billingCycle === 'annually' && (
                            <View style={styles.billingInfo}>
                                <Text style={[
                                    styles.billingNotice,
                                    plan.isHighlighted && styles.billingNoticeHighlighted
                                ]}>
                                    Facturado anualmente: ${currentPrice.toLocaleString()}
                                </Text>
                                {originalPrice && (
                                    <Text style={[
                                        styles.originalPrice,
                                        plan.isHighlighted && styles.originalPriceHighlighted
                                    ]}>
                                        Antes: ${originalPrice.toLocaleString()}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Features */}
                    <View style={styles.featuresSection}>
                        <Text style={[
                            styles.featuresTitle,
                            plan.isHighlighted && styles.featuresTitleHighlighted
                        ]}>
                            Incluye:
                        </Text>
                        
                        <View style={styles.featuresList}>
                            {plan.features.map((feature, featureIndex) => (
                                <FeatureItem
                                    key={feature.text}
                                    feature={feature}
                                    isHighlighted={plan.isHighlighted}
                                    delay={featureIndex * 100}
                                />
                            ))}
                        </View>

                        {plan.limitations.length > 0 && (
                            <View style={styles.limitationsSection}>
                                <Text style={[
                                    styles.limitationsTitle,
                                    plan.isHighlighted && styles.limitationsTitleHighlighted
                                ]}>
                                    Limitaciones:
                                </Text>
                                {plan.limitations.map((limitation, limitIndex) => (
                                    <View key={limitIndex} style={styles.limitationItem}>
                                        <Feather 
                                            name="minus" 
                                            size={12} 
                                            color={plan.isHighlighted ? 'rgba(18, 18, 18, 0.4)' : 'rgba(255, 255, 255, 0.4)'} 
                                        />
                                        <Text style={[
                                            styles.limitationText,
                                            plan.isHighlighted && styles.limitationTextHighlighted
                                        ]}>
                                            {limitation}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={[
                            styles.selectButton,
                            plan.isHighlighted ? styles.selectButtonHighlighted : styles.selectButtonDefault
                        ]}
                        onPress={handleSelect}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={plan.isHighlighted 
                                ? ['#121212', '#2a2a2a'] 
                                : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']
                            }
                            style={styles.selectButtonGradient}
                        >
                            <Text style={[
                                styles.selectButtonText,
                                plan.isHighlighted && styles.selectButtonTextHighlighted
                            ]}>
                                Comenzar con {plan.tagline}
                            </Text>
                            <Feather 
                                name="arrow-right" 
                                size={18} 
                                color={plan.isHighlighted ? '#FFFFFF' : '#FFFFFF'} 
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const PlanComparison = ({ plans, billingCycle }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const allFeatures = [...new Set(plans.flatMap(plan => 
        plan.features.map(f => f.text)
    ))];

    return (
        <Animated.View style={[styles.comparisonSection, { opacity: fadeAnim }]}>
            <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonTitle}>Comparación Detallada</Text>
                <Text style={styles.comparisonSubtitle}>
                    Ve las diferencias entre cada plan
                </Text>
            </View>
            
            <View style={styles.comparisonTable}>
                <View style={styles.comparisonHeaderRow}>
                    <Text style={styles.comparisonHeaderText}>Característica</Text>
                    {plans.map(plan => (
                        <View key={plan.id} style={styles.comparisonPlanHeader}>
                            <Text style={styles.comparisonPlanName}>
                                {plan.tagline}
                            </Text>
                        </View>
                    ))}
                </View>
                
                {allFeatures.slice(0, 7).map((feature, index) => (
                    <View key={index} style={[
                        styles.comparisonRow,
                        index % 2 === 0 && styles.comparisonRowEven
                    ]}>
                        <Text style={styles.comparisonFeature}>{feature}</Text>
                        {plans.map(plan => (
                            <View key={plan.id} style={styles.comparisonCell}>
                                <View style={[
                                    styles.checkIconContainer,
                                    plan.features.some(f => f.text === feature) && styles.checkIconContainerActive
                                ]}>
                                    <Feather 
                                        name={plan.features.some(f => f.text === feature) ? "check" : "x"} 
                                        size={16} 
                                        color={plan.features.some(f => f.text === feature) ? "#10B981" : "#FF6B6B"} 
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

// --- COMPONENTE PRINCIPAL ---
const PlanSelectionScreen = () => {
    const navigation = useNavigation();
    const [billingCycle, setBillingCycle] = useState('annually');
    const [showComparison, setShowComparison] = useState(false);
    const flatListRef = useRef(null);
    const [plans, setPlans] = useState([]); // Para guardar los planes de la API
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    
    // Animaciones
    const headerFadeAnim = useRef(new Animated.Value(0)).current;
    const headerSlideAnim = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        // Animación de entrada del header
        Animated.parallel([
            Animated.timing(headerFadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(headerSlideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePlanSelect = (selectedPlan) => {
        navigation.navigate('PaymentGateway', { selectedPlan });
    };

    const renderPlanCard = ({ item, index }) => (
        <PlanCard
            plan={item}
            billingCycle={billingCycle}
            onSelect={handlePlanSelect}
            index={index}
        />
    );

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            
            <LinearGradient
                colors={['#1a1a1a', '#121212', '#0f0f0f']}
                locations={[0, 0.7, 1]}
                style={styles.gradient}
            >
                {/* Header */}
                <Animated.View 
                    style={[
                        styles.header,
                        {
                            opacity: headerFadeAnim,
                            transform: [{ translateY: headerSlideAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="arrow-left" size={24} color="#FDB813" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Planes y Precios</Text>
                        <Text style={styles.subtitle}>
                            Elige la solución perfecta para tu negocio
                        </Text>
                    </View>
                </Animated.View>

                {/* Billing Toggle */}
                <AnimatedBillingToggle 
                    billingCycle={billingCycle} 
                    setBillingCycle={setBillingCycle} 
                />

               // En tu componente PlanSelectionScreen, reemplaza el bloque de renderizado existente con este:

{isLoading && (
    <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#FDB813" />
        <Text style={styles.loadingText}>Cargando planes...</Text>
    </View>
)}

{error && (
    <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        {/* Opcional: Añadir un botón para reintentar */}
    </View>
)}

{!isLoading && !error && (
    <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
    >
        {/* Plans Carousel */}
        <View style={styles.carouselSection}>
            <FlatList
                ref={flatListRef}
                data={plans}
                renderItem={renderPlanCard}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                initialScrollIndex={1} // Centrar en el plan recomendado
            />
            
            {/* Dots Indicator */}
            <View style={styles.dotsContainer}>
                {plans.map((_, index) => {
                    const inputRange = [
                        (index - 1) * (CARD_WIDTH + CARD_SPACING),
                        index * (CARD_WIDTH + CARD_SPACING),
                        (index + 1) * (CARD_WIDTH + CARD_SPACING),
                    ];
                    
                    const dotOpacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });
                    
                    const dotScale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.8, 1.3, 0.8],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    opacity: dotOpacity,
                                    transform: [{ scale: dotScale }]
                                }
                            ]}
                        />
                    );
                })}
            </View>
        </View>

        {/* Comparison Toggle */}
        <TouchableOpacity
            style={styles.comparisonToggle}
            onPress={() => setShowComparison(!showComparison)}
            activeOpacity={0.8}
        >
            <Text style={styles.comparisonToggleText}>
                {showComparison ? 'Ocultar' : 'Ver'} comparación detallada
            </Text>
            <Animated.View
                style={{
                    transform: [{
                        rotate: showComparison ? '180deg' : '0deg'
                    }]
                }}
            >
                <Feather name="chevron-down" size={20} color="#FDB813" />
            </Animated.View>
        </TouchableOpacity>

        {/* Detailed Comparison */}
        {showComparison && (
            <PlanComparison 
                plans={plans} 
                billingCycle={billingCycle} 
            />
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
            <View style={styles.helpHeader}>
                <Feather name="help-circle" size={24} color="#FDB813" />
                <Text style={styles.helpTitle}>¿Necesitas ayuda para decidir?</Text>
            </View>
            <Text style={styles.helpText}>
                Nuestro equipo está aquí para ayudarte a encontrar el plan perfecto para tu negocio
            </Text>
            
            <View style={styles.helpButtons}>
                <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['rgba(253, 184, 19, 0.1)', 'rgba(253, 184, 19, 0.05)']}
                        style={styles.helpButtonGradient}
                    >
                        <Feather name="message-circle" size={20} color="#FDB813" />
                        <Text style={styles.helpButtonText}>Chat en vivo</Text>
                    </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['rgba(253, 184, 19, 0.1)', 'rgba(253, 184, 19, 0.05)']}
                        style={styles.helpButtonGradient}
                    >
                        <Feather name="phone" size={20} color="#FDB813" />
                        <Text style={styles.helpButtonText}>Llamar ahora</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.bottomSpacing} />
    </ScrollView>
)}
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
    header: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 25 : 65,
        left: 24,
        zIndex: 10,
        padding: 12,
        borderRadius: 24,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.2)',
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    
    // Toggle Styles
    toggleWrapper: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    toggleContainer: {
        width: 220,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: 3,
        flexDirection: 'row',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    toggleKnob: {
        position: 'absolute',
        top: 3,
        height: 42,
        backgroundColor: '#FDB813',
        borderRadius: 21,
        shadowColor: '#FDB813',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    toggleOption: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 42,
        borderRadius: 21,
        position: 'relative',
        flex: 1,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    toggleTextActive: {
        color: '#121212',
        fontWeight: 'bold',
    },
    savingsBadge: {
        position: 'absolute',
        top: -8,
        right: -4,
        backgroundColor: '#10B981',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    savingsBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    savingsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    savingsText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    
    // Scroll and Carousel Styles
    scrollView: {
        flex: 1,
    },
    carouselSection: {
        paddingVertical: 20,
    },
    carouselContent: {
        paddingHorizontal: 20,
    },
    
    // Card Styles
    cardContainer: {
        width: CARD_WIDTH,
        marginHorizontal: CARD_SPACING / 2,
    },
    cardTouchable: {
        borderRadius: 24,
    },
    planCard: {
        borderRadius: 24,
        padding: 24,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    highlightedCard: {
        borderColor: 'rgba(253, 184, 19, 0.3)',
        shadowColor: '#FDB813',
        shadowOpacity: 0.4,
        transform: [{ scale: 1.02 }],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        minHeight: 32,
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(18, 18, 18, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(18, 18, 18, 0.2)',
    },
    popularBadgeText: {
        color: '#121212',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    discountBadge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        shadowColor: '#FF6B6B',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    
    // Plan Info Styles
    planInfo: {
        marginBottom: 24,
    },
    planTagline: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    planName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    planNameHighlighted: {
        color: '#121212',
    },
    planDescription: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 22,
    },
    planDescriptionHighlighted: {
        color: 'rgba(18, 18, 18, 0.8)',
    },
    
    // Pricing Styles
    pricingSection: {
        marginBottom: 28,
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 8,
    },
    currency: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    currencyHighlighted: {
        color: '#121212',
    },
    priceAmount: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    priceAmountHighlighted: {
        color: '#121212',
    },
    pricePeriod: {
        fontSize: 18,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        marginLeft: 4,
    },
    pricePeriodHighlighted: {
        color: 'rgba(18, 18, 18, 0.8)',
    },
    billingInfo: {
        alignItems: 'center',
    },
    billingNotice: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
    },
    billingNoticeHighlighted: {
        color: 'rgba(18, 18, 18, 0.7)',
    },
    originalPrice: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textDecorationLine: 'line-through',
    },
    originalPriceHighlighted: {
        color: 'rgba(18, 18, 18, 0.5)',
    },
    
    // Features Styles
    featuresSection: {
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    featuresTitleHighlighted: {
        color: '#121212',
    },
    featuresList: {
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        flex: 1,
        fontWeight: '500',
    },
    featureTextHighlighted: {
        color: 'rgba(18, 18, 18, 0.9)',
    },
    
    // Limitations Styles
    limitationsSection: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    limitationsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
    },
    limitationsTitleHighlighted: {
        color: 'rgba(18, 18, 18, 0.8)',
    },
    limitationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    limitationText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        marginLeft: 8,
        fontStyle: 'italic',
    },
    limitationTextHighlighted: {
        color: 'rgba(18, 18, 18, 0.6)',
    },
    
    // Button Styles
    selectButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    selectButtonHighlighted: {
        shadowColor: '#121212',
    },
    selectButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 8,
    },
    selectButtonTextHighlighted: {
        color: '#FFFFFF',
    },
    
    // Dots Indicator
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FDB813',
        marginHorizontal: 6,
    },
    
    // Comparison Styles
    comparisonToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginHorizontal: 20,
        marginVertical: 16,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.2)',
    },
    comparisonToggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FDB813',
        marginRight: 8,
    },
    comparisonSection: {
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    comparisonHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    comparisonTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    comparisonSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    comparisonTable: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    comparisonHeaderRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    comparisonHeaderText: {
        flex: 2,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FDB813',
    },
    comparisonPlanHeader: {
        flex: 1,
        alignItems: 'center',
    },
    comparisonPlanName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FDB813',
        textAlign: 'center',
    },
    comparisonRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    comparisonRowEven: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    comparisonFeature: {
        flex: 2,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    comparisonCell: {
        flex: 1,
        alignItems: 'center',
    },
    checkIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    checkIconContainerActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    
    // Help Section Styles
    helpSection: {
        marginHorizontal: 20,
        marginVertical: 24,
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    helpTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    helpText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 22,
        marginBottom: 20,
    },
    helpButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    helpButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    helpButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.2)',
        borderRadius: 16,
    },
    helpButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FDB813',
        marginLeft: 8,
    },
    
    // Spacing
    bottomSpacing: {
        height: 40,
    },
});

export default PlanSelectionScreen;