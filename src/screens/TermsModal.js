// components/TermsModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';

// --- SUBCOMPONENTES ---
const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.paragraph}>{children}</Text>
    </View>
);

const ListItem = ({ children }) => (
    <View style={styles.listItem}>
        <Feather name="check-circle" size={16} color="#FDB813" style={{ marginTop: 4 }}/>
        <Text style={styles.listItemText}>{children}</Text>
    </View>
);


/**
 * TermsModal - Refinado para una legibilidad y experiencia de usuario superiores.
 * * Estrategia de UX/UI:
 * 1.  Legibilidad Optimizada: El foco principal del rediseño es la tipografía. Se aumenta el
 * interlineado y el espaciado para hacer que el denso texto legal sea más fácil de leer.
 * 2.  Diseño Limpio y Enfocado: Se elimina el exceso de gradientes, usando colores sólidos del tema
 * para el fondo y reservando el color de acento para las acciones importantes. Esto crea una
 * interfaz más tranquila y profesional.
 * 3.  Jerarquía de Botones Clara: El botón "Aceptar" (primario) tiene un diseño sólido y llamativo,
 * mientras que el botón "Cancelar" (secundario) tiene un diseño más sutil. Esto guía al usuario.
 * 4.  Feedback Sutil y Útil: La barra de progreso y el indicador para hacer scroll se mantienen, pero
 * con un diseño más integrado y menos intrusivo, mejorando la experiencia sin distraer.
 */
const TermsModal = ({ isVisible, onClose, onAccept }) => {
    const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
    const scrollProgress = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef(null);

    // Resetear estado cuando se abre el modal
    useEffect(() => {
        if (isVisible) {
            setIsScrolledToEnd(false);
            scrollProgress.setValue(0);
            scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
    }, [isVisible, scrollProgress]);

    const handleScroll = (event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
        
        Animated.timing(scrollProgress, {
            toValue: progress,
            duration: 50,
            useNativeDriver: false, // width/height no soportan native driver
        }).start();

        if (progress >= 0.99) { // Un umbral para asegurar que se active
            setIsScrolledToEnd(true);
        }
    };
    
    const progressBarWidth = scrollProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modalContainer}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.7}
            useNativeDriverForBackdrop
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentContainer}>
                    {/* --- Header --- */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Términos y Condiciones</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="#A9A9A9" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
                    </View>

                    {/* --- Contenido --- */}
                    <ScrollView
                        ref={scrollRef}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <Section title="Acuerdo de Uso">
                            Te pedimos leer cuidadosamente los siguientes Términos y Condiciones antes de utilizar la aplicación <Text style={styles.highlight}>NextManager</Text>. Al usar la aplicación, aceptas voluntariamente estos términos.
                        </Section>
                        <Section title="I. Propiedad Intelectual">
                            Todos los derechos de propiedad intelectual relacionados con el contenido, diseño y desarrollo de NextManager son propiedad exclusiva de <Text style={styles.highlight}>NEXTECH</Text>.
                        </Section>
                        <Section title="II. Uso del Servicio">
                            NextManager está diseñada para la gestión de restaurantes. Al utilizarla, te comprometes a:
                            <ListItem>No realizar modificaciones no autorizadas en el sistema.</ListItem>
                            <ListItem>No utilizar la Aplicación con fines fraudulentos o ilegales.</ListItem>
                            <ListItem>Proporcionar datos verídicos para la generación de facturas.</ListItem>
                        </Section>
                         <Section title="III. Cuentas de Usuario">
                           Al crear una cuenta, te comprometes a proporcionar información precisa y mantener la confidencialidad de tu contraseña. Cualquier actividad realizada desde tu cuenta es tu responsabilidad.
                        </Section>
                        {isScrolledToEnd && (
                            <View style={styles.endOfDocument}>
                                <Feather name="check-square" size={16} color="#10B981" />
                                <Text style={styles.endOfDocumentText}>Has llegado al final del documento.</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* --- Footer con acciones --- */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.primaryButton, !isScrolledToEnd && styles.disabledButton]}
                            onPress={onAccept}
                            disabled={!isScrolledToEnd}
                            activeOpacity={0.7}
                        >
                            <Feather name="check" size={20} color="#121212" />
                            <Text style={styles.primaryButtonText}>He leído y Acepto</Text>
                        </TouchableOpacity>
                    </View>

                    {!isScrolledToEnd && (
                        <View style={styles.scrollHintContainer}>
                             <Feather name="arrow-down" size={24} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { margin: 0, justifyContent: 'flex-end' },
    safeArea: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    contentContainer: { flexShrink: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    closeButton: { padding: 4 },
    progressBarContainer: { height: 3, backgroundColor: '#2a2a2a' },
    progressBar: { height: '100%', backgroundColor: '#FDB813' },
    scrollArea: { maxHeight: '70%' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
    paragraph: { fontSize: 16, color: '#A9A9A9', lineHeight: 26 },
    highlight: { color: '#FDB813', fontWeight: '600' },
    listContainer: { marginTop: 10, marginBottom: 20 },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 8 },
    listItemText: { flex: 1, color: '#A9A9A9', fontSize: 16, marginLeft: 12, lineHeight: 26 },
    endOfDocument: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    endOfDocumentText: { color: '#10B981', fontWeight: '600' },
    scrollHintContainer: {
        position: 'absolute',
        bottom: 100,
        left: '50%',
        marginLeft: -22,
        height: 44,
        width: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        backgroundColor: '#1e1e1e',
    },
    secondaryButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
    secondaryButtonText: { color: '#A9A9A9', fontSize: 16, fontWeight: '600' },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDB813',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    primaryButtonText: { color: '#121212', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#2a2a2a', opacity: 0.8 },
});

export default TermsModal;
