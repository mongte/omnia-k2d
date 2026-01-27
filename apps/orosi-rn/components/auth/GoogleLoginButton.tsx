import { performGoogleLogin } from '@/services/auth';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// You might want to use an actual Google icon asset here
// For now, I'll use a simple text or a placeholder if an icon font is available
// Or assume a generic button style requested.
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

export const GoogleLoginButton = ({ onSuccess }: GoogleLoginButtonProps) => {
  const handlePress = async () => {
    const session = await performGoogleLogin();
    if (session) {
      onSuccess?.();
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <FontAwesome name="google" size={20} color="#000" />
      </View>
      <Text style={styles.buttonText}>Google로 계속하기</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});
