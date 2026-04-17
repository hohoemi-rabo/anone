import { Platform } from 'react-native'
import { createClient } from '@supabase/supabase-js'

import { Database } from './database.types'

// AsyncStorage は Native 環境でのみ使用（Web SSR では window が存在しないため）
const getStorage = () => {
  if (Platform.OS === 'web') {
    return undefined
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-async-storage/async-storage').default
}

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: getStorage(),
      autoRefreshToken: true,
      persistSession: Platform.OS !== 'web',
      detectSessionInUrl: false,
    },
  }
)
