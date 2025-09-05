// screens/SettingsScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    StatusBar,
    Platform,
    Animated,
    Alert,
    Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// --- DATOS DE MUESTRA MEJORADOS ---
const mockUser = {
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@elsazon.com',
    role: 'Administrador',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
    isVerified: true,
    planType: 'Premium',
    joinDate: 'Miembro desde Mar 2024'
};

// --- COMPONENTES MEJORADOS ---
const AnimatedSection = ({ children, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View 
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
            }}
        >
            {children}
        </Animated.View>
    );
};

const ProfileHeader = ({ user }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <AnimatedSection delay={0}>
            <BlurView intensity={20} style={styles.profileHeaderBlur}>
                <LinearGradient
                    colors={['rgba(253, 184, 19, 0.1)', 'rgba(253, 184, 19, 0.05)']}
                    style={styles.profileHeaderGradient}
                >
                    <View style={styles.profileHeader}>
                        <Animated.View 
                            style={[
                                styles.avatarContainer,
                                { transform: [{ scale: pulseAnim }] }
                            ]}
                        >
                            <Image 
                                source={{ uri: user.avatarUrl }} 
                                style={styles.avatar}
                                onLoad={() => setImageLoading(false)}
                            />
                            {user.isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Feather name="check" size={12} color="#FFFFFF" />
                                </View>
                            )}
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Feather name="camera" size={14} color="#FDB813" />
                            </TouchableOpacity>
                        </Animated.View>
                        
                        <View style={styles.userInfo}>
                            <View style={styles.userNameContainer}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <View style={styles.planBadge}>
                                    <Feather name="star" size={12} color="#FDB813" />
                                    <Text style={styles.planText}>{user.planType}</Text>
                                </View>
                            </View>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <Text style={styles.userRole}>{user.role} • {user.joinDate}</Text>
                        </View>

                        <TouchableOpacity style={styles.qrCodeButton}>
                            <Feather name="share-2" size={18} color="#FDB813" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </BlurView>
        </AnimatedSection>
    );
};

const SettingsSection = ({ title, subtitle, children, delay = 0 }) => (
    <AnimatedSection delay={delay}>
        <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
            </View>
            <View style={styles.sectionCard}>
                <LinearGradient
                    colors={['#1e1e1e', '#1a1a1a']}
                    style={styles.sectionGradient}
                >
                    {children}
                </LinearGradient>
            </View>
        </View>
    </AnimatedSection>
);

const SettingsRow = ({ 
    icon, 
    label, 
    description, 
    onPress, 
    isDestructive = false,
    hasSwitch = false,
    switchValue = false,
    onSwitchChange,
    badgeText,
    badgeColor = '#FDB813',
    iconColor
}) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        if (onPress) onPress();
    };

    const rowIconColor = iconColor || (isDestructive ? '#EF4444' : '#FDB813');
    const rowBgColor = isDestructive ? 'rgba(239, 68, 68, 0.1)' : `rgba(253, 184, 19, 0.1)`;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
                style={styles.row} 
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={hasSwitch}
            >
                <View style={[styles.iconWrapper, { backgroundColor: rowBgColor }]}>
                    <Feather name={icon} size={20} color={rowIconColor} />
                </View>
                
                <View style={styles.rowTextContainer}>
                    <View style={styles.rowLabelContainer}>
                        <Text style={[
                            styles.rowLabel, 
                            { color: isDestructive ? '#EF4444' : '#FFFFFF' }
                        ]}>
                            {label}
                        </Text>
                        {badgeText && (
                            <View style={[styles.badge, { backgroundColor: `${badgeColor}20` }]}>
                                <Text style={[styles.badgeText, { color: badgeColor }]}>
                                    {badgeText}
                                </Text>
                            </View>
                        )}
                    </View>
                    {description && (
                        <Text style={styles.rowDescription}>{description}</Text>
                    )}
                </View>

                {hasSwitch ? (
                    <Switch
                        value={switchValue}
                        onValueChange={onSwitchChange}
                        trackColor={{ false: '#2a2a2a', true: '#FDB81340' }}
                        thumbColor={switchValue ? '#FDB813' : '#666'}
                        ios_backgroundColor="#2a2a2a"
                    />
                ) : !isDestructive ? (
                    <Feather name="chevron-right" size={20} color="#666" />
                ) : null}
            </TouchableOpacity>
        </Animated.View>
    );
};

const QuickActions = () => {
    const actions = [
        { icon: 'download', label: 'Exportar\nDatos', color: '#22C55E' },
        { icon: 'upload', label: 'Importar\nDatos', color: '#3B82F6' },
        { icon: 'refresh-cw', label: 'Sincronizar', color: '#8B5CF6' },
        { icon: 'backup', label: 'Respaldo', color: '#F59E0B' },
    ];

    return (
        <AnimatedSection delay={200}>
            <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Acciones Rápidas</Text>
                <View style={styles.quickActionsGrid}>
                    {actions.map((action, index) => (
                        <TouchableOpacity 
                            key={action.icon} 
                            style={styles.quickActionButton}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[`${action.color}20`, `${action.color}10`]}
                                style={styles.quickActionGradient}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}30` }]}>
                                    <Feather name={action.icon} size={18} color={action.color} />
                                </View>
                                <Text style={styles.quickActionLabel}>{action.label}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </AnimatedSection>
    );
};

/**
 * SettingsScreen - Hub central de configuración moderno y profesional
 * 
 * Mejoras implementadas:
 * 1. **Perfil Enriquecido**: Header con glassmorphism, badges de verificación y plan
 * 2. **Animaciones Suaves**: Entrada escalonada de secciones y microinteracciones
 * 3. **Acciones Rápidas**: Grid de acciones frecuentes para mejor productividad
 * 4. **Estados Inteligentes**: Switches, badges y indicadores visuales
 * 5. **Diseño Modular**: Componentes reutilizables y configurables
 * 6. **Jerarquía Visual**: Tipografía mejorada y espaciado consistente
 */
const SettingsScreen = () => {
    const navigation = useNavigation();
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [biometric, setBiometric] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Cerrar Sesión', 
                    style: 'destructive',
                    onPress: () => {
                        // Lógica de cierre de sesión
                        console.log('Cerrando sesión...');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Eliminar Cuenta',
            'Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => console.log('Eliminando cuenta...')
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient colors={['#1e1e1e', '#121212', '#0a0a0a']} style={styles.gradient}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header */}
                    <ProfileHeader user={mockUser} />

                    {/* Quick Actions */}
                    <QuickActions />

                    {/* Account Settings */}
                    <SettingsSection 
                        title="CUENTA" 
                        subtitle="Gestiona tu información personal"
                        delay={300}
                    >
                        <SettingsRow 
                            icon="user" 
                            label="Editar Perfil" 
                            description="Actualiza tu información personal y avatar"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="shield" 
                            label="Seguridad y Privacidad" 
                            description="Contraseña, autenticación de dos factores"
                            onPress={() => navigation.navigate('Security')}
                            badgeText="2FA"
                            badgeColor="#22C55E"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="credit-card" 
                            label="Facturación e Historial" 
                            description="Gestiona suscripciones y métodos de pago"
                            onPress={() => navigation.navigate('Billing')}
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="fingerprint" 
                            label="Autenticación Biométrica" 
                            description="Usar huella dactilar o Face ID"
                            hasSwitch={true}
                            switchValue={biometric}
                            onSwitchChange={setBiometric}
                            iconColor="#8B5CF6"
                        />
                    </SettingsSection>

                    {/* App Settings */}
                    <SettingsSection 
                        title="APLICACIÓN" 
                        subtitle="Personaliza tu experiencia"
                        delay={400}
                    >
                        <SettingsRow 
                            icon="bell" 
                            label="Notificaciones" 
                            description="Gestiona alertas y recordatorios"
                            hasSwitch={true}
                            switchValue={notifications}
                            onSwitchChange={setNotifications}
                            iconColor="#3B82F6"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="moon" 
                            label="Modo Oscuro" 
                            description="Cambia entre tema claro y oscuro"
                            hasSwitch={true}
                            switchValue={darkMode}
                            onSwitchChange={setDarkMode}
                            iconColor="#8B5CF6"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="globe" 
                            label="Idioma y Región" 
                            description="Español (México)"
                            onPress={() => navigation.navigate('Language')}
                            iconColor="#F59E0B"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="database" 
                            label="Almacenamiento" 
                            description="Gestiona el espacio utilizado (2.3 GB)"
                            onPress={() => navigation.navigate('Storage')}
                            iconColor="#22C55E"
                        />
                    </SettingsSection>

                    {/* Business Settings */}
                    <SettingsSection 
                        title="NEGOCIO" 
                        subtitle="Configuración empresarial"
                        delay={500}
                    >
                        <SettingsRow 
                            icon="briefcase" 
                            label="Información del Negocio" 
                            description="Detalles, horarios y configuración"
                            onPress={() => navigation.navigate('BusinessInfo')}
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="users" 
                            label="Gestión de Usuarios" 
                            description="Administra empleados y permisos"
                            onPress={() => navigation.navigate('UserManagement')}
                            badgeText="3 usuarios"
                            badgeColor="#3B82F6"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="settings" 
                            label="Configuración POS" 
                            description="Impresoras, cajón, periféricos"
                            onPress={() => navigation.navigate('POSSettings')}
                        />
                    </SettingsSection>

                    {/* Support */}
                    <SettingsSection 
                        title="SOPORTE" 
                        subtitle="Ayuda y asistencia técnica"
                        delay={600}
                    >
                        <SettingsRow 
                            icon="help-circle" 
                            label="Centro de Ayuda" 
                            description="Guías, tutoriales y preguntas frecuentes"
                            onPress={() => navigation.navigate('HelpCenter')}
                            iconColor="#22C55E"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="message-circle" 
                            label="Contactar Soporte" 
                            description="Chat en vivo con nuestro equipo"
                            onPress={() => navigation.navigate('Contact')}
                            iconColor="#3B82F6"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="star" 
                            label="Calificar App" 
                            description="Ayúdanos a mejorar con tu opinión"
                            onPress={() => console.log('Abriendo store review...')}
                            iconColor="#F59E0B"
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="info" 
                            label="Acerca de" 
                            description="Versión 2.1.0 • Términos y privacidad"
                            onPress={() => navigation.navigate('About')}
                            iconColor="#8B5CF6"
                        />
                    </SettingsSection>

                    {/* Danger Zone */}
                    <SettingsSection 
                        title="ZONA PELIGROSA" 
                        subtitle="Acciones irreversibles"
                        delay={700}
                    >
                        <SettingsRow 
                            icon="log-out" 
                            label="Cerrar Sesión" 
                            description="Salir de tu cuenta en este dispositivo"
                            onPress={handleLogout}
                            isDestructive={true}
                        />
                        <View style={styles.divider} />
                        <SettingsRow 
                            icon="trash-2" 
                            label="Eliminar Cuenta" 
                            description="Eliminar permanentemente todos los datos"
                            onPress={handleDeleteAccount}
                            isDestructive={true}
                        />
                    </SettingsSection>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            El Sazón POS v2.1.0
                        </Text>
                        <Text style={styles.footerSubtext}>
                            Desarrollado con ❤️ en México
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingBottom: 40,
    },
    profileHeaderBlur: {
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    profileHeaderGradient: {
        padding: 24,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FDB813',
    },
    verifiedBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#22C55E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#121212',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#121212',
        borderWidth: 2,
        borderColor: '#FDB813',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 8,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(253, 184, 19, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    planText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FDB813',
    },
    userEmail: {
        fontSize: 14,
        color: '#A9A9A9',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 12,
        color: '#888',
    },
    qrCodeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(253, 184, 19, 0.3)',
    },
    quickActionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    quickActionGradient: {
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
        color: '#A9A9A9',
        textAlign: 'center',
        lineHeight: 14,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionHeaderContainer: {
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    sectionSubtitle: {
        color: '#666',
        fontSize: 12,
    },
    sectionCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    sectionGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        minHeight: 60,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    rowDescription: {
        fontSize: 13,
        color: '#A9A9A9',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginLeft: 76,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#888',
    },
});

export default SettingsScreen;