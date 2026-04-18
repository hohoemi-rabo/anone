import { useState } from 'react'
import {
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
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ChildHeader } from '@/components/child-header'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useChild } from '@/hooks/use-child'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getAgeDisplay } from '@/lib/age'
import { deletePhoto, type PickedImage, uploadDiaryPhoto, withTimeout } from '@/lib/image'
import { supabase } from '@/lib/supabase'

const MAX_TEXT_LENGTH = 500

function formatTodayLabel(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const day = days[now.getDay()]
  return `${month}月${date}日 ${day}曜日`
}

function toISODate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function WriteScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { child } = useChild()
  const [text, setText] = useState('')
  const [image, setImage] = useState<PickedImage | null>(null)
  const [saving, setSaving] = useState(false)

  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const backgroundColor = useThemeColor({}, 'background')

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
      setImage({ uri: a.uri, width: a.width, height: a.height })
    }
  }

  const persist = async () => {
    if (!child || !session) return
    const entryDate = toISODate()
    const userId = session.user.id

    const { data: existingRows, error: selectError } = await withTimeout(
      '既存チェック',
      supabase
        .from('diary_entries')
        .select('id, photo_url')
        .eq('child_id', child.id)
        .eq('author_id', userId)
        .eq('entry_date', entryDate)
        .limit(1),
    )
    if (selectError) throw selectError
    const existing = existingRows?.[0] ?? null

    if (existing) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert('今日の日記があります', '今日の日記を上書きしますか？', [
          { text: 'キャンセル', style: 'cancel', onPress: () => resolve(false) },
          { text: '上書き', onPress: () => resolve(true) },
        ])
      })
      if (!confirmed) return false

      const [, photoUrl] = await Promise.all([
        image && existing.photo_url
          ? deletePhoto(existing.photo_url)
          : Promise.resolve(),
        image
          ? uploadDiaryPhoto(child.id, entryDate, image)
          : Promise.resolve(existing.photo_url),
      ])
      const { error } = await withTimeout(
        '更新',
        supabase
          .from('diary_entries')
          .update({ text: text.trim(), photo_url: photoUrl })
          .eq('id', existing.id),
      )
      if (error) throw error
    } else {
      const photoUrl = image ? await uploadDiaryPhoto(child.id, entryDate, image) : null
      const { error } = await withTimeout(
        '登録',
        supabase.from('diary_entries').insert({
          child_id: child.id,
          author_id: userId,
          entry_date: entryDate,
          text: text.trim(),
          photo_url: photoUrl,
        }),
      )
      if (error) throw error
    }
    return true
  }

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('入力エラー', '日記を入力してください')
      return
    }
    if (!child || !session) return

    setSaving(true)
    try {
      const ok = await persist()
      if (ok) {
        setText('')
        setImage(null)
        router.navigate('/(tabs)')
      }
    } catch (error) {
      const message = (error as Error).message ?? '保存に失敗しました'
      Alert.alert('保存エラー', `${message}\n\n再試行しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        { text: '再試行', onPress: () => handleSave() },
      ])
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ChildHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.dateRow}>
            <ThemedText type="defaultSemiBold">{formatTodayLabel()}</ThemedText>
            {child && (
              <ThemedText style={[styles.ageText, { color: iconColor }]}>
                {getAgeDisplay(child.birthday)}
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

          {image && (
            <ThemedView style={styles.previewContainer}>
              <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" />
              <Pressable
                style={styles.removeButton}
                onPress={() => setImage(null)}
              >
                <ThemedText style={styles.removeButtonText}>×</ThemedText>
              </Pressable>
            </ThemedView>
          )}
        </ScrollView>

        <ThemedView style={[styles.footer, { borderTopColor: iconColor }]}>
          <Pressable style={styles.photoButton} onPress={pickImage}>
            <ThemedText style={{ color: tintColor }}>
              {image ? '写真を変更' : '写真を追加'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.saveButton, { backgroundColor: tintColor, opacity: saving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText style={[styles.saveButtonText, { color: backgroundColor }]}>
              {saving ? '保存中...' : '保存'}
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
