import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Estudante',
  ADMIN: 'Administrador',
  SUPPORT: 'Suporte',
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>Perfil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
          <Text style={styles.roleText}>{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryGhost }]}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Editar perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryGhost }]}>
              <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Notificações</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryGhost }]}>
              <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Ajuda e suporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  screenTitle: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5, marginTop: 12, marginBottom: 20 },
  profileCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 28, alignItems: 'center',
    shadowColor: colors.cardShadow, shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 6, marginBottom: 20,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    backgroundColor: colors.primaryGhost, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  roleText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  menuSection: {
    backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 20,
    shadowColor: colors.cardShadow, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.dangerLight, borderRadius: 14, padding: 16,
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
});
