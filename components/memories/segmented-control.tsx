import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Radius, Shadow } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'

export type SegmentedOption<T extends string> = {
  key: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const tintColor = useThemeColor({}, 'tint')
  const onTintColor = useThemeColor({}, 'onTint')
  const cardColor = useThemeColor({}, 'card')
  const textColor = useThemeColor({}, 'text')

  const [innerWidth, setInnerWidth] = useState(0)
  const translateX = useRef(new Animated.Value(0)).current
  const isFirstLayout = useRef(true)

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.key === value),
  )
  const segmentWidth = innerWidth > 0 ? innerWidth / options.length : 0

  useEffect(() => {
    if (segmentWidth === 0) return
    const target = activeIndex * segmentWidth
    if (isFirstLayout.current) {
      translateX.setValue(target)
      isFirstLayout.current = false
      return
    }
    Animated.spring(translateX, {
      toValue: target,
      useNativeDriver: true,
      stiffness: 220,
      damping: 22,
      mass: 0.8,
    }).start()
  }, [activeIndex, segmentWidth, translateX])

  return (
    <View style={[styles.container, { backgroundColor: cardColor }, Shadow.card]}>
      <View
        style={styles.inner}
        onLayout={(e) => setInnerWidth(e.nativeEvent.layout.width)}
      >
        {segmentWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                backgroundColor: tintColor,
                width: segmentWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        )}
        {options.map((option) => {
          const isActive = option.key === value
          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.key)}
              style={styles.button}
            >
              <ThemedText
                numberOfLines={1}
                style={[
                  styles.label,
                  isActive
                    ? { color: onTintColor, fontWeight: '700' }
                    : { color: textColor, fontWeight: '500' },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
    padding: 4,
    borderRadius: Radius.pill,
  },
  inner: {
    flexDirection: 'row',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: Radius.pill,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
})
