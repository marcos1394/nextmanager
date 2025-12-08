import React, { useRef, useState, useCallback, useEffect } from 'react';
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
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext'; // Importación del contexto

const { width, height } = Dimensions.get('window');

// --- CONSTANTES DE DISEÑO Y DATOS ---
const COLORS = {
    primary: '#FDB813',      // Amarillo Gold
    secondary: '#FFAA00',    // Naranja Gold
    background: '#121212',   // Negro profundo
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textDim: '#E0E0E0',      // Gris claro para buena lectura
};

const ONBOARDING_DATA = [
    {
        key: '1',
        icon: 'finance',
        title: 'Tu Restaurante,\nBajo Control',
        description: 'Visualiza tus ventas en tiempo real y detecta fugas de dinero al instante. Gestión total en tu bolsillo.',
    },
    {
        key: '2',
        icon: 'lightning-bolt',
        title: 'Decisiones que\nGeneran Dinero',
        description: 'No adivines. Usa datos reales para optimizar tu menú y aumentar tus márgenes de ganancia hoy mismo.',
    },
    {
        key: '3',
        icon: 'bell-ring',
        title: 'Nunca te quedes\nsin inventario',
        description: 'Recibe alertas automáticas antes de que se agoten tus insumos críticos. Opera sin interrupciones.',
    },
];

// --- COMPONENTE: ITEM DEL CARRUSEL (CON PARALLAX) ---
const OnboardingItem = ({ item, scrollX, index }) => {
    // Matemáticas para la interpolación Parallax basada en la posición del scroll
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    // El icono escala suavemente
    const iconScale = scrollX.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: 'clamp',
    });
    
    // El texto se mueve a diferente velocidad para efecto de profundidad
    const textTranslate = scrollX.interpolate({
        inputRange,
        outputRange: [50, 0, -50],
        extrapolate: 'clamp',
    });
    
    // Opacidad para transiciones suaves
    const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.itemContainer}>
            <Animated.View style={[
                styles.iconContainer, 
                { transform: [{ scale: iconScale }] }
            ]}>
                <LinearGradient
                    colors={['rgba(253, 184, 19, 0.25)', 'rgba(253, 184, 19, 0.02)']}
                    style={styles.iconBackground}
                >
                    <MaterialCommunityIcons name={item.icon} size={80} color={COLORS.primary} />
                </LinearGradient>
            </Animated.View>

            <Animated.View style={{ opacity, transform: [{ translateX: textTranslate }] }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
        </View>
    );
};

// --- COMPONENTE: PAGINADOR ANIMADO ---
const Paginator = ({ data, scrollX }) => {
    return (
        <View style={styles.paginatorContainer}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                
                // El punto activo se estira
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
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
                        style={[styles.dot, { width: dotWidth, opacity }]} 
                    />
                );
            })}
        </View>
    );
};

// --- COMPONENTE: FONDO MEMOIZADO (OPTIMIZACIÓN) ---
const Background = React.memo(() => (
    <LinearGradient
        colors={['#1a1a1a', '#050505']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    />
));

// --- COMPONENTE PRINCIPAL ---
export default function LandingPage() {
    const navigation = useNavigation();
    const { isAuthenticated, isLoading } = useAuth(); // Hook de autenticación

    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- 1. LÓGICA DE REDIRECCIÓN AUTOMÁTICA ---
    useEffect(() => {
        // Solo verificamos cuando termina de cargar (isLoading es false)
        if (!isLoading) {
            if (isAuthenticated) {
                console.log('[LandingPage] Sesión activa detectada. Redirigiendo al Dashboard.');
                navigation.replace('Monitor');
            } else {
                console.log('[LandingPage] No hay sesión activa. Mostrando Onboarding.');
            }
        }
    }, [isLoading, isAuthenticated, navigation]);

    // --- 2. RENDERIZADO DE CARGA (Evita "Flash" de contenido) ---
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // --- FUNCIONES DE INTERACCIÓN ---

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            const index = viewableItems[0].index;
            setCurrentIndex(index);
            // Feedback táctil suave al cambiar de slide
            if (Platform.OS === 'ios') Haptics.selectionAsync();
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (!slidesRef.current) return;

        if (currentIndex < ONBOARDING_DATA.length - 1) {
            // Avanzar al siguiente slide
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Finalizar onboarding e ir a Registro
            console.log('[LandingPage] Usuario completó el onboarding. Navegando a Registro.');
            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('Register');
        }
    };

    const handleLogin = () => {
        console.log('[LandingPage] Usuario seleccionó Iniciar Sesión.');
        navigation.navigate('Login');
    };

    // --- RENDERIZADO PRINCIPAL ---
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <Background />

            {/* Carrusel de Contenido */}
            <FlatList
                data={ONBOARDING_DATA}
                renderItem={({ item, index }) => <OnboardingItem item={item} scrollX={scrollX} index={index} />}
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
                scrollEventThrottle={32}
            />

            {/* Footer Fijo con Controles */}
            <View style={styles.footer}>
                {/* Paginador (Puntitos) */}
                <Paginator data={ONBOARDING_DATA} scrollX={scrollX} />

                <View style={styles.footerButtonsContainer}>
                    {/* Botón Principal (Siguiente / Crear Cuenta) */}
                    <TouchableOpacity 
                        style={styles.mainButton} 
                        onPress={handleNext}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.mainButtonText}>
                                {currentIndex === ONBOARDING_DATA.length - 1 ? 'Crear Cuenta Gratis' : 'Siguiente'}
                            </Text>
                            <Feather 
                                name={currentIndex === ONBOARDING_DATA.length - 1 ? "arrow-up-right" : "arrow-right"} 
                                size={22} 
                                color="#121212" 
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Enlace discreto para Login */}
                    <TouchableOpacity 
                        style={styles.loginLinkButton}
                        onPress={handleLogin}
                        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    >
                        <Text style={styles.loginLinkText}>
                            ¿Ya tienes cuenta? <Text style={styles.loginLinkHighlight}>Inicia Sesión</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    itemContainer: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: height * 0.25, // Empuja el contenido hacia arriba para dejar espacio al footer
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 15,
    },
    iconBackground: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(253, 184, 19, 0.4)',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
        lineHeight: 40,
    },
    description: {
        fontSize: 18,
        color: COLORS.textDim,
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.28, // Altura reservada para controles
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    paginatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginHorizontal: 5,
    },
    footerButtonsContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    mainButton: {
        width: '100%',
        borderRadius: 18,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    mainButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121212',
        letterSpacing: 0.5,
    },
    loginLinkButton: {
        padding: 10,
    },
    loginLinkText: {
        color: COLORS.textDim,
        fontSize: 15,
        fontWeight: '500',
    },
    loginLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '700',
    }
});