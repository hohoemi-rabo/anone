import { useState } from 'react'
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

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useThemeColor } from '@/hooks/use-theme-color'
import { type PickedImage, uploadChildIcon } from '@/lib/image'
import { supabase } from '@/lib/supabase'

export default function ChildRegisterScreen() {
  const router = useRouter()
  const { refreshChildStatus } = useAuth()
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [iconImage, setIconImage] = useState<PickedImage | null>(null)
  const [loading, setLoading] = useState(false)

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

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
      setIconImage({ uri: a.uri, width: a.width, height: a.height })
    }
  }

  const handleRegister = async () => {
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
      const { data: childId, error } = await supabase.rpc('create_child_with_owner', {
        child_name: trimmedName,
        child_birthday: toISODate(birthday),
      })

      if (error) throw error

      if (iconImage && childId) {
        try {
          const iconPath = await uploadChildIcon(childId, iconImage)
          await supabase.from('children').update({ icon_url: iconPath }).eq('id', childId)
        } catch (iconError) {
          Alert.alert(
            'アイコンアップロード失敗',
            `登録は完了しましたが、アイコン画像の保存に失敗しました。\n${(iconError as Error).message}`,
          )
        }
      }

      await refreshChildStatus()
    } catch (error) {
      Alert.alert('登録エラー', (error as Error).message)
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
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            お子さまの情報
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: iconColor }]}>
            日記の主人公を登録しましょう
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.iconField}>
            <Pressable
              onPress={pickIcon}
              style={[styles.iconButton, { borderColor: iconColor }]}
            >
              {iconImage ? (
                <Image source={{ uri: iconImage.uri }} style={styles.iconImage} contentFit="cover" />
              ) : (
                <ThemedText style={[styles.iconPlaceholder, { color: iconColor }]}>
                  写真を{'\n'}選ぶ
                </ThemedText>
              )}
            </Pressable>
            {iconImage && (
              <Pressable onPress={() => setIconImage(null)}>
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
            onPress={handleRegister}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              {loading ? '登録中...' : '登録する'}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/invite-join')}
            style={styles.inviteLink}
            disabled={loading}
          >
            <ThemedText style={[styles.inviteLinkText, { color: tintColor }]}>
              すでに招待コードをお持ちですか？
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
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
  inviteLink: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  inviteLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
