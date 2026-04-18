import { useMemo } from 'react'
import { SectionList, StyleSheet, View } from 'react-native'
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
  authorNames: Record<string, string>
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
  authorNames,
}: TimelineSectionProps) {
  const router = useRouter()
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({}, 'border')
  const cardColor = useThemeColor({}, 'card')

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
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            <ThemedText style={[styles.sectionRange, { color: iconColor }]}>
              {section.rangeText}
            </ThemedText>
          </View>
          <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />
        </View>
      )}
      renderItem={({ item, index, section }) => {
        const isFirstInSection = index === 0
        const isLastInSection = index === section.data.length - 1
        const hasPhoto = !!item.photo_url
        return (
          <View style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: tintColor,
                    top: isFirstInSection ? 24 : 0,
                    bottom: isLastInSection ? '60%' : 0,
                  },
                ]}
              />
              <View
                style={[
                  hasPhoto ? styles.dotLarge : styles.dot,
                  { backgroundColor: tintColor, borderColor: cardColor },
                ]}
              />
            </View>
            <View style={styles.cardWrap}>
              <DiaryCard
                entryDate={item.entry_date}
                text={item.text}
                photoUrl={item.photo_url ? signedUrls[item.photo_url] ?? null : null}
                birthday={birthday}
                onPress={() => router.push(`/diary/${item.id}`)}
                authorName={authorNames[item.author_id] ?? null}
                style={styles.timelineCard}
              />
            </View>
          </View>
        )
      }}
      contentContainerStyle={styles.list}
    />
  )
}

const RAIL_WIDTH = 28
const LINE_WIDTH = 2

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    letterSpacing: 0.3,
  },
  sectionRange: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
  },
  rail: {
    width: RAIL_WIDTH,
    position: 'relative',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    left: (RAIL_WIDTH - LINE_WIDTH) / 2,
    width: LINE_WIDTH,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 22,
    borderWidth: 2,
    zIndex: 1,
  },
  dotLarge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 20,
    borderWidth: 3,
    zIndex: 1,
  },
  cardWrap: {
    flex: 1,
    paddingLeft: 8,
  },
  timelineCard: {
    marginHorizontal: 0,
    marginVertical: 6,
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
