import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useThemeColor } from '@/hooks/use-theme-color'
import { supabase } from '@/lib/supabase'

export default function InviteJoinScreen() {
  const router = useRouter()
  const { refreshChildStatus } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      Alert.alert('入力エラー', '招待コードは6文字です')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.rpc('redeem_invite_code', { p_code: trimmed })
      if (error) throw error
      await refreshChildStatus()
      router.back()
      Alert.alert('参加しました', 'お子さまの日記を共有できるようになりました')
    } catch (error) {
      Alert.alert('参加エラー', (error as Error).message)
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
        <ThemedView style={styles.form}>
          <ThemedText style={[styles.label, { color: iconColor }]}>
            招待コードを入力してください
          </ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: iconColor }]}
            placeholder="ABCD12"
            placeholderTextColor={iconColor}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            textAlign="center"
            editable={!loading}
          />
          <Pressable
            style={[styles.button, { backgroundColor: tintColor, opacity: loading ? 0.6 : 1 }]}
            onPress={handleJoin}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              {loading ? '参加処理中...' : '参加する'}
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.note, { color: iconColor }]}>
            オーナーが発行した6文字の招待コードを入力します。コードは24時間有効です。
          </ThemedText>
        </ThemedView>
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
  form: {
    gap: 16,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 28,
    letterSpacing: 6,
    fontWeight: '600',
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
})
