import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TermsModal = ({ isVisible, onClose, onAccept }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      setScrollProgress(0);
      setIsScrolledToEnd(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [isVisible]);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const { y } = contentOffset;
    const { height: contentHeight } = contentSize;
    const { height: layoutHeight } = layoutMeasurement;
    
    const scrolled = (y / (contentHeight - layoutHeight)) * 100;
    setScrollProgress(scrolled);
    
    if (y + layoutHeight >= contentHeight - 5) {
      setIsScrolledToEnd(true);
    } else {
      setIsScrolledToEnd(false);
    }
  };

  const progressBarWidth = (width - 48) * (scrollProgress / 100);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#FFD700" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <MaterialIcons name="description" size={28} color="#FFD700" />
              <Text style={styles.title}>Términos y Condiciones</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={[styles.progressBar, { width: progressBarWidth }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.paragraph}>
              Te pedimos leer cuidadosamente los siguientes Términos y Condiciones antes de utilizar
              la aplicación web <Text style={styles.highlight}>NEXFACTURA</Text> (en adelante, la "Aplicación"), 
              un panel de autofacturación diseñado para restaurantes y otros establecimientos de consumo.
            </Text>

            <Text style={styles.sectionTitle}>I. Propiedad Intelectual</Text>
            <Text style={styles.paragraph}>
              Todos los derechos de propiedad intelectual relacionados con el contenido, diseño y
              desarrollo de NEXFACTURA son propiedad exclusiva de <Text style={styles.highlight}>NEXTECH</Text>.
            </Text>

            <Text style={styles.sectionTitle}>II. Uso del Servicio</Text>
            <Text style={styles.paragraph}>
              NEXFACTURA está diseñada para que los clientes de restaurantes puedan generar sus
              facturas de manera sencilla. Al utilizar la Aplicación, te comprometes a:
            </Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <MaterialIcons name="check-circle" size={20} color="#FFD700" />
                <Text style={styles.listItemText}>
                  No realizar modificaciones no autorizadas en el sistema o en la base de datos.
                </Text>
              </View>
              <View style={styles.listItem}>
                <MaterialIcons name="check-circle" size={20} color="#FFD700" />
                <Text style={styles.listItemText}>
                  No utilizar la Aplicación con fines fraudulentos o para actividades contrarias a la ley.
                </Text>
              </View>
              <View style={styles.listItem}>
                <MaterialIcons name="check-circle" size={20} color="#FFD700" />
                <Text style={styles.listItemText}>
                  Proporcionar datos verídicos para la generación de facturas.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>III. Cuentas de Usuario</Text>
            <Text style={styles.paragraph}>
              Para utilizar NEXFACTURA, es posible que debas crear una cuenta de usuario. Al crear una 
              Cuenta, te comprometes a proporcionar información precisa y mantener la confidencialidad 
              de tu contraseña.
            </Text>

            <Text style={styles.sectionTitle}>XIV. Misceláneos</Text>
            <Text style={styles.paragraph}>
              Si tienes alguna duda sobre estos Términos y Condiciones, puedes contactarnos a través
              de <Text style={styles.highlight}>soporte@nextechsolutions.com.mx</Text> o al teléfono{' '}
              <Text style={styles.highlight}>614-215-20-82</Text>.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.footerButton} 
              onPress={onClose}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF4949']}
                style={styles.gradientButton}
              >
                <MaterialIcons name="close" size={24} color="#fff" />
                <Text style={styles.buttonText}>Cancelar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerButton, !isScrolledToEnd && styles.disabled]}
              onPress={onAccept}
              disabled={!isScrolledToEnd}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.gradientButton}
                opacity={!isScrolledToEnd ? 0.5 : 1}
              >
                <MaterialIcons name="check" size={24} color="#000" />
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {!isScrolledToEnd && (
            <Animated.View style={styles.scrollHintContainer}>
              <MaterialIcons name="keyboard-arrow-down" size={36} color="#FFD700" />
            </Animated.View>
          )}
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 10,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
  highlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listItemText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  scrollHintContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TermsModal;