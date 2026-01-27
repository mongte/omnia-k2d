import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

// Google Sign-In Configuration
// IMPORTANT: 'webClientId' is required for Supabase integration.
// It must match the client ID in your Google Cloud Console (OAuth 2.0 Web Client ID).
// Do NOT use the Android/iOS client IDs here.
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // Add scopes if needed
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID_HERE', // Required for Supabase
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Optional: For iOS native verification
  offlineAccess: true, // Only if you need a refresh token
  forceCodeForRefreshToken: true, // required for offlineAccess
});

export const performGoogleLogin = async () => {
  try {
    // 1. Check if play services are available
    await GoogleSignin.hasPlayServices();

    // 2. Clear previous session for testing (optional)
    // await GoogleSignin.signOut();

    // 3. Prompt the user to sign in
    const userInfo = await GoogleSignin.signIn();

    // 4. Retrieve ID Token
    // Note: in v13+ userInfo.idToken is usually sufficient.
    // If it's missing, check webClientId configuration.
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      throw new Error(
        'No ID Token found. Please check your Web Client ID configuration.',
      );
    }

    // 5. Authenticate with Supabase using the ID Token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      console.log('Google Sign-In cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
      console.log('Google Sign-In in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
      Alert.alert('Error', 'Google Play Services are not available.');
    } else {
      // some other error happened
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Login Failed', error.message);
    }
  }
};
