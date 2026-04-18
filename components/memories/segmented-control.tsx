import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
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
  const backgroundColor = useThemeColor({}, 'background')
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon')
  const textColor = useThemeColor({}, 'text')

  return (
    <View style={[styles.container, { borderColor }]}>
      {options.map((option) => {
        const isActive = option.key === value
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.button,
              { backgroundColor: isActive ? tintColor : 'transparent' },
            ]}
          >
            <ThemedText
              style={[
                styles.label,
                { color: isActive ? backgroundColor : textColor },
              ]}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
})
