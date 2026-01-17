import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, ImageBackground } from 'react-native';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; 
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import Reanimated, { FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Brand Colors
const THEME = {
  primary: '#2D4B38', // Deep Green
  white: '#FFFFFF',
};

import { useQueryClient } from '@tanstack/react-query';
import { fetchMonthEvents } from '@/components/calendar/model/useCalendarQueries';
import { format } from 'date-fns';

export default function LoginScreen() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const queryClient = useQueryClient();

  // const handleGoogleSignIn = async () => { ... } // Native implementation commented out

  const handleTestLogin = async () => {
      try {
          setIsSigningIn(true);
          const { error } = await supabase.auth.signInWithPassword({
              email: 'mongte32@gmail.com',
              password: 'password123',
          });
          if (error) {
              alert(error.message);
          } else {
              // Prefetch current month events to prevent "pop"
              const now = new Date();
              try {
                  await queryClient.prefetchQuery({
                      queryKey: ['events', format(now, 'yyyy-MM')],
                      queryFn: () => fetchMonthEvents(now),
                      staleTime: 1000 * 60 * 5,
                  });
              } catch (err) {
                  console.warn('Prefetch failed', err);
              }
              
              // Navigate after prefetch
              router.replace('/');
          }
      } catch (e) {
          alert('Test login failed');
      } finally {
          setIsSigningIn(false);
      }
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../assets/images/splash-bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
            {/* Login Buttons - Fade In on Mount */}
            <Reanimated.View 
                entering={FadeInDown.delay(300).duration(800).springify()}
                style={styles.bottomSection}
            >
                {/* Google Sign In (Placeholder for Native) */}
                {/* 
                <TouchableOpacity style={styles.loginButton} ... >
                    <Text>Continue with Google</Text>
                </TouchableOpacity> 
                */}

                {/* Dev Test Button */}
                <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleTestLogin}
                    disabled={isSigningIn}
                    activeOpacity={0.8}
                >
                    {isSigningIn ? (
                        <ActivityIndicator color={THEME.primary} />
                    ) : (
                        <Text style={styles.loginButtonText}>Start with Test Login</Text>
                    )}
                </TouchableOpacity>
            </Reanimated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.primary,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end', // Push content to bottom
    padding: 30,
    paddingBottom: 50, // Add bottom padding
  },
  bottomSection: {
      width: '100%',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly translucent white
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D4B38', // Text matches primary bg color
  },
});
