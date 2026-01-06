import React, { useRef } from 'react';
import { StyleSheet, View, DrawerLayoutAndroid, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventDetailModal } from '@/components/calendar/ui/EventDetailModal';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  
  // Drawer logic usually handled by Expo Router's Drawer or simple state.
  // The 'onOpenDrawer' in header was for a hamburger menu.
  // We can just log or implement a simple DrawerLayout later. 
  // For now, let's keep it consistent with the UI.
  
  const [containerWidth, setContainerWidth] = React.useState(0);
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} testID='app'>
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
         <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
          <View 
            style={[styles.contentContainer]} 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            testID='app-content-container'
          >
            <CalendarHeader 
              onOpenDrawer={() => {}}
              width={containerWidth > 0 ? containerWidth : undefined}
            />
            {containerWidth > 0 && <CalendarGrid width={containerWidth} />}
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
