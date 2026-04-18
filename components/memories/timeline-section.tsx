import { useMemo } from 'react'
import { Platform, SectionList, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'

import { DiaryCard } from '@/components/diary-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getDaysOld } from '@/lib/age'

import type { MemoriesEntry } from './types'

type TimelineSectionProps = {
  entries: MemoriesEntry[]
  signedUrls: Record<string, string>
  birthday: string
}

type Section = {
  title: string
  rangeText: string
  data: MemoriesEntry[]
}

function groupByMonth(entries: MemoriesEntry[], birthday: string): Section[] {
  const groups = new Map<string, MemoriesEntry[]>()
  for (const e of entries) {
    const key = e.entry_date.slice(0, 7)
    const arr = groups.get(key)
    if (arr) {
      arr.push(e)
    } else {
      groups.set(key, [e])
    }
  }
  return Array.from(groups.entries()).map(([key, items]) => {
    const [y, m] = key.split('-')
    const minDate = items[items.length - 1].entry_date
    const maxDate = items[0].entry_date
    const minDays = getDaysOld(birthday, new Date(minDate + 'T00:00:00'))
    const maxDays = getDaysOld(birthday, new Date(maxDate + 'T00:00:00'))
    const rangeText =
      minDays === maxDays ? `生後${minDays}日` : `生後${minDays}日〜${maxDays}日`
    return {
      title: `${Number(y)}年${Number(m)}月`,
      rangeText,
      data: items,
    }
  })
}

export function TimelineSection({
  entries,
  signedUrls,
  birthday,
}: TimelineSectionProps) {
  const router = useRouter()
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const headerBg = useThemeColor({ light: '#f6f7f8', dark: '#1f2123' }, 'background')

  const sections = useMemo(
    () => groupByMonth(entries, birthday),
    [entries, birthday],
  )

  if (sections.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText style={[styles.emptyText, { color: iconColor }]}>
          まだ日記がありません
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { backgroundColor: headerBg }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          <ThemedText style={[styles.sectionRange, { color: iconColor }]}>
            {section.rangeText}
          </ThemedText>
        </View>
      )}
      renderItem={({ item }) => {
        const hasPhoto = !!item.photo_url
        return (
          <View style={hasPhoto ? [styles.photoEmphasis, { borderLeftColor: tintColor }] : undefined}>
            <DiaryCard
              entryDate={item.entry_date}
              text={item.text}
              photoUrl={item.photo_url ? signedUrls[item.photo_url] ?? null : null}
              birthday={birthday}
              onPress={() => router.push(`/diary/${item.id}`)}
            />
          </View>
        )
      }}
      contentContainerStyle={styles.list}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionRange: {
    fontSize: 12,
  },
  photoEmphasis: {
    borderLeftWidth: 3,
    marginLeft: 0,
    ...Platform.select({
      android: { elevation: 1 },
      default: {},
    }),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
  },
})
