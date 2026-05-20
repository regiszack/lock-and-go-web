import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password, phone || undefined);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={32} color={colors.white} />
          </View>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Celular (opcional)" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Senha (min. 6 caracteres)" placeholderTextColor={colors.textMuted} secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>Cadastrar</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
          <Text style={styles.link}>Já tem conta? </Text>
          <Text style={styles.linkBold}>Fazer login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 24, gap: 14,
    shadowColor: colors.cardShadow, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: colors.border,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: colors.textPrimary },
  button: {
    backgroundColor: colors.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 4,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { color: colors.textSecondary, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
