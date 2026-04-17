import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

type Child = {
  id: string
  name: string
  birthday: string
  icon_url: string | null
}

export function useChild() {
  const { session } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user.id) {
      setChild(null)
      setIsLoading(false)
      return
    }

    const fetchChild = async () => {
      const { data } = await supabase
        .from('child_members')
        .select('child_id')
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
      }
      setIsLoading(false)
    }

    fetchChild()
  }, [session?.user.id])

  return { child, isLoading }
}
