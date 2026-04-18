import { ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

import { DiaryCard } from '@/components/diary-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'

import type { MemoriesEntry } from './types'

type OneYearAgoSectionProps = {
  entries: MemoriesEntry[]
  signedUrls: Record<string, string>
  birthday: string
}

function formatOneYearAgoDate(): string {
  const now = new Date()
  const past = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const y = past.getFullYear()
  const m = String(past.getMonth() + 1).padStart(2, '0')
  const d = String(past.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function OneYearAgoSection({
  entries,
  signedUrls,
  birthday,
}: OneYearAgoSectionProps) {
  const router = useRouter()
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const targetDate = formatOneYearAgoDate()
  const entry = entries.find((e) => e.entry_date === targetDate) ?? null

  if (!entry) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText style={[styles.emptyText, { color: iconColor }]}>
          1年前の今日に書かれた日記はありません
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.label, { color: tintColor }]}
      >
        1年前の今日
      </ThemedText>
      <DiaryCard
        entryDate={entry.entry_date}
        text={entry.text}
        photoUrl={entry.photo_url ? signedUrls[entry.photo_url] ?? null : null}
        birthday={birthday}
        onPress={() => router.push(`/diary/${entry.id}`)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  label: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
})
