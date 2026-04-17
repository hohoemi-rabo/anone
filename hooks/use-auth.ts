import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

type AuthContextType = {
  session: Session | null
  isLoading: boolean
  hasChild: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshChildStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }

export function useAuthProvider(): AuthContextType {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChild, setHasChild] = useState(false)

  const checkChildStatus = async (userId: string) => {
    const { data } = await supabase
      .from('child_members')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    setHasChild(!!data && data.length > 0)
  }

  const refreshChildStatus = async () => {
    if (session?.user.id) {
      await checkChildStatus(session.user.id)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user.id) {
        await checkChildStatus(session.user.id)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user.id) {
        await checkChildStatus(session.user.id)
      } else {
        setHasChild(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { session, isLoading, hasChild, signIn, signUp, signOut, refreshChildStatus }
}
