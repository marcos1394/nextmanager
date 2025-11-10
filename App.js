import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- IMPORTACIONES DE CONTEXTO ---
// 1. Importa tu AuthProvider
import { AuthProvider } from './src/context/AuthContext';
// (Si tienes un ThemeProvider, también iría aquí)
// import { ThemeProvider } from './src/context/ThemeContext';

// Tus pantallas existentes
import LandingPage from './src/screens/LandingPage';
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen';
import Monitor from './src/screens/MonitorScreen';
import Report from './src/screens/ReportScreen';

// Nuevas pantallas agregadas
import PlanSelection from './src/screens/PlanSelection';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentSuccess from './src/screens/PaymentSuccess';
import PaymentPending from './src/screens/PaymentPending';
import PaymentFailure from './src/screens/PaymentFailure';
// (Aquí también faltarían tus otras pantallas como RestaurantConfig, HelpCenter, etc.)

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      {/*
        2. Envuelve toda tu aplicación con el AuthProvider.
           Esto "inyecta" el estado (user, login, logout) a todos los
           componentes hijos (incluyendo toda la navegación).
      */}
      <AuthProvider>
        {/* Si tienes un ThemeProvider, iría aquí, dentro de AuthProvider */}
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LandingPage" screenOptions={{ headerShown: false }}>
            {/* Pantallas existentes */}
            <Stack.Screen name="LandingPage" component={LandingPage} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Monitor" component={Monitor} />
            <Stack.Screen name="Report" component={Report} />

            {/* NUEVAS pantallas según la lógica creada */}
            <Stack.Screen name="Plans" component={PlanSelection} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
            <Stack.Screen name="PaymentPending" component={PaymentPending} />
            <Stack.Screen name="PaymentFailure" component={PaymentFailure} />
            
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}