import React, { useRef, useState, useEffect } from 'react';
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
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Feedback táctil profesional

const { width, height } = Dimensions.get('window');

// --- CONSTANTES DE DISEÑO ---
const COLORS = {
    primary: '#FDB813',     // Amarillo Gold
    secondary: '#FFAA00',   // Naranja Gold
    background: '#121212',  // Negro profundo
    surface: '#1E1E1E',     // Gris oscuro para tarjetas
    text: '#FFFFFF',
    textDim: '#A9A9A9',
};

const ONBOARDING_DATA = [
    {
        key: '1',
        icon: 'chart-timeline-variant',
        title: 'Control Total',
        description: 'Monitorea tus ventas y métricas en tiempo real. Tu restaurante, en tu bolsillo.',
    },
    {
        key: '2',
        icon: 'brain', // Icono más moderno para "Inteligencia"
        title: 'Decisiones Inteligentes',
        description: 'Transforma datos en estrategias. Optimiza tu menú basándote en tendencias reales.',
    },
    {
        key: '3',
        icon: 'radar', // Icono para "Detección/Alertas"
        title: 'Siempre Alerta',
        description: 'Recibe notificaciones instantáneas sobre inventario crítico y anomalías en ventas.',
    },
];

// --- COMPONENTE: ITEM DEL CARRUSEL (CON PARALLAX) ---
const OnboardingItem = ({ item, scrollX, index }) => {
    // Interpolaciones para efectos Parallax
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    // El icono se mueve un poco más lento que el texto (Parallax)
    const iconTranslateY = scrollX.interpolate({
        inputRange,
        outputRange: [0, 0, 0], // Mantener centrado, pero podríamos moverlo
    });

    const iconScale = scrollX.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: 'clamp',
    });
    
    const textOpacity = scrollX.interpolate({
        inputRange,
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
    });

    const textTranslate = scrollX.interpolate({
        inputRange,
        outputRange: [50, 0, -50],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.itemContainer}>
            <Animated.View style={[
                styles.iconContainer, 
                { transform: [{ scale: iconScale }, { translateY: iconTranslateY }] }
            ]}>
                {/* Círculo decorativo con gradiente sutil */}
                <LinearGradient
                    colors={['rgba(253, 184, 19, 0.2)', 'rgba(253, 184, 19, 0.05)']}
                    style={styles.iconBackground}
                >
                    <MaterialCommunityIcons name={item.icon} size={80} color={COLORS.primary} />
                </LinearGradient>
            </Animated.View>

            <Animated.View style={{ opacity: textOpacity, transform: [{ translateX: textTranslate }] }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
        </View>
    );
};

// --- COMPONENTE: PAGINADOR ---
const Paginator = ({ data, scrollX }) => {
    return (
        <View style={styles.paginatorContainer}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 25, 10], // El punto activo se estira
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

// --- COMPONENTE PRINCIPAL ---
export default function LandingPage() {
    const navigation = useNavigation();
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Función para manejar el cambio de slide
    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            const index = viewableItems[0].index;
            setCurrentIndex(index);
            // Feedback táctil suave al cambiar de slide (Experiencia Premium)
            Haptics.selectionAsync(); 
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    // Acción del botón principal
    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Navegar a registro con feedback de éxito
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('Register');
        }
    };

    const handleSkip = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* Fondo Sutil Global */}
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header: Botón Omitir (Skip) */}
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Omitir</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Carrusel */}
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

            {/* Footer: Paginador y Botones */}
            <View style={styles.footer}>
                <Paginator data={ONBOARDING_DATA} scrollX={scrollX} />

                <View style={styles.footerButtonsContainer}>
                    {/* Botón Principal Dinámico */}
                    <TouchableOpacity 
                        style={styles.mainButton} 
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.mainButtonText}>
                                {currentIndex === ONBOARDING_DATA.length - 1 ? 'Comenzar Ahora' : 'Siguiente'}
                            </Text>
                            <Feather 
                                name={currentIndex === ONBOARDING_DATA.length - 1 ? "check-circle" : "arrow-right"} 
                                size={20} 
                                color="#121212" 
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Botón secundario para Login (Solo visible al final o siempre visible pequeño) */}
                    {currentIndex === ONBOARDING_DATA.length - 1 && (
                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.secondaryButtonText}>¿Ya tienes cuenta? Ingresa aquí</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: COLORS.textDim,
        fontSize: 16,
        fontWeight: '600',
    },
    // Estilos del Item
    itemContainer: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        // Ajuste para centrar visualmente teniendo en cuenta header y footer
        paddingBottom: 100, 
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 17,
        color: COLORS.textDim,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
    },
    // Footer styles
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.25, // Ocupa el 25% inferior
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 40,
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
        marginHorizontal: 6,
    },
    footerButtonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    mainButton: {
        width: '100%',
        borderRadius: 16,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden', // Necesario para el gradiente dentro de botones redondeados
    },
    gradientButton: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    mainButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121212',
    },
    secondaryButton: {
        marginTop: 20,
        padding: 10,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});