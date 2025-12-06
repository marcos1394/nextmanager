import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
    FlatList,
    Platform,
    SafeAreaView,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// --- CONSTANTES DE DISEÑO OPTIMIZADAS ---
const COLORS = {
    primary: '#FDB813',
    secondary: '#FFAA00',
    accent: '#FF6B35',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceLight: '#252525',
    text: '#FFFFFF',
    textSecondary: '#B8B8B8',
    textDim: '#808080',
    success: '#00D084',
    border: 'rgba(253, 184, 19, 0.2)',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

const TYPOGRAPHY = {
    hero: 42,
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    bodyLarge: 18,
    caption: 14,
    small: 12,
};

// --- DATOS DEL ONBOARDING MEJORADOS ---
const ONBOARDING_DATA = [
    {
        key: '1',
        icon: 'cash-register',
        title: 'Aumenta Ventas 30%',
        description: 'Dashboard en tiempo real que identifica tus platillos más rentables y horarios pico.',
        metric: '+$15,000 MXN/mes promedio',
        color: '#00D084',
    },
    {
        key: '2',
        icon: 'chart-line',
        title: 'Reduce Desperdicio',
        description: 'IA que predice demanda exacta. Ahorra hasta $5,000 mensuales en inventario no utilizado.',
        metric: '-40% desperdicio',
        color: '#FDB813',
    },
    {
        key: '3',
        icon: 'bell-alert',
        title: 'Control 24/7',
        description: 'Alertas instantáneas sobre stock crítico, ventas inusuales y oportunidades perdidas.',
        metric: 'Respuesta en <2 min',
        color: '#FF6B35',
    },
];

const SOCIAL_PROOF = {
    restaurants: '12,000+',
    rating: '4.9',
    savings: '$8M MXN',
};

// --- COMPONENTE: HERO SECTION (NUEVA) ---
const HeroSection = ({ onGetStarted, onLogin }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
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
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.heroContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* Fondo con gradiente sutil */}
            <LinearGradient
                colors={['#0A0A0A', '#1A1A1A', '#0A0A0A']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Elementos decorativos de fondo */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <SafeAreaView style={styles.heroContent}>
                <Animated.View style={[styles.heroTop, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {/* Logo/Badge Premium */}
                    <View style={styles.brandBadge}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.brandBadgeGradient}
                        >
                            <MaterialCommunityIcons name="storefront" size={28} color="#0A0A0A" />
                        </LinearGradient>
                    </View>

                    {/* Tagline principal */}
                    <Text style={styles.heroTitle}>
                        Tu Restaurante,{'\n'}
                        <Text style={styles.heroTitleAccent}>Más Rentable</Text>
                    </Text>
                    
                    <Text style={styles.heroSubtitle}>
                        Plataforma de gestión que aumenta ventas y reduce costos con inteligencia artificial
                    </Text>

                    {/* Social Proof compacto */}
                    <View style={styles.socialProofContainer}>
                        <View style={styles.socialProofItem}>
                            <MaterialCommunityIcons name="store-check" size={16} color={COLORS.success} />
                            <Text style={styles.socialProofText}>{SOCIAL_PROOF.restaurants} restaurantes</Text>
                        </View>
                        <View style={styles.socialProofDivider} />
                        <View style={styles.socialProofItem}>
                            <MaterialCommunityIcons name="star" size={16} color={COLORS.primary} />
                            <Text style={styles.socialProofText}>{SOCIAL_PROOF.rating} rating</Text>
                        </View>
                        <View style={styles.socialProofDivider} />
                        <View style={styles.socialProofItem}>
                            <MaterialCommunityIcons name="currency-usd" size={16} color={COLORS.success} />
                            <Text style={styles.socialProofText}>{SOCIAL_PROOF.savings} ahorrados</Text>
                        </View>
                    </View>

                    {/* CTAs principales */}
                    <View style={styles.heroCTAContainer}>
                        <TouchableOpacity 
                            style={styles.primaryCTA} 
                            onPress={onGetStarted}
                            activeOpacity={0.85}
                            accessible={true}
                            accessibilityLabel="Comenzar prueba gratuita de 30 días"
                            accessibilityRole="button"
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryCTAGradient}
                            >
                                <View style={styles.ctaContent}>
                                    <Text style={styles.primaryCTAText}>Probar 30 Días Gratis</Text>
                                    <View style={styles.ctaBadge}>
                                        <Text style={styles.ctaBadgeText}>Sin tarjeta</Text>
                                    </View>
                                </View>
                                <Feather name="arrow-right" size={22} color="#0A0A0A" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.secondaryCTA}
                            onPress={onLogin}
                            activeOpacity={0.7}
                            accessible={true}
                            accessibilityLabel="Iniciar sesión"
                            accessibilityRole="button"
                        >
                            <Text style={styles.secondaryCTAText}>¿Ya tienes cuenta? </Text>
                            <Text style={styles.secondaryCTATextBold}>Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Indicador de scroll */}
                    <View style={styles.scrollIndicator}>
                        <Feather name="chevron-down" size={20} color={COLORS.textDim} />
                        <Text style={styles.scrollIndicatorText}>Conoce los beneficios</Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

// --- COMPONENTE: ITEM DEL ONBOARDING MEJORADO ---
const OnboardingItem = ({ item, scrollX, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.85, 1, 0.85],
        extrapolate: 'clamp',
    });
    
    const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.4, 1, 0.4],
        extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
        inputRange,
        outputRange: [30, 0, 30],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.onboardingItemContainer}>
            <Animated.View style={[
                styles.onboardingCard,
                { 
                    transform: [{ scale }, { translateY }],
                    opacity,
                }
            ]}>
                {/* Indicador de color personalizado */}
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                
                <View style={styles.cardContent}>
                    {/* Icono con fondo de color */}
                    <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                        <MaterialCommunityIcons 
                            name={item.icon} 
                            size={48} 
                            color={item.color} 
                        />
                    </View>

                    {/* Métrica destacada */}
                    <View style={styles.metricBadge}>
                        <Text style={[styles.metricText, { color: item.color }]}>
                            {item.metric}
                        </Text>
                    </View>

                    {/* Contenido */}
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>

                    {/* Checkmarks de beneficios */}
                    <View style={styles.benefitsContainer}>
                        <View style={styles.benefitItem}>
                            <Feather name="check-circle" size={16} color={COLORS.success} />
                            <Text style={styles.benefitText}>Sin instalación</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Feather name="check-circle" size={16} color={COLORS.success} />
                            <Text style={styles.benefitText}>Soporte 24/7</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

// --- COMPONENTE: PAGINADOR MEJORADO ---
const Paginator = ({ data, scrollX, currentIndex }) => {
    return (
        <View style={styles.paginatorContainer}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 28, 8],
                    extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View 
                        key={i.toString()} 
                        style={[
                            styles.paginatorDot, 
                            { 
                                width: dotWidth, 
                                opacity,
                                backgroundColor: i === currentIndex ? COLORS.primary : COLORS.textDim,
                            }
                        ]} 
                    />
                );
            })}
        </View>
    );
};

// --- COMPONENTE: FOOTER CON TESTIMONIAL ---
const TestimonialFooter = () => {
    return (
        <View style={styles.testimonialContainer}>
            <View style={styles.testimonialCard}>
                <View style={styles.quoteIcon}>
                    <MaterialCommunityIcons name="format-quote-close" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.testimonialText}>
                    "Recuperé la inversión en 3 semanas. Ahora sé exactamente qué vender y cuándo"
                </Text>
                <View style={styles.testimonialAuthor}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>MC</Text>
                    </View>
                    <View>
                        <Text style={styles.authorName}>María Contreras</Text>
                        <Text style={styles.authorRole}>Dueña, Taquería El Fogón</Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                        <Feather name="check" size={10} color="#fff" />
                    </View>
                </View>
            </View>
        </View>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function LandingPage() {
    const navigation = useNavigation();
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showHero, setShowHero] = useState(true);
    const [skipVisible, setSkipVisible] = useState(false);

    // Mostrar botón skip después de 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            setSkipVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            const index = viewableItems[0]?.index ?? 0;
            setCurrentIndex(index);
            Haptics.selectionAsync();
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleGetStarted = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowHero(false);
    };

    const handleNext = () => {
        if (!slidesRef.current) return;
        
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            slidesRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('Register');
        }
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Register');
    };

    const handleLogin = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Login');
    };

    // Gradiente de fondo memoizado para rendimiento
    const backgroundGradient = useMemo(() => (
        <LinearGradient
            colors={['#0A0A0A', '#1A1A1A']}
            style={StyleSheet.absoluteFillObject}
        />
    ), []);

    if (showHero) {
        return <HeroSection onGetStarted={handleGetStarted} onLogin={handleLogin} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            {backgroundGradient}

            {/* Header con skip button (aparece después de 3s) */}
            {skipVisible && (
                <SafeAreaView style={styles.headerContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={handleSkip} 
                            style={styles.skipButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.skipText}>Saltar</Text>
                            <Feather name="arrow-right" size={14} color={COLORS.textDim} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

            {/* Carrusel de beneficios */}
            <FlatList
                data={ONBOARDING_DATA}
                renderItem={({ item, index }) => (
                    <OnboardingItem item={item} scrollX={scrollX} index={index} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.key}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={width}
                snapToAlignment="center"
            />

            {/* Footer con paginador y acciones */}
            <View style={styles.footerContainer}>
                <Paginator data={ONBOARDING_DATA} scrollX={scrollX} currentIndex={currentIndex} />
                
                {/* Testimonial (solo en última pantalla) */}
                {currentIndex === ONBOARDING_DATA.length - 1 && <TestimonialFooter />}

                {/* Botones de acción */}
                <View style={styles.footerActions}>
                    <TouchableOpacity 
                        style={styles.mainActionButton} 
                        onPress={handleNext}
                        activeOpacity={0.85}
                        accessible={true}
                        accessibilityLabel={
                            currentIndex === ONBOARDING_DATA.length - 1 
                                ? "Crear cuenta gratuita" 
                                : "Ver siguiente beneficio"
                        }
                        accessibilityRole="button"
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.mainActionGradient}
                        >
                            <Text style={styles.mainActionText}>
                                {currentIndex === ONBOARDING_DATA.length - 1 
                                    ? 'Crear Cuenta Gratis' 
                                    : 'Siguiente'}
                            </Text>
                            <Feather 
                                name={currentIndex === ONBOARDING_DATA.length - 1 ? "check" : "arrow-right"} 
                                size={20} 
                                color="#0A0A0A" 
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Link a login */}
                    <TouchableOpacity 
                        style={styles.loginLink}
                        onPress={handleLogin}
                        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                    >
                        <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
                        <Text style={styles.loginLinkBold}>Ingresa aquí</Text>
                    </TouchableOpacity>

                    {/* Trust badges */}
                    <View style={styles.trustBadges}>
                        <View style={styles.trustBadge}>
                            <Feather name="shield" size={12} color={COLORS.success} />
                            <Text style={styles.trustBadgeText}>Datos seguros</Text>
                        </View>
                        <View style={styles.trustBadge}>
                            <Feather name="lock" size={12} color={COLORS.success} />
                            <Text style={styles.trustBadgeText}>Cifrado 256-bit</Text>
                        </View>
                        <View style={styles.trustBadge}>
                            <Feather name="clock" size={12} color={COLORS.success} />
                            <Text style={styles.trustBadgeText}>Cancela cuando quieras</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

// --- ESTILOS COMPLETOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    
    // --- HERO SECTION STYLES ---
    heroContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.primary,
        opacity: 0.03,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: COLORS.accent,
        opacity: 0.03,
    },
    heroContent: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg,
    },
    heroTop: {
        alignItems: 'center',
    },
    brandBadge: {
        marginBottom: SPACING.xl,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    brandBadgeGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    heroTitle: {
        fontSize: TYPOGRAPHY.hero,
        fontWeight: '900',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
        letterSpacing: -0.5,
        lineHeight: TYPOGRAPHY.hero * 1.2,
    },
    heroTitleAccent: {
        color: COLORS.primary,
    },
    heroSubtitle: {
        fontSize: TYPOGRAPHY.bodyLarge,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    socialProofContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 100,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    socialProofItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    socialProofText: {
        fontSize: TYPOGRAPHY.small,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    socialProofDivider: {
        width: 1,
        height: 16,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    heroCTAContainer: {
        width: '100%',
        alignItems: 'center',
        gap: SPACING.md,
    },
    primaryCTA: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    primaryCTAGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    ctaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    primaryCTAText: {
        fontSize: TYPOGRAPHY.bodyLarge,
        fontWeight: '800',
        color: '#0A0A0A',
        letterSpacing: 0.3,
    },
    ctaBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ctaBadgeText: {
        fontSize: TYPOGRAPHY.small,
        color: '#0A0A0A',
        fontWeight: '700',
    },
    secondaryCTA: {
        paddingVertical: SPACING.md,
        flexDirection: 'row',
    },
    secondaryCTAText: {
        fontSize: TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
    secondaryCTATextBold: {
        fontSize: TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '700',
    },
    scrollIndicator: {
        marginTop: SPACING.xxl,
        alignItems: 'center',
        gap: SPACING.xs,
    },
    scrollIndicatorText: {
        fontSize: TYPOGRAPHY.caption,
        color: COLORS.textDim,
        fontWeight: '500',
    },

    // --- ONBOARDING STYLES ---
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'android' ? SPACING.lg : 0,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skipText: {
        color: COLORS.textDim,
        fontSize: TYPOGRAPHY.caption,
        fontWeight: '600',
    },
    onboardingItemContainer: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xxl,
    },
    onboardingCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 16,
    },
    colorIndicator: {
        height: 4,
        width: '100%',
    },
    cardContent: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    metricBadge: {
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    metricText: {
        fontSize: TYPOGRAPHY.caption,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: TYPOGRAPHY.h2,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
        letterSpacing: -0.3,
    },
    cardDescription: {
        fontSize: TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.lg,
    },
    benefitsContainer: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginTop: SPACING.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    benefitText: {
        fontSize: TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },

    // --- PAGINATOR ---
    paginatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    paginatorDot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
    },

    // --- TESTIMONIAL ---
    testimonialContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    testimonialCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    quoteIcon: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        opacity: 0.5,
    },
    testimonialText: {
        fontSize: TYPOGRAPHY.body,
        color: COLORS.text,
        lineHeight: 24,
        marginBottom: SPACING.md,
        fontStyle: 'italic',
    },
    testimonialAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: TYPOGRAPHY.caption,
        fontWeight: '800',
        color: '#0A0A0A',
    },
    authorName: {
        fontSize: TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
    },
    authorRole: {
        fontSize: TYPOGRAPHY.small,
        color: COLORS.textDim,
    },
    verifiedBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- FOOTER ACTIONS ---
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
        backgroundColor: 'transparent',
    },
    footerActions: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    mainActionButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    mainActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    mainActionText: {
        fontSize: TYPOGRAPHY.bodyLarge,
        fontWeight: '800',
        color: '#0A0A0A',
        letterSpacing: 0.3,
    },
    loginLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    loginLinkText: {
        fontSize: TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    loginLinkBold: {
        fontSize: TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontWeight: '700',
    },
    trustBadges: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginTop: SPACING.sm,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trustBadgeText: {
        fontSize: TYPOGRAPHY.small,
        color: COLORS.textDim,
        fontWeight: '500',
    },
});