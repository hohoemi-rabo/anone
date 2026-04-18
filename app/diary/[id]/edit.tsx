import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getAgeDisplay } from '@/lib/age'
import {
  deletePhoto,
  getSignedPhotoUrl,
  type PickedImage,
  uploadDiaryPhoto,
  withTimeout,
} from '@/lib/image'
import { supabase } from '@/lib/supabase'

const MAX_TEXT_LENGTH = 500

type PhotoState =
  | { kind: 'none' }
  | { kind: 'existing'; path: string; signedUrl: string | null }
  | { kind: 'new'; image: PickedImage }

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}曜日`
}

export default function DiaryEditScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { child } = useChild()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [text, setText] = useState('')
  const [entryDate, setEntryDate] = useState<string | null>(null)
  const [photo, setPhoto] = useState<PhotoState>({ kind: 'none' })

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

  useEffect(() => {
    if (!id) return
    const fetchEntry = async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('text, photo_url, entry_date, author_id')
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        Alert.alert('取得エラー', '日記が取得できませんでした')
        router.back()
        return
      }

      if (data.author_id !== session?.user.id) {
        Alert.alert('編集権限なし', '他のメンバーの日記は編集できません')
        router.back()
        return
      }

      setText(data.text ?? '')
      setEntryDate(data.entry_date)
      if (data.photo_url) {
        const signed = await getSignedPhotoUrl(data.photo_url)
        setPhoto({ kind: 'existing', path: data.photo_url, signedUrl: signed })
      }
      setLoading(false)
    }
    fetchEntry()
  }, [id, router, session?.user.id])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('権限エラー', '写真へのアクセスを許可してください')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0]
      setPhoto({ kind: 'new', image: { uri: a.uri, width: a.width, height: a.height } })
    }
  }

  const removePhoto = () => {
    setPhoto({ kind: 'none' })
  }

  const handleUpdate = async () => {
    if (!text.trim()) {
      Alert.alert('入力エラー', '日記を入力してください')
      return
    }
    if (!id || !child) return

    setSaving(true)
    try {
      const uploadPromise =
        photo.kind === 'new'
          ? uploadDiaryPhoto(child.id, entryDate ?? '', photo.image)
          : Promise.resolve<string | null>(photo.kind === 'existing' ? photo.path : null)

      const currentPromise = supabase
        .from('diary_entries')
        .select('photo_url')
        .eq('id', id)
        .maybeSingle()

      const [newPhotoPath, { data: current }] = await Promise.all([
        uploadPromise,
        currentPromise,
      ])

      const oldPathToDelete =
        current?.photo_url && current.photo_url !== newPhotoPath ? current.photo_url : null

      const { error } = await withTimeout(
        '更新',
        supabase
          .from('diary_entries')
          .update({ text: text.trim(), photo_url: newPhotoPath })
          .eq('id', id),
      )
      if (error) throw error

      if (oldPathToDelete) await deletePhoto(oldPathToDelete)

      router.back()
    } catch (err) {
      Alert.alert('更新エラー', (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    )
  }

  const previewUri =
    photo.kind === 'new'
      ? photo.image.uri
      : photo.kind === 'existing'
        ? photo.signedUrl
        : null

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.dateRow}>
            {entryDate && (
              <ThemedText type="defaultSemiBold">{formatDateLabel(entryDate)}</ThemedText>
            )}
            {child && entryDate && (
              <ThemedText style={[styles.ageText, { color: iconColor }]}>
                {getAgeDisplay(child.birthday, new Date(entryDate + 'T00:00:00'))}
              </ThemedText>
            )}
          </ThemedView>

          <TextInput
            style={[styles.textInput, { color: textColor, borderColor: iconColor }]}
            placeholder="今日はどんな日でしたか？"
            placeholderTextColor={iconColor}
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_TEXT_LENGTH))}
            multiline
            textAlignVertical="top"
          />
          <ThemedText style={[styles.counter, { color: iconColor }]}>
            {text.length}/{MAX_TEXT_LENGTH}
          </ThemedText>

          {previewUri && (
            <ThemedView style={styles.previewContainer}>
              <Image source={{ uri: previewUri }} style={styles.preview} contentFit="cover" />
              <Pressable style={styles.removeButton} onPress={removePhoto}>
                <ThemedText style={styles.removeButtonText}>×</ThemedText>
              </Pressable>
            </ThemedView>
          )}
        </ScrollView>

        <ThemedView style={[styles.footer, { borderTopColor: iconColor }]}>
          <Pressable style={styles.photoButton} onPress={pickImage}>
            <ThemedText style={{ color: tintColor }}>
              {photo.kind === 'none' ? '写真を追加' : '写真を変更'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.saveButton, { backgroundColor: tintColor, opacity: saving ? 0.6 : 1 }]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <ThemedText style={[styles.saveButtonText, { color: backgroundColor }]}>
              {saving ? '更新中...' : '更新'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  ageText: {
    fontSize: 13,
  },
  textInput: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  counter: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    marginTop: 12,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  photoButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
