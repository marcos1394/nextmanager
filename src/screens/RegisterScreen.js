// screens/RegisterScreen.js
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- SUBCOMPONENTES DE UI ---

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => {
    // Reutilizamos el componente de InputField de LoginScreen para consistencia
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    return (
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
            <Feather name={icon} size={20} color={isFocused ? '#FDB813' : '#888'} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#888" value={value} onChangeText={onChangeText} secureTextEntry={!isPasswordVisible} keyboardType={keyboardType} autoCapitalize="none" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} />
            {secureTextEntry && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const ProgressStepper = ({ currentStep, totalSteps = 3 }) => (
    <View style={styles.stepperContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
                <View style={[styles.step, index < currentStep && styles.stepActive]}>
                    <Text style={[styles.stepText, index < currentStep && styles.stepTextActive]}>{index + 1}</Text>
                </View>
                {index < totalSteps - 1 && <View style={[styles.stepLine, index < currentStep - 1 && styles.stepLineActive]} />}
            </React.Fragment>
        ))}
    </View>
);

const PasswordCriteriaItem = ({ text, met }) => (
     <View style={styles.criteriaItem}>
        <Feather name={met ? "check-circle" : "circle"} size={14} color={met ? "#10B981" : "#888"} />
        <Text style={[styles.criteriaText, met && styles.criteriaMet]}>{text}</Text>
    </View>
);

/**
 * RegisterScreen - Reimaginada como un asistente de registro guiado (wizard).
 * * Estrategia de UX/UI:
 * 1.  Wizard Multi-Paso: Se divide el formulario largo en 3 pasos manejables (Cuenta, Negocio,
 * Finalizar). Esto reduce la carga cognitiva y hace que el proceso se sienta más rápido y menos intimidante.
 * 2.  Guía Visual de Progreso: Un "stepper" en la parte superior muestra al usuario dónde se encuentra
 * en el proceso, gestionando sus expectativas y motivándolo a completar el registro.
 * 3.  UI Limpia y Enfocada: Cada paso se enfoca en una sola tarea. El diseño es limpio, con una clara
 * jerarquía visual y una estética premium consistente con el resto de la app.
 * 4.  Feedback Interactivo: La validación de la contraseña es visual e instantánea, y los botones
 * se activan condicionalmente, guiando al usuario de forma natural a través del formulario.
 */
const RegisterScreen = () => {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', restaurantName: '', phoneNumber: '', termsAccepted: false });
    const [passwordCriteria, setPasswordCriteria] = useState({ length: false, uppercase: false, number: false });

    // Animaciones
    const stepAnim = useRef(new Animated.Value(0)).current;

    const validatePassword = (value) => {
        setPasswordCriteria({
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
        });
    };

    const runStepAnimation = (direction = 1) => {
        Animated.sequence([
            Animated.timing(stepAnim, { toValue: 50 * direction, duration: 200, useNativeDriver: true }),
            Animated.timing(stepAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };
    
    const nextStep = () => {
        if(currentStep < 3) {
            runStepAnimation(1);
            setCurrentStep(s => s + 1);
        } else {
            handleRegister();
        }
    };
    
    const prevStep = () => {
        if(currentStep > 1) {
            runStepAnimation(-1);
            setCurrentStep(s => s - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleRegister = () => {
        console.log("Registro simulado con datos:", formData);
        alert("¡Registro exitoso! (Simulado)");
        navigation.navigate('Login');
    };

    const isStep1Valid = formData.name && formData.email && Object.values(passwordCriteria).every(Boolean) && formData.password === formData.confirmPassword;
    const isStep2Valid = formData.restaurantName;
    const isStep3Valid = formData.termsAccepted;
    
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <Text style={styles.stepTitle}>Crea tu Cuenta</Text>
                        <InputField icon="user" placeholder="Nombre completo" value={formData.name} onChangeText={val => setFormData({...formData, name: val})} />
                        <InputField icon="mail" placeholder="Correo electrónico" value={formData.email} onChangeText={val => setFormData({...formData, email: val})} keyboardType="email-address"/>
                        <InputField icon="lock" placeholder="Contraseña" value={formData.password} onChangeText={val => { setFormData({...formData, password: val}); validatePassword(val); }} secureTextEntry />
                        <InputField icon="lock" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChangeText={val => setFormData({...formData, confirmPassword: val})} secureTextEntry />
                        <View style={styles.criteriaContainer}>
                            <PasswordCriteriaItem text="Mínimo 8 caracteres" met={passwordCriteria.length} />
                            <PasswordCriteriaItem text="Una mayúscula" met={passwordCriteria.uppercase} />
                            <PasswordCriteriaItem text="Un número" met={passwordCriteria.number} />
                        </View>
                    </>
                );
            case 2:
                return (
                     <>
                        <Text style={styles.stepTitle}>Información de tu Negocio</Text>
                        <InputField icon="coffee" placeholder="Nombre del restaurante" value={formData.restaurantName} onChangeText={val => setFormData({...formData, restaurantName: val})} />
                        <InputField icon="phone" placeholder="Número de teléfono (Opcional)" value={formData.phoneNumber} onChangeText={val => setFormData({...formData, phoneNumber: val})} keyboardType="phone-pad"/>
                    </>
                );
            case 3:
                return (
                     <>
                        <Text style={styles.stepTitle}>Acuerdo y Finalización</Text>
                        <View style={styles.termsContainer}>
                            <TouchableOpacity style={styles.termsRow} onPress={() => setFormData({...formData, termsAccepted: !formData.termsAccepted})}>
                               <View style={[styles.checkbox, formData.termsAccepted && styles.checkboxActive]}>
                                   {formData.termsAccepted && <Feather name="check" size={14} color="#121212" />}
                               </View>
                               <Text style={styles.termsText}>He leído y acepto los </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => alert("Mostrando Términos y Condiciones...")}>
                                <Text style={styles.linkText}>Términos y Condiciones</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );
            default: return null;
        }
    }
    
    let isNextDisabled = false;
    if (currentStep === 1) isNextDisabled = !isStep1Valid;
    if (currentStep === 2) isNextDisabled = !isStep2Valid;
    if (currentStep === 3) isNextDisabled = !isStep3Valid;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                     <View style={styles.header}>
                         <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <ProgressStepper currentStep={currentStep} />
                     </View>
                     <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                        <Animated.View style={{ opacity: stepAnim.interpolate({inputRange:[-50, 0, 50], outputRange:[0,1,0]}), transform: [{ translateX: stepAnim }]}}>
                            {renderStep()}
                        </Animated.View>
                     </ScrollView>
                     <View style={styles.footer}>
                        <TouchableOpacity style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]} onPress={nextStep} disabled={isNextDisabled}>
                            <Text style={styles.nextButtonText}>{currentStep < 3 ? 'Siguiente' : 'Finalizar Registro'}</Text>
                        </TouchableOpacity>
                     </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20, paddingBottom: 10 },
    backButton: { padding: 10, marginRight: 10 },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    step: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2a2a2a' },
    stepActive: { backgroundColor: '#FDB813', borderColor: '#FDB813' },
    stepText: { color: '#888', fontWeight: 'bold' },
    stepTextActive: { color: '#121212' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#2a2a2a' },
    stepLineActive: { backgroundColor: '#FDB813' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
    stepTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 32 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: 'transparent' },
    inputContainerFocused: { borderColor: '#FDB813' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 },
    criteriaContainer: { paddingHorizontal: 8, marginVertical: 8 },
    criteriaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    criteriaText: { color: '#888', marginLeft: 8 },
    criteriaMet: { color: '#10B981' },
    termsContainer: { alignItems: 'center', marginTop: 24, paddingHorizontal: 16 },
    termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8},
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#888', justifyContent: 'center', alignItems: 'center'},
    checkboxActive: { borderColor: '#FDB813', backgroundColor: '#FDB813' },
    termsText: { color: '#A9A9A9', fontSize: 16, marginLeft: 12 },
    linkText: { color: '#FDB813', fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
    footer: { padding: 24, paddingTop: 12, backgroundColor: '#1e1e1e', borderTopWidth: 1, borderTopColor: '#2a2a2a' },
    nextButton: { backgroundColor: '#FDB813', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    nextButtonDisabled: { backgroundColor: '#2a2a2a' },
    nextButtonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
});

export default RegisterScreen;
