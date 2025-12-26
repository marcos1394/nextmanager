// screens/HelpCenterScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { getHelpCenterContent, searchHelpArticles } from '../services/api';
import { useDebounce } from '../hooks/useDebounce'; // Asegúrate de tener este hook
import { useAuth } from '../context/AuthContext'; // <--- CORREGIDO: Viene de context

const { width } = Dimensions.get('window');

// --- DATOS MEJORADOS ---



// --- COMPONENTES MEJORADOS ---
const AnimatedSearchBar = ({ onChangeText, delay = 0 }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(-20);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    const handleTextChange = (text) => {
        setSearchText(text);
        onChangeText && onChangeText(text);
    };

    return (
        <Animated.View
            style={[
                styles.searchContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <BlurView intensity={20} tint="dark" style={styles.searchBlur}>
                <LinearGradient
                    colors={isFocused 
                        ? ['rgba(253, 184, 19, 0.15)', 'rgba(253, 184, 19, 0.08)']
                        : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.searchGradient}
                >
                    <View style={styles.searchInputContainer}>
                        <Feather 
                            name="search" 
                            size={20} 
                            color={isFocused ? "#FDB813" : "#6B7280"} 
                        />
                        <TextInput
                            placeholder="Buscar artículos, guías, tutoriales..."
                            placeholderTextColor="#6B7280"
                            style={styles.searchInput}
                            value={searchText}
                            onChangeText={handleTextChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => handleTextChange('')}>
                                <Feather name="x" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>
            </BlurView>
            {isFocused && <View style={styles.searchIndicator} />}
        </Animated.View>
    );
};

const AnimatedCategoryCard = ({ item, onPress, delay = 0 }) => {
    const [isPressed, setIsPressed] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(30);
    const scaleAnim = new Animated.Value(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={styles.categoryCard}
            >
                <BlurView intensity={15} tint="dark" style={styles.categoryBlur}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        style={styles.categoryGradient}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}>
                            <Feather name={item.icon} size={28} color={item.color} />
                        </View>
                        <View style={styles.categoryContent}>
                            <Text style={styles.categoryName}>{item.name}</Text>
                            <Text style={styles.categoryDescription}>{item.description}</Text>
                            <Text style={styles.categoryArticles}>{item.articles} artículos</Text>
                        </View>
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const AnimatedArticleLink = ({ article, onPress, delay = 0 }) => {
    const [isPressed, setIsPressed] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(20);
    const scaleAnim = new Animated.Value(1);

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
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={styles.articleLink}
            >
                <View style={styles.articleContent}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <View style={styles.articleMeta}>
                        <View style={styles.articleTag}>
                            <Text style={styles.articleCategory}>{article.category}</Text>
                        </View>
                        <View style={styles.articleStats}>
                            <Feather name="clock" size={12} color="#6B7280" />
                            <Text style={styles.articleReadTime}>{article.readTime}</Text>
                            <Feather name="eye" size={12} color="#6B7280" />
                            <Text style={styles.articleViews}>{article.views}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.articleChevron}>
                    <Feather name="chevron-right" size={20} color="#6B7280" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const QuickActionCard = ({ action, onPress, delay = 0 }) => {
    const [isPressed, setIsPressed] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(20);
    const scaleAnim = new Animated.Value(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={styles.quickActionCard}
            >
                <BlurView intensity={15} tint="dark" style={styles.quickActionBlur}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                        style={styles.quickActionGradient}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                            <Feather name={action.icon} size={24} color={action.color} />
                        </View>
                        <Text style={styles.quickActionTitle}>{action.title}</Text>
                        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * HelpCenterScreen Mejorado - Portal de autoservicio premium
 * 
 * Mejoras implementadas:
 * 1. Header animado con iconografía profesional
 * 2. Barra de búsqueda con glassmorphism y estados interactivos
 * 3. Grid de categorías con información detallada y animaciones
 * 4. Artículos populares con metadata (tiempo de lectura, vistas)
 * 5. Acciones rápidas para funcionalidades clave
 * 6. Microinteracciones y feedback táctil
 * 7. Diseño responsive y accesible
 * 8. Jerarquía visual mejorada
 */
const HelpCenterScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [helpContent, setHelpContent] = useState({
        quickActions: [],
        categories: [],
        popularArticles: []
    });
    const contentAnim = useRef(new Animated.Value(0)).current;

    // --- NUEVOS ESTADOS PARA BÚSQUEDA ---
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearch = useDebounce(searchText, 500); // 500ms de retraso

    // --- useEffect PARA LA CARGA INICIAL (CORREGIDO) ---
    useEffect(() => {
        const fetchHelpContent = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // 1. Llama a la nueva función de api.js
                const response = await getHelpCenterContent();

                if (response.success) {
                    setHelpContent(response.data);
                } else {
                    throw new Error(response.message || 'No se pudo cargar el contenido de ayuda.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Error cargando el centro de ayuda:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHelpContent();
        
        // 2. Animación (tu código original)
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []); // El array vacío es correcto

    // --- NUEVO useEffect PARA LA BÚSQUEDA ---
    useEffect(() => {
        const fetchSearch = async () => {
            // Si el término de búsqueda está vacío, limpia los resultados
            if (debouncedSearch.length < 3) {
                setSearchResults([]);
                return;
            }

            console.log(`Buscando: ${debouncedSearch}`);
            setIsSearching(true);
            try {
                const response = await searchHelpArticles(debouncedSearch);
                if (response.success) {
                    setSearchResults(response.results);
                }
            } catch (error) {
                console.error("Error en la búsqueda:", error);
            } finally {
                setIsSearching(false);
            }
        };
        
        fetchSearch();
    }, [debouncedSearch]); // Se ejecuta cada vez que el usuario deja de teclear

    const handleCategoryPress = (category) => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Light);
        }
        console.log('Navegar a la categoría:', category.name);
        // navigation.navigate('CategoryScreen', { categoryId: category.id });
    };

    const handleArticlePress = (article) => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Light);
        }
        console.log('Navegar al artículo:', article.title);
        // navigation.navigate('ArticleScreen', { articleSlug: article.slug });
    };

    const handleQuickAction = (action) => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Medium);
        }
        
        switch (action.title) {
            case 'Chat en Vivo':
                navigation.navigate('Contact');
                break;
            default:
                console.log('Acción rápida:', action.title);
        }
    };

    const handleContactPress = () => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Medium);
        }
        navigation.navigate('Contact');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient 
                colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            { opacity: contentAnim }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerIconContainer}>
                                <LinearGradient
                                    colors={['#FDB813', '#F59E0B']}
                                    style={styles.headerIconGradient}
                                >
                                    <MaterialIcons name="help-center" size={32} color="#000000" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.headerTitle}>Centro de Ayuda</Text>
                            <Text style={styles.headerSubtitle}>
                                Encuentra respuestas rápidas, guías detalladas y tutoriales paso a paso
                            </Text>
                        </View>

                        {/* Barra de búsqueda */}
                        <AnimatedSearchBar 
                            onChangeText={setSearchText}
                            delay={200}
                        />

                        {/* --- RENDERIZADO CONDICIONAL DEL CONTENIDO --- */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#FDB813" style={{ marginVertical: 40 }} />
                        ) : error ? (
                            <Text style={styles.errorText}>Error al cargar: {error}</Text>
                        ) : (
                            <>
                                {/* Acciones rápidas */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Acceso rápido</Text>
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.quickActionsContainer}
                                    >
                                        {helpContent.quickActions.map((action, index) => (
                                            <QuickActionCard 
                                                key={action.title}
                                                action={action}
                                                onPress={() => handleQuickAction(action)}
                                                delay={300 + (index * 100)}
                                            />
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Categorías */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <MaterialIcons name="category" size={24} color="#FDB813" />
                                        <Text style={styles.sectionTitle}>Explora por categorías</Text>
                                    </View>
                                    <View style={styles.categoryGrid}>
                                        {helpContent.categories.map((category, index) => (
                                            <AnimatedCategoryCard
                                                key={category.name}
                                                item={category}
                                                onPress={() => handleCategoryPress(category)}
                                                delay={400 + (index * 80)}
                                            />
                                        ))}
                                    </View>
                                </View>

                                {/* Artículos populares */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <MaterialIcons name="trending-up" size={24} color="#4ADE80" />
                                        <Text style={styles.sectionTitle}>Artículos más consultados</Text>
                                    </View>
                                    <BlurView intensity={15} tint="dark" style={styles.articlesBlur}>
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                                            style={styles.articlesGradient}
                                        >
                                            {helpContent.popularArticles.map((article, index) => (
                                                <React.Fragment key={article.title}>
                                                    <AnimatedArticleLink 
                                                        article={article}
                                                        onPress={() => handleArticlePress(article)}
                                                        delay={600 + (index * 100)}
                                                    />
                                                    {index < helpContent.popularArticles.length - 1 && (
                                                        <View style={styles.articleDivider} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </LinearGradient>
                                    </BlurView>
                                </View>

                                {/* Tarjeta de contacto */}
                                <BlurView intensity={20} tint="dark" style={styles.contactBlur}>
                                    <LinearGradient
                                        colors={['rgba(253, 184, 19, 0.15)', 'rgba(253, 184, 19, 0.08)']}
                                        style={styles.contactGradient}
                                    >
                                        <TouchableOpacity 
                                            style={styles.contactCard} 
                                            onPress={handleContactPress}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.contactIconContainer}>
                                                <MaterialIcons name="support-agent" size={28} color="#FDB813" />
                                            </View>
                                            <View style={styles.contactContent}>
                                                <Text style={styles.contactCardTitle}>
                                                    ¿No encontraste lo que buscas?
                                                </Text>
                                                <Text style={styles.contactCardSubtitle}>
                                                    Nuestro equipo de soporte está aquí para ayudarte 24/7
                                                </Text>
                                            </View>
                                            <View style={styles.contactChevron}>
                                                <Feather name="arrow-right" size={24} color="#FDB813" />
                                            </View>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </BlurView>

                                {/* Footer informativo */}
                                <View style={styles.footer}>
                                    <MaterialIcons name="lightbulb-outline" size={16} color="#6B7280" />
                                    <Text style={styles.footerText}>
                                        Tip: Usa palabras clave específicas para encontrar respuestas más rápido
                                    </Text>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    content: {
        paddingTop: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerIconContainer: {
        marginBottom: 16,
    },
    headerIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    searchContainer: {
        marginBottom: 32,
        borderRadius: 16,
        overflow: 'hidden',
    },
    searchBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchGradient: {
        padding: 20,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    searchIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#FDB813',
        borderRadius: 1,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 12,
        letterSpacing: -0.3,
    },
    quickActionsContainer: {
        paddingRight: 24,
    },
    quickActionCard: {
        marginRight: 16,
        width: 140,
        borderRadius: 16,
        overflow: 'hidden',
    },
    quickActionBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    quickActionGradient: {
        padding: 20,
        alignItems: 'center',
        minHeight: 120,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    categoryBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryGradient: {
        padding: 20,
        minHeight: 120,
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryContent: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 6,
        lineHeight: 18,
    },
    categoryArticles: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    articlesBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    articlesGradient: {
        padding: 24,
    },
    articleLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    articleContent: {
        flex: 1,
    },
    articleTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 22,
    },
    articleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    articleTag: {
        backgroundColor: 'rgba(253, 184, 19, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    articleCategory: {
        fontSize: 11,
        color: '#FDB813',
        fontWeight: '500',
    },
    articleStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    articleReadTime: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    articleViews: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    articleChevron: {
        marginLeft: 16,
    },
    articleDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 8,
    },
    contactBlur: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    contactGradient: {
        padding: 24,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(253, 184, 19, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactContent: {
        flex: 1,
        marginLeft: 16,
    },
    contactCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    contactCardSubtitle: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
    },
    contactChevron: {
        marginLeft: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 13,
        marginLeft: 8,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default HelpCenterScreen;