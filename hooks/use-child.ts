import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

type Child = {
  id: string
  name: string
  birthday: string
  icon_url: string | null
}

type ChildRole = 'owner' | 'member' | null

export function useChild() {
  const { session } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [role, setRole] = useState<ChildRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchChild = useCallback(async () => {
    if (!session?.user.id) {
      setChild(null)
      setRole(null)
      setIsLoading(false)
      return
    }

    const { data } = await supabase
      .from('child_members')
      .select('child_id, role')
      .eq('user_id', session.user.id)
      .limit(1)
      .single()

    if (data) {
      const { data: childData } = await supabase
        .from('children')
        .select('id, name, birthday, icon_url')
        .eq('id', data.child_id)
        .single()

      setChild(childData)
      setRole((data.role as ChildRole) ?? 'member')
    }
    setIsLoading(false)
  }, [session?.user.id])

  useEffect(() => {
    fetchChild()
  }, [fetchChild])

  return { child, role, isLoading, refresh: fetchChild }
}
