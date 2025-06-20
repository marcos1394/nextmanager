// screens/ContactScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const ContactRow = ({ icon, title, value, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.contactRow}>
        <Feather name={icon} size={24} color="#FDB813" />
        <View style={{marginLeft: 16}}>
            <Text style={styles.contactRowTitle}>{title}</Text>
            <Text style={styles.contactRowValue}>{value}</Text>
        </View>
    </TouchableOpacity>
);

const ContactScreen = ({ navigation }) => {
    const handleSubmit = () => {
        alert('Mensaje enviado (simulado). ¡Gracias!');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contactar a Soporte</Text>
                    <View style={{width: 44}}/>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.formTitle}>Envíanos un mensaje</Text>
                    <TextInput style={styles.formInput} placeholder="Asunto" placeholderTextColor="#888"/>
                    <TextInput style={[styles.formInput, styles.textArea]} placeholder="Describe tu problema..." placeholderTextColor="#888" multiline/>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Enviar</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />
                    
                    <Text style={styles.formTitle}>Otras formas de contacto</Text>
                    <View style={styles.contactOptionsContainer}>
                        <ContactRow icon="mail" title="Correo Electrónico" value="soporte@nextmanager.com.mx" onPress={() => Linking.openURL('mailto:soporte@nextmanager.com.mx')} />
                        <ContactRow icon="phone-call" title="Llamada Telefónica" value="614-215-20-82" onPress={() => Linking.openURL('tel:6142152082')} />
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
