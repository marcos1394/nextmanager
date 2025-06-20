// screens/SettingsScreen.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- DATOS DE MUESTRA ---
const mockUser = {
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@elsazon.com',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop'
};

// --- SUBCOMPONENTES ---
const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionCard}>
            {children}
        </View>
    </View>
);

const SettingsRow = ({ icon, label, description, onPress, isDestructive = false }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={[styles.iconWrapper, { backgroundColor: isDestructive ? 'rgba(255, 107, 107, 0.1)' : '#2a2a2a' }]}>
            <Feather name={icon} size={20} color={isDestructive ? '#FF6B6B' : '#FDB813'} />
        </View>
        <View style={styles.rowTextContainer}>
            <Text style={[styles.rowLabel, { color: isDestructive ? '#FF6B6B' : '#FFFFFF' }]}>{label}</Text>
            {description && <Text style={styles.rowDescription}>{description}</Text>}
        </View>
        {!isDestructive && <Feather name="chevron-right" size={20} color="#888" />}
    </TouchableOpacity>
);

/**
 * SettingsScreen - El hub central para toda la gestión de la cuenta del usuario.
 * * Estrategia de UX/UI:
 * 1.  Navegación Intuitiva: La pantalla está estructurada como una lista de navegación, un patrón
 * universalmente entendido en apps móviles. El usuario sabe inmediatamente cómo usarla.
 * 2.  Organización Temática: Agrupar las opciones en secciones ("Cuenta", "Aplicación") reduce la
 * carga cognitiva y ayuda al usuario a encontrar lo que busca rápidamente.
 * 3.  Diseño Limpio y Accionable: Cada fila es un botón claro. El uso de iconos refuerza el
 * significado de cada opción, permitiendo un escaneo visual rápido.
 * 4.  Personalización: La cabecera con el avatar y nombre del usuario hace que la pantalla se
 * sienta como un espacio personal, no como un menú genérico.
 */
const SettingsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* User Profile Header */}
                    <View style={styles.profileHeader}>
                        <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatar} />
                        <Text style={styles.userName}>{mockUser.name}</Text>
                        <Text style={styles.userEmail}>{mockUser.email}</Text>
                    </View>

                    {/* Secciones de Ajustes */}
                    <SettingsSection title="CUENTA">
                        <SettingsRow icon="user" label="Editar Perfil" description="Actualiza tu nombre y avatar" onPress={() => { /* Navegar a EditProfile */ }} />
                        <SettingsRow icon="shield" label="Seguridad" description="Cambiar contraseña, 2FA" onPress={() => { /* Navegar a Security */ }} />
                        <SettingsRow icon="credit-card" label="Facturación e Historial" description="Gestiona tus datos fiscales y pagos" onPress={() => { /* Navegar a Billing */ }} />
                    </SettingsSection>

                    <SettingsSection title="APLICACIÓN">
                        <SettingsRow icon="bell" label="Notificaciones" description="Elige qué alertas quieres recibir" onPress={() => navigation.navigate('NotificationSettings')} />
                        <SettingsRow icon="moon" label="Apariencia" description="Activa el modo claro u oscuro" onPress={() => { /* Lógica de Theme */ }} />
                    </SettingsSection>

                    <SettingsSection title="SOPORTE">
                        <SettingsRow icon="help-circle" label="Centro de Ayuda" description="Encuentra respuestas a tus dudas" onPress={() => navigation.navigate('HelpCenter')} />
                        <SettingsRow icon="send" label="Contactar a Soporte" description="Habla con nuestro equipo" onPress={() => navigation.navigate('Contact')} />
                    </SettingsSection>
                    
                     <SettingsSection title="SESIÓN">
                        <SettingsRow icon="log-out" label="Cerrar Sesión" onPress={() => alert('Cerrando sesión... (simulado)')} isDestructive />
                    </SettingsSection>

                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
// El resto de los estilos se definirán a continuación
