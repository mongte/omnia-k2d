import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade In
    opacity.value = withTiming(1, { duration: 1000 });

    // Auto Navigate after delay
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Reanimated.View style={[styles.content, animatedStyle]}>
        <ImageBackground
          source={require('../assets/images/splash-bg.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D4B38', // Fallback color
  },
  content: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
});
