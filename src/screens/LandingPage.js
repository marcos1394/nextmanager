// LandingPage.js
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
    FlatList,
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; // Usaremos un set de iconos consistente y elegante

const { width, height } = Dimensions.get('window');

// --- DATOS PARA EL ONBOARDING ---
const onboardingScreens = [
    {
        key: '1',
        icon: 'chart-line', // Icono para representar datos y control
        title: 'Toma el control desde cualquier lugar',
        subtitle: 'Monitorea las ventas, el rendimiento y la actividad de tu restaurante en tiempo real, directamente desde tu bolsillo.',
    },
    {
        key: '2',
        icon: 'lightbulb-on-outline', // Icono para representar insights
        title: 'Convierte datos en ganancias',
        subtitle: 'Nuestros análisis avanzados te ayudan a identificar tendencias, optimizar tu menú y tomar decisiones más inteligentes.',
    },
    {
        key: '3',
        icon: 'bell-ring-outline', // Icono para representar alertas
        title: 'Anticípate a los problemas',
        subtitle: 'Recibe alertas personalizadas sobre niveles de inventario, ventas inusuales o cualquier métrica clave que definas.',
    },
];

// --- SUBCOMPONENTES ---

// Tarjeta individual del carrusel de onboarding
const OnboardingItem = ({ item }) => {
    return (
        <View style={styles.slide}>
            <View style={styles.iconWrapper}>
                <MaterialCommunityIcons name={item.icon} size={100} color="#FDB813" />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style_={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
    );
};

// Indicador de paginación (los puntos)
const Pagination = ({ data, scrollX }) => {
    return (
        <View style={styles.paginationContainer}>
            {data.map((_, idx) => {
                const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 20, 10],
                    extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });
                return <Animated.View key={idx.toString()} style={[styles.dot, { width: dotWidth, opacity }]} />;
            })}
        </View>
    );
};

/**
 * LandingPage - Reimaginada como una experiencia de Onboarding inmersiva.
 * * Estrategia de UX/UI:
 * 1.  Onboarding Progresivo: Se reemplaza la pantalla estática por un carrusel deslizable (FlatList).
 * Esto permite presentar los beneficios clave de forma secuencial y digerible, contando una historia.
 * 2.  Jerarquía Visual Clara: Cada diapositiva se enfoca en un solo beneficio, con un ícono grande,
 * un título potente y un subtítulo claro, creando un fuerte impacto visual.
 * 3.  Interacción y Feedback: El usuario interactúa deslizando, y la paginación (puntos) le da un
 * feedback visual inmediato sobre su progreso en el recorrido.
 * 4.  Llamada a la Acción Contextual: Los botones de "Registrarse" e "Iniciar Sesión" aparecen al
 * final del recorrido, justo cuando el usuario ha comprendido el valor de la app, maximizando la conversión.
 */
const LandingPage = () => {
    const navigation = useNavigation();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;
    
    // Animación para los botones finales
    const buttonsFadeAnim = scrollX.interpolate({
        inputRange: [(onboardingScreens.length - 2) * width, (onboardingScreens.length - 1) * width],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
     const buttonsSlideAnim = scrollX.interpolate({
        inputRange: [(onboardingScreens.length - 2) * width, (onboardingScreens.length - 1) * width],
        outputRange: [50, 0],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#1e1e1e', '#121212']}
                style={styles.gradient}
            >
                <FlatList
                    data={onboardingScreens}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    viewabilityConfig={viewabilityConfig}
                    onViewableItemsChanged={onViewableItemsChanged}
                />
                
                <View style={styles.footer}>
                     <Pagination data={onboardingScreens} scrollX={scrollX} />
                </View>

                {/* Los botones solo aparecen en la última pantalla */}
                <Animated.View style={[
                    styles.buttonContainer,
                    { 
                        opacity: buttonsFadeAnim,
                        transform: [{ translateY: buttonsSlideAnim }]
                    }
                ]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <LinearGradient
                            colors={['#FDB813', '#FFAA00']}
                            style={styles.gradientButton}
                        >
                            <Feather name="user-plus" size={20} color="#121212" />
                            <Text style={styles.buttonText}>Crear una Cuenta</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>¿Ya tienes una cuenta? Inicia Sesión</Text>
                    </TouchableOpacity>
                </Animated.View>
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
    slide: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        marginBottom: 50,
    },
    slideTitle: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    slideSubtitle: {
        fontSize: 16,
        color: '#A9A9A9',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: height * 0.25,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FDB813',
        marginHorizontal: 8,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    button: {
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    buttonText: {
        marginLeft: 10,
        color: '#121212',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#FDB813',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LandingPage;
