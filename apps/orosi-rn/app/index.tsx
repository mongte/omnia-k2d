import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventDetailModal } from '@/components/calendar/ui/EventDetailModal';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth, 1280);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} testID='app'>
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
         <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
          <View 
            style={[styles.contentContainer]} 
            testID='app-content-container'
          >
              <CalendarHeader 
                onOpenDrawer={() => {}}
                width={containerWidth}
              />
              <CalendarGrid 
                  width={containerWidth} 
              />
              <EventDetailModal />
         </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
});
