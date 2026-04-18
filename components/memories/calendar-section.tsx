import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Calendar, type DateData, LocaleConfig } from 'react-native-calendars'

import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'

import type { MemoriesEntry } from './types'

LocaleConfig.locales['ja'] = {
  monthNames: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  dayNames: [
    '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日',
  ],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日',
}
LocaleConfig.defaultLocale = 'ja'

type CalendarSectionProps = {
  entries: MemoriesEntry[]
}

export function CalendarSection({ entries }: CalendarSectionProps) {
  const router = useRouter()
  const tintColor = useThemeColor({}, 'tint')
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const iconColor = useThemeColor({}, 'icon')

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {}
    for (const e of entries) {
      marks[e.entry_date] = { marked: true, dotColor: tintColor }
    }
    return marks
  }, [entries, tintColor])

  const handleDayPress = (day: DateData) => {
    const entry = entries.find((e) => e.entry_date === day.dateString)
    if (entry) {
      router.push(`/diary/${entry.id}`)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        monthFormat="yyyy年 M月"
        firstDay={0}
        enableSwipeMonths
        theme={{
          backgroundColor,
          calendarBackground: backgroundColor,
          textSectionTitleColor: iconColor,
          dayTextColor: textColor,
          monthTextColor: textColor,
          todayTextColor: tintColor,
          arrowColor: tintColor,
          textDisabledColor: iconColor,
          dotColor: tintColor,
          selectedDotColor: tintColor,
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
