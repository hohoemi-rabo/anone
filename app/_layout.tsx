import type { ReactNode } from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, StyleSheet } from 'react-native'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { AuthContext, useAuthProvider } from '@/hooks/use-auth'
import { ChildContext, useChildProvider } from '@/hooks/use-child'
import {
  FamilyMembersContext,
  useFamilyMembersProvider,
} from '@/hooks/use-family-members'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'

const navLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    primary: Colors.light.tint,
    border: Colors.light.border,
  },
}

const navDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    primary: Colors.dark.tint,
    border: Colors.dark.border,
  },
}

function ChildProviderWrapper({ children }: { children: ReactNode }) {
  const value = useChildProvider()
  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>
}

function FamilyMembersProviderWrapper({ children }: { children: ReactNode }) {
  const value = useFamilyMembersProvider()
  return (
    <FamilyMembersContext.Provider value={value}>
      {children}
    </FamilyMembersContext.Provider>
  )
}

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const auth = useAuthProvider()

  if (auth.isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? navDarkTheme : navLightTheme}>
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
      <ChildProviderWrapper>
        <FamilyMembersProviderWrapper>
          <ThemeProvider value={colorScheme === 'dark' ? navDarkTheme : navLightTheme}>
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
                <Stack.Screen
                  name="invite-issue"
                  options={{
                    presentation: 'modal',
                    title: '招待コードを発行',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                  }}
                />
                <Stack.Screen
                  name="members"
                  options={{
                    presentation: 'modal',
                    title: 'メンバー管理',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                  }}
                />
              </Stack.Protected>
              <Stack.Protected guard={needsChildRegistration}>
                <Stack.Screen name="child-register" options={{ headerShown: false }} />
              </Stack.Protected>
              <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen
                  name="invite-join"
                  options={{
                    presentation: 'modal',
                    title: '招待コードで参加',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                  }}
                />
              </Stack.Protected>
              <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="sign-up" options={{ title: 'アカウント作成' }} />
              </Stack.Protected>
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </FamilyMembersProviderWrapper>
      </ChildProviderWrapper>
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
