import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { Radius } from '@/constants/theme'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getAgeDisplay } from '@/lib/age'
import { getSignedPhotoUrl } from '@/lib/image'

export function ChildHeader() {
  const { child } = useChild()
  const surfaceColor = useThemeColor({}, 'surface')
  const textColor = useThemeColor({}, 'text')
  const cardColor = useThemeColor({}, 'card')

  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const childIconPath = child?.icon_url ?? null

  useEffect(() => {
    let cancelled = false
    if (childIconPath) {
      getSignedPhotoUrl(childIconPath).then((url) => {
        if (!cancelled) setIconUrl(url)
      })
    } else {
      setIconUrl(null)
    }
    return () => {
      cancelled = true
    }
  }, [childIconPath])

  if (!child) return null

  const initial = child.name.trim()[0] ?? '?'

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: surfaceColor }}>
      <View style={styles.container}>
        <View style={[styles.avatar, { backgroundColor: cardColor }]}>
          {iconUrl ? (
            <Image source={{ uri: iconUrl }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <ThemedText style={[styles.initial, { color: textColor }]}>{initial}</ThemedText>
          )}
        </View>
        <View style={styles.text}>
          <ThemedText type="subtitle" style={[styles.name, { color: textColor }]}>
            {child.name}
          </ThemedText>
          <ThemedText style={[styles.age, { color: textColor, opacity: 0.75 }]}>
            {getAgeDisplay(child.birthday)}
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initial: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    lineHeight: 22,
  },
  age: {
    fontSize: 13,
    marginTop: 2,
  },
})
