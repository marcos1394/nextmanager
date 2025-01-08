import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const {API_URL} = Constants.expoConfig.extra;

const PaymentGateway = ({ route, navigation }) => {
  const { selectedPlan } = route.params || {};
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

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
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
          style={styles.gradient}
        >
          <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={64} color="#FFD700" />
            <Text style={styles.emptyText}>No se seleccionó ningún plan</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('PlanSelection')}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.gradientButton}
              >
                <MaterialIcons name="arrow-back" size={24} color="#000" />
                <Text style={styles.buttonText}>Volver a Planes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={[styles.decorativeCircle, styles.topCircle]}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.iconBackground}
              >
                <MaterialIcons name="payment" size={40} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Confirmar Pago</Text>
            <Text style={styles.subtitle}>Estás a un paso de activar tu plan</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.planInfo}>
              <View style={styles.planDetails}>
                <Text style={styles.planTitle}>{selectedPlan.product}</Text>
                <Text style={styles.planName}>{selectedPlan.name}</Text>
                {selectedPlan.savings && (
                  <View style={styles.savingsContainer}>
                    <MaterialIcons name="trending-up" size={20} color="#FFD700" />
                    <Text style={styles.savingsText}>
                      Ahorro: ${selectedPlan.savings.toLocaleString()} MXN
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.planPrice}>
                ${selectedPlan.price.toLocaleString()}
                <Text style={styles.periodText}>/{selectedPlan.period}</Text>
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <MaterialIcons name="verified" size={24} color="#FFD700" />
                <Text style={styles.benefitText}>Activación inmediata</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialIcons name="security" size={24} color="#FFD700" />
                <Text style={styles.benefitText}>Pago seguro con Mercado Pago</Text>
              </View>
              {selectedPlan.additionalBenefits?.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialIcons name="check-circle" size={24} color="#FFD700" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.paymentButton}
              onPress={handlePayment}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.gradientButton}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <MaterialIcons name="payment" size={24} color="#000" />
                    <Text style={styles.buttonText}>Pagar con Mercado Pago</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <MaterialIcons name="info" size={16} color="#FFD700" />
              <Text style={styles.termsText}>
                Al continuar, aceptas nuestros{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Términos', 'Mostrar términos en otra pantalla o modal')}
                >
                  términos y condiciones
                </Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <LinearGradient
          colors={['#FFA500', '#FFD700']}
          style={[styles.decorativeCircle, styles.bottomCircle]}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  topCircle: {
    top: -100,
    right: -100,
  },
  bottomCircle: {
    bottom: -100,
    left: -100,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  iconBackground: {
    padding: 20,
    borderRadius: 30,
  },
  title: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  planInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  planDetails: {
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planName: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  planPrice: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  periodText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  savingsText: {
    color: '#FFD700',
    marginLeft: 5,
    fontSize: 16,
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
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  paymentButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
    textAlign: 'center',
  },
  termsLink: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default PaymentGateway;