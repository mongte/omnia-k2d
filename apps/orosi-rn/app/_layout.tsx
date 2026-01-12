import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { supabase } from '@/lib/supabase';

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
  
  // Dev: Auto-login test user
  useEffect(() => {
    const signInTestUser = async () => {
      // Force sign out to clear stale tokens (since we recreated the user in DB)
      await supabase.auth.signOut();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Auto-signing in test user...');
        await supabase.auth.signInWithPassword({
          email: 'mongte32@gmail.com',
          password: 'password123',
        });
      }
    };
    signInTestUser();
  }, []);



  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Auth Listener for Cache Invalidation
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_IN') {
           console.log('User signed in, invalidating queries...');
           queryClient.invalidateQueries({ queryKey: ['events'] });
           queryClient.invalidateQueries({ queryKey: ['event'] });
       }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

// Force refresh
console.log('RootLayout loaded');
