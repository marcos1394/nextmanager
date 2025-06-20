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
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- SUBCOMPONENTES DE UI ---

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    return (
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
            <Feather name={icon} size={20} color={isFocused ? '#FDB813' : '#888'} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!isPasswordVisible}
                keyboardType={keyboardType}
                autoCapitalize="none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {secureTextEntry && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const SocialButton = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
        <Text style={styles.socialButtonText}>{text}</Text>
    </TouchableOpacity>
);

/**
 * LoginScreen - Rediseñada para una experiencia móvil superior.
 * * Estrategia de UX/UI:
 * 1.  Diseño Limpio y Enfocado: Se elimina el desorden visual (gradientes excesivos, círculos) para
 * centrar la atención en la tarea principal: iniciar sesión. El uso generoso del espacio en blanco
 * y una tipografía clara mejoran la legibilidad.
 * 2.  Formulario UX-First: Se introducen mejoras críticas de usabilidad como la visibilidad de la
 * contraseña (icono de ojo) y mensajes de error en línea no disruptivos, en lugar de alertas.
 * 3.  Componentes Modernos y Coherentes: Los botones siguen una jerarquía clara. El botón primario
 * tiene un color sólido y llamativo, mientras que los botones sociales son reconocibles y consistentes.
 * 4.  Adaptabilidad Móvil: El uso de `KeyboardAvoidingView` y `ScrollView` asegura que la interfaz
 * funcione perfectamente en diferentes tamaños de pantalla, evitando que el teclado oculte los campos.
 */
const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, bounciness: 5, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = () => {
        setError('');
        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        setLoading(true);
        // --- LÓGICA SIMULADA ---
        setTimeout(() => {
            if (email.toLowerCase() === 'test@nextmanager.com' && password === '123456') {
                console.log('Login exitoso (simulado)');
                navigation.navigate('Dashboard'); // Navega a tu pantalla de dashboard
            } else {
                setError('El correo o la contraseña son incorrectos.');
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Feather name="arrow-left" size={24} color="#FDB813" />
                            </TouchableOpacity>

                            <View style={styles.headerContainer}>
                                <Text style={styles.title}>Bienvenido de Nuevo</Text>
                                <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
                            </View>

                            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                                <InputField
                                    icon="mail"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                />
                                <InputField
                                    icon="lock"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />

                                {error && <Text style={styles.errorText}>{error}</Text>}

                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#121212" />
                                    ) : (
                                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                    )}
                                </TouchableOpacity>

                                <Text style={styles.dividerText}>O inicia sesión con</Text>

                                <View style={styles.socialContainer}>
                                    <SocialButton icon="google" text="Google" onPress={() => console.log('Google Sign-In (Simulado)')} />
                                    <SocialButton icon="apple" text="Apple" onPress={() => console.log('Apple Sign-In (Simulado)')} />
                                </View>

                                <View style={styles.footer}>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={styles.footerText}>
                                            ¿No tienes una cuenta? <Text style={styles.linkText}>Regístrate</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
    backButton: { position: 'absolute', top: 10, left: 0, padding: 10 },
    headerContainer: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold' },
    subtitle: { fontSize: 16, color: '#A9A9A9', marginTop: 8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputContainerFocused: {
        borderColor: '#FDB813',
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 },
    errorText: { color: '#FF6B6B', textAlign: 'center', marginBottom: 12 },
    forgotPasswordText: { color: '#FDB813', textAlign: 'right', marginBottom: 24, fontSize: 14, fontWeight: '500' },
    loginButton: { backgroundColor: '#FDB813', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    loginButtonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
    dividerText: { color: '#A9A9A9', textAlign: 'center', marginVertical: 24 },
    socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: 16,
        borderRadius: 12,
    },
    socialButtonText: { color: '#FFFFFF', marginLeft: 10, fontWeight: '500' },
    footer: { marginTop: 32, alignItems: 'center' },
    footerText: { color: '#A9A9A9', fontSize: 14 },
    linkText: { color: '#FDB813', fontWeight: 'bold' },
});

export default LoginScreen;
