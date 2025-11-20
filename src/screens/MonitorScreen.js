// screens/MonitorScreen.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width, height } = Dimensions.get('window');



// --- COMPONENTES MEJORADOS ---
const AnimatedHeader = ({ totalSales, isLive }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(-30);
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        // Animación de entrada
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

        // Animación de pulso para indicador en vivo
        if (isLive) {
            const pulseAnimation = Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ]);
            
            Animated.loop(pulseAnimation).start();
        }
    }, [isLive]);

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
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconContainer}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.headerIconGradient}
                        >
                            <MaterialCommunityIcons name="monitor-dashboard" size={28} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Dashboard Operativo</Text>
                        <Text style={styles.headerSubtitle}>
                            Monitoreo en tiempo real • ${totalSales.toFixed(0)}
                        </Text>
                    </View>
                </View>
                
                <Animated.View 
                    style={[
                        styles.liveIndicator,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                >
                    <BlurView intensity={15} tint="dark" style={styles.liveIndicatorBlur}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>EN VIVO</Text>
                    </BlurView>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const StatCard = ({ icon, label, value, trend, delay = 0 }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(20);

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

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <BlurView intensity={15} tint="dark" style={styles.statCard}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.statCardGradient}
                >
                    <View style={styles.statIconContainer}>
                        <MaterialCommunityIcons name={icon} size={24} color="#10B981" />
                    </View>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                    {trend && (
                        <View style={styles.trendContainer}>
                            <Feather 
                                name={trend > 0 ? "trending-up" : "trending-down"} 
                                size={12} 
                                color={trend > 0 ? "#10B981" : "#EF4444"} 
                            />
                            <Text style={[
                                styles.trendText,
                                { color: trend > 0 ? "#10B981" : "#EF4444" }
                            ]}>
                                {Math.abs(trend)}%
                            </Text>
                        </View>
                    )}
                </LinearGradient>
            </BlurView>
        </Animated.View>
    );
};

const WaiterRankItem = ({ item, rank, maxSales, delay = 0 }) => {
    const [isPressed, setIsPressed] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(30);
    const scaleAnim = new Animated.Value(1);
    const progressAnim = new Animated.Value(0);

    const progressWidth = (item.sales / maxSales) * 100;

    const statusColors = {
        'active': '#10B981',
        'break': '#F59E0B',
        'offline': '#6B7280'
    };

    const statusLabels = {
        'active': 'Activo',
        'break': 'Descanso',
        'offline': 'Inactivo'
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
                }),
                Animated.timing(progressAnim, {
                    toValue: progressWidth,
                    duration: 1000,
                    useNativeDriver: false,
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
        console.log('View waiter details:', item.id);
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
                style={styles.waiterCard}
            >
                <BlurView intensity={15} tint="dark" style={styles.waiterCardBlur}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                        style={styles.waiterCardGradient}
                    >
                        {/* Ranking Badge */}
                        <View style={[
                            styles.rankBadge,
                            rank === 1 && styles.firstPlaceBadge,
                            rank === 2 && styles.secondPlaceBadge,
                            rank === 3 && styles.thirdPlaceBadge
                        ]}>
                            {rank <= 3 ? (
                                <MaterialIcons 
                                    name={rank === 1 ? "emoji-events" : rank === 2 ? "military-tech" : "workspace-premium"} 
                                    size={16} 
                                    color={rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32"} 
                                />
                            ) : (
                                <Text style={styles.rankText}>{rank}</Text>
                            )}
                        </View>

                        <View style={styles.waiterMainContent}>
                            {/* Avatar and Basic Info */}
                            <View style={styles.waiterHeader}>
                                <View style={styles.avatarContainer}>
                                    <LinearGradient
                                        colors={['#10B981', '#059669']}
                                        style={styles.avatar}
                                    >
                                        <Text style={styles.avatarText}>{item.avatar}</Text>
                                    </LinearGradient>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: statusColors[item.status] }
                                    ]} />
                                </View>
                                
                                <View style={styles.waiterInfo}>
                                    <Text style={styles.waiterName}>{item.name}</Text>
                                    <View style={styles.waiterMeta}>
                                        <Text style={styles.sectionText}>Sección {item.section}</Text>
                                        <View style={styles.separator} />
                                        <Text style={[
                                            styles.statusText,
                                            { color: statusColors[item.status] }
                                        ]}>
                                            {statusLabels[item.status]}
                                        </Text>
                                    </View>
                                    <Text style={styles.lastOrderText}>
                                        Última orden: {item.lastOrder}
                                    </Text>
                                </View>

                                <View style={styles.salesContainer}>
                                    <Text style={styles.salesAmount}>${item.sales.toFixed(0)}</Text>
                                    <Text style={styles.efficiencyText}>{item.efficiency}% eficiencia</Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressSection}>
                                <View style={styles.progressBarBackground}>
                                    <Animated.View style={styles.progressBarContainer}>
                                        <LinearGradient
                                            colors={['#10B981', '#059669']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[
                                                styles.progressBar,
                                                { 
                                                    width: progressAnim.interpolate({
                                                        inputRange: [0, 100],
                                                        outputRange: ['0%', '100%'],
                                                        extrapolate: 'clamp'
                                                    })
                                                }
                                            ]}
                                        />
                                    </Animated.View>
                                </View>
                            </View>

                            {/* Stats Row */}
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <MaterialCommunityIcons name="table-chair" size={16} color="#6B7280" />
                                    <Text style={styles.statItemValue}>{item.tables}</Text>
                                    <Text style={styles.statItemLabel}>Mesas</Text>
                                </View>
                                
                                <View style={styles.statItem}>
                                    <MaterialCommunityIcons name="clipboard-list" size={16} color="#6B7280" />
                                    <Text style={styles.statItemValue}>{item.orders}</Text>
                                    <Text style={styles.statItemLabel}>Órdenes</Text>
                                </View>
                                
                                <View style={styles.statItem}>
                                    <MaterialCommunityIcons name="calculator" size={16} color="#6B7280" />
                                    <Text style={styles.statItemValue}>${item.avgTicket.toFixed(0)}</Text>
                                    <Text style={styles.statItemLabel}>Ticket Prom.</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const QuickStats = ({ data }) => {
    const totalSales = data.reduce((sum, waiter) => sum + waiter.sales, 0);
    const totalTables = data.reduce((sum, waiter) => sum + waiter.tables, 0);
    const totalOrders = data.reduce((sum, waiter) => sum + waiter.orders, 0);
    const averageTicket = totalSales / (totalOrders || 1);
    const activeWaiters = data.filter(w => w.status === 'active').length;

    return (
        <View style={styles.quickStatsContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickStatsScroll}
            >
                <StatCard 
                    icon="cash-multiple" 
                    label="Ventas Turno" 
                    value={`$${totalSales.toFixed(0)}`} 
                    trend={8.5}
                    delay={0}
                />
                <StatCard 
                    icon="table-chair" 
                    label="Mesas Activas" 
                    value={totalTables.toString()} 
                    trend={2.3}
                    delay={100}
                />
                <StatCard 
                    icon="clipboard-list" 
                    label="Órdenes Total" 
                    value={totalOrders.toString()} 
                    trend={5.1}
                    delay={200}
                />
                <StatCard 
                    icon="calculator" 
                    label="Ticket Promedio" 
                    value={`$${averageTicket.toFixed(0)}`} 
                    trend={-1.2}
                    delay={300}
                />
                <StatCard 
                    icon="account-group" 
                    label="Staff Activo" 
                    value={`${activeWaiters}/${data.length}`} 
                    delay={400}
                />
            </ScrollView>
        </View>
    );
};

/**
 * MonitorScreen Mejorado - Dashboard de Operaciones en Tiempo Real Premium
 * 
 * Mejoras implementadas:
 * 1. Header animado con indicador de tiempo real pulsante
 * 2. Cards de estadísticas con glassmorphism y tendencias
 * 3. Items de meseros enriquecidos con información completa
 * 4. Animaciones staggered y microinteracciones
 * 5. Barras de progreso animadas y rankings visuales
 * 6. Estados de meseros (Activo, Descanso, Inactivo)
 * 7. Información detallada: sección, última orden, eficiencia
 * 8. Diseño premium con gradientes y efectos de blur
 */
const MonitorScreen = ({ navigation }) => {
    const { user } = useAuth();
    
    // Un estado unificado para todos los datos del dashboard
    const [dashboardData, setDashboardData] = useState({
        waiterRanking: [],
        topProducts: [],
        paymentMethods: [],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // useCallback para crear una función de carga de datos estable y reutilizable
    const fetchData = useCallback(async () => {
        if (!user?.restaurants?.length) {
            setError("No hay un restaurante seleccionado.");
            setIsLoading(false);
            return;
        }
        const restaurantId = user.restaurants[0].id;

        try {
            setError(null);

            // 1. Hacemos todas las llamadas a los endpoints existentes en paralelo
            const [chequesRes, cheqdetRes, productsRes, paymentsRes] = await Promise.all([
                api.get(`/pos/query/${restaurantId}/cheques`),
                api.get(`/pos/query/${restaurantId}/cheqdet`),
                api.get(`/pos/query/${restaurantId}/products`),
                api.get(`/pos/query/${restaurantId}/chequespagos`),
            ]);

            // Validamos que las respuestas críticas sean exitosas
            if (!chequesRes.data.success || !cheqdetRes.data.success || !productsRes.data.success || !paymentsRes.data.success) {
                throw new Error('No se pudieron obtener todos los datos de ventas.');
            }
            
            const cheques = chequesRes.data.data;
            const details = cheqdetRes.data.data;
            const products = productsRes.data.data;
            const payments = paymentsRes.data.data;
            
            // --- 2. PROCESAMIENTO DE DATOS EN EL FRONTEND ---

            // A. Ranking de Meseros (como antes)
            const salesByWaiter = cheques.reduce((acc, cheque) => {
                const waiterId = cheque.idusuario || cheque.usuario || 'Desconocido';
                const waiterName = cheque.usuario || 'Desconocido';
                if (!acc[waiterId]) {
                    acc[waiterId] = { id: waiterId, name: waiterName, sales: 0, orders: 0, tables: new Set() };
                }
                acc[waiterId].sales += cheque.total;
                acc[waiterId].orders += 1;
                if (cheque.mesa) acc[waiterId].tables.add(cheque.mesa);
                return acc;
            }, {});
            const waiterRanking = Object.values(salesByWaiter)
                .map(waiter => ({ ...waiter, tables: waiter.tables.size }))
                .sort((a, b) => b.sales - a.sales);

            // B. Top Productos Vendidos
            const productMap = new Map(products.map(p => [p.idproducto, p.descripcion]));
            const salesByProduct = details.reduce((acc, item) => {
                if (!acc[item.idproducto]) {
                    acc[item.idproducto] = { id: item.idproducto, name: productMap.get(item.idproducto) || 'Producto Desconocido', quantity: 0, sales: 0 };
                }
                acc[item.idproducto].quantity += item.cantidad;
                acc[item.idproducto].sales += item.cantidad * item.precio;
                return acc;
            }, {});
            const topProducts = Object.values(salesByProduct).sort((a, b) => b.sales - a.sales).slice(0, 5);
            
            // C. Desglose de Métodos de Pago
            const paymentMap = { 1: 'Efectivo', 4: 'Tarjeta', /* Añadir más según Soft Restaurant */ };
            const salesByPayment = payments.reduce((acc, payment) => {
                const paymentName = paymentMap[payment.idformadepago] || 'Otro';
                if (!acc[paymentName]) {
                    acc[paymentName] = { id: paymentName, name: paymentName, total: 0 };
                }
                acc[paymentName].total += payment.importe;
                return acc;
            }, {});
            const paymentMethods = Object.values(salesByPayment).sort((a, b) => b.total - a.total);

            // 3. Actualizamos el estado con todos los datos procesados
            setDashboardData({ waiterRanking, topProducts, paymentMethods });

        } catch (err) {
            setError(err.message);
            console.error("Error en el monitor:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    // useEffect para el polling de datos en tiempo real
    useEffect(() => {
        if (isLive) {
            fetchData(); // Carga inicial
            const interval = setInterval(fetchData, 15000); // Repetir cada 15 segundos
            return () => clearInterval(interval);
        }
    }, [isLive, fetchData]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchData();
    }, [fetchData]);

    // useMemo para optimizar cálculos derivados
    const { totalSales, maxSales } = useMemo(() => {
        const total = dashboardData.waiterRanking.reduce((sum, waiter) => sum + waiter.sales, 0);
        const max = Math.max(...dashboardData.waiterRanking.map(w => w.sales), 1);
        return { totalSales: total, maxSales: max };
    }, [dashboardData.waiterRanking]);

    const renderWaiterItem = ({ item, index }) => (
        <WaiterRankItem 
            item={item} 
            rank={index + 1} 
            maxSales={maxSales}
            delay={index * 100}
        />
    );

    // Si aún está cargando, muestra un indicador
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                 <LinearGradient colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} style={styles.gradient}>
                    <ActivityIndicator size="large" color="#FDB813" />
                </LinearGradient>
            </SafeAreaView>
        );
    }
    
    // Si hubo un error, muestra el error
    if (error) {
        return (
             <SafeAreaView style={styles.container}>
                 <LinearGradient colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} style={styles.gradient}>
                    <View style={styles.emptyContainer}><Text style={styles.errorText}>Error: {error}</Text></View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Renderizado principal
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient 
                colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <AnimatedHeader totalSales={totalSales} isLive={isLive} />
                
                {/* El FlatList ahora es el contenedor principal para permitir el "pull to refresh" */}
                <FlatList
                    ListHeaderComponent={
                        <>
                            <QuickStats data={dashboardData.waiterRanking} />
                            
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>Ranking de Meseros</Text>
                                <TouchableOpacity onPress={() => setIsLive(!isLive)} style={styles.liveToggle}>
                                    <Feather name={isLive ? "pause" : "play"} size={16} color={isLive ? "#EF4444" : "#10B981"} />
                                    <Text style={[styles.liveToggleText, { color: isLive ? "#EF4444" : "#10B981" }]}>
                                        {isLive ? "Pausar" : "Reanudar"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                    data={dashboardData.waiterRanking}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderWaiterItem}
                    ListFooterComponent={
                        <>
                            {/* --- NUEVAS SECCIONES DE DATOS ENRIQUECIDOS --- */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Top 5 Productos Vendidos</Text>
                                {dashboardData.topProducts.map(product => (
                                    <View key={product.id} style={styles.productRow}>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productSales}>${product.sales.toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>
                            
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Desglose de Pagos</Text>
                                {dashboardData.paymentMethods.map(method => (
                                    <View key={method.id} style={styles.productRow}>
                                        <Text style={styles.productName}>{method.name}</Text>
                                        <Text style={styles.productSales}>${method.total.toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#10B981"
                        />
                    }
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
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    liveIndicator: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    liveIndicatorBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 8,
    },
    liveText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    quickStatsContainer: {
        marginBottom: 24,
    },
    quickStatsScroll: {
        paddingHorizontal: 24,
        paddingRight: 48,
    },
    statCard: {
        marginRight: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        minWidth: 140,
    },
    statCardGradient: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 8,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    liveToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    liveToggleText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    waiterCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    waiterCardBlur: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    waiterCardGradient: {
        position: 'relative',
    },
    rankBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    firstPlaceBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
    secondPlaceBadge: {
        backgroundColor: 'rgba(192, 192, 192, 0.2)',
    },
    thirdPlaceBadge: {
        backgroundColor: 'rgba(205, 127, 50, 0.2)',
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    waiterMainContent: {
        padding: 20,
    },
    waiterHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#0A0A0A',
    },
    waiterInfo: {
        flex: 1,
        marginRight: 16,
    },
    waiterName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    waiterMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    separator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#4B5563',
        marginHorizontal: 8,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    lastOrderText: {
        fontSize: 12,
        color: '#6B7280',
    },
    salesContainer: {
        alignItems: 'flex-end',
    },
    salesAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 2,
    },
    efficiencyText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarContainer: {
        height: '100%',
        width: '100%',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statItemValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 6,
        marginBottom: 2,
    },
    statItemLabel: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default MonitorScreen;