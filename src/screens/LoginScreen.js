// screens/LoginScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    Animated,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Haptics
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- COMPONENTES UI MEJORADOS ---

const FloatingInputField = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default',
    error = null,
    success = false,
    autoComplete = 'off'
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const successAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedIsFocused, {
            toValue: (isFocused || value) ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [animatedIsFocused, isFocused, value]);

    useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
            ]).start();
            
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    }, [error, shakeAnimation]);

    useEffect(() => {
        if (success && !error) {
            Animated.sequence([
                Animated.timing(successAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(successAnimation, { toValue: 0.8, duration: 100, useNativeDriver: true }),
                Animated.timing(successAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        }
    }, [success, error, successAnimation]);

    const labelStyle = {
        position: 'absolute',
        left: 50,
        top: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 8],
        }),
        fontSize: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: ['#888', getBorderColor()],
        }),
        fontWeight: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: ['400', '500'],
        }),
    };

    const getBorderColor = () => {
        if (error) return '#FF6B6B';
        if (success && !error) return '#10B981';
        if (isFocused) return '#FDB813';
        return 'rgba(255, 255, 255, 0.1)';
    };

    const getIconColor = () => {
        if (error) return '#FF6B6B';
        if (success && !error) return '#10B981';
        if (isFocused) return '#FDB813';
        return '#888';
    };

    return (
        <View style={styles.inputWrapper}>
            <Animated.View 
                style={[
                    styles.inputContainer, 
                    { 
                        borderColor: getBorderColor(),
                        transform: [{ translateX: shakeAnimation }]
                    }
                ]}
            >
                <Animated.View style={{ transform: [{ scale: success ? successAnimation : 1 }] }}>
                    <Feather 
                        name={icon} 
                        size={20} 
                        color={getIconColor()} 
                        style={styles.inputIcon} 
                    />
                </Animated.View>
                
                <View style={styles.inputContent}>
                    <Animated.Text style={labelStyle}>
                        {placeholder}
                    </Animated.Text>
                    <TextInput
                        style={[styles.input, { paddingTop: (isFocused || value) ? 22 : 0 }]}
                        value={value}
                        onChangeText={onChangeText}
                        secureTextEntry={secureTextEntry && !isPasswordVisible}
                        keyboardType={keyboardType}
                        autoCapitalize="none"
                        autoComplete={autoComplete}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholderTextColor="transparent"
                    />
                </View>
                
                {secureTextEntry && (
                    <TouchableOpacity 
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeButton}
                    >
                        <Feather 
                            name={isPasswordVisible ? 'eye-off' : 'eye'} 
                            size={20} 
                            color={isFocused ? '#FDB813' : '#888'} 
                        />
                    </TouchableOpacity>
                )}
                
                {success && !secureTextEntry && !error && (
                    <Animated.View style={{ transform: [{ scale: successAnimation }] }}>
                        <Feather name="check-circle" size={20} color="#10B981" />
                    </Animated.View>
                )}
            </Animated.View>
            
            {error && (
                <Animated.View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}
        </View>
    );
};

const SocialButton = ({ icon, text, onPress, loading }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };
    
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            style={styles.socialButton}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
            activeOpacity={0.8}
        >
            <Animated.View 
                style={[
                    styles.socialButtonContent,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <>
                        <MaterialCommunityIcons name={icon} size={20} color="#FFF" />
                        <Text style={styles.socialButtonText}>{text}</Text>
                    </>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const CustomButton = ({ title, onPress, loading, disabled, variant = 'primary', style }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };
    
    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return [styles.secondaryButton, disabled && styles.buttonDisabled];
            default:
                return [styles.primaryButton, disabled && styles.buttonDisabled];
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButtonText;
            default:
                return styles.primaryButtonText;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={1}
        >
            <Animated.View 
                style={[
                    getButtonStyle(),
                    style,
                    { 
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim 
                    }
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={variant === 'primary' ? '#121212' : '#FFF'} />
                ) : (
                    <Text style={getTextStyle()}>{title}</Text>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const BiometricButton = ({ onPress, available }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (available) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            return () => pulseAnimation.stop();
        }
    }, [available, pulseAnim]);

    if (!available) return null;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.biometricContainer}>
            <Animated.View 
                style={[
                    styles.biometricButton,
                    { 
                        transform: [
                            { scale: scaleAnim },
                            { scale: pulseAnim }
                        ] 
                    }
                ]}
            >
                <MaterialCommunityIcons name="fingerprint" size={28} color="#FDB813" />
            </Animated.View>
            <Text style={styles.biometricText}>Usar Touch/Face ID</Text>
        </TouchableOpacity>
    );
};

// --- COMPONENTE PRINCIPAL ---
const LoginScreen = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');
    const [biometricAvailable, setBiometricAvailable] = useState(true); // Simulado

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const headerAnim = useRef(new Animated.Value(-100)).current;
    const formAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Animación de entrada secuencial
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.spring(headerAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(formAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.email.trim()) {
            errors.email = 'El correo electrónico es requerido';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Formato de correo inválido';
        }
        
        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setFormErrors({});

    try {
        // 1. Llamamos a la función login de nuestro AuthContext.
        // Ésta se encarga de llamar a la API, guardar los tokens de forma segura
        // y obtener los datos completos del usuario.
        const loginResponse = await login(formData.email, formData.password);

        // 2. Revisamos el 'status' que devuelve el endpoint de login
        const userStatus = loginResponse.status;
        
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // 3. Lógica de Redirección Inteligente
        if (!userStatus.hasPlan) {
            // Si no tiene plan, lo mandamos a seleccionar uno.
            navigation.replace('PlanSelection');
        } else if (!userStatus.hasRestaurant) {
            // Si tiene plan pero no ha configurado su restaurante, lo mandamos a configurarlo.
            navigation.replace('RestaurantSetup');
        } else {
            // Si tiene todo, lo mandamos al dashboard principal.
            navigation.replace('Dashboard');
        }

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Credenciales inválidas o error de conexión.';
        setFormErrors({ general: errorMessage });
        
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    } finally {
        setLoading(false);
    }
};

    const handleSocialLogin = async (provider) => {
        setSocialLoading(provider);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`${provider} login simulado`);
            
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            navigation.replace('Dashboard');
        } catch (error) {
            console.error(`Error ${provider} login:`, error);
        } finally {
            setSocialLoading('');
        }
    };

    const handleBiometric = async () => {
        try {
            console.log('Autenticación biométrica simulada');
            
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            navigation.replace('Dashboard');
        } catch (error) {
            console.error('Error biometric:', error);
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
        if (formErrors.general) {
            setFormErrors(prev => ({ ...prev, general: null }));
        }
    };

    const isFormValid = formData.email && formData.password && Object.keys(formErrors).length === 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            
            <LinearGradient
                colors={['#1a1a1a', '#121212', '#0a0a0a']}
                locations={[0, 0.6, 1]}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View 
                            style={[
                                styles.container,
                                { opacity: fadeAnim }
                            ]}
                        >
                            {/* Header */}
                            <TouchableOpacity 
                                style={styles.backButton} 
                                onPress={() => navigation.goBack()}
                            >
                                <Feather name="arrow-left" size={24} color="#FDB813" />
                            </TouchableOpacity>

                            <Animated.View 
                                style={[
                                    styles.headerContainer,
                                    { transform: [{ translateY: headerAnim }] }
                                ]}
                            >
                                <View style={styles.logoContainer}>
                                    <View style={styles.logoBackground}>
                                        <MaterialCommunityIcons name="restaurant" size={32} color="#FDB813" />
                                    </View>
                                </View>
                                
                                <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
                                <Text style={styles.welcomeSubtitle}>
                                    Inicia sesión para acceder a tu cuenta
                                </Text>
                            </Animated.View>

                            {/* Form */}
                            <Animated.View 
                                style={[
                                    styles.formContainer,
                                    { transform: [{ translateY: formAnim }] }
                                ]}
                            >
                                <View style={styles.inputsContainer}>
                                    <FloatingInputField
                                        icon="mail"
                                        placeholder="Correo electrónico"
                                        value={formData.email}
                                        onChangeText={(value) => updateFormData('email', value)}
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        error={formErrors.email}
                                        success={formData.email.length > 0 && validateEmail(formData.email)}
                                    />
                                    
                                    <FloatingInputField
                                        icon="lock"
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        onChangeText={(value) => updateFormData('password', value)}
                                        secureTextEntry
                                        autoComplete="password"
                                        error={formErrors.password}
                                        success={formData.password.length >= 6}
                                    />
                                </View>

                                {formErrors.general && (
                                    <View style={styles.generalErrorContainer}>
                                        <Feather name="alert-triangle" size={16} color="#FF6B6B" />
                                        <Text style={styles.generalErrorText}>{formErrors.general}</Text>
                                    </View>
                                )}

                                <TouchableOpacity 
                                    onPress={() => navigation.navigate('ForgotPassword')}
                                    style={styles.forgotPasswordContainer}
                                >
                                    <Text style={styles.forgotPasswordText}>
                                        ¿Olvidaste tu contraseña?
                                    </Text>
                                </TouchableOpacity>

                                <CustomButton
                                    title="Iniciar Sesión"
                                    onPress={handleLogin}
                                    loading={loading}
                                    disabled={!isFormValid}
                                    style={styles.loginButton}
                                />

                                {/* Biometric Authentication */}
                                <BiometricButton
                                    onPress={handleBiometric}
                                    available={biometricAvailable}
                                />

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>O continúa con</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <View style={styles.socialContainer}>
                                    <SocialButton
                                        icon="google"
                                        text="Google"
                                        onPress={() => handleSocialLogin('google')}
                                        loading={socialLoading === 'google'}
                                    />
                                    <SocialButton
                                        icon="apple"
                                        text="Apple"
                                        onPress={() => handleSocialLogin('apple')}
                                        loading={socialLoading === 'apple'}
                                    />
                                </View>
                            </Animated.View>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <TouchableOpacity 
                                    onPress={() => navigation.navigate('Register')}
                                    style={styles.registerContainer}
                                >
                                    <Text style={styles.footerText}>
                                        ¿No tienes cuenta?{' '}
                                        <Text style={styles.linkText}>Regístrate aquí</Text>
                                    </Text>
                                </TouchableOpacity>
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
        backgroundColor: '#121212',
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        minHeight: screenHeight - 100,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        left: 24,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 80,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(253, 184, 19, 0.2)',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 32,
    },
    inputsContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minHeight: 64,
    },
    inputIcon: {
        marginRight: 12,
    },
    inputContent: {
        flex: 1,
        position: 'relative',
    },
    input: {
        color: '#FFFFFF',
        fontSize: 16,
        paddingVertical: 8,
    },
    eyeButton: {
        padding: 4,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginLeft: 6,
    },
    generalErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    generalErrorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginLeft: 8,
        textAlign: 'center',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#FDB813',
        fontSize: 14,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#FDB813',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FDB813',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loginButton: {
        marginBottom: 24,
    },
    biometricContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    biometricButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(253, 184, 19, 0.3)',
        marginBottom: 8,
    },
    biometricText: {
        color: '#FDB813',
        fontSize: 12,
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
        color: '#A0A0A0',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
    },
    socialButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    socialButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontWeight: '500',
        fontSize: 14,
    },
    footer: {
        alignItems: 'center',
    },
    registerContainer: {
        paddingVertical: 16,
    },
    footerText: {
        color: '#A0A0A0',
        fontSize: 14,
        textAlign: 'center',
    },
    linkText: {
        color: '#FDB813',
        fontWeight: 'bold',
    },
});

export default LoginScreen;