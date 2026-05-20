import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { subscriptionsApi, Subscription } from '../../api/subscriptions';
import { lockersApi, Locker } from '../../api/lockers';
import { colors } from '../../theme/colors';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  PENDING: 'Aguardando pagamento',
  GRACE_PERIOD: 'Período de carência',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: colors.success,
  PENDING: colors.warning,
  GRACE_PERIOD: colors.warning,
  EXPIRED: colors.danger,
  CANCELLED: colors.textMuted,
};

const STATUS_BG: Record<string, string> = {
  ACTIVE: colors.successLight,
  PENDING: colors.warningLight,
  GRACE_PERIOD: colors.warningLight,
  EXPIRED: colors.dangerLight,
  CANCELLED: colors.borderLight,
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [myLocker, setMyLocker] = useState<Locker | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscription = useCallback(async () => {
    try {
      const { data } = await subscriptionsApi.getMySubscription();
      setSubscription(data);
      // Busca detalhes do armário
      if (data?.lockerId) {
        try {
          const { data: lockerData } = await lockersApi.findById(data.lockerId);
          setMyLocker(lockerData);
        } catch {
          setMyLocker(null);
        }
      }
    } catch {
      setSubscription(null);
      setMyLocker(null);
    } finally {
      setLoadingSub(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadSubscription(); }, [loadSubscription]));

  async function handleUnlock() {
    if (!subscription) return;
    setUnlocking(true);
    try {
      await lockersApi.unlock(subscription.lockerId);
      Alert.alert('Armário aberto!', 'Seu armário foi desbloqueado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o armário. Tente novamente.');
    } finally {
      setUnlocking(false);
    }
  }

  const isActive = subscription?.status === 'ACTIVE';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSubscription(); }} tintColor={colors.primary} />}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Olá, {user?.name?.split(' ')[0]}</Text>
          <Text style={styles.greetingSubtitle}>Bem-vindo ao LockAndGo</Text>
        </View>

        {loadingSub ? (
          <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} size="large" />
        ) : subscription ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.lockerIcon}>
                  <Ionicons name="lock-closed" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Meu Armário {myLocker ? String(myLocker.number).padStart(2, '0') : ''}</Text>
                  {myLocker && (
                    <Text style={styles.lockerLocation} numberOfLines={1}>{myLocker.location}</Text>
                  )}
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_BG[subscription.status] }]}>
                <View style={[styles.badgeDot, { backgroundColor: STATUS_COLOR[subscription.status] }]} />
                <Text style={[styles.badgeText, { color: STATUS_COLOR[subscription.status] }]}>
                  {STATUS_LABEL[subscription.status]}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="pricetag-outline" size={16} color={colors.textMuted} />
                <Text style={styles.infoLabel}>Plano</Text>
                <Text style={styles.infoValue}>{subscription.planName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <Text style={styles.infoLabel}>Validade</Text>
                <Text style={styles.infoValue}>{new Date(subscription.endDate).toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>

            {subscription.status === 'GRACE_PERIOD' && subscription.graceDeadline && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={18} color={colors.warning} />
                <Text style={styles.warningText}>
                  Retire seus pertences até {new Date(subscription.graceDeadline).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            {isActive && (
              <TouchableOpacity
                style={[styles.unlockButton, unlocking && styles.buttonDisabled]}
                onPress={handleUnlock}
                disabled={unlocking}
                activeOpacity={0.8}
              >
                {unlocking ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <View style={styles.unlockContent}>
                    <Ionicons name="lock-open-outline" size={22} color={colors.white} />
                    <Text style={styles.unlockButtonText}>Abrir Armário</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma assinatura ativa</Text>
            <Text style={styles.emptyText}>Acesse a aba Armários para contratar um plano.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  greeting: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greetingText: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: {
    margin: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 22,
    shadowColor: colors.cardShadow, shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lockerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryGhost, justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  lockerLocation: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoItem: { flex: 1, backgroundColor: colors.background, borderRadius: 14, padding: 14, gap: 6 },
  infoLabel: { fontSize: 12, color: colors.textMuted },
  infoValue: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.warningLight, borderRadius: 12, padding: 14, marginTop: 14,
  },
  warningText: { color: colors.warning, fontSize: 13, fontWeight: '600', flex: 1 },
  unlockButton: {
    backgroundColor: colors.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 18,
    shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  unlockContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unlockButtonText: { color: colors.white, fontWeight: '800', fontSize: 17 },
  emptyCard: {
    margin: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 48, alignItems: 'center',
    shadowColor: colors.cardShadow, shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
