import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export type FamilyMember = {
  user_id: string
  name: string | null
  avatar_url: string | null
  role: string
  joined_at: string
}

export function useFamilyMembers(childId: string | undefined) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!childId) {
      setMembers([])
      return
    }
    setIsLoading(true)
    const { data, error } = await supabase.rpc('get_family_members', {
      p_child_id: childId,
    })
    if (!error && data) {
      setMembers(data as FamilyMember[])
    }
    setIsLoading(false)
  }, [childId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { members, isLoading, refresh }
}
