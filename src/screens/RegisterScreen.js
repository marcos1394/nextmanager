import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import TermsModal from './TermsModal';
import { ScrollView } from 'react-native';


const { width, height } = Dimensions.get('window');
const { API_URL, GOOGLE_CLIENT_ID } = Constants.expoConfig.extra;

const Register = ({ navigation }) => {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation states
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Terms states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Password validation states
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

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

  const validatePassword = (value) => {
    const criteria = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
    setPasswordCriteria(criteria);
  };

  const isPasswordValid = () => {
    return Object.values(passwordCriteria).every(Boolean);
  };

  const handleRegister = async () => {
    if (!isPasswordValid()) {
      Alert.alert('Error', 'La contraseña no cumple con los criterios de seguridad.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones.');
      return;
    }

    const formData = {
      name,
      email,
      password,
      restaurantName,
      phoneNumber,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/users/register`,
        formData
      );

      Alert.alert(
        'Registro Exitoso',
        'Verifica tu correo electrónico para activar tu cuenta.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Error en el registro. Por favor, intenta nuevamente.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const response = await axios.post(`${API_URL}/api/users/google-login`, {
        token: userInfo.idToken,
      });

      const { token } = response.data;
      await AsyncStorage.setItem('authToken', token);

      navigation.navigate('Dashboard');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo iniciar/registrar con Google');
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
         <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
                <MaterialIcons name="person-add" size={40} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Registro</Text>
            <Text style={styles.subtitle}>Crea tu cuenta</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

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
              <MaterialIcons name="store" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre del restaurante"
                placeholderTextColor="#999"
                value={restaurantName}
                onChangeText={setRestaurantName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Número de teléfono"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  validatePassword(val);
                }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  size={24} 
                  color="#FFD700" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={24} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons 
                  name={showConfirmPassword ? "visibility-off" : "visibility"} 
                  size={24} 
                  color="#FFD700" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.criteriaContainer}>
              <Text style={[styles.criteriaText, passwordCriteria.length && styles.criteriaMet]}>
                {passwordCriteria.length ? '✓' : '•'} Mínimo 8 caracteres
              </Text>
              <Text style={[styles.criteriaText, passwordCriteria.uppercase && styles.criteriaMet]}>
                {passwordCriteria.uppercase ? '✓' : '•'} Una mayúscula
              </Text>
              <Text style={[styles.criteriaText, passwordCriteria.lowercase && styles.criteriaMet]}>
                {passwordCriteria.lowercase ? '✓' : '•'} Una minúscula
              </Text>
              <Text style={[styles.criteriaText, passwordCriteria.number && styles.criteriaMet]}>
                {passwordCriteria.number ? '✓' : '•'} Un número
              </Text>
              <Text style={[styles.criteriaText, passwordCriteria.specialChar && styles.criteriaMet]}>
                {passwordCriteria.specialChar ? '✓' : '•'} Un carácter especial
              </Text>
            </View>
          </View>

          <View style={styles.termsContainer}>
            <Switch
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              trackColor={{ false: '#767577', true: '#FFD700' }}
              thumbColor={termsAccepted ? '#FFA500' : '#f4f3f4'}
            />
            <TouchableOpacity onPress={() => setIsModalOpen(true)}>
              <Text style={styles.termsText}>Acepto los términos y condiciones</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.gradientButton}
                >
                  <MaterialIcons name="person-add" size={24} color="#000" />
                  <Text style={styles.buttonText}>Registrarse</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleGoogleSignUp}>
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
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['#FFA500', '#FFD700']}
            style={[styles.decorativeCircle, styles.bottomCircle]}
          />
        </Animated.View>
        </ScrollView>
      </LinearGradient>

      <TermsModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={() => {
          setIsModalOpen(false);
          setTermsAccepted(true);
        }}
      />
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
    marginTop: height * 0.08,
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
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  criteriaContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  criteriaText: {
    color: '#fff',
    fontSize: 14,
  },
  criteriaMet: {
    color: '#FFD700',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    color: '#FFD700',
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    marginBottom: 15,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  googleButtonText: {
    color: '#fff',
  },
  loader: {
    marginTop: 20,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  link: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
});

export default Register;
