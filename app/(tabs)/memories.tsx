import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ChildHeader } from '@/components/child-header'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function MemoriesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ChildHeader />
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">思い出</ThemedText>
        <ThemedText>ここに振り返り機能が表示されます</ThemedText>
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
    padding: 16,
  },
})
