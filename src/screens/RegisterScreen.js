import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Alert,
    TextInput,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- CORRECCIÓN IMPORTANTE
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Habilitar animaciones de layout para Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- COMPONENTES UI ---

const ModernInput = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, error, onFocus, onBlur }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <View style={{ marginBottom: 16 }}>
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                error && styles.inputError
            ]}>
                <Feather name={icon} size={20} color={error ? "#EF4444" : (isFocused ? "#FDB813" : "#666")} style={{ marginRight: 12 }} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#666"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => { setIsFocused(true); if(onFocus) onFocus(); }}
                    onBlur={() => { setIsFocused(false); if(onBlur) onBlur(); }}
                    // cursorColor solo funciona en Android API 29+, usamos selectionColor para compatibilidad general
                    selectionColor="#FDB813" 
                />
                {error && <Feather name="alert-circle" size={20} color="#EF4444" />}
                {!error && value.length > 0 && !secureTextEntry && (
                    <Feather name="check-circle" size={20} color="#10B981" />
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    
    const criteria = [
        { label: '8+ caracteres', valid: password.length >= 8 },
        { label: 'Número', valid: /\d/.test(password) },
        { label: 'Mayúscula', valid: /[A-Z]/.test(password) },
    ];
    
    const strength = criteria.filter(c => c.valid).length;
    const colors = ['#EF4444', '#F59E0B', '#10B981']; 
    
    // CORRECCIÓN: Usamos LayoutAnimation en lugar de Animated para el ancho
    // Esto evita el error "Expected static flag was missing"
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [strength]);

    return (
        <View style={styles.passwordStrengthContainer}>
            <View style={styles.strengthBarBg}>
                <View 
                    style={[
                        styles.strengthBarFill, 
                        { 
                            width: `${(strength / 3) * 100}%`, // Ancho simple
                            backgroundColor: colors[strength - 1] || '#333'
                        }
                    ]} 
                />
            </View>
            <View style={styles.criteriaRow}>
                {criteria.map((c, i) => (
                    <Text key={i} style={[styles.criteriaText, c.valid && styles.criteriaTextValid]}>
                        {c.valid ? '✓ ' : '○ '} {c.label}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const SocialButton = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.socialButton} onPress={onPress} activeOpacity={0.8}>
        <MaterialCommunityIcons name={icon} size={24} color="white" />
        {text && <Text style={styles.socialButtonText}>{text}</Text>}
    </TouchableOpacity>
);

// --- PANTALLA PRINCIPAL ---

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { register } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        restaurantName: '',
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Tu nombre es requerido";
        // Regex robusto para email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email.trim()) newErrors.email = "El correo es requerido";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Correo inválido";
        
        if (!formData.password) newErrors.password = "La contraseña es requerida";
        else if (formData.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
        
        if (!formData.restaurantName.trim()) newErrors.restaurantName = "El nombre de tu negocio es requerido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) {
            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setIsLoading(true);
        setErrors({}); 

        try {
            const payload = {
                name: formData.name,
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
                restaurantName: formData.restaurantName,
                phoneNumber: ''
            };

            await register(payload);

            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // CORRECCIÓN PANTALLA NEGRA:
            // Al hacer replace, esta pantalla se desmonta. NO debemos llamar a setIsLoading(false) después.
            navigation.replace('Plans');

        } catch (error) {
            // Solo logueamos en sistema, no mostramos error feo al usuario
            console.log('[RegisterSystem] Error:', error.message);

            let userMessage = 'Ocurrió un problema inesperado. Por favor intenta de nuevo.';
            
            if (error.response?.status === 409) {
                userMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
            } else if (error.response?.data?.message) {
                userMessage = error.response.data.message;
            }

            Alert.alert('No pudimos crear tu cuenta', userMessage);
            
            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
            // Solo desactivamos loading si HUBO error (la pantalla sigue viva)
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Header */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Empieza Gratis</Text>
                        <Text style={styles.subtitle}>Crea tu cuenta en segundos y digitaliza tu restaurante hoy mismo.</Text>
                    </View>

                    {/* Formulario */}
                    <View style={styles.form}>
                        <ModernInput 
                            icon="user" 
                            placeholder="Tu Nombre Completo" 
                            value={formData.name}
                            onChangeText={(t) => setFormData({...formData, name: t})}
                            autoCapitalize="words"
                            error={errors.name}
                        />

                        <ModernInput 
                            icon="coffee" 
                            placeholder="Nombre de tu Restaurante" 
                            value={formData.restaurantName}
                            onChangeText={(t) => setFormData({...formData, restaurantName: t})}
                            autoCapitalize="words"
                            error={errors.restaurantName}
                        />

                        <ModernInput 
                            icon="mail" 
                            placeholder="Correo Electrónico" 
                            value={formData.email}
                            onChangeText={(t) => setFormData({...formData, email: t})}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <View>
                            <ModernInput 
                                icon="lock" 
                                placeholder="Contraseña" 
                                value={formData.password}
                                onChangeText={(t) => setFormData({...formData, password: t})}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                error={errors.password}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <PasswordStrength password={formData.password} />

                        <TouchableOpacity 
                            style={[styles.submitButton, isLoading && styles.buttonDisabled]} 
                            onPress={handleRegister}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FDB813', '#F59E0B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Crear Cuenta</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            Al registrarte, aceptas nuestros <Text style={styles.link}>Términos</Text> y <Text style={styles.link}>Privacidad</Text>.
                        </Text>

                        <View style={styles.divider}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>o regístrate con</Text>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialContainer}>
                            <SocialButton icon="google" onPress={() => {}} />
                            <SocialButton icon="apple" onPress={() => {}} />
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 40,
    },
    backButton: {
        marginTop: 10,
        marginBottom: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        lineHeight: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 16,
        height: 56,
    },
    inputFocused: {
        borderColor: '#FDB813',
        backgroundColor: '#1E1E1E',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        height: '100%',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    passwordStrengthContainer: {
        marginBottom: 24,
    },
    strengthBarBg: {
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    criteriaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    criteriaText: {
        color: '#666',
        fontSize: 12,
    },
    criteriaTextValid: {
        color: '#10B981', // Verde
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 56,
        marginBottom: 16,
        shadowColor: '#FDB813',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 30,
    },
    link: {
        color: '#FDB813',
        textDecorationLine: 'underline',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#666',
        marginHorizontal: 16,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 40,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    loginLink: {
        color: '#FDB813',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;