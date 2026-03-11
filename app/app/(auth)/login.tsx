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

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();

  const theme = themeStore((state) => state.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

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
    setIsPressed(true);
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();
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
              Welcome back
            </Text>
            <Text style={[styles.subtext, { color: colors.subText }]}>
              Sign in to continue your journey
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
              {/* Email */}
              <Text style={[styles.label, { color: colors.subText }]}>
                Email address
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
                  selectionColor={colors.primary}
                />
              </View>

              {/* Password */}
              <Text
                style={[
                  styles.label,
                  { color: colors.subText, marginTop: 18 },
                ]}
              >
                Password
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: passwordFocused
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text style={[styles.inputIcon, { color: colors.subText }]}>
                  ◈
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.subText}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  selectionColor={colors.primary}
                />
              </View>

              {/* CTA */}
              <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 24 }}>
                <Pressable
                  style={styles.btnPressable}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => router.replace('/(tabs)')}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary]}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>Sign In</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </LinearGradient>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.subText }]}>
                Don't have an account?
              </Text>
              <Pressable>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  {' '}Create one
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