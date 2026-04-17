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

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      Alert.alert('ログインエラー', (error as Error).message)
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
            通知ゼロ、プレッシャーゼロ
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
            placeholder="パスワード"
            placeholderTextColor={iconColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
          <Pressable
            style={[styles.button, { backgroundColor: tintColor, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <Link href="/sign-up" style={styles.link}>
          <ThemedText style={{ color: tintColor }}>
            アカウントをお持ちでない方はこちら
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
