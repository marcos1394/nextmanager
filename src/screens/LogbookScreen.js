// screens/LogbookScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../hooks/useAuth'; // Para obtener el restaurantId
import api from '../services/api'; // Tu cliente de API (axios)

const { width, height } = Dimensions.get('window');



// --- COMPONENTES MEJORADOS ---
const AnimatedHeader = () => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(-30);

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
            })
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.header,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.headerContent}>
                <View style={styles.headerIconContainer}>
                    <LinearGradient
                        colors={['#FDB813', '#F59E0B']}
                        style={styles.headerIconGradient}
                    >
                        <MaterialIcons name="assignment" size={28} color="#000000" />
                    </LinearGradient>
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Bitácora Gerencial</Text>
                    <Text style={styles.headerSubtitle}>
                        Registro de eventos y operaciones del día
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <View style={styles.filterContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
            >
                {categories.map((category, index) => {
                    const isSelected = selectedCategory === category.name;
                    return (
                        <TouchableOpacity
                            key={category.name}
                            onPress={() => onSelectCategory(category.name)}
                            style={[
                                styles.filterChip,
                                isSelected && styles.filterChipSelected
                            ]}
                        >
                            <BlurView 
                                intensity={isSelected ? 25 : 15} 
                                tint="dark" 
                                style={styles.filterChipBlur}
                            >
                                <LinearGradient
                                    colors={isSelected 
                                        ? ['rgba(253, 184, 19, 0.3)', 'rgba(253, 184, 19, 0.15)']
                                        : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                                    }
                                    style={styles.filterChipGradient}
                                >
                                    <View style={[
                                        styles.filterIconContainer, 
                                        { backgroundColor: `${category.color}${isSelected ? '30' : '20'}` }
                                    ]}>
                                        <Feather 
                                            name={category.icon} 
                                            size={16} 
                                            color={isSelected ? category.color : '#9CA3AF'} 
                                        />
                                    </View>
                                    <Text style={[
                                        styles.filterChipText,
                                        isSelected && styles.filterChipTextSelected
                                    ]}>
                                        {category.name}
                                    </Text>
                                    <View style={styles.filterCountContainer}>
                                        <Text style={[
                                            styles.filterCount,
                                            isSelected && styles.filterCountSelected
                                        ]}>
                                            {category.count}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </BlurView>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const AnimatedLogEntryCard = ({ entry, delay = 0 }) => {
    const [isPressed, setIsPressed] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(30);
    const scaleAnim = new Animated.Value(1);

    const categoryColors = {
        'Cliente': '#3B82F6',
        'Inventario': '#10B981',
        'Mantenimiento': '#F59E0B',
        'Operaciones': '#8B5CF6',
    };

    const priorityColors = {
        'alta': '#EF4444',
        'media': '#F59E0B',
        'baja': '#10B981',
    };

    const priorityLabels = {
        'alta': 'Alta',
        'media': 'Media',
        'baja': 'Baja',
    };

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

    const handlePress = () => {
        if (Platform.OS === 'ios') {
            try {
                const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
                impactAsync(ImpactFeedbackStyle.Light);
            } catch (error) {
                console.log('Haptics not available');
            }
        }
        // Navigate to entry details
        console.log('View entry details:', entry.id);
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
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={styles.logCard}
            >
                <BlurView intensity={15} tint="dark" style={styles.logCardBlur}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                        style={styles.logCardGradient}
                    >
                        {/* Header with avatar and info */}
                        <View style={styles.logHeader}>
                            <View style={styles.logAuthorContainer}>
                                <View style={[
                                    styles.avatarContainer,
                                    { backgroundColor: categoryColors[entry.category] + '30' }
                                ]}>
                                    <Text style={[
                                        styles.avatarText,
                                        { color: categoryColors[entry.category] }
                                    ]}>
                                        {entry.avatar}
                                    </Text>
                                </View>
                                <View style={styles.authorInfo}>
                                    <Text style={styles.logAuthor}>{entry.author}</Text>
                                    <View style={styles.timestampContainer}>
                                        <MaterialIcons name="schedule" size={12} color="#6B7280" />
                                        <Text style={styles.logTimestamp}>
                                            {entry.timestamp} • {entry.date}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.logBadges}>
                                <View style={[
                                    styles.priorityBadge,
                                    { backgroundColor: priorityColors[entry.priority] + '20' }
                                ]}>
                                    <View style={[
                                        styles.priorityDot,
                                        { backgroundColor: priorityColors[entry.priority] }
                                    ]} />
                                    <Text style={[
                                        styles.priorityText,
                                        { color: priorityColors[entry.priority] }
                                    ]}>
                                        {priorityLabels[entry.priority]}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Content */}
                        <Text style={styles.logText}>{entry.text}</Text>

                        {/* Footer */}
                        <View style={styles.logFooter}>
                            <View style={[
                                styles.logCategoryBadge, 
                                { backgroundColor: categoryColors[entry.category] + '20' }
                            ]}>
                                <Feather 
                                    name={categories.find(c => c.name === entry.category)?.icon || 'tag'} 
                                    size={12} 
                                    color={categoryColors[entry.category]} 
                                />
                                <Text style={[
                                    styles.logCategoryText,
                                    { color: categoryColors[entry.category] }
                                ]}>
                                    {entry.category}
                                </Text>
                            </View>
                            
                            <View style={styles.statusContainer}>
                                {entry.resolved ? (
                                    <View style={styles.resolvedBadge}>
                                        <Feather name="check-circle" size={14} color="#10B981" />
                                        <Text style={styles.resolvedText}>Resuelto</Text>
                                    </View>
                                ) : (
                                    <View style={styles.pendingBadge}>
                                        <Feather name="clock" size={14} color="#F59E0B" />
                                        <Text style={styles.pendingText}>Pendiente</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const AnimatedFAB = ({ onPress }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = new Animated.Value(1);
    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.9,
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
                styles.fabContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={styles.fab}
            >
                <BlurView intensity={20} tint="dark" style={styles.fabBlur}>
                    <LinearGradient
                        colors={['#FDB813', '#F59E0B']}
                        style={styles.fabGradient}
                    >
                        <Feather name="plus" size={28} color="#000000" />
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const AddEntryModal = ({ visible, onClose, onAdd }) => {
    const [text, setText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Cliente');
    const [selectedPriority, setPriority] = useState('media');

    const priorities = [
        { key: 'alta', label: 'Alta Prioridad', color: '#EF4444', icon: 'alert-circle' },
        { key: 'media', label: 'Media Prioridad', color: '#F59E0B', icon: 'info' },
        { key: 'baja', label: 'Baja Prioridad', color: '#10B981', icon: 'check-circle' },
    ];

    const availableCategories = categories.filter(c => c.name !== 'Todos');

    const handleAdd = () => {
        if (!text.trim()) {
            Alert.alert('Campo requerido', 'Por favor describe el evento o incidencia.');
            return;
        }

        const newEntry = {
            id: Date.now().toString(),
            text: text.trim(),
            author: 'Usuario Actual',
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            date: 'Hace un momento',
            category: selectedCategory,
            priority: selectedPriority,
            resolved: false,
            avatar: 'UA'
        };

        onAdd(newEntry);
        setText('');
        setSelectedCategory('Cliente');
        setPriority('media');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <BlurView intensity={80} tint="dark" style={styles.modalContainer}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalKeyboard}
                >
                    <SafeAreaView style={styles.modalSafeArea}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                                <Feather name="x" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Nueva Entrada</Text>
                            <TouchableOpacity onPress={handleAdd} style={styles.modalSaveButton}>
                                <Text style={styles.modalSaveText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Descripción */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Descripción del evento</Text>
                                <BlurView intensity={15} tint="dark" style={styles.modalInputContainer}>
                                    <TextInput
                                        style={styles.modalTextInput}
                                        placeholder="Describe lo que sucedió..."
                                        placeholderTextColor="#6B7280"
                                        value={text}
                                        onChangeText={setText}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </BlurView>
                            </View>

                            {/* Categoría */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Categoría</Text>
                                <View style={styles.optionsGrid}>
                                    {availableCategories.map((category) => (
                                        <TouchableOpacity
                                            key={category.name}
                                            onPress={() => setSelectedCategory(category.name)}
                                            style={[
                                                styles.optionCard,
                                                selectedCategory === category.name && styles.optionCardSelected
                                            ]}
                                        >
                                            <View style={[
                                                styles.optionIcon,
                                                { backgroundColor: category.color + '20' }
                                            ]}>
                                                <Feather 
                                                    name={category.icon} 
                                                    size={20} 
                                                    color={category.color} 
                                                />
                                            </View>
                                            <Text style={[
                                                styles.optionText,
                                                selectedCategory === category.name && styles.optionTextSelected
                                            ]}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Prioridad */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Prioridad</Text>
                                <View style={styles.priorityList}>
                                    {priorities.map((priority) => (
                                        <TouchableOpacity
                                            key={priority.key}
                                            onPress={() => setPriority(priority.key)}
                                            style={[
                                                styles.priorityOption,
                                                selectedPriority === priority.key && styles.priorityOptionSelected
                                            ]}
                                        >
                                            <View style={[
                                                styles.priorityIconContainer,
                                                { backgroundColor: priority.color + '20' }
                                            ]}>
                                                <Feather 
                                                    name={priority.icon} 
                                                    size={18} 
                                                    color={priority.color} 
                                                />
                                            </View>
                                            <Text style={[
                                                styles.priorityOptionText,
                                                selectedPriority === priority.key && styles.priorityOptionTextSelected
                                            ]}>
                                                {priority.label}
                                            </Text>
                                            {selectedPriority === priority.key && (
                                                <Feather name="check" size={20} color="#FDB813" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
};

/**
 * LogbookScreen Mejorado - Sistema de bitácora gerencial premium
 * 
 * Mejoras implementadas:
 * 1. Header animado con iconografía profesional
 * 2. Sistema de filtrado por categorías con chips animados
 * 3. Cards de entradas con glassmorphism y información enriquecida
 * 4. Avatares, prioridades y estados de resolución
 * 5. Modal de creación de entradas con formulario completo
 * 6. FAB animado con gradientes
 * 7. Microinteracciones y feedback táctil
 * 8. Diseño responsive y accesible
 */
const LogbookScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [modalVisible, setModalVisible] = useState(false);

    // useEffect para cargar los datos de la bitácora desde la API
    useEffect(() => {
        const fetchLogEntries = async () => {
            if (!user?.restaurants?.length) {
                setError("No hay un restaurante seleccionado.");
                setIsLoading(false);
                return;
            }
            const restaurantId = user.restaurants[0].id; // Usamos el primer restaurante del usuario

            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get(`/pos/query/${restaurantId}/bitacora`);
                const data = await response.data;
                
                if (data.success) {
                    // Mapeamos los datos crudos del backend a la estructura que el frontend espera
                    const formattedEntries = data.data.map(entry => ({
                        id: entry.seriefolio || `${entry.fecha}-${Math.random()}`,
                        user: entry.usuario,
                        timestamp: entry.fecha,
                        category: entry.tipoalerta || 'General',
                        title: entry.evento,
                        content: entry.valores,
                    }));
                    setEntries(formattedEntries);
                } else {
                    throw new Error(data.message || 'No se pudo cargar la bitácora.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Error cargando la bitácora:", err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLogEntries();
    }, [user]); // Se vuelve a ejecutar si el usuario cambia

    // useMemo para optimizar el filtrado de entradas
    const filteredEntries = useMemo(() => {
        if (selectedCategory === 'Todos') {
            return entries;
        }
        return entries.filter(entry => entry.category === selectedCategory);
    }, [selectedCategory, entries]);
    
    // useMemo para extraer las categorías únicas de las entradas
    const categories = useMemo(() => {
        const allCategories = new Set(entries.map(entry => entry.category));
        return ['Todos', ...Array.from(allCategories)];
    }, [entries]);

    // Función para manejar la adición de una nueva entrada (a futuro podría llamar a una API)
    const handleAddEntry = (newEntry) => {
        setEntries([newEntry, ...entries]);
        setModalVisible(false);
        // ... (Tu código de haptics)
    };

    const renderLogEntry = ({ item, index }) => (
        <AnimatedLogEntryCard 
            entry={item} 
            delay={index * 80} // Ralentizamos un poco la animación
        />
    );

    const handleFABPress = () => {
        setModalVisible(true);
        // ... (Tu código de haptics)
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
                <AnimatedHeader />
                
                <CategoryFilter 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {isLoading ? (
                    <ActivityIndicator size="large" color="#FDB813" style={{ flex: 1 }} />
                ) : error ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.errorText}>Error al cargar: {error}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredEntries}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderLogEntry}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="event-note" size={80} color="#374151" />
                                <Text style={styles.emptyTitle}>Sin entradas</Text>
                                <Text style={styles.emptyText}>
                                    No hay registros para mostrar en esta categoría.
                                </Text>
                            </View>
                        }
                    />
                )}

                <AnimatedFAB onPress={handleFABPress} />

                <AddEntryModal 
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onAdd={handleAddEntry}
                />
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
    header: {
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconContainer: {
        marginRight: 16,
    },
    headerIconGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#9CA3AF',
        lineHeight: 20,
    },
    filterContainer: {
        marginBottom: 24,
    },
    filterScrollContainer: {
        paddingHorizontal: 24,
        paddingRight: 48,
    },
    filterChip: {
        marginRight: 12,
        borderRadius: 20,
        overflow: 'hidden',
    },
    filterChipSelected: {
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    filterChipBlur: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    filterChipGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    filterIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF',
        marginRight: 8,
    },
    filterChipTextSelected: {
        color: '#FFFFFF',
    },
    filterCountContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    filterCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterCountSelected: {
        color: '#FDB813',
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    logCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    logCardBlur: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logCardGradient: {
        padding: 20,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    logAuthorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '600',
    },
    authorInfo: {
        flex: 1,
    },
    logAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logTimestamp: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    logBadges: {
        marginLeft: 12,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    logText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#E5E7EB',
        marginBottom: 16,
    },
    logFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logCategoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    logCategoryText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resolvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    resolvedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
        marginLeft: 4,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    pendingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#9CA3AF',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 24,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabBlur: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        overflow: 'hidden',
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalKeyboard: {
        flex: 1,
    },
    modalSafeArea: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    modalSaveButton: {
        backgroundColor: '#FDB813',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 24,
    },
    modalSection: {
        marginBottom: 32,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    modalInputContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTextInput: {
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    optionCard: {
        width: '48%',
        marginHorizontal: '1%',
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    optionCardSelected: {
        backgroundColor: 'rgba(253, 184, 19, 0.15)',
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
        textAlign: 'center',
    },
    optionTextSelected: {
        color: '#FFFFFF',
    },
    priorityList: {
        gap: 12,
    },
    priorityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    priorityOptionSelected: {
        backgroundColor: 'rgba(253, 184, 19, 0.15)',
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    priorityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    priorityOptionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    priorityOptionTextSelected: {
        color: '#FFFFFF',
    },
});

export default LogbookScreen;