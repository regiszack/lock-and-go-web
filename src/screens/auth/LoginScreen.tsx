import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch {
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={36} color={colors.white} />
        </View>
        <Text style={styles.logo}>LockAndGo</Text>
        <Text style={styles.subtitle}>Armários inteligentes para universitários</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
        <Text style={styles.link}>Não tem conta? </Text>
        <Text style={styles.linkBold}>Cadastre-se</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  logo: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 24, gap: 16,
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
