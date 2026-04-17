import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ChildHeader } from '@/components/child-header'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function WriteScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ChildHeader />
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">今日の日記</ThemedText>
        <ThemedText>ここに日記入力フォームが表示されます</ThemedText>
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
