// screens/RegisterScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
    Haptics
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// --- IMPORTACIONES ---
import { registerUser } from '../services/api'; // <-- 1. IMPORTA LA FUNCIÓN DE LA API
import * as SecureStore from 'expo-secure-store'; // <-- 2. IMPORTA SECURESTORE
import { useAuth } from '../context/AuthContext'; // <-- 3. IMPORTA EL CONTEXTO (si lo tienes)

const { width: screenWidth } = Dimensions.get('window');

// --- COMPONENTES UI MEJORADOS ---

const InputField = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default',
    error = null,
    success = false 
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;

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

    const labelStyle = {
        position: 'absolute',
        left: 50,
        top: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 8],
        }),
        fontSize: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: ['#888', isFocused ? '#FDB813' : (error ? '#FF6B6B' : success ? '#10B981' : '#888')],
        }),
    };

    const getBorderColor = () => {
        if (error) return '#FF6B6B';
        if (success) return '#10B981';
        if (isFocused) return '#FDB813';
        return 'transparent';
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
                <Feather 
                    name={icon} 
                    size={20} 
                    color={error ? '#FF6B6B' : success ? '#10B981' : (isFocused ? '#FDB813' : '#888')} 
                    style={styles.inputIcon} 
                />
                <View style={styles.inputContent}>
                    <Animated.Text style={labelStyle}>
                        {placeholder}
                    </Animated.Text>
                    <TextInput
                        style={[styles.input, { paddingTop: (isFocused || value) ? 20 : 0 }]}
                        value={value}
                        onChangeText={onChangeText}
                        secureTextEntry={secureTextEntry && !isPasswordVisible}
                        keyboardType={keyboardType}
                        autoCapitalize="none"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholderTextColor="transparent"
                    />
                </View>
                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Feather 
                            name={isPasswordVisible ? 'eye-off' : 'eye'} 
                            size={20} 
                            color={isFocused ? '#FDB813' : '#888'} 
                        />
                    </TouchableOpacity>
                )}
                {success && !secureTextEntry && (
                    <Feather name="check-circle" size={20} color="#10B981" />
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

const ProgressStepper = ({ currentStep, totalSteps = 3 }) => {
    const animatedValues = useRef(
        Array.from({ length: totalSteps }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        animatedValues.forEach((animatedValue, index) => {
            Animated.timing(animatedValue, {
                toValue: index < currentStep ? 1 : 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        });
    }, [currentStep, animatedValues]);

    return (
        <View style={styles.stepperContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                    <Animated.View 
                        style={[
                            styles.step,
                            {
                                backgroundColor: animatedValues[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#2a2a2a', '#FDB813'],
                                }),
                                borderColor: animatedValues[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#2a2a2a', '#FDB813'],
                                }),
                                transform: [{
                                    scale: animatedValues[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 1.1],
                                    }),
                                }]
                            }
                        ]}
                    >
                        <Animated.Text 
                            style={[
                                styles.stepText,
                                {
                                    color: animatedValues[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['#888', '#121212'],
                                    }),
                                }
                            ]}
                        >
                            {index + 1}
                        </Animated.Text>
                    </Animated.View>
                    {index < totalSteps - 1 && (
                        <Animated.View 
                            style={[
                                styles.stepLine,
                                {
                                    backgroundColor: animatedValues[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['#2a2a2a', '#FDB813'],
                                    }),
                                }
                            ]} 
                        />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
};

const PasswordCriteriaItem = ({ text, met, animated = false }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    
    useEffect(() => {
        if (animated && met) {
            Animated.spring(scaleAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            scaleAnim.setValue(1);
        }
    }, [met, animated, scaleAnim]);

    return (
        <Animated.View style={[styles.criteriaItem, { transform: [{ scale: scaleAnim }] }]}>
            <Feather 
                name={met ? "check-circle" : "circle"} 
                size={16} 
                color={met ? "#10B981" : "#666"} 
            />
            <Text style={[styles.criteriaText, met && styles.criteriaMet]}>
                {text}
            </Text>
        </Animated.View>
    );
};

const CustomButton = ({ title, onPress, disabled, loading, style, variant = 'primary' }) => {
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
            activeOpacity={0.8}
        >
            <Animated.View style={[getButtonStyle(), style, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={getTextStyle()}>
                    {title}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// --- COMPONENTE PRINCIPAL ---
const RegisterScreen = () => {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(1);
    const { register } = useAuth(); // <-- AÑADE ESTA LÍNEA
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        restaurantName: '',
        phoneNumber: '',
        termsAccepted: false
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false); // <-- AÑADE ESTADO DE CARGA
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    // Animaciones mejoradas
    const stepAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (value) => {
        const criteria = {
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        };
        setPasswordCriteria(criteria);
        return criteria;
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        switch (step) {
            case 1:
                if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
                if (!formData.email.trim()) newErrors.email = 'El email es requerido';
                else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
                if (!formData.password) newErrors.password = 'La contraseña es requerida';
                else if (!Object.values(passwordCriteria).every(Boolean)) {
                    newErrors.password = 'La contraseña no cumple los requisitos';
                }
                if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                }
                break;
            case 2:
                if (!formData.restaurantName.trim()) {
                    newErrors.restaurantName = 'El nombre del restaurante es requerido';
                }
                break;
            case 3:
                if (!formData.termsAccepted) {
                    newErrors.terms = 'Debes aceptar los términos y condiciones';
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const runStepAnimation = (direction = 1) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(stepAnim, {
                toValue: 50 * direction,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(stepAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                runStepAnimation(1);
                setCurrentStep(s => s + 1);
                if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            } else {
                handleRegister();
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            runStepAnimation(-1);
            setCurrentStep(s => s - 1);
        } else {
            navigation.goBack();
        }
    };

    // Dentro de tu componente RegisterScreen

const handleRegister = async () => {
    // 1. Validación (tu código actual)
    if (!validateStep(3)) {
        return;
    }

    setIsLoading(true); // Activa el estado de carga

    try {
        // 2. Preparación de datos (tu código actual)
        const registrationData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            restaurantName: formData.restaurantName,
            phoneNumber: formData.phoneNumber
        };

        // 3. Llamada al AuthContext (tu código actual)
        await register(registrationData);

        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // 4. Alerta de éxito (tu código actual)
        Alert.alert(
            "¡Registro Exitoso!",
            "Tu cuenta ha sido creada. Ahora, vamos a configurar tu plan.",
            [{ 
                text: "OK", 
                onPress: () => navigation.navigate('Plans')
            }]
        );

    } catch (error) {
        // --- INICIO DE LA CORRECCIÓN PROFESIONAL ---

        // 5. LOGGING (Para tu terminal de Expo)
        // Imprime el error completo y estructurado para que TÚ puedas depurarlo.
        console.error('[handleRegister] Error al registrar usuario:', {
            message: error.message,
            status: error.response?.status,
            backendMessage: error.response?.data?.message,
            data: error.response?.data,
        });

        // 6. MENSAJE PARA EL USUARIO (UX/UI)
        // Define un mensaje amigable por defecto.
        let userFriendlyMessage = 'No pudimos crear tu cuenta. Revisa tu conexión e inténtalo de nuevo.';
        
        // Si el backend envió un mensaje claro (ej. "El correo ya está en uso"), lo usamos.
        if (error.response?.data?.message) {
            userFriendlyMessage = error.response.data.message;
        }

        // Muestra la alerta amigable al usuario.
        Alert.alert("Error de Registro", userFriendlyMessage);
        
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        // --- FIN DE LA CORRECCIÓN ---

    } finally {
        setIsLoading(false); // Desactiva el estado de carga
    }
};

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>Crea tu Cuenta</Text>
                            <Text style={styles.stepSubtitle}>
                                Ingresa tus datos personales para comenzar
                            </Text>
                        </View>
                        
                        <View style={styles.inputsContainer}>
                            <InputField
                                icon="user"
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChangeText={val => {
                                    setFormData({...formData, name: val});
                                    if (errors.name) setErrors({...errors, name: null});
                                }}
                                error={errors.name}
                                success={formData.name.length > 0 && !errors.name}
                            />
                            
                            <InputField
                                icon="mail"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChangeText={val => {
                                    setFormData({...formData, email: val});
                                    if (errors.email) setErrors({...errors, email: null});
                                }}
                                keyboardType="email-address"
                                error={errors.email}
                                success={formData.email.length > 0 && validateEmail(formData.email)}
                            />
                            
                            <InputField
                                icon="lock"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChangeText={val => {
                                    setFormData({...formData, password: val});
                                    validatePassword(val);
                                    if (errors.password) setErrors({...errors, password: null});
                                }}
                                secureTextEntry
                                error={errors.password}
                            />
                            
                            <InputField
                                icon="lock"
                                placeholder="Confirmar contraseña"
                                value={formData.confirmPassword}
                                onChangeText={val => {
                                    setFormData({...formData, confirmPassword: val});
                                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                                }}
                                secureTextEntry
                                error={errors.confirmPassword}
                                success={formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword}
                            />
                        </View>

                        <View style={styles.criteriaContainer}>
                            <Text style={styles.criteriaTitle}>Requisitos de contraseña:</Text>
                            <PasswordCriteriaItem text="Mínimo 8 caracteres" met={passwordCriteria.length} animated />
                            <PasswordCriteriaItem text="Una letra mayúscula" met={passwordCriteria.uppercase} animated />
                            <PasswordCriteriaItem text="Un número" met={passwordCriteria.number} animated />
                            <PasswordCriteriaItem text="Un carácter especial" met={passwordCriteria.special} animated />
                        </View>
                    </View>
                );
                
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>Tu Negocio</Text>
                            <Text style={styles.stepSubtitle}>
                                Cuéntanos sobre tu restaurante
                            </Text>
                        </View>
                        
                        <View style={styles.inputsContainer}>
                            <InputField
                                icon="coffee"
                                placeholder="Nombre del restaurante"
                                value={formData.restaurantName}
                                onChangeText={val => {
                                    setFormData({...formData, restaurantName: val});
                                    if (errors.restaurantName) setErrors({...errors, restaurantName: null});
                                }}
                                error={errors.restaurantName}
                                success={formData.restaurantName.length > 0 && !errors.restaurantName}
                            />
                            
                            <InputField
                                icon="phone"
                                placeholder="Número de teléfono (Opcional)"
                                value={formData.phoneNumber}
                                onChangeText={val => setFormData({...formData, phoneNumber: val})}
                                keyboardType="phone-pad"
                                success={formData.phoneNumber.length > 0}
                            />
                        </View>

                        <View style={styles.businessTips}>
                            <View style={styles.tipItem}>
                                <Feather name="info" size={16} color="#FDB813" />
                                <Text style={styles.tipText}>
                                    Este nombre aparecerá en tu perfil público
                                </Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Feather name="phone" size={16} color="#FDB813" />
                                <Text style={styles.tipText}>
                                    Los clientes podrán contactarte por teléfono
                                </Text>
                            </View>
                        </View>
                    </View>
                );
                
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>Casi Listo</Text>
                            <Text style={styles.stepSubtitle}>
                                Revisa y acepta nuestros términos
                            </Text>
                        </View>

                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Nombre:</Text>
                                <Text style={styles.summaryValue}>{formData.name}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Email:</Text>
                                <Text style={styles.summaryValue}>{formData.email}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Restaurante:</Text>
                                <Text style={styles.summaryValue}>{formData.restaurantName}</Text>
                            </View>
                        </View>

                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={styles.termsRow}
                                onPress={() => setFormData({...formData, termsAccepted: !formData.termsAccepted})}
                            >
                                <View style={[styles.checkbox, formData.termsAccepted && styles.checkboxActive]}>
                                    {formData.termsAccepted && (
                                        <Feather name="check" size={14} color="#121212" />
                                    )}
                                </View>
                                <Text style={styles.termsText}>
                                    He leído y acepto los{' '}
                                    <Text
                                        style={styles.linkText}
                                        onPress={() => {/* Mostrar términos */}}
                                    >
                                        Términos y Condiciones
                                    </Text>
                                    {' '}y la{' '}
                                    <Text
                                        style={styles.linkText}
                                        onPress={() => {/* Mostrar política */}}
                                    >
                                        Política de Privacidad
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                            {errors.terms && (
                                <Text style={styles.termsError}>{errors.terms}</Text>
                            )}
                        </View>
                    </View>
                );
                
            default:
                return null;
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.name && 
                       validateEmail(formData.email) && 
                       Object.values(passwordCriteria).every(Boolean) && 
                       formData.password === formData.confirmPassword;
            case 2:
                return formData.restaurantName.trim();
            case 3:
                return formData.termsAccepted;
            default:
                return false;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            
            <LinearGradient
                colors={['#1a1a1a', '#121212', '#0a0a0a']}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {/* Header mejorado */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <ProgressStepper currentStep={currentStep} totalSteps={3} />
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Contenido principal */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            style={[
                                styles.contentContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateX: stepAnim }]
                                }
                            ]}
                        >
                            {renderStep()}
                        </Animated.View>
                    </ScrollView>

                    {/* Footer con botones */}
                   <View style={styles.footer}>
                    {currentStep > 1 && (
                        <CustomButton
                            title="Anterior"
                            onPress={prevStep}
                            variant="secondary"
                            style={styles.backStepButton}
                            disabled={isLoading} // <-- AÑADIDO: Deshabilitar si está cargando
                        />
                    )}
                    <CustomButton
                        // --- CORRECCIÓN CLAVE ---
                        // Cambia el texto y deshabilita el botón si 'isLoading' es true
                        title={isLoading ? 'Creando Cuenta...' : (currentStep < 3 ? 'Continuar' : 'Crear Cuenta')}
                        onPress={nextStep}
                        disabled={!isStepValid() || isLoading}
                        // --- FIN DE LA CORRECCIÓN ---
                        style={[
                            styles.nextStepButton,
                            currentStep === 1 && styles.fullWidthButton
                        ]}
                    />
                </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerSpacer: {
        width: 40,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 20,
    },
    step: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2a2a2a',
    },
    stepText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#2a2a2a',
        marginHorizontal: 8,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        minHeight: 400,
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    inputsContainer: {
        marginBottom: 24,
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
        borderColor: 'transparent',
        minHeight: 60,
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
    criteriaContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    criteriaTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    criteriaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 2,
    },
    criteriaText: {
        color: '#888',
        marginLeft: 10,
        fontSize: 14,
    },
    criteriaMet: {
        color: '#10B981',
    },
    businessTips: {
        backgroundColor: 'rgba(253, 184, 19, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        color: '#E0E0E0',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    summaryContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    summaryLabel: {
        color: '#A0A0A0',
        fontSize: 14,
        fontWeight: '500',
    },
    summaryValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: 16,
    },
    termsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 16,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxActive: {
        borderColor: '#FDB813',
        backgroundColor: '#FDB813',
    },
    termsText: {
        color: '#E0E0E0',
        fontSize: 15,
        lineHeight: 22,
        marginLeft: 12,
        flex: 1,
    },
    linkText: {
        color: '#FDB813',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    termsError: {
        color: '#FF6B6B',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 16,
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        gap: 12,
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
    backStepButton: {
        flex: 1,
    },
    nextStepButton: {
        flex: 2,
    },
    fullWidthButton: {
        flex: 1,
    },
});

export default RegisterScreen;