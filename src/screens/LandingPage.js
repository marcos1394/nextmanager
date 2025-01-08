import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LandingPage = () => {
  const navigation = useNavigation();
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

  const renderFeatureItem = ({ icon, text }) => (
    <TouchableOpacity style={styles.featureItem}>
      <LinearGradient
        colors={['rgba(255,215,0,0.15)', 'rgba(255,215,0,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureGradient}
      >
        <MaterialIcons name={icon} size={24} color="#FFD700" />
        <Text style={styles.featureText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

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

          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.iconBackground}
              >
                <MaterialIcons name="restaurant-menu" size={50} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>NextManager</Text>
            <Text style={styles.subtitle}>
              Gestión inteligente para tu restaurante
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {renderFeatureItem({ 
              icon: 'trending-up', 
              text: 'Monitoreo en tiempo real' 
            })}
            {renderFeatureItem({ 
              icon: 'analytics', 
              text: 'Análisis detallado de ventas' 
            })}
            {renderFeatureItem({ 
              icon: 'notifications-active', 
              text: 'Alertas instantáneas' 
            })}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Register')}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.gradientButton}
              >
                <FontAwesome5 name="user-plus" size={20} color="#000" />
                <Text style={styles.buttonText}>Regístrate Ahora</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={() => navigation.navigate('Login')}
            >
              <FontAwesome5 name="sign-in-alt" size={20} color="#FFD700" />
              <Text style={[styles.buttonText, styles.loginText]}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
          </View>

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 42,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
  },
  featureText: {
    color: '#fff',
    marginLeft: 15,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 25,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  buttonText: {
    marginLeft: 10,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  loginText: {
    color: '#FFD700',
  },
});

export default LandingPage;
