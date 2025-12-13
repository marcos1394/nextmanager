import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- TUS PANTALLAS ---
import LandingPage from '../screens/LandingPage';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MonitorScreen from '../screens/MonitorScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import PaymentGatewayScreen from '../screens/PaymentGatewayScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentPendingScreen from '../screens/PaymentPendingScreen';
import PaymentFailureScreen from '../screens/PaymentFailureScreen';

// Componente del Menú Lateral
import CustomDrawer from '../components/CustomDrawer';

// Contexto
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// 1. Stack para usuarios NO autenticados (Onboarding)
const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

// 2. Stack para el flujo de Pagos (Se abre "encima" del menú)
const PaymentStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PlansList" component={PlanSelectionScreen} />
            <Stack.Screen name="Payment" component={PaymentGatewayScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="PaymentPending" component={PaymentPendingScreen} />
            <Stack.Screen name="PaymentFailure" component={PaymentFailureScreen} />
        </Stack.Navigator>
    );
};

// 3. Drawer Principal (Menú Lateral)
const MainDrawer = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false, // Ocultamos el header default porque MonitorScreen tiene el suyo animado
                drawerActiveBackgroundColor: 'rgba(253, 184, 19, 0.15)', // Fondo dorado suave al estar activo
                drawerActiveTintColor: '#FDB813', // Texto dorado al estar activo
                drawerInactiveTintColor: '#A0A0A0', // Texto gris inactivo
                drawerLabelStyle: { marginLeft: -20, fontSize: 15, fontWeight: '500' },
                drawerStyle: {
                    backgroundColor: '#000',
                    width: 300,
                },
                swipeEdgeWidth: 100, // Facilita abrir el menú deslizando
            }}
        >
            <Drawer.Screen 
                name="Monitor" 
                component={MonitorScreen} 
                options={{
                    drawerIcon: ({ color }) => <MaterialCommunityIcons name="monitor-dashboard" size={22} color={color} />,
                    title: 'Dashboard Operativo'
                }}
            />
            
            <Drawer.Screen 
                name="Plans" 
                component={PaymentStack} 
                options={{
                    drawerIcon: ({ color }) => <MaterialCommunityIcons name="crown" size={22} color={color} />,
                    title: 'Mi Suscripción'
                }}
            />

            {/* Puedes agregar más pantallas aquí en el futuro */}
            <Drawer.Screen 
                name="Help" 
                component={MonitorScreen} // Placeholder: Cambiar por HelpScreen cuando exista
                options={{
                    drawerIcon: ({ color }) => <Feather name="help-circle" size={22} color={color} />,
                    title: 'Centro de Ayuda'
                }}
            />
        </Drawer.Navigator>
    );
};

// 4. Navegador Raíz que decide qué mostrar
const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FDB813" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <MainDrawer />
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;