// screens/HelpCenterScreen.js
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// --- DATOS DE MUESTRA ---
const helpCategories = [
    { name: 'Primeros Pasos', icon: 'play-circle' },
    { name: 'Facturación', icon: 'credit-card' },
    { name: 'Mi Cuenta', icon: 'user' },
    { name: 'Reportes', icon: 'bar-chart-2' },
    { name: 'Seguridad', icon: 'shield' },
    { name: 'Problemas', icon: 'alert-triangle' },
];

const popularArticles = [
    { title: '¿Cómo configuro mi primer restaurante?' },
    { title: 'No puedo cargar mis archivos CSD, ¿qué hago?' },
    { title: '¿Cómo puedo cambiar mi plan de suscripción?' },
    { title: 'Entendiendo el Dashboard de Operaciones en Vivo' },
];

// --- SUBCOMPONENTES ---
const CategoryCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
        <Feather name={item.icon} size={28} color="#FDB813" />
        <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
);

const ArticleLink = ({ title, onPress }) => (
    <TouchableOpacity style={styles.articleLink} onPress={onPress}>
        <Text style={styles.articleTitle}>{title}</Text>
        <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>
);

/**
 * HelpCenterScreen - Un portal de autoservicio intuitivo y completo.
 * * Estrategia de UX/UI:
 * 1.  Búsqueda como Protagonista: La barra de búsqueda se coloca en una posición prominente, ya que
 * es la herramienta principal para los usuarios que tienen una pregunta específica.
 * 2.  Navegación Visual por Categorías: Las categorías con iconos permiten a los usuarios explorar
 * temas de forma visual y rápida, incluso si no saben qué término exacto buscar.
 * 3.  Acceso Rápido a lo Común: La sección de "Artículos Populares" anticipa las necesidades del
 * usuario y ofrece soluciones a los problemas más frecuentes con un solo toque.
 * 4.  Diseño Limpio y Enfocado: El diseño minimalista y organizado evita abrumar a un usuario
 * que ya podría sentirse frustrado o confundido.
 */
const HelpCenterScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Feather name="life-buoy" size={40} color="#FDB813" />
                        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
                        <Text style={styles.headerSubtitle}>Encuentra respuestas, guías y tutoriales.</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Busca un tema (ej. 'facturación')"
                            placeholderTextColor="#888"
                            style={styles.searchInput}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categorías</Text>
                        <View style={styles.categoryGrid}>
                            {helpCategories.map(cat => <CategoryCard key={cat.name} item={cat} />)}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Artículos Populares</Text>
                        <View style={styles.articlesContainer}>
                            {popularArticles.map((article, index) => (
                                <React.Fragment key={article.title}>
                                    <ArticleLink title={article.title} />
                                    {index < popularArticles.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>
                     <TouchableOpacity style={styles.contactCard} onPress={() => navigation.navigate('Contact')}>
                        <Feather name="send" size={24} color="#FDB813" />
                        <View style={{flex: 1, marginLeft: 16}}>
                            <Text style={styles.contactCardTitle}>¿No encuentras lo que buscas?</Text>
                            <Text style={styles.contactCardSubtitle}>Contacta a nuestro equipo de soporte.</Text>
                        </View>
                        <Feather name="arrow-right" size={20} color="#888" />
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
