import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
// Suplentes de íconos
const CheckCircleIcon = () => <Text style={{ fontSize: 60, color: 'green' }}>✔</Text>;
const SparklesIcon = () => <Text style={{ fontSize: 24, color: '#4f9bed' }}>✨</Text>;
const ArrowRightIcon = () => <Text style={{ marginLeft: 8, fontSize: 18 }}>→</Text>;
const RocketIcon = () => <Text style={{ fontSize: 40 }}>🚀</Text>;

const PaymentSuccess = ({ navigation }) => {
  // Modo oscuro ficticio, en tu proyecto podría venir de un context
  const [darkMode] = useState(false);

  const handleConfigRestaurant = () => {
    // Navega a la pantalla de configuración de restaurante
    navigation.navigate('RestaurantConfig');
  };

  return (
    <View
      style={[
        styles.container,
        darkMode ? styles.darkGradientBackground : styles.lightGradientBackground,
      ]}
    >
      <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        {/* Icono principal con "sparkles" */}
        <View style={styles.iconWrapper}>
          <CheckCircleIcon />
          {/* Sparkles en esquinas simuladas */}
          <View style={[styles.sparkle, styles.sparkleTopRight]}>
            <SparklesIcon />
          </View>
          <View style={[styles.sparkle, styles.sparkleBottomLeft]}>
            <SparklesIcon />
          </View>
        </View>

        <Text style={[styles.title, darkMode ? styles.titleDark : styles.titleLight]}>
          Pago Exitoso
        </Text>
        <Text style={[styles.subtitle, darkMode ? { color: '#ccc' } : { color: '#666' }]}>
          Gracias por tu compra. Tu plan ha sido activado correctamente.
        </Text>

        {/* Sección con rocket info */}
        <View
          style={[
            styles.infoBox,
            darkMode ? { backgroundColor: '#333' } : { backgroundColor: '#f0f0f0' },
          ]}
        >
          <RocketIcon />
          <Text style={[styles.infoText, darkMode ? { color: '#ccc' } : { color: '#444' }]}>
            Ahora puedes configurar tu restaurante para empezar a facturar.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            darkMode ? styles.buttonDark : styles.buttonLight,
          ]}
          onPress={handleConfigRestaurant}
        >
          <Text style={{ color: darkMode ? '#000' : '#fff', fontWeight: 'bold' }}>
            Configurar Restaurante
          </Text>
          <ArrowRightIcon />
        </TouchableOpacity>

        <Text style={[styles.helpText, darkMode ? { color: '#999' } : { color: '#999' }]}>
          ¿Necesitas ayuda? Contáctanos al soporte
        </Text>
      </View>
    </View>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkGradientBackground: {
    backgroundColor: '#222',
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
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardDark: {
    backgroundColor: '#2f2f2f',
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  iconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTopRight: {
    top: 0,
    right: -10,
  },
  sparkleBottomLeft: {
    bottom: 0,
    left: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  titleDark: {
    color: '#ffd600', // similar a "bg-gradient-to-r from-yellow-400 to-yellow-600"
  },
  titleLight: {
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 260,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'center',
  },
  buttonDark: {
    backgroundColor: '#ffd600',
  },
  buttonLight: {
    backgroundColor: '#4f9bed',
  },
  helpText: {
    fontSize: 12,
    marginTop: 12,
  },
});
