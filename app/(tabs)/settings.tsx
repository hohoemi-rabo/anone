import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import { useFocusEffect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getAgeDisplay } from '@/lib/age'
import { getSignedPhotoUrl } from '@/lib/image'

function formatBirthday(iso: string): string {
  const date = new Date(iso + 'T00:00:00')
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}年${m}月${d}日`
}

export default function SettingsScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { child, role, refresh } = useChild()
  const [iconUrl, setIconUrl] = useState<string | null>(null)

  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({}, 'border')
  const surfaceColor = useThemeColor({}, 'surface')
  const bgColor = useThemeColor({}, 'background')

  useEffect(() => {
    let cancelled = false
    if (child?.icon_url) {
      getSignedPhotoUrl(child.icon_url).then((url) => {
        if (!cancelled) setIconUrl(url)
      })
    } else {
      setIconUrl(null)
    }
    return () => {
      cancelled = true
    }
  }, [child?.icon_url])

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh]),
  )

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut()
          } catch (error) {
            Alert.alert('ログアウトエラー', (error as Error).message)
          }
        },
      },
    ])
  }

  if (!child) return null

  const version = Constants.expoConfig?.version ?? '—'

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: surfaceColor }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: bgColor }}
        contentContainerStyle={styles.list}
      >
        <ThemedText type="defaultSemiBold" style={[styles.sectionLabel, { color: iconColor }]}>
          お子さまの情報
        </ThemedText>
        <ThemedView style={[styles.section, { borderColor }]}>
          <View style={styles.childRow}>
            <View style={[styles.iconWrap, { borderColor: iconColor }]}>
              {iconUrl ? (
                <Image source={{ uri: iconUrl }} style={styles.icon} contentFit="cover" />
              ) : (
                <ThemedText style={[styles.iconPlaceholder, { color: iconColor }]}>
                  No{'\n'}Image
                </ThemedText>
              )}
            </View>
            <View style={styles.childInfo}>
              <ThemedText type="defaultSemiBold" style={styles.childName}>
                {child.name}
              </ThemedText>
              <ThemedText style={[styles.childMeta, { color: iconColor }]}>
                {formatBirthday(child.birthday)}
              </ThemedText>
              <ThemedText style={[styles.childMeta, { color: iconColor }]}>
                {getAgeDisplay(child.birthday)}
              </ThemedText>
            </View>
          </View>

          {role === 'owner' ? (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { borderTopColor: borderColor, opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => router.push('/child-edit')}
            >
              <ThemedText style={[styles.rowLabel, { color: tintColor }]}>
                お子さまの情報を編集
              </ThemedText>
            </Pressable>
          ) : (
            <View style={[styles.row, { borderTopColor: borderColor }]}>
              <ThemedText style={[styles.rowMeta, { color: iconColor }]}>
                編集はオーナーのみ可能です
              </ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedText type="defaultSemiBold" style={[styles.sectionLabel, { color: iconColor }]}>
          家族共有
        </ThemedText>
        <ThemedView style={[styles.section, { borderColor }]}>
          {role === 'owner' && (
            <Pressable
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => router.push('/invite-issue')}
            >
              <ThemedText style={[styles.rowLabel, { color: tintColor }]}>
                家族を招待
              </ThemedText>
            </Pressable>
          )}
          {role !== 'owner' && (
            <Pressable
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => router.push('/invite-join')}
            >
              <ThemedText style={[styles.rowLabel, { color: tintColor }]}>
                招待コードで参加
              </ThemedText>
            </Pressable>
          )}
          {role === 'owner' && (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { borderTopColor: borderColor, borderTopWidth: 1, opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => router.push('/members')}
            >
              <ThemedText style={[styles.rowLabel, { color: tintColor }]}>
                メンバー管理
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>

        <ThemedText type="defaultSemiBold" style={[styles.sectionLabel, { color: iconColor }]}>
          アカウント
        </ThemedText>
        <ThemedView style={[styles.section, { borderColor }]}>
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleLogout}
          >
            <ThemedText style={[styles.rowLabel, { color: tintColor }]}>ログアウト</ThemedText>
          </Pressable>
          <View style={[styles.row, { borderTopColor: borderColor, borderTopWidth: 1 }]}>
            <ThemedText style={styles.rowLabel}>バージョン</ThemedText>
            <ThemedText style={[styles.rowMeta, { color: iconColor }]}>{version}</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    paddingVertical: 16,
    gap: 8,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  childRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    fontSize: 10,
    textAlign: 'center',
  },
  childInfo: {
    flex: 1,
    gap: 2,
  },
  childName: {
    fontSize: 16,
  },
  childMeta: {
    fontSize: 13,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
  },
  rowMeta: {
    fontSize: 13,
  },
})
