import { useCallback } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'

import { AuthorAvatar } from '@/components/author-avatar'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/hooks/use-auth'
import { useChild } from '@/hooks/use-child'
import { type FamilyMember, useFamilyMembers } from '@/hooks/use-family-members'
import { useThemeColor } from '@/hooks/use-theme-color'
import { supabase } from '@/lib/supabase'

function formatJoinedAt(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}年${m}月${day}日 参加`
}

export default function MembersScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { child, role } = useChild()
  const { members, refresh } = useFamilyMembers()

  const tintColor = useThemeColor({}, 'tint')
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon')
  const dangerColor = useThemeColor({ light: '#d33', dark: '#f66' }, 'tint')

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh]),
  )

  if (!child) return null

  if (role !== 'owner') {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notOwner}>
          <ThemedText style={[styles.notOwnerText, { color: iconColor }]}>
            メンバー管理はオーナーのみ可能です
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
              閉じる
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    )
  }

  const handleRemove = (member: FamilyMember) => {
    Alert.alert(
      'メンバー削除',
      `${member.name ?? 'メンバー'} さんをこのお子さまから削除しますか？\nこの人は今後この子の日記にアクセスできなくなります。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.rpc('remove_family_member', {
              p_child_id: child.id,
              p_user_id: member.user_id,
            })
            if (error) {
              Alert.alert('削除エラー', error.message)
              return
            }
            await refresh()
          },
        },
      ],
    )
  }

  const renderItem = ({ item }: { item: FamilyMember }) => {
    const isMe = item.user_id === session?.user.id
    return (
      <View style={[styles.row, { borderBottomColor: borderColor }]}>
        <AuthorAvatar name={item.name} size={40} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
              {item.name ?? '名前未設定'}
              {isMe ? ' (あなた)' : ''}
            </ThemedText>
            <View
              style={[
                styles.badge,
                { borderColor: item.role === 'owner' ? tintColor : iconColor },
              ]}
            >
              <ThemedText
                style={[
                  styles.badgeText,
                  { color: item.role === 'owner' ? tintColor : iconColor },
                ]}
              >
                {item.role === 'owner' ? 'オーナー' : 'メンバー'}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.joinedAt, { color: iconColor }]}>
            {formatJoinedAt(item.joined_at)}
          </ThemedText>
        </View>
        {!isMe && (
          <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
            <ThemedText style={[styles.removeText, { color: dangerColor }]}>削除</ThemedText>
          </Pressable>
        )}
      </View>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(m) => m.user_id}
        renderItem={renderItem}
        ListHeaderComponent={
          <ThemedText style={[styles.header, { color: iconColor }]}>
            最大5人まで共有できます（現在 {members.length} 人）
          </ThemedText>
        }
        ListEmptyComponent={
          <ThemedText style={[styles.empty, { color: iconColor }]}>
            まだメンバーがいません
          </ThemedText>
        }
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
  header: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    flexShrink: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  joinedAt: {
    fontSize: 12,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
    padding: 32,
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
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
})
