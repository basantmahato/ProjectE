import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/lib/axios';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

const CONTENT_MAX_WIDTH = 500;

export default function ProfileSettings() {
  const router = useRouter();
  const user = authStore((state) => state.user);
  const hydrationDone = authStore((state) => state.hydrationDone);
  const updateUser = authStore((state) => state.updateUser);

  const theme = themeStore((state) => state.theme);
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [currentPasswordFocused, setCurrentPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user?.id]);

  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 24);

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    try {
      await updateUser({ name: name.trim(), email: email.trim() });
      setSuccess('Profile updated');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update profile';
      setError(message);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update password';
      setError(message);
    }
  };

  useEffect(() => {
    if (hydrationDone && !user) {
      router.back();
    }
  }, [hydrationDone, user, router]);

  if (!hydrationDone || !user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subText }]}>
          {!hydrationDone ? 'Loading…' : 'Please log in'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile settings</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit profile</Text>

            <Text style={[styles.label, { color: colors.subText }]}>Name</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: nameFocused ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialIcons name="person-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Your name"
                placeholderTextColor={colors.subText}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                selectionColor={colors.primary}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.label, { color: colors.subText, marginTop: 16 }]}>Email</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: emailFocused ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialIcons name="email" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.subText}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                selectionColor={colors.primary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
            {success ? <Text style={[styles.successText, { color: colors.success }]}>{success}</Text> : null}

            <Pressable
              onPress={handleSaveProfile}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={styles.primaryBtnText}>Save profile</Text>
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Change password</Text>

            <Text style={[styles.label, { color: colors.subText }]}>Current password</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: currentPasswordFocused ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialIcons name="lock-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.subText}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                onFocus={() => setCurrentPasswordFocused(true)}
                onBlur={() => setCurrentPasswordFocused(false)}
                selectionColor={colors.primary}
                secureTextEntry
              />
            </View>

            <Text style={[styles.label, { color: colors.subText, marginTop: 16 }]}>New password</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: newPasswordFocused ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialIcons name="lock-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.subText}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setNewPasswordFocused(true)}
                onBlur={() => setNewPasswordFocused(false)}
                selectionColor={colors.primary}
                secureTextEntry
              />
            </View>

            <Text style={[styles.label, { color: colors.subText, marginTop: 16 }]}>Confirm new password</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: confirmFocused ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialIcons name="lock-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.subText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                selectionColor={colors.primary}
                secureTextEntry
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: colors.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Update password</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  errorText: { fontSize: 14, marginTop: 12 },
  successText: { fontSize: 14, marginTop: 12 },
  primaryBtn: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryBtn: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 2,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
});
