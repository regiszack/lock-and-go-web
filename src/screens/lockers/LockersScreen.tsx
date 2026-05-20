import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lockersApi, Locker } from '../../api/lockers';
import { plansApi, Plan } from '../../api/plans';
import { subscriptionsApi } from '../../api/subscriptions';
import { colors } from '../../theme/colors';

export default function LockersScreen() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    Promise.all([
      lockersApi.findAll('AVAILABLE'),
      plansApi.findAll(),
      subscriptionsApi.getMySubscription().catch(() => null),
    ]).then(([l, p, sub]) => {
      setLockers(l.data);
      setPlans(p.data);
      if (sub) setActiveSubId(sub.data.id);
    }).finally(() => setLoading(false));
  }, []));

  async function handleCheckout(planId: string) {
    if (!selectedLocker) return;
    setSaving(true);
    try {
      const { data } = await subscriptionsApi.checkout(selectedLocker.id, planId);
      setShowPlanModal(false);
      // Abre o checkout do Mercado Pago no navegador
      const supported = await Linking.canOpenURL(data.checkoutUrl);
      if (supported) {
        await Linking.openURL(data.checkoutUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link de pagamento.');
      }
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.detail ?? 'Não foi possível criar o checkout.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePassword() {
    if (!activeSubId || password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter entre 6 e 12 dígitos.');
      return;
    }
    setSaving(true);
    try {
      await subscriptionsApi.setStudentPassword(activeSubId, password);
      setShowPasswordModal(false);
      setPassword('');
      Alert.alert('Senha atualizada!', 'Sua senha pessoal foi configurada no cadeado.');
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.detail ?? 'Não foi possível salvar a senha.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Armários</Text>
          <Text style={styles.headerSub}>{lockers.length} disponíveis</Text>
        </View>
        {activeSubId && (
          <TouchableOpacity style={styles.passwordBtn} onPress={() => setShowPasswordModal(true)} activeOpacity={0.7}>
            <Ionicons name="key-outline" size={16} color={colors.primary} />
            <Text style={styles.passwordBtnText}>Minha senha</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={lockers}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-open-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum armário disponível</Text>
            <Text style={styles.emptyText}>Tente novamente mais tarde.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => { setSelectedLocker(item); setShowPlanModal(true); }}
            activeOpacity={0.7}
          >
            <View style={styles.cardLeft}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{item.number}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Armário {String(item.number).padStart(2, '0')}</Text>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.cardSub} numberOfLines={1}>{item.location}</Text>
                </View>
                {item.address ? (
                  <View style={styles.cardLocationRow}>
                    <Ionicons name="map-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.statusDot} />
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showPlanModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="lock-closed" size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Escolha um plano</Text>
              <Text style={styles.modalSub}>Armário {String(selectedLocker?.number ?? 0).padStart(2, '0')}</Text>
              <View style={styles.modalLocationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={styles.modalLocationText} numberOfLines={2}>{selectedLocker?.location}</Text>
              </View>
            </View>
            {plans.filter(p => p.active).map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planItem}
                onPress={() => handleCheckout(plan.id)}
                disabled={saving}
                activeOpacity={0.7}
              >
                <View style={styles.planLeft}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDuration}>{plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}</Text>
                </View>
                <View style={styles.planRight}>
                  <Text style={styles.planPrice}>R$ {plan.price.toFixed(2)}</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPlanModal(false)} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="key" size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Senha pessoal</Text>
              <Text style={styles.modalSub}>6 a 12 dígitos numéricos</Text>
            </View>
            <TextInput
              style={styles.passwordInput}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              secureTextEntry
              maxLength={12}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSavePassword}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.saveBtnText}>Salvar senha</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPasswordModal(false); setPassword(''); }}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  passwordBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryGhost, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  passwordBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  listContent: { padding: 16, gap: 10, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: colors.cardShadow, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  numberBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primaryGhost, justifyContent: 'center', alignItems: 'center',
  },
  numberBadgeText: { fontSize: 18, fontWeight: '800', color: colors.primary },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  cardSub: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  cardAddress: { fontSize: 11, color: colors.textMuted, flex: 1 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyText: { fontSize: 14, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12, gap: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 8,
  },
  modalHeader: { alignItems: 'center', marginBottom: 8 },
  modalIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primaryGhost, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  modalSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  modalLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  modalLocationText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  planItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: colors.border,
  },
  planLeft: {},
  planRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  planDuration: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 15 },
  passwordInput: {
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, padding: 16, fontSize: 22, letterSpacing: 6, textAlign: 'center',
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 14, padding: 17, alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  saveBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
