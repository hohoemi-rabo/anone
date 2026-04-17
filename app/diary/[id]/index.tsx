import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getAgeDisplay } from '@/lib/age'
import { deletePhoto, getSignedPhotoUrl } from '@/lib/image'
import { supabase } from '@/lib/supabase'

type Entry = {
  id: string
  entry_date: string
  text: string | null
  photo_url: string | null
  author_id: string
  updated_at: string | null
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}曜日`
}

export default function DiaryDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { child } = useChild()

  const [entry, setEntry] = useState<Entry | null>(null)
  const [authorName, setAuthorName] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

  const fetchEntry = useCallback(async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('diary_entries')
      .select('id, entry_date, text, photo_url, author_id, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.warn('[diary-detail] fetch error', error.message)
    }
    setEntry(data)
    setLoading(false)
  }, [id])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      fetchEntry()
    }, [fetchEntry]),
  )

  useEffect(() => {
    if (!entry) return
    const isMine = entry.author_id === session?.user.id
    if (isMine) {
      setAuthorName(null)
      return
    }
    const fetchAuthor = async () => {
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', entry.author_id)
        .maybeSingle()
      setAuthorName(data?.name ?? '家族のメンバー')
    }
    fetchAuthor()
  }, [entry, session?.user.id])

  useEffect(() => {
    if (!entry?.photo_url) {
      setPhotoUrl(null)
      return
    }
    const resolve = async () => {
      const url = await getSignedPhotoUrl(entry.photo_url!)
      setPhotoUrl(url)
    }
    resolve()
  }, [entry?.photo_url])

  const handleDelete = () => {
    if (!entry) return
    Alert.alert('日記を削除', 'この日記を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true)
          try {
            if (entry.photo_url) await deletePhoto(entry.photo_url)
            const { error } = await supabase.from('diary_entries').delete().eq('id', entry.id)
            if (error) throw error
            router.back()
          } catch (err) {
            Alert.alert('削除エラー', (err as Error).message)
          } finally {
            setDeleting(false)
          }
        },
      },
    ])
  }

  const handleEdit = () => {
    if (!entry) return
    router.push(`/diary/${entry.id}/edit`)
  }

  const handleClose = () => router.back()

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    )
  }

  if (!entry) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ color: iconColor }}>日記が見つかりません</ThemedText>
        <Pressable onPress={handleClose} style={[styles.closeAlt, { backgroundColor: tintColor }]}>
          <ThemedText style={{ color: backgroundColor }}>閉じる</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  const isMine = entry.author_id === session?.user.id

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={12}>
            <ThemedText style={[styles.closeText, { color: tintColor }]}>閉じる</ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="defaultSemiBold" style={styles.dateLabel}>
            {formatDateLabel(entry.entry_date)}
          </ThemedText>
          {child && (
            <ThemedText style={[styles.ageLabel, { color: iconColor }]}>
              {getAgeDisplay(child.birthday, new Date(entry.entry_date + 'T00:00:00'))}
            </ThemedText>
          )}
          {authorName && (
            <ThemedText style={[styles.authorLabel, { color: iconColor }]}>
              {authorName}
            </ThemedText>
          )}

          {photoUrl && (
            <Image
              source={{ uri: photoUrl }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
          )}

          {entry.text && <ThemedText style={styles.text}>{entry.text}</ThemedText>}
        </ScrollView>

        {isMine && (
          <ThemedView style={[styles.footer, { borderTopColor: iconColor }]}>
            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              style={[styles.footerButton, { opacity: deleting ? 0.5 : 1 }]}
            >
              <ThemedText style={styles.deleteText}>削除</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleEdit}
              style={[styles.footerButton, styles.editButton, { backgroundColor: tintColor }]}
            >
              <ThemedText style={[styles.editText, { color: backgroundColor }]}>編集</ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeText: {
    fontSize: 16,
  },
  closeAlt: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  dateLabel: {
    fontSize: 18,
  },
  ageLabel: {
    fontSize: 13,
  },
  authorLabel: {
    fontSize: 13,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  footerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 15,
    color: '#c0392b',
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
