import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, StyleSheet } from 'react-native'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { AuthContext, useAuthProvider } from '@/hooks/use-auth'
import { ThemedView } from '@/components/themed-view'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const auth = useAuthProvider()

  if (auth.isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ThemedView style={styles.loading}>
          <ActivityIndicator size="large" />
        </ThemedView>
      </ThemeProvider>
    )
  }

  const isLoggedIn = !!auth.session
  const needsChildRegistration = isLoggedIn && !auth.hasChild

  return (
    <AuthContext.Provider value={auth}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Protected guard={isLoggedIn && auth.hasChild}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen
              name="diary/[id]/index"
              options={{
                presentation: 'modal',
                title: '',
                animation: 'slide_from_right',
                animationDuration: 350,
              }}
            />
            <Stack.Screen
              name="diary/[id]/edit"
              options={{
                presentation: 'modal',
                title: '編集',
                animation: 'slide_from_right',
                animationDuration: 350,
              }}
            />
            <Stack.Screen
              name="child-edit"
              options={{
                presentation: 'modal',
                title: 'お子さまの情報',
                animation: 'slide_from_right',
                animationDuration: 350,
              }}
            />
          </Stack.Protected>
          <Stack.Protected guard={needsChildRegistration}>
            <Stack.Screen name="child-register" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ title: 'アカウント作成' }} />
          </Stack.Protected>
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
