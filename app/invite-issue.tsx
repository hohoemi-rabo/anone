import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import { supabase } from '@/lib/supabase'

function formatExpiresAt(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${h}:${min}`
}

export default function InviteIssueScreen() {
  const router = useRouter()
  const { child, role } = useChild()
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const tintColor = useThemeColor({}, 'tint')
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon')

  useEffect(() => {
    if (!child || role !== 'owner') return
    let cancelled = false
    const issue = async () => {
      const { data, error } = await supabase.rpc('create_invite_code', {
        p_child_id: child.id,
      })
      if (cancelled) return
      if (error || !data || data.length === 0) {
        router.back()
        Alert.alert('発行エラー', error?.message ?? 'コードを生成できませんでした')
        return
      }
      setCode(data[0].code)
      setExpiresAt(data[0].expires_at)
      setIsLoading(false)
    }
    issue()
    return () => {
      cancelled = true
    }
  }, [child, role, router])

  if (!child) return null

  if (role !== 'owner') {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.notOwner}>
          <ThemedText style={[styles.notOwnerText, { color: iconColor }]}>
            招待コードの発行はオーナーのみ可能です
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              閉じる
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    )
  }

  if (isLoading || !code || !expiresAt) {
    return (
      <ThemedView style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    )
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code)
    Alert.alert('コピーしました', '招待コードをクリップボードにコピーしました')
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `「あのね。」の招待コード: ${code}\n有効期限: ${formatExpiresAt(expiresAt)}`,
      })
    } catch (error) {
      Alert.alert('共有エラー', (error as Error).message)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={[styles.label, { color: iconColor }]}>招待コード</ThemedText>
        <View style={[styles.codeBox, { borderColor }]}>
          <ThemedText style={styles.codeText}>{code}</ThemedText>
        </View>
        <ThemedText style={[styles.expiry, { color: iconColor }]}>
          {formatExpiresAt(expiresAt)} まで有効
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, { backgroundColor: tintColor }]}
            onPress={handleCopy}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              コピー
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.button, styles.outlineButton, { borderColor: tintColor }]}
            onPress={handleShare}
          >
            <ThemedText style={[styles.buttonText, { color: tintColor }]}>
              シェア
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText style={[styles.note, { color: iconColor }]}>
          家族にこのコードを伝えてください。受け取った人が「招待コードで参加」から入力すると、お子さまの日記を共有できます。
        </ThemedText>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  codeText: {
    fontSize: 36,
    letterSpacing: 6,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  expiry: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  notOwner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 24,
  },
  notOwnerText: {
    fontSize: 14,
    textAlign: 'center',
  },
})
