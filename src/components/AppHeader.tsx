import React, { useState } from 'react';
import { Modal, Platform, Pressable, StatusBar, Text, View } from 'react-native';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { styles } from '../styles';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const now = new Date();
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${day}, ${date} ${month} ${year}`;
}

type AppHeaderProps = {
  onLogin: () => void;
  onSettings: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function GuestAvatar() {
  return (
    <View style={styles.guestAvatarIcon}>
      <View style={styles.guestAvatarHead} />
      <View style={styles.guestAvatarBody} />
    </View>
  );
}

export function AppHeader({ onLogin, onSettings }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const initials = getInitials(displayName);
  const profileTopOffset =
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44) + 22 + 43 + 8;

  const handleSettings = () => {
    setIsProfileOpen(false);
    onSettings();
  };

  const handleLogin = () => {
    setIsProfileOpen(false);
    onLogin();
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await signOut();
  };

  return (
    <>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <View>
          <Text style={[styles.eyebrow, isDark && styles.darkMuted]}>{getFormattedDate()}</Text>
          <Text style={[styles.greeting, isDark && styles.darkText]}>{getGreeting()}, Rafiul</Text>
        </View>
        <Pressable
          style={styles.avatar}
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          onPress={() => setIsProfileOpen(true)}>
          {user ? <Text style={styles.avatarText}>{initials}</Text> : <GuestAvatar />}
        </Pressable>
      </View>
      <Modal
        visible={isProfileOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileOpen(false)}>
        <Pressable
          style={[styles.profileBackdrop, { paddingTop: profileTopOffset }]}
          onPress={() => setIsProfileOpen(false)}
          accessibilityLabel="Close profile menu">
          <Pressable style={[styles.profileMenu, isDark && styles.darkProfileMenu]} onPress={() => undefined}>
            <View style={styles.profileAvatar}>
              {user ? <Text style={styles.profileAvatarText}>{initials}</Text> : <GuestAvatar />}
            </View>
            {user ? (
              <>
                <Text style={[styles.profileName, isDark && styles.darkProfileName]}>{displayName}</Text>
                <Text style={[styles.profileEmail, isDark && styles.darkProfileEmail]}>{user.email}</Text>
              </>
            ) : (
              <Pressable
                style={styles.profileLoginButton}
                onPress={handleLogin}
                accessibilityRole="button">
                <Text style={styles.profileLoginText}>Login</Text>
              </Pressable>
            )}
            <View style={styles.profileDivider} />
            <Pressable
              style={styles.profileAction}
              onPress={handleSettings}
              accessibilityRole="button">
              <Text style={styles.profileActionIcon}>⚙</Text>
              <Text style={[styles.profileActionText, isDark && styles.darkProfileActionText]}>Settings</Text>
            </Pressable>
            {user && (
              <Pressable
                style={styles.profileAction}
                onPress={handleSignOut}
                accessibilityRole="button">
                <Text style={styles.profileActionIcon}>↪</Text>
                <Text style={[styles.profileActionText, isDark && styles.darkProfileActionText]}>Log out</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
