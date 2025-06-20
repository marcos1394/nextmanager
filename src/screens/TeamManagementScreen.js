// screens/TeamManagementScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Modal from 'react-native-modal';

// --- DATOS DE MUESTRA Y SIMULACIÓN ---
const initialTeamMembers = [
    { id: 'user_1', name: 'Carlos Mendoza', email: 'carlos.mendoza@elsazon.com', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop', role: 'Propietario', status: 'Activo' },
    { id: 'user_2', name: 'Ana García', email: 'ana.garcia@contador.com', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop', role: 'Contador', status: 'Activo' },
    { id: 'user_3', name: 'invitacion@gerente.com', email: 'invitacion@gerente.com', avatarUrl: null, role: 'Gerente', status: 'Invitación Pendiente' },
];

const roles = [
    { id: 'admin', name: 'Administrador', description: 'Acceso casi total, ideal para gerentes.' },
    { id: 'accountant', name: 'Contador', description: 'Acceso de solo lectura a reportes y facturas.' },
    { id: 'viewer', name: 'Lector', description: 'Acceso de solo lectura al dashboard principal.' },
];

// --- SUBCOMPONENTES ---

const MemberListItem = ({ member }) => {
    const roleColors = {
        'Propietario': { bg: 'rgba(253, 184, 19, 0.1)', text: '#FDB813' },
        'Contador': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6' },
        'Gerente': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981' },
    };
    return (
        <View style={styles.memberCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                {member.avatarUrl ? (
                    <Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}><Feather name="user" size={20} color="#A9A9A9" /></View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
            </View>
            <View style={[styles.roleBadge, {backgroundColor: roleColors[member.role]?.bg || '#2a2a2a'}]}>
                <Text style={[styles.roleText, {color: roleColors[member.role]?.text || '#A9A9A9'}]}>{member.role}</Text>
            </View>
            <TouchableOpacity><Feather name="more-vertical" size={20} color="#888" /></TouchableOpacity>
        </View>
    );
};

const InviteMemberModal = ({ isVisible, onClose }) => {
    const handleInvite = () => {
        alert('Invitación enviada (simulado).');
        onClose();
    };
    return (
        <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modalContainer} useNativeDriverForBackdrop>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Invitar Nuevo Miembro</Text>
                <Text style={styles.modalSubtitle}>La persona recibirá un enlace por correo para unirse a tu equipo.</Text>
                <TextInput style={styles.modalInput} placeholder="Correo electrónico del invitado" placeholderTextColor="#888" keyboardType="email-address" />
                <Text style={styles.modalLabel}>Asignar Rol</Text>
                {/* En una app real, esto podría ser un picker o un selector más elegante */}
                <View style={styles.roleSelector}>
                    <Text style={styles.roleOption}>Administrador</Text>
                </View>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalButtonSecondary} onPress={onClose}><Text style={styles.modalButtonSecondaryText}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleInvite}><Text style={styles.modalButtonPrimaryText}>Enviar Invitación</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

/**
 * TeamManagementScreen - La pieza final para la escalabilidad del negocio.
 * * Estrategia de UX/UI:
 * 1.  Centro de Control Centralizado: La pantalla ofrece una vista clara de todos los miembros del
 * equipo, sus roles y estados, actuando como un único punto de verdad para la gestión de usuarios.
 * 2.  Flujo de Invitación Simple: El proceso de invitar a un nuevo miembro está encapsulado en un
 * modal enfocado, pidiendo solo la información esencial (email y rol) para minimizar la fricción.
 * 3.  Feedback Visual de Roles: El uso de "insignias" (badges) de colores para cada rol permite al
 * propietario identificar rápidamente la jerarquía y permisos de su equipo de un solo vistazo.
 * 4.  Acciones Contextuales: La presencia de un menú de acciones por cada miembro prepara la
 * interfaz para futuras funcionalidades (cambiar rol, eliminar) de una manera limpia y no intrusiva.
 */
const TeamManagementScreen = ({ navigation }) => {
    const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e1e1e', '#121212']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gestión de Equipo</Text>
                    <View style={{ width: 44 }} />
                </View>

                <FlatList
                    data={teamMembers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <MemberListItem member={item} />}
                    contentContainerStyle={styles.listContainer}
                    ListHeaderComponent={
                        <TouchableOpacity style={styles.inviteButton} onPress={() => setIsModalOpen(true)}>
                            <Feather name="user-plus" size={20} color="#121212" />
                            <Text style={styles.inviteButtonText}>Invitar Nuevo Miembro</Text>
                        </TouchableOpacity>
                    }
                />
            </LinearGradient>
            <InviteMemberModal isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </SafeAreaView>
    );
};

// screens/TeamManagementScreen.js (continuación - Estilos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
        height: 100,
    },
    backButton: { padding: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    listContainer: { padding: 24 },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDB813',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    inviteButtonText: { color: '#121212', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a'
    },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center' },
    memberName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    memberEmail: { color: '#A9A9A9', fontSize: 12 },
    roleBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginHorizontal: 16 },
    roleText: { fontSize: 12, fontWeight: 'bold' },
    // Estilos del Modal
    modalContainer: { justifyContent: 'flex-end', margin: 0 },
    modalContent: {
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#A9A9A9', marginBottom: 24 },
    modalLabel: { fontSize: 14, color: '#A9A9A9', marginBottom: 8, marginTop: 16 },
    modalInput: { backgroundColor: '#2a2a2a', color: '#FFFFFF', padding: 16, borderRadius: 12, fontSize: 16 },
    roleSelector: { backgroundColor: '#2a2a2a', padding: 16, borderRadius: 12 },
    roleOption: { color: '#FFFFFF', fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
    modalButtonSecondary: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#2a2a2a' },
    modalButtonSecondaryText: { color: '#FFFFFF', fontWeight: '600' },
    modalButtonPrimary: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#FDB813' },
    modalButtonPrimaryText: { color: '#121212', fontWeight: 'bold' },
});

export default TeamManagementScreen;
