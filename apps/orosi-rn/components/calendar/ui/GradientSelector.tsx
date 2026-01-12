import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
  scrollTo,
  useAnimatedRef,
  runOnJS,
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
  renderItem: (
    item: any,
    index: number,
    selectedness: SharedValue<number>
  ) => React.ReactNode;
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
  orientation = 'horizontal',
  itemHeight = 40,
}: GradientSelectorProps & { orientation?: 'horizontal' | 'vertical'; itemHeight?: number }) {
  const scrollOffset = useSharedValue(0);
  const isHorizontal = orientation === 'horizontal';
  const itemSize = isHorizontal ? itemWidth : itemHeight;
  const containerSize = isHorizontal ? containerWidth : height;

  // Center padding to make the first item centered
  // For vertical: (height - itemHeight) / 2
  // For horizontal: (containerWidth - itemWidth) / 2
  const spacerSize = (containerSize - itemSize) / 2;

  const flatListRef = useAnimatedRef<Animated.FlatList<any>>();
  const context = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(Platform.OS === 'web')
    .onBegin(() => {
      context.value = scrollOffset.value;
    })
    .onUpdate((e) => {
      if (Platform.OS === 'web') {
        const translation = isHorizontal ? e.translationX : e.translationY;
        const targetOffset = context.value - translation;
        const x = isHorizontal ? targetOffset : 0;
        const y = isHorizontal ? 0 : targetOffset;
        scrollTo(flatListRef, x, y, false);
      }
    })
    .onEnd((e) => {
      if (Platform.OS === 'web') {
        const translation = isHorizontal ? e.translationX : e.translationY;
        const finalOffset = context.value - translation;
        const index = Math.round(finalOffset / itemSize);
        const snappedOffset = index * itemSize;

        const x = isHorizontal ? snappedOffset : 0;
        const y = isHorizontal ? 0 : snappedOffset;

        scrollTo(flatListRef, x, y, true);
        // @ts-ignore
        runOnJS(onIndexChanged)(index);

        // @ts-ignore
        if (onScrollEnd) runOnJS(onScrollEnd)();
      }
    });

  // Sync Scroll when selectedIndex changes (e.g. from Grid)
  useEffect(() => {
    if (selectedIndex !== undefined && flatListRef.current) {
      const targetOffset = selectedIndex * itemSize;
      const currentOffset = scrollOffset.value;

      if (Math.abs(currentOffset - targetOffset) > 10) {
        flatListRef.current.scrollToOffset({
          offset: targetOffset,
          animated: true,
        });
      }
    }
  }, [selectedIndex, itemSize, isHorizontal]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = isHorizontal ? event.contentOffset.x : event.contentOffset.y;
    },
    onBeginDrag: () => {
      // @ts-ignore
      if (onScrollStart) runOnJS(onScrollStart)();
    },
    onMomentumEnd: (event) => {
      const offset = isHorizontal ? event.contentOffset.x : event.contentOffset.y;
      const index = Math.round(offset / itemSize);
      // @ts-ignore
      if (onScrollEnd) runOnJS(onScrollEnd)();
      // @ts-ignore
      runOnJS(onIndexChanged)(index);
    },
  });

  const getItemLayout = (_: any, index: number) => ({
    length: itemSize,
    offset: itemSize * index,
    index,
  });

  const RenderItemContainer = ({
    index,
    children,
  }: {
    index: number;
    children: React.ReactNode;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      // Calculate distance from center based on scrollOffset
      const distance = Math.abs(scrollOffset.value - index * itemSize);
      // ranges: distance 0 => selectedness 1
      // distance itemSize => selectedness 0

      const selectedness = interpolate(
        distance,
        [0, itemSize],
        [1, 0],
        Extrapolation.CLAMP
      );

      const scale = interpolate(selectedness, [0, 1], [0.8, 1.0]);
      
      return {
        transform: [{ scale }],
        opacity: interpolate(selectedness, [0, 1], [0.4, 1]),
      };
    });

    return (
      <Animated.View
        style={[
          { 
              width: itemWidth, 
              height: isHorizontal ? undefined : itemHeight, // Set fixed height in vertical mode
              alignItems: 'center', 
              justifyContent: 'center' 
          },
          animatedStyle,
        ]}
        testID="GradientSelector-ItemContainer"
      >
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
          horizontal={isHorizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemSize}
          decelerationRate="fast"
          contentContainerStyle={
              isHorizontal 
              ? { paddingHorizontal: spacerSize } 
              : { paddingVertical: spacerSize }
          }
          getItemLayout={getItemLayout}
          initialScrollIndex={initialIndex}
          renderItem={({ item, index }) => (
            <RenderItemContainer index={index}>
              {renderItem(item, index, scrollOffset)}
            </RenderItemContainer>
          )}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      </GestureDetector>

      {/* Gradients */}
      {isHorizontal ? (
          <>
            <LinearGradient
                colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFill, { width: spacerSize }]}
                pointerEvents="none"
            />
            <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                StyleSheet.absoluteFill,
                { left: containerWidth - spacerSize, width: spacerSize },
                ]}
                pointerEvents="none"
            />
          </>
      ) : (
          <>
            <LinearGradient
                colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[StyleSheet.absoluteFill, { height: spacerSize, width: '100%' }]}
                pointerEvents="none"
            />
            <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[
                StyleSheet.absoluteFill,
                { top: height - spacerSize, height: spacerSize, width: '100%' },
                ]}
                pointerEvents="none"
            />
          </>
      )}
    </View>
  );
}
