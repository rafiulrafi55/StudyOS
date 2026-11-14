import React, { useEffect } from 'react';
import { BackHandler, Pressable, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';

type SettingsScreenProps = {
  onClose: () => void;
  onLogin: () => void;
};

export function SettingsScreen({ onClose, onLogin }: SettingsScreenProps) {
  const { user } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable style={[styles.backButton, isDark && styles.darkButton]} onPress={onClose}>
          <Text style={[styles.backText, isDark && styles.darkMuted]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.content}>
        <View style={[styles.profileCard, isDark && styles.darkCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user ? initials : 'S'}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, isDark && styles.darkText]}>
              {user ? displayName : 'Guest mode'}
            </Text>
            <Text style={[styles.profileEmail, isDark && styles.darkMuted]}>
              {user?.email || 'You are using StudyOS without an account'}
            </Text>
          </View>
        </View>
        {!user && (
          <Pressable style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>Log in or create an account</Text>
          </Pressable>
        )}
        <Text style={[styles.sectionLabel, isDark && styles.darkMuted]}>APPEARANCE</Text>
        <View style={[styles.settingRow, isDark && styles.darkCard]}>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, isDark && styles.darkText]}>Dark mode</Text>
            <Text style={[styles.settingDescription, isDark && styles.darkMuted]}>
              Use a pure black theme to save power on AMOLED displays.
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#C9D3CD', true: '#2F6B56' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F8F5' },
  darkSafeArea: { backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8EFEB', alignItems: 'center', justifyContent: 'center' },
  darkButton: { backgroundColor: '#171717' },
  backText: { color: '#2F6B56', fontSize: 32, lineHeight: 34, fontWeight: '300', marginTop: -5, textAlign: 'center', textAlignVertical: 'center' },
  darkMuted: { color: '#929292' },
  headerTitle: { color: '#18211F', fontSize: 20, fontWeight: '800' },
  darkText: { color: '#FFFFFF' },
  headerSpacer: { width: 40 },
  content: { padding: 22 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18 },
  darkCard: { backgroundColor: '#121212', borderColor: '#242424', borderWidth: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2F6B56', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  profileCopy: { flex: 1, marginLeft: 14 },
  profileName: { color: '#18211F', fontSize: 16, fontWeight: '800' },
  profileEmail: { color: '#78817D', fontSize: 12, marginTop: 5 },
  loginButton: { backgroundColor: '#2F6B56', borderRadius: 15, alignItems: 'center', paddingVertical: 14, marginTop: 12 },
  loginButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  sectionLabel: { color: '#78817D', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 30, marginBottom: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17 },
  settingCopy: { flex: 1, paddingRight: 12 },
  settingTitle: { color: '#18211F', fontSize: 14, fontWeight: '800' },
  settingDescription: { color: '#78817D', fontSize: 11, lineHeight: 16, marginTop: 5 },
});
