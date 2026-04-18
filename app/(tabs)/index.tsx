import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'

import { ChildHeader } from '@/components/child-header'
import { DiaryCard } from '@/components/diary-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useChild } from '@/hooks/use-child'
import { useFamilyMembers } from '@/hooks/use-family-members'
import { useThemeColor } from '@/hooks/use-theme-color'
import { deletePhoto, getSignedPhotoUrl } from '@/lib/image'
import { supabase } from '@/lib/supabase'

type DiaryEntry = {
  id: string
  entry_date: string
  text: string | null
  photo_url: string | null
  author_id: string
}

const PAGE_SIZE = 20

export default function HomeScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { child } = useChild()
  const { members } = useFamilyMembers()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [oneYearAgoEntry, setOneYearAgoEntry] = useState<DiaryEntry | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const memberNameById = new Map(members.map((m) => [m.user_id, m.name]))
  const authorNameOf = (authorId: string): string | null => {
    if (members.length <= 1) return null
    if (authorId === session?.user.id) return null
    return memberNameById.get(authorId) ?? '家族のメンバー'
  }

  const tintColor = useThemeColor({}, 'tint')
  const onTintColor = useThemeColor({}, 'onTint')
  const iconColor = useThemeColor({}, 'icon')

  const childId = child?.id

  const fetchEntries = useCallback(async (offset = 0, append = false) => {
    if (!childId) return

    const { data, error } = await supabase
      .from('diary_entries')
      .select('id, entry_date, text, photo_url, author_id')
      .eq('child_id', childId)
      .order('entry_date', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      Alert.alert('取得エラー', error.message)
      return
    }

    if (data) {
      setEntries((prev) => (append ? [...prev, ...data] : data))
      setHasMore(data.length === PAGE_SIZE)
    }
  }, [childId])

  const fetchOneYearAgo = useCallback(async () => {
    if (!childId) return

    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const y = oneYearAgo.getFullYear()
    const m = String(oneYearAgo.getMonth() + 1).padStart(2, '0')
    const d = String(oneYearAgo.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    const { data } = await supabase
      .from('diary_entries')
      .select('id, entry_date, text, photo_url, author_id')
      .eq('child_id', childId)
      .eq('entry_date', dateStr)
      .limit(1)
      .maybeSingle()

    setOneYearAgoEntry(data)
  }, [childId])

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  useFocusEffect(
    useCallback(() => {
      if (childId) {
        fetchEntries()
        fetchOneYearAgo()
      }
    }, [childId, fetchEntries, fetchOneYearAgo]),
  )

  const photoPathsKey = (() => {
    const paths: string[] = []
    if (oneYearAgoEntry?.photo_url) paths.push(oneYearAgoEntry.photo_url)
    for (const e of entries) {
      if (e.photo_url) paths.push(e.photo_url)
    }
    return paths.join('|')
  })()

  useEffect(() => {
    if (!photoPathsKey) return
    const paths = photoPathsKey.split('|')
    const resolve = async () => {
      const urls: Record<string, string> = {}
      for (const path of paths) {
        if (!signedUrls[path]) {
          const signed = await getSignedPhotoUrl(path)
          if (signed) urls[path] = signed
        }
      }
      if (Object.keys(urls).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...urls }))
      }
    }
    resolve()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPathsKey])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchEntries(), fetchOneYearAgo()])
    setRefreshing(false)
  }

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    await fetchEntries(entries.length, true)
    setLoadingMore(false)
  }

  const handleDelete = (entry: DiaryEntry) => {
    if (entry.author_id !== session?.user.id) return

    Alert.alert('日記を削除', 'この日記を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          if (entry.photo_url) {
            await deletePhoto(entry.photo_url)
          }
          await supabase.from('diary_entries').delete().eq('id', entry.id)
          setEntries((prev) => prev.filter((e) => e.id !== entry.id))
        },
      },
    ])
  }

  const renderEmpty = () => (
    <ThemedView style={styles.empty}>
      <ThemedText style={[styles.emptyText, { color: iconColor }]}>
        まだ日記がありません
      </ThemedText>
      <Pressable
        style={[styles.writeButton, { backgroundColor: tintColor }]}
        onPress={() => router.navigate('/(tabs)/write')}
      >
        <ThemedText style={[styles.writeButtonText, { color: onTintColor }]}>
          日記を書く
        </ThemedText>
      </Pressable>
    </ThemedView>
  )

  const renderHeader = () => {
    if (!oneYearAgoEntry || !child) return null

    return (
      <ThemedView style={styles.oneYearAgo}>
        <ThemedText type="defaultSemiBold" style={[styles.oneYearAgoLabel, { color: tintColor }]}>
          1年前の今日
        </ThemedText>
        <DiaryCard
          entryDate={oneYearAgoEntry.entry_date}
          text={oneYearAgoEntry.text}
          photoUrl={
            oneYearAgoEntry.photo_url
              ? signedUrls[oneYearAgoEntry.photo_url] ?? null
              : null
          }
          birthday={child.birthday}
          onPress={() => router.push(`/diary/${oneYearAgoEntry.id}`)}
          authorName={authorNameOf(oneYearAgoEntry.author_id)}
        />
      </ThemedView>
    )
  }

  if (!child) return null

  return (
    <View style={styles.safeArea}>
      <ChildHeader />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DiaryCard
            entryDate={item.entry_date}
            text={item.text}
            photoUrl={item.photo_url ? signedUrls[item.photo_url] ?? null : null}
            birthday={child.birthday}
            onPress={() => router.push(`/diary/${item.id}`)}
            onLongPress={
              item.author_id === session?.user.id ? () => handleDelete(item) : undefined
            }
            authorName={authorNameOf(item.author_id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  writeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  writeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  oneYearAgo: {
    marginBottom: 8,
  },
  oneYearAgoLabel: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 14,
  },
})
