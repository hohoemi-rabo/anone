import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useChild } from '@/hooks/use-child'
import { supabase } from '@/lib/supabase'

export type FamilyMember = {
  user_id: string
  name: string | null
  avatar_url: string | null
  role: string
  joined_at: string
}

type FamilyMembersContextType = {
  members: FamilyMember[]
  isLoading: boolean
  refresh: () => Promise<void>
}

const FamilyMembersContext = createContext<FamilyMembersContextType | null>(null)

export function useFamilyMembers() {
  const ctx = useContext(FamilyMembersContext)
  if (!ctx) {
    throw new Error('useFamilyMembers must be used within FamilyMembersContext.Provider')
  }
  return ctx
}

export { FamilyMembersContext }

export function useFamilyMembersProvider(): FamilyMembersContextType {
  const { child } = useChild()
  const childId = child?.id

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
