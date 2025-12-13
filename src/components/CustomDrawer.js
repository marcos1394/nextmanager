import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem
} from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CustomDrawer = (props) => {
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await logout();
        // La navegación se maneja automáticamente en AppNavigator al cambiar el estado de auth
    };

    // Obtenemos el nombre del restaurante o del usuario
    const restaurantName = user?.restaurants?.[0]?.name || 'Mi Restaurante';
    const userName = user?.name || 'Administrador';
    const userEmail = user?.email || '';

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <LinearGradient
                colors={['#1a1a1a', '#050505']}
                style={StyleSheet.absoluteFillObject}
            />
            
            <DrawerContentScrollView 
                {...props} 
                contentContainerStyle={{ paddingTop: 0 }}
                showsVerticalScrollIndicator={false}
            >
                {/* --- HEADER DEL MENÚ --- */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#FDB813', '#F59E0B']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </LinearGradient>
                    </View>
                    
                    <View style={styles.userInfo}>
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {restaurantName}
                        </Text>
                        <Text style={styles.userName} numberOfLines={1}>
                            {userName}
                        </Text>
                        <View style={styles.planBadge}>
                            <MaterialCommunityIcons name="crown" size={12} color="#000" />
                            <Text style={styles.planText}>
                                {user?.plan?.name || 'Free Trial'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* --- LISTA DE NAVEGACIÓN --- */}
                <View style={styles.menuContainer}>
                    <DrawerItemList {...props} />
                </View>

            </DrawerContentScrollView>

            {/* --- FOOTER (Cerrar Sesión) --- */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.divider} />
                
                <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
                    <Feather name="settings" size={20} color="#888" />
                    <Text style={styles.footerText}>Configuración</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <View style={styles.logoutContent}>
                        <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </View>
                </TouchableOpacity>
                
                <Text style={styles.versionText}>NextManager v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 10,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatarGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#FDB813",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    userInfo: {
        gap: 4,
    },
    restaurantName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB813',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
        gap: 4,
    },
    planText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    footer: {
        paddingHorizontal: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    footerText: {
        color: '#888',
        fontSize: 15,
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    logoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: 'bold',
    },
    versionText: {
        color: '#444',
        fontSize: 11,
        textAlign: 'center',
    },
});

export default CustomDrawer;