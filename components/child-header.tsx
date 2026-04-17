import { StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useChild } from '@/hooks/use-child'
import { getAgeDisplay } from '@/lib/age'

export function ChildHeader() {
  const { child } = useChild()

  if (!child) return null

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.name}>
        {child.name}
      </ThemedText>
      <ThemedText style={styles.age}>
        {getAgeDisplay(child.birthday)}
      </ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 18,
  },
  age: {
    fontSize: 14,
  },
})
