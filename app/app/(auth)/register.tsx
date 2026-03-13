import 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

import { authStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();

  const theme = themeStore((state) => state.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDark = theme === 'dark';

  const register = authStore((state) => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleRegister = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, name);
      router.replace('/(tabs)');
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <Animated.View
            style={[
              styles.container,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Logo */}
            <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
              <View
                style={[
                  styles.logoRing,
                  { borderColor: colors.primary + '44', backgroundColor: colors.card },
                ]}
              >
                <View
                  style={[
                    styles.logoInner,
                    { backgroundColor: isDark ? '#1E1C30' : colors.background },
                  ]}
                >
                  <Text style={[styles.logoGlyph, { color: colors.primary }]}>⬡</Text>
                </View>
              </View>
            </Animated.View>

            {/* Heading */}
            <Text style={[styles.headline, { color: colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtext, { color: colors.subText }]}>
              Start your journey with us
            </Text>

            {/* Card */}
            <LinearGradient
              colors={
                isDark
                  ? ['#1C1A35', '#13112A', '#0E0D20']
                  : [colors.card, colors.background]
              }
              style={[styles.card, { borderColor: colors.border }]}
            >
              {/* Name */}
              <Text style={[styles.label, { color: colors.subText }]}>
                Full Name
              </Text>

              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: nameFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.inputIcon, { color: colors.subText }]}>👤</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.subText}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>

              {/* Email */}
              <Text style={[styles.label, { color: colors.subText, marginTop: 18 }]}>
                Email
              </Text>

              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: emailFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.inputIcon, { color: colors.subText }]}>✉</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.subText}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {/* Password */}
              <Text style={[styles.label, { color: colors.subText, marginTop: 18 }]}>
                Password
              </Text>

              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: passwordFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.inputIcon, { color: colors.subText }]}>◈</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.subText}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>

              {/* Confirm Password */}
              <Text style={[styles.label, { color: colors.subText, marginTop: 18 }]}>
                Confirm Password
              </Text>

              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: confirmFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.inputIcon, { color: colors.subText }]}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.subText}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Button */}
              <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 24 }}>
                <Pressable
                  style={styles.btnPressable}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleRegister}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary]}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>Create Account</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </LinearGradient>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.subText }]}>
                Already have an account?
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  {' '}Sign In
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoWrap: { alignSelf: 'center', marginBottom: 28 },
  logoRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: { fontSize: 22 },
  headline: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 12,
    textAlign: 'center',
  },
  btnPressable: { borderRadius: 16, overflow: 'hidden' },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 56,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});