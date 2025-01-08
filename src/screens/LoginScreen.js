import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width, height } = Dimensions.get('window');
const { API_URL, GOOGLE_CLIENT_ID } = Constants.expoConfig.extra;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
      offlineAccess: true,
    });

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password,
      });

      const { role, token } = response.data;
      await AsyncStorage.setItem('authToken', token);

      const statusResponse = await axios.get(`${API_URL}/api/users/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { hasPlan, hasRestaurant } = statusResponse.data;

      if (!hasPlan) {
        navigation.navigate('Plans');
      } else if (hasPlan && !hasRestaurant) {
        navigation.navigate('RestaurantConfig');
      } else {
        if (role === 'superadmin') {
          navigation.navigate('SuperAdminScreen');
        } else if (role === 'admin') {
          navigation.navigate('DashboardScreen');
        } else {
          Alert.alert('Error', 'Rol de usuario no reconocido');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error de inicio de sesión',
        error.response?.data?.message || 'Credenciales incorrectas'
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const response = await axios.post(`${API_URL}/api/users/google-login`, {
        token: userInfo.idToken,
      });

      const { role, token } = response.data;
      await AsyncStorage.setItem('authToken', token);

      const statusResponse = await axios.get(`${API_URL}/api/users/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { hasPlan, hasRestaurant } = statusResponse.data;

      if (!hasPlan) {
        navigation.navigate('Plans');
      } else if (hasPlan && !hasRestaurant) {
        navigation.navigate('RestaurantConfig');
      } else {
        if (role === 'superadmin') {
          navigation.navigate('SuperAdminScreen');
        } else if (role === 'admin') {
          navigation.navigate('DashboardScreen');
        } else {
          Alert.alert('Error', 'Rol de usuario no reconocido');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

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
                <MaterialIcons name="person" size={40} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>¡Bienvenido de nuevo!</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.gradientButton}
                >
                  <MaterialIcons name="login" size={24} color="#000" />
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={signInWithGoogle}>
                <LinearGradient
                  colors={['#DB4437', '#C53929']}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="google" size={24} color="#fff" />
                  <Text style={[styles.buttonText, styles.googleButtonText]}>
                    Continuar con Google
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>¿No tienes una cuenta? Regístrate</Text>
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
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: 15,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginBottom: 15,
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
    fontSize: 16,
    marginLeft: 10,
  },
  googleButtonText: {
    color: '#fff',
  },
  loader: {
    marginVertical: 20,
  },
  linksContainer: {
    marginTop: 20,
  },
  link: {
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default Login;