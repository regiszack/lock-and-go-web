import React from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import LockersScreen from './src/screens/lockers/LockersScreen';
import HistoryScreen from './src/screens/history/HistoryScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import { colors } from './src/theme/colors';
import { AuthStackParamList, AppTabParamList } from './src/navigation/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'home', default: 'home-outline' },
  Lockers: { focused: 'lock-closed', default: 'lock-closed-outline' },
  History: { focused: 'time', default: 'time-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: colors.cardShadow,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          height: Platform.OS === 'ios' ? 96 : 80,
          paddingBottom: Platform.OS === 'ios' ? 30 : 22,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.default;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <AppTab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <AppTab.Screen name="Lockers" component={LockersScreen} options={{ title: 'Armários' }} />
      <AppTab.Screen name="History" component={HistoryScreen} options={{ title: 'Histórico' }} />
      <AppTab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </AppTab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
