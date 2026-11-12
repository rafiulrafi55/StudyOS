import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  updateProfile,
} from '@react-native-firebase/auth';
import Svg, { Path } from 'react-native-svg';
import { authProviderConfig } from '../config/authProviders';
import { colors } from '../styles';

type AuthMode = 'login' | 'signup';

type AuthScreenProps = {
  onClose?: () => void;
};

type GithubDeviceAuth = {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
};

function GithubIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Path
        fill="#FFFFFF"
        d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.28c0 .32.22.69.83.57A12 12 0 0 0 12 .3Z"
      />
    </Svg>
  );
}

export function AuthScreen({ onClose }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [githubDeviceAuth, setGithubDeviceAuth] = useState<GithubDeviceAuth | null>(null);
  const [isGithubPolling, setIsGithubPolling] = useState(false);

  useEffect(() => {
    if (!onClose) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose]);

  const handleAuth = async () => {
    if (mode === 'signup' && !firstName.trim()) {
      Alert.alert('First name required', 'Please enter your first name to create an account.');
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
        await updateProfile(credential.user, { displayName });
      }
    } catch (error: any) {
      let message = 'An error occurred';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      }
      Alert.alert('Authentication Error', message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(current => (current === 'login' ? 'signup' : 'login'));
    setConfirmPassword('');
  };

  const pollGithubDeviceToken = async (deviceAuth: GithubDeviceAuth) => {
    const deadline = Date.now() + deviceAuth.expiresIn * 1000;
    let interval = deviceAuth.interval * 1000;

    while (Date.now() < deadline) {
      await new Promise<void>(resolve => setTimeout(resolve, interval));
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: authProviderConfig.githubClientId,
          device_code: deviceAuth.deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });
      const result = await response.json();

      if (result.access_token) {
        await signInWithCredential(getAuth(), GithubAuthProvider.credential(result.access_token));
        return;
      }
      if (result.error === 'authorization_pending') {
        continue;
      }
      if (result.error === 'slow_down') {
        interval += 5000;
        continue;
      }
      throw new Error(result.error_description || 'GitHub authorization was not completed.');
    }

    throw new Error('GitHub authorization expired. Please try again.');
  };

  const startGithubAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: authProviderConfig.githubClientId,
          scope: 'read:user user:email',
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.device_code || !result.user_code || !result.verification_uri) {
        throw new Error(result.error_description || 'Unable to start GitHub authorization.');
      }
      setGithubDeviceAuth({
        deviceCode: result.device_code,
        userCode: result.user_code,
        verificationUri: result.verification_uri,
        expiresIn: result.expires_in,
        interval: result.interval || 5,
      });
    } catch (error: any) {
      Alert.alert('GitHub sign-in failed', error.message || 'Please try again.');
      setLoading(false);
    }
  };

  const continueGithubAuth = async () => {
    if (!githubDeviceAuth) return;
    setGithubDeviceAuth(null);
    setIsGithubPolling(true);
    try {
      await pollGithubDeviceToken(githubDeviceAuth);
    } catch (error: any) {
      Alert.alert('GitHub sign-in failed', error.message || 'Please try again.');
    } finally {
      setIsGithubPolling(false);
      setLoading(false);
    }
  };

  const openGithubVerification = async () => {
    if (!githubDeviceAuth) return;
    try {
      await Linking.openURL(githubDeviceAuth.verificationUri);
    } catch {
      Alert.alert('Unable to open GitHub', 'Open github.com in your browser and enter the displayed code.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Modal
        visible={githubDeviceAuth !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setGithubDeviceAuth(null);
          setLoading(false);
        }}>
        <View style={styles.providerModalBackdrop}>
          <View style={styles.providerModalCard}>
            <Text style={styles.providerModalKicker}>GITHUB SIGN-IN</Text>
            <Text style={styles.providerModalTitle}>Enter this code on GitHub</Text>
            <Text style={styles.providerModalCode}>{githubDeviceAuth?.userCode}</Text>
            <Text style={styles.providerModalBody}>
              Open GitHub, enter the code above, then come back here to finish signing in.
            </Text>
            <Pressable style={styles.button} onPress={openGithubVerification}>
              <Text style={styles.buttonText}>Open GitHub</Text>
            </Pressable>
            <Pressable
              style={styles.providerModalContinue}
              onPress={continueGithubAuth}
              disabled={isGithubPolling}>
              {isGithubPolling ? (
                <ActivityIndicator color={colors.green} />
              ) : (
                <Text style={styles.providerModalContinueText}>I&apos;ve finished</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.providerModalCancel}
              onPress={() => {
                setGithubDeviceAuth(null);
                setLoading(false);
              }}
              disabled={isGithubPolling}>
              <Text style={styles.providerModalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>S</Text>
        </View>
        <Text style={styles.brandName}>StudyOS</Text>
        <View style={styles.authCard}>
          <View style={styles.authCardHeader}>
            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>
            {onClose && (
              <Pressable
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close login"
                accessibilityRole="button">
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to keep your study life organized.'
              : 'Save your progress and make every session count.'}
          </Text>

          <View style={styles.form}>
            {mode === 'signup' && (
              <>
                <Text style={styles.inputLabel}>Your name</Text>
                <View style={styles.nameRow}>
                  <TextInput
                    style={[styles.input, styles.nameField, focusedField === 'firstName' && styles.inputFocused]}
                    placeholder="First name"
                    placeholderTextColor="#A1AAA5"
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                  <TextInput
                    style={[styles.input, styles.nameField, focusedField === 'lastName' && styles.inputFocused]}
                    placeholder="Last name"
                    placeholderTextColor="#A1AAA5"
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </>
            )}
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              style={[styles.input, focusedField === 'email' && styles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor="#A1AAA5"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, focusedField === 'password' && styles.inputFocused]}
                placeholder="Enter your password"
                placeholderTextColor="#A1AAA5"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowPassword(current => !current)}
                accessibilityRole="button">
                <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            {mode === 'signup' && (
              <>
                <Text style={styles.inputLabel}>Confirm password</Text>
                <TextInput
                  style={[styles.input, focusedField === 'confirmPassword' && styles.inputFocused]}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#A1AAA5"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
              </>
            )}

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleAuth}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'login' ? 'Continue' : 'Create account'}
                </Text>
              )}
            </Pressable>

            <View style={styles.providerDivider}>
              <View style={styles.providerDividerLine} />
              <Text style={styles.providerDividerText}>CONTINUE WITH</Text>
              <View style={styles.providerDividerLine} />
            </View>
            <View style={styles.providerRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.providerButton,
                  styles.providerButtonSingle,
                  pressed && styles.providerButtonPressed,
                ]}
                onPress={startGithubAuth}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Continue with GitHub">
                <View style={[styles.providerIcon, styles.githubIcon]}><GithubIcon /></View>
                <Text style={styles.providerButtonText}>GitHub</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.switchButton}
              onPress={switchMode}
              disabled={loading}>
              <Text style={styles.switchPrompt}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchText}>
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </Text>
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.optionalNote}>You can also continue using StudyOS without an account.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EFEB',
  },
  closeButtonText: {
    color: colors.green,
    fontSize: 21,
    lineHeight: 23,
    fontWeight: '700',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 42,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  brandMarkText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
  },
  brandName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 22,
  },
  authCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  authCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 8,
    marginBottom: 24,
  },
  form: {
    gap: 7,
  },
  inputLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 7,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 9,
  },
  nameField: {
    flex: 1,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: '#FBFCFB',
  },
  inputFocused: {
    borderColor: colors.green,
    borderWidth: 1.5,
    backgroundColor: '#FFF',
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 58,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  passwordToggleText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '800',
  },
  button: {
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: colors.green,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  providerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
  },
  providerDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  providerDividerText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  providerButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
  },
  providerButtonPressed: {
    backgroundColor: '#F3F7F4',
  },
  providerIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  githubIcon: {
    backgroundColor: colors.ink,
  },
  providerButtonSingle: {
    alignSelf: 'center',
    width: '70%',
  },
  providerButtonText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  providerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 33, 31, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  providerModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
  },
  providerModalKicker: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  providerModalTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  providerModalCode: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    backgroundColor: '#F1F6F2',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
  },
  providerModalBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  providerModalContinue: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  providerModalContinueText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
  },
  providerModalCancel: {
    alignItems: 'center',
    paddingTop: 6,
  },
  providerModalCancelText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  switchButton: {
    paddingTop: 18,
    alignItems: 'center',
  },
  switchPrompt: {
    color: colors.muted,
    fontSize: 12,
  },
  switchText: {
    color: colors.green,
    fontWeight: '800',
  },
  optionalNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 18,
  },
});
