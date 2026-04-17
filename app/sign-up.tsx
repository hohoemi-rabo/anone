import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native'
import { Link } from 'expo-router'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useThemeColor } from '@/hooks/use-theme-color'

export default function SignUpScreen() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください')
      return
    }

    if (password.length < 6) {
      Alert.alert('入力エラー', 'パスワードは6文字以上にしてください')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
      Alert.alert('登録完了', 'アカウントが作成されました')
    } catch (error) {
      Alert.alert('登録エラー', (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.appName}>
            あのね。
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: iconColor }]}>
            アカウント作成
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: iconColor }]}
            placeholder="メールアドレス"
            placeholderTextColor={iconColor}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={[styles.input, { color: textColor, borderColor: iconColor }]}
            placeholder="パスワード（6文字以上）"
            placeholderTextColor={iconColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />
          <Pressable
            style={[styles.button, { backgroundColor: tintColor, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              {loading ? '登録中...' : 'アカウント作成'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <Link href="/sign-in" style={styles.link}>
          <ThemedText style={{ color: tintColor }}>
            すでにアカウントをお持ちの方はこちら
          </ThemedText>
        </Link>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 40,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    alignSelf: 'center',
  },
})
