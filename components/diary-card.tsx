import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'

import { AuthorAvatar } from '@/components/author-avatar'
import { ThemedText } from '@/components/themed-text'
import { Radius, Shadow } from '@/constants/theme'
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
  style?: StyleProp<ViewStyle>
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
  style,
}: DiaryCardProps) {
  const iconColor = useThemeColor({}, 'icon')
  const cardColor = useThemeColor({}, 'card')
  const borderColor = useThemeColor({}, 'border')

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardColor, borderColor },
        Shadow.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.date}>
              {formatEntryDate(entryDate)}
            </ThemedText>
            <ThemedText style={[styles.age, { color: iconColor }]} numberOfLines={1}>
              {getAgeDisplay(birthday, new Date(entryDate + 'T00:00:00'))}
            </ThemedText>
          </View>
          {authorName && <AuthorAvatar name={authorName} size={20} />}
        </View>
        {text && (
          <ThemedText numberOfLines={3} style={styles.text}>
            {text}
          </ThemedText>
        )}
      </View>
      {photoUrl && (
        <View style={styles.thumbnailWrap}>
          <Image source={{ uri: photoUrl }} style={styles.thumbnailImage} contentFit="cover" />
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  content: {
    flex: 6,
    padding: 14,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  date: {
    fontSize: 15,
    lineHeight: 20,
  },
  age: {
    fontSize: 12,
    lineHeight: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
  },
  thumbnailWrap: {
    flex: 4,
    minHeight: 88,
    overflow: 'hidden',
  },
  thumbnailImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
