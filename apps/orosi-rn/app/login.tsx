import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMonthEvents } from '@/components/calendar/model/useCalendarQueries';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

// Brand Colors
const THEME = {
  primary: '#2D4B38', // Deep Green
  white: '#FFFFFF',
};

export default function LoginScreen() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const queryClient = useQueryClient();

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
            <View style={styles.buttonContainer}>
              {/* Email Login/Sign Up */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleTestLogin}
                activeOpacity={0.8}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <ActivityIndicator color={THEME.primary} />
                ) : (
                  <Text style={styles.signInText}>이메일로 계속하기</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                disabled={isSigningIn}
              >
                <Text style={styles.signUpText}>회원가입</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <GoogleLoginButton onSuccess={() => router.replace('/')} />
            </View>
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
  buttonContainer: {
    width: '100%',
    gap: 12, // Gap between buttons
  },
  signInButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // White
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D4B38', // Text matches primary bg color
  },
  signUpButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent dark
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
});
