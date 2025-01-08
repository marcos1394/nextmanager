import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';

// Suplente de ícono
const HourglassIcon = () => <Text style={{ fontSize: 60 }}>⏳</Text>;
const CheckCircleIcon = () => <Text style={{ fontSize: 16, color: 'green' }}>✔</Text>;

const PaymentPending = () => {
  const [darkMode] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        styles.container,
        darkMode ? styles.darkGradientBackground : styles.lightGradientBackground,
      ]}
    >
      <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        {/* Ícono principal */}
        <View style={{ position: 'relative', marginBottom: 16, alignItems: 'center' }}>
          <HourglassIcon />
          {/* Pequeño check en la esquina */}
          <View
            style={[
              styles.checkBadge,
              darkMode ? { backgroundColor: '#444' } : { backgroundColor: '#ddd' },
            ]}
          >
            <CheckCircleIcon />
          </View>
        </View>

        <Text style={[styles.title, darkMode ? { color: '#ffc107' } : { color: '#d59e00' }]}>
          Pago en Proceso
        </Text>
        <Text style={[styles.subtitle, darkMode ? { color: '#ccc' } : { color: '#666' }]}>
          Tu pago está siendo procesado{dots}
        </Text>
        <Text style={[styles.description, darkMode ? { color: '#999' } : { color: '#555' }]}>
          Por favor, no cierres esta pantalla. Serás redirigido una vez confirmado.
        </Text>

        {/* Barra de carga simulada */}
        <View
          style={[
            styles.progressBarBackground,
            darkMode ? { backgroundColor: '#444' } : { backgroundColor: '#eee' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              darkMode ? { backgroundColor: '#ffc107' } : { backgroundColor: '#f9c74f' },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default PaymentPending;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkGradientBackground: {
    backgroundColor: '#111',
  },
  lightGradientBackground: {
    backgroundColor: '#eef2ff',
  },
  card: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#333',
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    maxWidth: 260,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '50%',
    height: '100%',
    // Puedes agregar un animation si gustas
  },
});
