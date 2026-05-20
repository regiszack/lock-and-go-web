import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accessLogsApi, AccessLog } from '../../api/accessLogs';
import { colors } from '../../theme/colors';

function formatDuration(seconds?: number) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

export default function HistoryScreen() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await accessLogsApi.myLogs();
      setLogs(data.content);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.headerSub}>{logs.length} registros</Text>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum acesso registrado</Text>
            <Text style={styles.emptyText}>Seus acessos aparecerão aqui.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOpen = item.action === 'OPEN';
          return (
            <View style={styles.card}>
              <View style={[styles.actionBadge, { backgroundColor: isOpen ? colors.successLight : colors.background }]}>
                <Ionicons
                  name={isOpen ? 'lock-open-outline' : 'lock-closed-outline'}
                  size={20}
                  color={isOpen ? colors.success : colors.textMuted}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.actionText}>{isOpen ? 'Abertura' : 'Fechamento'}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.timestamp).toLocaleString('pt-BR')}
                </Text>
              </View>
              {isOpen && item.durationSeconds != null && (
                <View style={styles.durationBadge}>
                  <Ionicons name="timer-outline" size={14} color={colors.primary} />
                  <Text style={styles.duration}>{formatDuration(item.durationSeconds)}</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  listContent: { padding: 16, gap: 10, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: colors.cardShadow, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  actionBadge: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  actionText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  dateText: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryGhost, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  duration: { fontSize: 13, fontWeight: '700', color: colors.primary },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyText: { fontSize: 14, color: colors.textMuted },
});
