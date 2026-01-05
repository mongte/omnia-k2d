import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
  scrollTo,
  useAnimatedRef,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface GradientSelectorProps {
  data: any[];
  itemWidth: number;
  height: number;
  initialIndex: number;
  selectedIndex?: number;
  renderItem: (item: any, index: number, selectedness: SharedValue<number>) => React.ReactNode;
  onIndexChanged: (index: number) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  containerWidth?: number;
}

export function GradientSelector({
  data,
  itemWidth,
  height,
  initialIndex,
  selectedIndex,
  renderItem,
  onIndexChanged,
  onScrollStart,
  onScrollEnd,
  containerWidth = 250,
}: GradientSelectorProps) {
  const scrollX = useSharedValue(0);
  // Center padding to make the first item centered
  const spacerWidth = (containerWidth - itemWidth) / 2;

  const flatListRef = useAnimatedRef<Animated.FlatList<any>>();
  const context = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      context.value = scrollX.value;
    })
    .onUpdate((e) => {
      if (Platform.OS === 'web') {
        const targetX = context.value - e.translationX;
        scrollTo(flatListRef, targetX, 0, false);
      }
    })
    .onEnd((e) => {
      if (Platform.OS === 'web') {
           const finalX = context.value - e.translationX;
           const index = Math.round(finalX / itemWidth);
           const snappedX = index * itemWidth;
           
           scrollTo(flatListRef, snappedX, 0, true);
           // @ts-ignore: runOnJS is deprecated in newer versions but scheduleOnRN is not yet stable/exported in this version
           runOnJS(onIndexChanged)(index);
           
           // @ts-ignore
           if (onScrollEnd) runOnJS(onScrollEnd)();
      }
    });

  // Sync Scroll when selectedIndex changes (e.g. from Grid)
  useEffect(() => {
    if (selectedIndex !== undefined && flatListRef.current) {
        const targetOffset = selectedIndex * itemWidth;
        const currentOffset = scrollX.value; // Read current shared value
        
        // Only animate/scroll if we are significantly far from the target.
        // This prevents "rebound" when the user just dragged us there.
        if (Math.abs(currentOffset - targetOffset) > 10) { 
            flatListRef.current.scrollToOffset({
                offset: targetOffset,
                animated: true
            });
        }
    }
  }, [selectedIndex, itemWidth]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      // @ts-ignore
      if (onScrollStart) runOnJS(onScrollStart)();
    },
    onMomentumEnd: (event) => {
      const offsetX = event.contentOffset.x;
      const index = Math.round(offsetX / itemWidth);
      // @ts-ignore
      if (onScrollEnd) runOnJS(onScrollEnd)();
      // @ts-ignore
      runOnJS(onIndexChanged)(index);
    }
  });

  const getItemLayout = (_: any, index: number) => ({
    length: itemWidth,
    offset: itemWidth * index,
    index,
  });

  const RenderItemContainer = ({ index, children }: { index: number; children: React.ReactNode }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 2) * itemWidth,
        (index - 1) * itemWidth,
        index * itemWidth,
        (index + 1) * itemWidth,
        (index + 2) * itemWidth,
      ];
      
      // Calculate distance from center based on scrollX
      // Center of container is scrollX + spacerWidth + itemWidth/2
      // Center of item is index*itemWidth + itemWidth/2 (neglecting spacer if it's padding)
      // Actually with contentContainerStyle padding, index 0 is at x=0 (after padding).
      
      const distance = Math.abs(scrollX.value - (index * itemWidth));
      // ranges: distance 0 => selectedness 1
      // distance itemWidth => selectedness 0
      
      const selectedness = interpolate(
        distance,
        [0, itemWidth],
        [1, 0],
        Extrapolation.CLAMP
      );
      
      const scale = interpolate(selectedness, [0, 1], [0.8, 1.0]);
      
      return {
        transform: [{ scale }],
        opacity: interpolate(selectedness, [0, 1], [0.4, 1]), // Simple base opacity + renderItem custom
      };
    });

    // Pass selectedness down? We can't pass shared value easily to render function unless it's a reanimated component.
    // The renderItem prop expects a shared value.
    // Let's create a wrapper that calculates selectedness and passes it.
    
    // Recalculate selectedness for the child
    // Optimization: We can just pass the derived selectedness if needed, but renderItem signature is simple.
    // Let's reconstruct selectedness shared value for the child or just pass style?
    // The renderItem expects "selectedness" as shared value.
    // We can't really mint a new SharedValue per item easily in render.
    // Instead, let's pass a derived value or just use the style in the wrapper.
    
    return (
      <Animated.View style={[{ width: itemWidth, alignItems: 'center', justifyContent: 'center' }, animatedStyle]} testID="GradientSelector-ItemContainer">
        {children}
      </Animated.View>
    );
  };

  return (
    <View style={{ height, width: containerWidth }} testID="GradientSelector">
      <GestureDetector gesture={pan}>
        <Animated.FlatList
            ref={flatListRef}
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={itemWidth}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: spacerWidth }}
            getItemLayout={getItemLayout}
            initialScrollIndex={initialIndex}
            renderItem={({ item, index }) => (
              <RenderItemContainer index={index}>
                {renderItem(item, index, scrollX)} 
              </RenderItemContainer>
            )}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
        />
      </GestureDetector>
      
      {/* Gradients */}
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { width: spacerWidth }]}
        pointerEvents="none"
      />
       <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { left: containerWidth - spacerWidth, width: spacerWidth }]}
        pointerEvents="none"
      />
    </View>
  );
}
