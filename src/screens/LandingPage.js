// LandingPage.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Icono principal */}
      <MaterialIcons name="restaurant-menu" size={80} color="#FFD700" style={styles.icon} />
      
      {/* Título */}
      <Text style={styles.title}>NextManager</Text>
      
      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Monitorea tus ventas en tiempo real desde SoftRestaurant
      </Text>
      
      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <FontAwesome5 name="user-plus" size={16} color="#000" />
          <Text style={styles.buttonText}>Regístrate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <FontAwesome5 name="sign-in-alt" size={16} color="#000" />
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
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
    backgroundColor: '#1a1a1a', // Fondo oscuro para diseño moderno
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    color: '#FFD700', // Color dorado para destacar
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700', // Color dorado para consistencia
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5, // Sombra para Android
  },
  buttonText: {
    marginLeft: 8,
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LandingPage;
