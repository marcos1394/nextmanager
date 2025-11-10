// screens/ContactScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    ScrollView,
    Linking,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    Alert,
    KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../hooks/useAuth'; // Para saber si el usuario está logueado
import { sendContactForm } from '../services/api';
const { width } = Dimensions.get('window');

// --- COMPONENTES MEJORADOS ---
const AnimatedContactRow = ({ icon, title, value, onPress, delay = 0, type = 'default' }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(30);
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = new Animated.Value(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const getIconColor = () => {
        switch (type) {
            case 'email': return '#4ADE80';
            case 'phone': return '#60A5FA';
            case 'whatsapp': return '#25D366';
            default: return '#FDB813';
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'email': return 'rgba(74, 222, 128, 0.1)';
            case 'phone': return 'rgba(96, 165, 250, 0.1)';
            case 'whatsapp': return 'rgba(37, 211, 102, 0.1)';
            default: return 'rgba(253, 184, 19, 0.1)';
        }
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={[
                    styles.contactRow,
                    { shadowOpacity: isPressed ? 0.1 : 0.2 }
                ]}
            >
                <BlurView intensity={20} tint="dark" style={styles.contactRowBlur}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        style={styles.contactRowGradient}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
                            <Feather name={icon} size={24} color={getIconColor()} />
                        </View>
                        <View style={styles.contactRowContent}>
                            <Text style={styles.contactRowTitle}>{title}</Text>
                            <Text style={styles.contactRowValue}>{value}</Text>
                        </View>
                        <View style={styles.chevronContainer}>
                            <Feather name="chevron-right" size={20} color="#6B7280" />
                        </View>
                    </LinearGradient>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const AnimatedFormInput = ({ placeholder, multiline = false, value, onChangeText, delay = 0 }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(20);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setHasValue(value && value.length > 0);
    }, [value]);

    return (
        <Animated.View
            style={[
                styles.inputContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <BlurView intensity={15} tint="dark" style={styles.inputBlur}>
                <LinearGradient
                    colors={isFocused 
                        ? ['rgba(253, 184, 19, 0.1)', 'rgba(253, 184, 19, 0.05)']
                        : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                    }
                    style={[
                        styles.inputGradient,
                        multiline && styles.textAreaGradient
                    ]}
                >
                    <TextInput
                        style={[
                            styles.formInput,
                            multiline && styles.textArea,
                            isFocused && styles.inputFocused
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor="#6B7280"
                        multiline={multiline}
                        numberOfLines={multiline ? 4 : 1}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </LinearGradient>
            </BlurView>
            {isFocused && (
                <View style={styles.inputIndicator} />
            )}
        </Animated.View>
    );
};

const AnimatedSubmitButton = ({ onPress, loading = false }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = new Animated.Value(1);
    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.submitButtonContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={loading}
                style={[
                    styles.submitButton,
                    { shadowOpacity: isPressed ? 0.2 : 0.4 }
                ]}
            >
                <LinearGradient
                    colors={['#FDB813', '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitButtonGradient}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <MaterialIcons name="hourglass-empty" size={20} color="#000000" />
                            <Text style={styles.submitButtonText}>Enviando...</Text>
                        </View>
                    ) : (
                        <View style={styles.submitButtonContent}>
                            <MaterialIcons name="send" size={20} color="#000000" />
                            <Text style={styles.submitButtonText}>Enviar mensaje</Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * ContactScreen Mejorado - Centro de soporte premium
 * 
 * Mejoras implementadas:
 * 1. Diseño glassmorphism para formularios y tarjetas de contacto
 * 2. Animaciones fluidas y microinteracciones profesionales
 * 3. Estados de focus mejorados en inputs
 * 4. Validación visual y feedback táctil
 * 5. Iconografía contextual por tipo de contacto
 * 6. Mejor jerarquía visual y espaciado
 * 7. Estados de carga en el botón de envío
 * 8. Header rediseñado con blur effect
 */
const ContactScreen = ({ navigation }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth(); // <-- AÑADE ESTA LÍNEA

    const contentAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

   const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
        Alert.alert(
            'Campos requeridos',
            'Por favor completa el asunto y el mensaje antes de enviar.',
        );
        return;
    }

    setLoading(true);
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
        // 1. Preparamos el payload (cuerpo de la petición)
        const contactData = {
            subject,
            message,
            // Incluimos la información del usuario si está logueado
            userInfo: user ? { 
                id: user.profile.id, 
                email: user.profile.email,
                name: user.profile.name
            } : null
        };

        // 2. Llamamos a la función limpia de nuestra API
        const response = await sendContactForm(contactData);

        if (!response.success) {
            // Maneja un error devuelto por el backend
            throw new Error(response.message || 'No se pudo enviar el mensaje.');
        }
        
        // 3. Si todo sale bien, mostramos la alerta de éxito
        setLoading(false);
        Alert.alert(
            '¡Mensaje enviado!',
            'Gracias por contactarnos. Te responderemos en las próximas 24 horas.',
            [{
                text: 'Perfecto',
                onPress: () => {
                    setSubject('');
                    setMessage('');
                    navigation.goBack();
                }
            }]
        );

    } catch (error) {
        setLoading(false);
        const errorMessage = error.message || 'Hubo un problema al enviar tu mensaje.';
        Alert.alert('Error', errorMessage);
    }
};

    const handleContactPress = (type, value) => {
        if (Platform.OS === 'ios') {
            const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
            impactAsync(ImpactFeedbackStyle.Light);
        }

        switch (type) {
            case 'email':
                Linking.openURL(`mailto:${value}`);
                break;
            case 'phone':
                Linking.openURL(`tel:${value.replace(/\D/g, '')}`);
                break;
            case 'whatsapp':
                Linking.openURL(`whatsapp://send?phone=52${value.replace(/\D/g, '')}`);
                break;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <LinearGradient 
                colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header mejorado */}
                <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Centro de soporte</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                </BlurView>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={styles.keyboardView}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            style={[
                                styles.content,
                                { opacity: contentAnim }
                            ]}
                        >
                            {/* Sección del formulario */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <MaterialIcons name="message" size={24} color="#FDB813" />
                                    <Text style={styles.sectionTitle}>Envíanos un mensaje</Text>
                                </View>
                                <Text style={styles.sectionSubtitle}>
                                    Te responderemos en menos de 24 horas
                                </Text>
                                
                                <View style={styles.formContainer}>
                                    <AnimatedFormInput
                                        placeholder="Asunto del mensaje"
                                        value={subject}
                                        onChangeText={setSubject}
                                        delay={100}
                                    />
                                    
                                    <AnimatedFormInput
                                        placeholder="Describe tu consulta o problema..."
                                        multiline={true}
                                        value={message}
                                        onChangeText={setMessage}
                                        delay={200}
                                    />
                                    
                                    <AnimatedSubmitButton 
                                        onPress={handleSubmit}
                                        loading={loading}
                                    />
                                </View>
                            </View>

                            {/* Divisor con estilo */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>o</Text>
                                <View style={styles.dividerLine} />
                            </View>
                            
                            {/* Sección de contacto directo */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <MaterialIcons name="support-agent" size={24} color="#4ADE80" />
                                    <Text style={styles.sectionTitle}>Contacto directo</Text>
                                </View>
                                <Text style={styles.sectionSubtitle}>
                                    Comunícate con nosotros inmediatamente
                                </Text>
                                
                                <View style={styles.contactOptionsContainer}>
                                    <AnimatedContactRow 
                                        icon="mail" 
                                        title="Correo electrónico" 
                                        value="soporte@nextmanager.com.mx"
                                        type="email"
                                        onPress={() => handleContactPress('email', 'soporte@nextmanager.com.mx')}
                                        delay={300}
                                    />
                                    
                                    <AnimatedContactRow 
                                        icon="phone" 
                                        title="Llamada telefónica" 
                                        value="+52 614 215 20 82"
                                        type="phone"
                                        onPress={() => handleContactPress('phone', '6142152082')}
                                        delay={400}
                                    />
                                    
                                    <AnimatedContactRow 
                                        icon="message-circle" 
                                        title="WhatsApp" 
                                        value="Mensaje directo"
                                        type="whatsapp"
                                        onPress={() => handleContactPress('whatsapp', '6142152082')}
                                        delay={500}
                                    />
                                </View>
                            </View>

                            {/* Footer informativo */}
                            <View style={styles.footer}>
                                <MaterialIcons name="schedule" size={16} color="#6B7280" />
                                <Text style={styles.footerText}>
                                    Horario de atención: Lunes a Viernes, 9:00 AM - 6:00 PM (CST)
                                </Text>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    gradient: {
        flex: 1,
    },
    headerBlur: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    headerSpacer: {
        width: 44,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    content: {
        paddingTop: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 12,
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 15,
        color: '#9CA3AF',
        marginBottom: 24,
        lineHeight: 22,
    },
    formContainer: {
        gap: 16,
    },
    inputContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    inputBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputGradient: {
        padding: 20,
        minHeight: 56,
    },
    textAreaGradient: {
        minHeight: 120,
    },
    formInput: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    textArea: {
        textAlignVertical: 'top',
        minHeight: 80,
    },
    inputFocused: {
        color: '#FFFFFF',
    },
    inputIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#FDB813',
        borderRadius: 1,
    },
    submitButtonContainer: {
        marginTop: 8,
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FDB813',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    submitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 17,
        fontWeight: '600',
        marginLeft: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#6B7280',
        fontSize: 14,
        marginHorizontal: 20,
    },
    contactOptionsContainer: {
        gap: 16,
    },
    contactRow: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    contactRowBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    contactRowGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactRowContent: {
        flex: 1,
        marginLeft: 16,
    },
    contactRowTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    contactRowValue: {
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 20,
    },
    chevronContainer: {
        marginLeft: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 13,
        marginLeft: 8,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default ContactScreen;