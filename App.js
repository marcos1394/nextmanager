import 'react-native-gesture-handler'; // IMPORTANTE: Debe ser la 1ra línea siempre para que funcione el Menú Lateral
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- IMPORTACIONES DE CONTEXTO ---
import { AuthProvider } from './src/context/AuthContext';

// --- IMPORTACIÓN DE NAVEGACIÓN PRINCIPAL ---
// Ya no importamos las pantallas aquí una por una. 
// AppNavigator se encarga de decidir si mostrar Login o el Dashboard.
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* AuthProvider debe envolver a la navegación para que 
        todas las pantallas tengan acceso al usuario y al token.
      */}
      <AuthProvider>
        
        {/* Configuración global de la barra de estado (Estilo Dark Mode) */}
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* El Navegador Principal. 
          Aquí dentro vive la lógica de:
          - Si no hay usuario -> Muestra Landing/Login/Register
          - Si hay usuario -> Muestra el Menú Lateral (Drawer) y Monitor
        */}
        <AppNavigator />

      </AuthProvider>
    </SafeAreaProvider>
  );
}