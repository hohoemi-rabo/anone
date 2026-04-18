import { Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'

import { AuthorAvatar } from '@/components/author-avatar'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getAgeDisplay } from '@/lib/age'

type DiaryCardProps = {
  entryDate: string
  text: string | null
  photoUrl: string | null
  birthday: string
  onPress: () => void
  onLongPress?: () => void
  authorName?: string | null
}

function formatEntryDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.getMonth() + 1
  const day = date.getDate()
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const dayName = days[date.getDay()]
  return `${month}月${day}日 ${dayName}曜日`
}

export function DiaryCard({
  entryDate,
  text,
  photoUrl,
  birthday,
  onPress,
  onLongPress,
  authorName,
}: DiaryCardProps) {
  const iconColor = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon')

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.card, { borderColor }]}
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="defaultSemiBold">{formatEntryDate(entryDate)}</ThemedText>
          <ThemedText style={[styles.age, { color: iconColor }]}>
            {getAgeDisplay(birthday, new Date(entryDate + 'T00:00:00'))}
          </ThemedText>
          {authorName && (
            <View style={styles.authorWrap}>
              <AuthorAvatar name={authorName} size={20} />
            </View>
          )}
        </ThemedView>
        {text && (
          <ThemedText numberOfLines={3} style={styles.text}>
            {text}
          </ThemedText>
        )}
      </ThemedView>
      {photoUrl && (
        <Image source={{ uri: photoUrl }} style={styles.thumbnail} contentFit="cover" />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorWrap: {
    marginLeft: 'auto',
  },
  age: {
    fontSize: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  thumbnail: {
    width: 80,
    height: '100%',
    minHeight: 80,
  },
})
