import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import {
  deletePhoto,
  getSignedPhotoUrl,
  type PickedImage,
  uploadChildIcon,
} from '@/lib/image'
import { supabase } from '@/lib/supabase'

type IconState =
  | { kind: 'unchanged' }
  | { kind: 'removed' }
  | { kind: 'new'; image: PickedImage }

export default function ChildEditScreen() {
  const router = useRouter()
  const { child, role, refresh } = useChild()

  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [iconState, setIconState] = useState<IconState>({ kind: 'unchanged' })
  const [currentIconUrl, setCurrentIconUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const onTintColor = useThemeColor({}, 'onTint')

  useEffect(() => {
    if (child) {
      setName(child.name)
      setBirthday(new Date(child.birthday + 'T00:00:00'))
      if (child.icon_url) {
        getSignedPhotoUrl(child.icon_url).then((url) => setCurrentIconUrl(url))
      }
    }
  }, [child])

  if (!child) return null

  if (role !== 'owner') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.notOwner}>
          <ThemedText style={[styles.notOwnerText, { color: iconColor }]}>
            お子さまの情報の編集はオーナーのみ可能です
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.buttonText, { color: onTintColor }]}>
              閉じる
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    )
  }

  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}年${m}月${d}日`
  }

  const toISODate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setBirthday(selectedDate)
    }
  }

  const pickIcon = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('権限エラー', '写真へのアクセスを許可してください')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0]
      setIconState({
        kind: 'new',
        image: { uri: a.uri, width: a.width, height: a.height },
      })
    }
  }

  const removeIcon = () => {
    setIconState({ kind: 'removed' })
  }

  const previewUri = (() => {
    if (iconState.kind === 'new') return iconState.image.uri
    if (iconState.kind === 'removed') return null
    return currentIconUrl
  })()

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      Alert.alert('入力エラー', 'お子さまの名前を入力してください')
      return
    }
    if (trimmedName.length > 20) {
      Alert.alert('入力エラー', '名前は20文字以内にしてください')
      return
    }

    setLoading(true)
    try {
      const updates: { name: string; birthday: string; icon_url?: string | null } = {
        name: trimmedName,
        birthday: toISODate(birthday),
      }

      let newIconPath: string | null = null
      if (iconState.kind === 'new') {
        newIconPath = await uploadChildIcon(child.id, iconState.image)
        updates.icon_url = newIconPath
      } else if (iconState.kind === 'removed') {
        updates.icon_url = null
      }

      const { error } = await supabase.from('children').update(updates).eq('id', child.id)
      if (error) throw error

      const oldPath = child.icon_url
      if (oldPath && (iconState.kind === 'new' || iconState.kind === 'removed')) {
        await deletePhoto(oldPath)
      }

      await refresh()
      router.back()
    } catch (error) {
      Alert.alert('保存エラー', (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ThemedView style={styles.form}>
          <ThemedView style={styles.iconField}>
            <Pressable
              onPress={pickIcon}
              style={[styles.iconButton, { borderColor: iconColor }]}
            >
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.iconImage} contentFit="cover" />
              ) : (
                <ThemedText style={[styles.iconPlaceholder, { color: iconColor }]}>
                  写真を{'\n'}選ぶ
                </ThemedText>
              )}
            </Pressable>
            {previewUri && (
              <Pressable onPress={removeIcon}>
                <ThemedText style={[styles.iconRemoveText, { color: tintColor }]}>
                  削除
                </ThemedText>
              </Pressable>
            )}
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="defaultSemiBold">名前（ニックネーム可）</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: iconColor }]}
              placeholder="例：はるちゃん"
              placeholderTextColor={iconColor}
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="defaultSemiBold">生年月日</ThemedText>
            <Pressable
              style={[styles.input, styles.dateButton, { borderColor: iconColor }]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{formatDate(birthday)}</ThemedText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={birthday}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}
          </ThemedView>

          <Pressable
            style={[styles.button, { backgroundColor: tintColor, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: onTintColor }]}>
              {loading ? '保存中...' : '保存する'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  form: {
    gap: 24,
  },
  iconField: {
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    fontSize: 12,
    textAlign: 'center',
  },
  iconRemoveText: {
    fontSize: 13,
  },
  field: {
    gap: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  dateButton: {
    justifyContent: 'center',
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notOwner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 24,
  },
  notOwnerText: {
    fontSize: 14,
    textAlign: 'center',
  },
})
