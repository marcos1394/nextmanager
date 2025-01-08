// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Tus pantallas existentes
import LandingPage from './src/screens/LandingPage';
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen';
import Monitor from './src/screens/MonitorScreen';
import Report from './src/screens/ReportScreen';

// Nuevas pantallas agregadas
import PlanSelection from './src/screens/PlanSelection';       // Ajusta la ruta real
import PaymentScreen from './src/screens/PaymentScreen';       // Ajusta la ruta real
import PaymentSuccess from './src/screens/PaymentSuccess';     // Ajusta la ruta real
import PaymentPending from './src/screens/PaymentPending';     // Ajusta la ruta real
import PaymentFailure from './src/screens/PaymentFailure';     // Ajusta la ruta real

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>

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

        {/* Si necesitas configurar tu restaurante tras un pago exitoso */}
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>

  );
}
