import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { SessionProvider, useSession } from '@/lib/ctx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'welcome',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (isLoading) return;

    // Use string casting or checking to avoid rigid TS overlap error
    const segment = segments[0] as string | undefined; 
    
    // Check if in auth group or welcome/login screen
    const inAuthGroup = segment === '(auth)' || segment === 'login' || segment === 'welcome';
    
    if (!session && !inAuthGroup) {
      // Redirect to welcome if not authenticated
      router.replace('/welcome');
    } 
    // Remove auto-redirect to home for testing flow
    // else if (session && (segment === 'login' || segment === 'welcome')) {
    //   router.replace('/');
    // }
  }, [session, isLoading, segments]);

  // Auth Listener for Cache Invalidation removed to prevent conflict with login prefetch
  // useEffect(() => {
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  //      if (event === 'SIGNED_IN') {
  //          // prevent wiping prefetched data
  //      }
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

// Force refresh
console.log('RootLayout loaded');
