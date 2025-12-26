import 'react-native-gesture-handler'; // 1. IMPORTANTE: Primera línea siempre
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 2. IMPORTANTE: Necesitamos importar este componente contenedor
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 

// --- IMPORTACIONES DE CONTEXTO ---
import { AuthProvider } from './src/context/AuthContext';

// --- IMPORTACIÓN DE NAVEGACIÓN PRINCIPAL ---
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // 3. IMPORTANTE: Envolvemos TODA la app en GestureHandlerRootView con flex: 1
    // Sin esto, el Menú Lateral (Drawer) provoca pantalla blanca o no responde en Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          
          {/* Configuración global de la barra de estado (Estilo Dark Mode) */}
          <StatusBar barStyle="light-content" backgroundColor="#000" />

          {/* El Navegador Principal */}
          <AppNavigator />

        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}