import { useCallback, useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ChildHeader } from '@/components/child-header'
import { CalendarSection } from '@/components/memories/calendar-section'
import { OneYearAgoSection } from '@/components/memories/one-year-ago-section'
import { SegmentedControl } from '@/components/memories/segmented-control'
import { TimelineSection } from '@/components/memories/timeline-section'
import type { MemoriesEntry } from '@/components/memories/types'
import { useChild } from '@/hooks/use-child'
import { getSignedPhotoUrl } from '@/lib/image'
import { supabase } from '@/lib/supabase'

type Section = 'oneYearAgo' | 'timeline' | 'calendar'

const SECTION_OPTIONS = [
  { key: 'oneYearAgo' as const, label: '1年前' },
  { key: 'timeline' as const, label: 'タイムライン' },
  { key: 'calendar' as const, label: 'カレンダー' },
]

export default function MemoriesScreen() {
  const { child } = useChild()
  const [entries, setEntries] = useState<MemoriesEntry[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<Section>('oneYearAgo')

  const childId = child?.id

  const fetchEntries = useCallback(async () => {
    if (!childId) return
    const { data, error } = await supabase
      .from('diary_entries')
      .select('id, entry_date, text, photo_url, author_id')
      .eq('child_id', childId)
      .order('entry_date', { ascending: false })
    if (error) {
      Alert.alert('取得エラー', error.message)
      return
    }
    if (data) setEntries(data)
  }, [childId])

  useEffect(() => {
    if (childId) fetchEntries()
  }, [childId, fetchEntries])

  useFocusEffect(
    useCallback(() => {
      if (childId) fetchEntries()
    }, [childId, fetchEntries]),
  )

  useEffect(() => {
    const resolve = async () => {
      const urls: Record<string, string> = {}
      for (const item of entries) {
        if (item.photo_url && !signedUrls[item.photo_url]) {
          const signed = await getSignedPhotoUrl(item.photo_url)
          if (signed) urls[item.photo_url] = signed
        }
      }
      if (Object.keys(urls).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...urls }))
      }
    }
    resolve()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])

  if (!child) return null

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ChildHeader />
      <SegmentedControl
        options={SECTION_OPTIONS}
        value={activeSection}
        onChange={setActiveSection}
      />
      {activeSection === 'oneYearAgo' && (
        <OneYearAgoSection
          entries={entries}
          signedUrls={signedUrls}
          birthday={child.birthday}
        />
      )}
      {activeSection === 'timeline' && (
        <TimelineSection
          entries={entries}
          signedUrls={signedUrls}
          birthday={child.birthday}
        />
      )}
      {activeSection === 'calendar' && <CalendarSection entries={entries} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
})
