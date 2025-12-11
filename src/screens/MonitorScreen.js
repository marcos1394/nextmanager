import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

// ------------------------------------------------------------------
// --- COMPONENTES UI AUXILIARES ---
// ------------------------------------------------------------------

const AnimatedHeader = ({ totalSales, isLive }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
        ]).start();

        if (isLive) {
            Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])).start();
        }
    }, [isLive]);

    return (
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconContainer}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.headerIconGradient}>
                            <MaterialCommunityIcons name="monitor-dashboard" size={28} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Venta del Día • ${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                    </View>
                </View>
                <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={[styles.liveIndicatorBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}> 
                        <View style={[styles.liveDot, { backgroundColor: isLive ? '#10B981' : '#EF4444' }]} />
                        <Text style={[styles.liveText, { color: isLive ? '#10B981' : '#EF4444' }]}>{isLive ? 'EN VIVO' : 'PAUSADO'}</Text>
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const StatCard = ({ icon, label, value }) => (
    <View style={styles.statCardContainer}>
        <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <View style={styles.statCardGradient}>
                <View style={styles.statIconContainer}><MaterialCommunityIcons name={icon} size={24} color="#10B981" /></View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    </View>
);

const WaiterRankItem = ({ item, rank, maxSales }) => {
    const progressWidth = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
    return (
        <View style={styles.waiterCard}>
            <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.waiterCardGradient}>
                <View style={styles.waiterHeader}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.waiterInfo}>
                        <View style={styles.waiterNameRow}>
                            <Text style={styles.waiterName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.salesAmount}>${item.sales.toLocaleString()}</Text>
                        </View>
                        <View style={styles.waiterStatsRow}>
                            <Text style={styles.waiterStat}>{item.orders} Órdenes</Text>
                            <View style={styles.dotSeparator} />
                            <Text style={styles.waiterStat}>{item.tables} Mesas</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.progressSection}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBar, { width: `${progressWidth}%`, backgroundColor: rank === 1 ? '#FDB813' : '#10B981' }]} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const QuickStats = ({ data }) => {
    const totalSales = data.reduce((sum, w) => sum + w.sales, 0);
    const totalTables = data.reduce((sum, w) => sum + w.tables, 0);
    const totalOrders = data.reduce((sum, w) => sum + w.orders, 0);
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const activeWaiters = data.filter(w => w.sales > 0).length;

    return (
        <View style={styles.quickStatsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickStatsScroll}>
                <StatCard icon="cash-multiple" label="Ventas" value={`$${totalSales.toLocaleString('es-MX', {maximumFractionDigits:0})}`} />
                <StatCard icon="table-chair" label="Mesas" value={totalTables.toString()} />
                <StatCard icon="clipboard-list" label="Órdenes" value={totalOrders.toString()} />
                <StatCard icon="calculator" label="Ticket" value={`$${avgTicket.toLocaleString('es-MX', {maximumFractionDigits:0})}`} />
                <StatCard icon="account-group" label="Staff" value={`${activeWaiters}`} />
            </ScrollView>
        </View>
    );
};

const DetailRow = ({ label, value, isLast }) => (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

// ------------------------------------------------------------------
// --- MONITOR SCREEN (PRINCIPAL) ---
// ------------------------------------------------------------------

const MonitorScreen = ({ navigation }) => {
    const { user } = useAuth();
    
    // Estado unificado
    const [dashboardData, setDashboardData] = useState({
        waiterRanking: [],
        topProducts: [],
        paymentMethods: [],
        totalSales: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLive, setIsLive] = useState(true);
    const [error, setError] = useState(null);
    const [hasRestaurant, setHasRestaurant] = useState(false); // <-- NUEVO ESTADO

    // --- FUNCIÓN DE CARGA ---
    const fetchData = useCallback(async () => {
        // 1. Verificación Crítica: ¿Tiene restaurante?
        if (!user?.restaurants || user.restaurants.length === 0) {
            console.log('[Monitor] Usuario sin restaurante configurado.');
            setHasRestaurant(false); // Marcamos que no hay restaurante
            setIsLoading(false);     // Dejamos de cargar
            return;
        }

        // Si sí tiene, procedemos
        setHasRestaurant(true);
        const restaurantId = user.restaurants[0].id;

        try {
            setError(null);
            
            // Llamadas paralelas a los endpoints
            const [chequesRes, cheqdetRes, productsRes, paymentsRes] = await Promise.all([
                api.get(`/pos/query/${restaurantId}/cheques`),
                api.get(`/pos/query/${restaurantId}/cheqdet`),
                api.get(`/pos/query/${restaurantId}/products`),
                api.get(`/pos/query/${restaurantId}/chequespagos`),
            ]);

            if (!chequesRes.data.success) throw new Error('Error al sincronizar datos.');

            // Extracción segura de datos
            const cheques = chequesRes.data.data || [];
            const details = cheqdetRes.data.data || [];
            const products = productsRes.data.data || [];
            const payments = paymentsRes.data.data || [];

            // --- PROCESAMIENTO ---
            // A. Ranking Meseros
            const salesByWaiter = cheques.reduce((acc, c) => {
                const id = c.idusuario || c.usuario || 'N/A';
                if (!acc[id]) acc[id] = { id, name: c.usuario || 'Staff', sales: 0, orders: 0, tables: new Set() };
                acc[id].sales += (c.total || 0);
                acc[id].orders += 1;
                if (c.mesa) acc[id].tables.add(c.mesa);
                return acc;
            }, {});

            const waiterRanking = Object.values(salesByWaiter)
                .map(w => ({ ...w, tables: w.tables.size }))
                .sort((a, b) => b.sales - a.sales);

            const totalSales = waiterRanking.reduce((sum, w) => sum + w.sales, 0);

            // B. Top Productos
            const prodSales = details.reduce((acc, d) => {
                if(!acc[d.idproducto]) acc[d.idproducto] = {id: d.idproducto, sales: 0, name: 'Prod'};
                acc[d.idproducto].sales += (d.precio * d.cantidad);
                return acc;
            }, {});
            const topProducts = Object.values(prodSales).sort((a,b) => b.sales - a.sales).slice(0,5);

            // C. Métodos de Pago
            const payMap = { 1: 'Efectivo', 4: 'Tarjeta' };
            const paymentMethods = Object.values(payments.reduce((acc, p) => {
                const name = payMap[p.idformadepago] || 'Otros';
                if(!acc[name]) acc[name] = { name, total: 0 };
                acc[name].total += p.importe;
                return acc;
            }, {})).sort((a,b) => b.total - a.total);

            setDashboardData({ waiterRanking, topProducts, paymentMethods, totalSales });

        } catch (err) {
            console.error('[Monitor] Error fetch:', err.message);
            setError("No pudimos conectar con tu restaurante. Verifica que el Agente esté en línea.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    // Polling solo si hay restaurante
    useEffect(() => {
        if(isLive && hasRestaurant) fetchData();
        const interval = setInterval(() => { if(isLive && hasRestaurant) fetchData() }, 15000);
        return () => clearInterval(interval);
    }, [isLive, hasRestaurant, fetchData]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchData();
    }, [fetchData]);

    const { maxSales } = useMemo(() => {
        const max = Math.max(...dashboardData.waiterRanking.map(w => w.sales), 1);
        return { maxSales: max };
    }, [dashboardData.waiterRanking]);

    // --- RENDERIZADO 1: CARGA ---
    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#FDB813" />
                    <Text style={styles.loadingText}>Sincronizando...</Text>
                </View>
            </View>
        );
    }

    // --- RENDERIZADO 2: NO HAY RESTAURANTE (CASO USUARIO NUEVO) ---
    if (!hasRestaurant && !isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
                <LinearGradient colors={['#0A0A0A', '#151515']} style={styles.gradient} />
                
                <View style={styles.emptyStateContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="store-plus" size={64} color="#FDB813" />
                    </View>
                    <Text style={styles.emptyStateTitle}>¡Bienvenido a NextManager!</Text>
                    <Text style={styles.emptyStateText}>
                        Para comenzar a monitorear tus ventas en tiempo real, necesitas activar un plan y conectar tu restaurante.
                    </Text>
                    
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Plans')}
                    >
                        <LinearGradient
                            colors={['#FDB813', '#F59E0B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionButtonGradient}
                        >
                            <Text style={styles.actionButtonText}>Ver Planes y Configurar</Text>
                            <Feather name="arrow-right" size={20} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // --- RENDERIZADO 3: DASHBOARD NORMAL ---
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
            <LinearGradient colors={['#0A0A0A', '#151515']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            
            <AnimatedHeader totalSales={dashboardData.totalSales} isLive={isLive} />

            <FlatList
                data={dashboardData.waiterRanking}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <WaiterRankItem item={item} rank={index + 1} maxSales={maxSales} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />}
                ListHeaderComponent={
                    <>
                        <QuickStats data={dashboardData.waiterRanking} />
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Ranking Staff</Text>
                            <TouchableOpacity onPress={() => setIsLive(!isLive)} style={styles.liveToggle}>
                                <Feather name={isLive ? "pause" : "play"} size={14} color={isLive ? "#EF4444" : "#10B981"} />
                                <Text style={[styles.liveToggleText, { color: isLive ? "#EF4444" : "#10B981" }]}>
                                    {isLive ? "Pausar" : "Reanudar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                ListFooterComponent={
                    <View style={styles.footerContainer}>
                        {/* Top Productos */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoCardHeader}>
                                <MaterialCommunityIcons name="star-circle" size={20} color="#FDB813" />
                                <Text style={styles.infoCardTitle}>Top Productos</Text>
                            </View>
                            {dashboardData.topProducts.map((prod, idx) => (
                                <DetailRow 
                                    key={prod.id} 
                                    label={prod.name} 
                                    value={`$${prod.sales.toLocaleString()}`} 
                                    isLast={idx === dashboardData.topProducts.length - 1} 
                                />
                            ))}
                        </View>

                        {/* Métodos de Pago */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoCardHeader}>
                                <MaterialCommunityIcons name="credit-card-outline" size={20} color="#6366F1" />
                                <Text style={styles.infoCardTitle}>Formas de Pago</Text>
                            </View>
                            {dashboardData.paymentMethods.map((method, idx) => (
                                <DetailRow 
                                    key={method.name} 
                                    label={method.name} 
                                    value={`$${method.total.toLocaleString()}`} 
                                    isLast={idx === dashboardData.paymentMethods.length - 1} 
                                    />
                            ))}
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{error ? error : "No hay ventas registradas hoy."}</Text>
                        {error && (
                            <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
                                <Text style={styles.retryText}>Reintentar Conexión</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },
    gradient: { ...StyleSheet.absoluteFillObject },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#888', marginTop: 10 },
    
    // Header
    header: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerIconContainer: { marginRight: 12 },
    headerIconGradient: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    headerTextContainer: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 14, color: '#9CA3AF' },
    liveIndicatorBlur: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    liveText: { fontSize: 10, fontWeight: 'bold' },

    // Stats
    quickStatsContainer: { marginBottom: 24 },
    quickStatsScroll: { paddingHorizontal: 20, paddingRight: 40 },
    statCardContainer: { marginRight: 12, minWidth: 130 },
    statCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    statCardGradient: { padding: 16, alignItems: 'center' },
    statIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16, 185, 129, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 2 },
    statLabel: { fontSize: 11, color: '#9CA3AF' },

    // Waiter Card
    waiterCard: { marginBottom: 12, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    waiterCardGradient: { padding: 16 },
    waiterHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { marginRight: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    waiterInfo: { flex: 1 },
    waiterNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    waiterName: { fontSize: 16, fontWeight: '600', color: 'white', flex: 1 },
    salesAmount: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
    waiterStatsRow: { flexDirection: 'row', alignItems: 'center' },
    waiterStat: { fontSize: 12, color: '#9CA3AF' },
    dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#666', marginHorizontal: 6 },
    progressSection: { marginTop: 10 },
    progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 3 },

    sectionHeader: { paddingHorizontal: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
    liveToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    liveToggleText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },

    emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 40 },
    emptyText: { color: '#888', marginBottom: 20, textAlign: 'center' },
    retryButton: { backgroundColor: '#333', padding: 10, borderRadius: 8 },
    retryText: { color: 'white' },
    
    listContent: { paddingBottom: 40 },
    
    // Footer Cards
    footerContainer: { paddingHorizontal: 20, marginTop: 10 },
    infoCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    infoCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoCardTitle: { fontSize: 16, fontWeight: '600', color: 'white', marginLeft: 8 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    detailRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    detailLabel: { color: '#D1D5DB', fontSize: 14, flex: 1 },
    detailValue: { color: 'white', fontWeight: '500', fontSize: 14 },

    // Empty State (New User)
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(253, 184, 19, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: 'rgba(253, 184, 19, 0.3)' },
    emptyStateTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 10 },
    emptyStateText: { fontSize: 16, color: '#A0A0A0', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
    actionButton: { width: '100%', borderRadius: 14, overflow: 'hidden', shadowColor: '#FDB813', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    actionButtonGradient: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    actionButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});

export default MonitorScreen;