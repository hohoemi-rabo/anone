import { StyleSheet, Text, View } from 'react-native'

import { useThemeColor } from '@/hooks/use-theme-color'

type AuthorAvatarProps = {
  name: string | null | undefined
  size?: number
}

export function AuthorAvatar({ name, size = 24 }: AuthorAvatarProps) {
  const tintColor = useThemeColor({}, 'tint')
  const onTintColor = useThemeColor({}, 'onTint')

  const initial = (name?.trim()[0] ?? '?').toUpperCase()

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tintColor,
        },
      ]}
    >
      <Text
        style={{
          color: onTintColor,
          fontSize: size * 0.55,
          fontWeight: '600',
          lineHeight: size * 0.7,
        }}
      >
        {initial}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
