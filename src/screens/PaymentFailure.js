import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Icon components to match PaymentFailure style
const PaymentIcon = () => <Text style={{ fontSize: 60, color: '#FFD700' }}>💳</Text>;
const ArrowLeftIcon = () => <Text style={{ fontSize: 24 }}>←</Text>;
const CheckIcon = () => <Text style={{ fontSize: 24, color: '#FFD700' }}>✓</Text>;

const {API_URL} = Constants.expoConfig.extra;

const PaymentGateway = ({ route, navigation }) => {
  const { selectedPlan } = route.params || {};
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación.');
        setIsProcessing(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/payment/create-payment`,
        { plan: selectedPlan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const initPoint = response.data.init_point;
      await Linking.openURL(initPoint);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error al crear la preferencia de pago:', error);
      Alert.alert(
        'Error',
        'Hubo un error al procesar el pago. Por favor, inténtalo nuevamente.'
      );
      setIsProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <View style={[
        styles.container,
        darkMode ? styles.darkGradientBackground : styles.lightGradientBackground,
      ]}>
        <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.title, darkMode ? styles.titleDark : styles.titleLight]}>
            No se seleccionó ningún plan
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, darkMode ? styles.retryButtonDark : styles.retryButtonLight]}
            onPress={() => navigation.navigate('PlanSelection')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Volver a Planes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      darkMode ? styles.darkGradientBackground : styles.lightGradientBackground,
    ]}>
      <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, darkMode ? styles.backButtonDark : styles.backButtonLight]}
        >
          <ArrowLeftIcon />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <PaymentIcon />
        </View>

        <Text style={[styles.title, darkMode ? styles.titleDark : styles.titleLight]}>
          Confirmar Pago
        </Text>
        
        <Text style={[styles.subtitle, darkMode ? { color: '#ccc' } : { color: '#666' }]}>
          Estás a un paso de activar tu plan
        </Text>

        <View style={styles.planInfo}>
          <Text style={[styles.planTitle, darkMode ? { color: '#FFD700' } : { color: '#1a1a1a' }]}>
            {selectedPlan.product}
          </Text>
          <Text style={[styles.planPrice, darkMode ? { color: '#FFD700' } : { color: '#1a1a1a' }]}>
            ${selectedPlan.price.toLocaleString()}
            <Text style={darkMode ? { color: '#ccc' } : { color: '#666' }}>/{selectedPlan.period}</Text>
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          {selectedPlan.additionalBenefits?.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <CheckIcon />
              <Text style={[styles.benefitText, darkMode ? { color: '#ccc' } : { color: '#666' }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.retryButton, darkMode ? styles.retryButtonDark : styles.retryButtonLight]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Pagar con Mercado Pago
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.homeButton, darkMode ? styles.homeButtonDark : styles.homeButtonLight]}
          onPress={() => navigation.goBack()}
        >
          <Text style={darkMode ? { color: '#ddd' } : { color: '#333' }}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    elevation: 4,
    position: 'relative',
  },
  cardDark: {
    backgroundColor: '#333',
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    padding: 6,
    borderRadius: 20,
  },
  backButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButtonLight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  titleDark: {
    color: '#FFD700',
  },
  titleLight: {
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 280,
    alignSelf: 'center',
  },
  planInfo: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
  },
  retryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryButtonDark: {
    backgroundColor: '#4f9bed',
  },
  retryButtonLight: {
    backgroundColor: '#FFD700',
  },
  homeButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeButtonDark: {
    backgroundColor: '#444',
  },
  homeButtonLight: {
    backgroundColor: '#ddd',
  },
});

export default PaymentGateway;