import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PlanSelection = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('individual');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const plans = {
    individual: [
      {
        product: 'NEXFACTURA',
        options: [
          { name: 'Plan Mensual', price: 450, period: 'mes', savings: null },
          { name: 'Plan Semestral', price: 2300, period: 'semestre', savings: 400 },
          { name: 'Plan Anual', price: 4150, period: 'año', savings: null },
        ],
      },
      {
        product: 'NEXTMANAGER',
        options: [
          { name: 'Plan Mensual', price: 430, period: 'mes', savings: null },
          { name: 'Plan Semestral', price: 2200, period: 'semestre', savings: 380 },
          { name: 'Plan Anual', price: 3950, period: 'año', savings: null },
        ],
      },
    ],
    combined: [
      {
        product: 'Paquete Anual Combinado',
        options: [
          {
            name: 'NEXFACTURA + NEXTMANAGER',
            price: 7500,
            period: 'año',
            savings: 600,
            additionalBenefits: [
              'Soporte técnico prioritario',
              'Una sesión de capacitación adicional sin costo',
            ],
            recommended: true,
          },
        ],
      },
    ],
  };

  const handlePlanSelect = (option, product) => {
    setLoading(true);
    setTimeout(() => {
      navigation.navigate('Payment', {
        selectedPlan: {
          product,
          name: option.name,
          price: option.price,
          period: option.period,
          savings: option.savings,
          additionalBenefits: option.additionalBenefits || [],
        },
      });
      setLoading(false);
    }, 1000);
  };

  const faqData = [
    {
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Sí, puedes actualizar o bajar tu plan en cualquier momento desde tu panel de usuario.',
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito, débito y pagos a través de Mercado Pago.',
    },
    {
      question: '¿Hay algún cargo adicional?',
      answer: 'No, todos los costos están claramente especificados en los planes.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.decorativeCircle}
          />

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
                <MaterialIcons name="attach-money" size={40} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Selección de Plan</Text>
            <Text style={styles.subtitle}>Elige el plan perfecto para tu negocio</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeSection === 'individual' && styles.tabButtonActive]}
              onPress={() => setActiveSection('individual')}
            >
              <MaterialIcons name="person" size={24} color={activeSection === 'individual' ? '#000' : '#FFD700'} />
              <Text style={[styles.tabButtonText, activeSection === 'individual' && styles.tabButtonTextActive]}>
                Individual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeSection === 'combined' && styles.tabButtonActive]}
              onPress={() => setActiveSection('combined')}
            >
              <MaterialIcons name="group" size={24} color={activeSection === 'combined' ? '#000' : '#FFD700'} />
              <Text style={[styles.tabButtonText, activeSection === 'combined' && styles.tabButtonTextActive]}>
                Combinado
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.plansContainer}>
            {plans[activeSection].map(({ product, options }, productIndex) => (
              <View key={product} style={styles.planCard}>
                {options.some(o => o.recommended) && (
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.recommendedBadge}
                  >
                    <MaterialIcons name="star" size={16} color="#000" />
                    <Text style={styles.recommendedText}>Recomendado</Text>
                  </LinearGradient>
                )}

                <Text style={styles.planTitle}>{product}</Text>

                {options.map((option, optionIndex) => (
                  <View key={`${option.name}-${optionIndex}`} style={styles.optionCard}>
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionPrice}>
                      ${option.price.toLocaleString()}
                      <Text style={styles.periodText}>/{option.period}</Text>
                    </Text>

                    {option.savings && (
                      <View style={styles.savingsContainer}>
                        <MaterialIcons name="trending-up" size={20} color="#FFD700" />
                        <Text style={styles.savingsText}>
                          Ahorro: ${option.savings.toLocaleString()} MXN
                        </Text>
                      </View>
                    )}

                    {option.additionalBenefits?.map((benefit, benefitIndex) => (
                      <View key={benefitIndex} style={styles.benefitItem}>
                        <MaterialIcons name="check-circle" size={20} color="#FFD700" />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => handlePlanSelect(option, product)}
                    >
                      <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={styles.gradientButton}
                      >
                        <MaterialIcons name="shopping-cart" size={24} color="#000" />
                        <Text style={styles.buttonText}>Seleccionar Plan</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.faqContainer}>
              <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
              {faqData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.faqItem}
                  onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <MaterialIcons
                      name={expandedFAQ === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={24}
                      color="#FFD700"
                    />
                  </View>
                  {expandedFAQ === index && (
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          )}

          <LinearGradient
            colors={['#FFA500', '#FFD700']}
            style={[styles.decorativeCircle, styles.bottomCircle]}
          />
        </Animated.View>
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
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  bottomCircle: {
    top: undefined,
    right: undefined,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 20,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFD700',
  },
  tabButtonText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabButtonTextActive: {
    color: '#000',
  },
  plansContainer: {
    flex: 1,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  recommendedText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  planTitle: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  optionName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionPrice: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  periodText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  savingsText: {
    color: '#FFD700',
    marginLeft: 5,
    fontSize: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  benefitText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  selectButton: {
    marginTop: 15,
    borderRadius: 25,
    overflow: 'hidden',
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
    fontSize:  16,
    marginLeft: 10,
  },
  faqContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
  },
  faqTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faqItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  faqAnswer: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
});

export default PlanSelection;
