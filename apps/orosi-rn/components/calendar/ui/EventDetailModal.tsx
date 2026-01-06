import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { format } from 'date-fns';
import Colors from '@/constants/Colors';
import { useCalendarStore } from '../model/useCalendarStore';
import { CalendarEvent } from '../model/calendarTypes';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 
  Mocking event data fetching or receiving it as props.
  In a real app, we might fetch from store based on ID.
  Here we will receive events or filter them from the static mock data.
*/
import mockData from '../model/mockData.json';

// Helper to get events for a date
const getEventsForDate = (date: Date): CalendarEvent[] => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const rawEvents = (mockData.events as any)[key] || [];
    return rawEvents.map((e: any) => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime)
    }));
};

export const EventDetailModal = () => {
    const { detailModal, setDetailModal } = useCalendarStore();
    const { isOpen, date } = detailModal;

    const events = useMemo(() => {
        if (!date) return [];
        return getEventsForDate(date);
    }, [date]);

    // We render the container even if closed, to allow 'exiting' animations to play.
    // However, if we just return null, the exiting animation won't work because the component unmounts.
    // So we return the container logic but rely on Reanimated's conditional rendering inside.
    
    // Safety check just for data, but allow animation to proceed if isOpen is toggling.
    // We persist the `date` during the exit animation by not relying on it being null if we don't render content.
    // Actually, if date becomes null, we can't render the content.
    // Ideally, the store should keep the date selected until the modal is fully closed?
    // For now, let's assume `date` is valid if `isOpen` was true.
    
    // Logic:
    // If we use { isOpen && <Animated.../> }, then when isOpen becomes false, it unmounts and EXITING runs.
    
    const onClose = () => setDetailModal(false, null);

    return (
        <View style={styles.absoluteContainer} pointerEvents="box-none"> 
          {/* We use box-none so touches pass through when not visible/backdrop not present. */}
          {/* Actually we want to block touches only when open. */}
            
            {isOpen && (
             <React.Fragment>
                {/* Backdrop */}
                <Animated.View 
                    entering={FadeIn} 
                    exiting={FadeOut}
                    style={StyleSheet.absoluteFill}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
                    </BlurView>
                </Animated.View>

                {/* Modal Content */}
                <Animated.View 
                    entering={SlideInDown.springify().damping(20).mass(1).stiffness(150)}
                    exiting={SlideOutDown.springify().damping(20).mass(1).stiffness(150)}
                    style={styles.modalContainer}
                >
                    {date && (
                     <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.headerTitle}>Events</Text>
                                <Text style={styles.headerSubtitle}>{format(date, 'MMM d, yyyy')}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                            {/* Center Line */}
                            <View style={styles.centerLine} />

                            {/* Date Header Marker */}
                            <View style={styles.dateMarkerContainer}>
                                <View style={styles.dateMarker}>
                                    <Text style={styles.dateMarkerText}>{format(date, 'MMM d').toUpperCase()}</Text>
                                </View>
                            </View>

                            {/* Events List */}
                            {events.map((event, index) => {
                                const isLeft = index % 2 === 0;
                                return (
                                    <View key={event.id} style={[styles.timelineItem, isLeft ? styles.leftItem : styles.rightItem]}>
                                        {/* Connector & Dot */}
                                        <View style={[styles.connectorContainer]}>
                                            <View style={[
                                                styles.connectorLine, 
                                                isLeft ? { right: '50%', marginRight: 5 } : { left: '50%', marginLeft: 5 }
                                            ]} />
                                            <View style={[styles.dot, { backgroundColor: event.color }]} />
                                        </View>

                                        {/* Content Card */}
                                        <View style={[styles.cardContent, isLeft ? styles.cardLeft : styles.cardRight]}>
                                            <Text style={[styles.timeText, { color: event.color }, isLeft ? extraStyles.textAlignRight : extraStyles.textAlignLeft]}>
                                                {format(event.startTime, 'hh:mm a')}
                                            </Text>
                                            <Text style={[styles.eventTitle, isLeft ? extraStyles.textAlignRight : extraStyles.textAlignLeft]}>
                                                {event.title}
                                            </Text>
                                            <Text style={[styles.eventDesc, isLeft ? extraStyles.textAlignRight : extraStyles.textAlignLeft]} numberOfLines={2}>
                                                No description
                                            </Text>
                                            
                                            {/* Indicator Bar */}
                                            <View style={[styles.indicatorBar, { backgroundColor: event.color }]} />
                                        </View>
                                    </View>
                                );
                            })}
                            
                            {/* Bottom Padding */}
                            <View style={{ height: 100 }} />
                        </ScrollView>

                        {/* Floating Add Button */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.addButton}>
                                <Text style={styles.addButtonText}>+  Add New Event</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    )}
                </Animated.View>
             </React.Fragment>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    absoluteContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        justifyContent: 'flex-end',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
        marginTop: 2,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    centerLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: 1,
        backgroundColor: '#E0E0E0',
        zIndex: 0,
    },
    dateMarkerContainer: {
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 1,
    },
    dateMarker: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    dateMarkerText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9E9E9E',
        letterSpacing: 1,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
        width: '100%',
        position: 'relative',
        height: 80, // Approximate height
    },
    leftItem: {
        justifyContent: 'flex-start',
    },
    rightItem: {
        justifyContent: 'flex-end',
    },
    // ... (previous layout props)
    connectorContainer: {
        position: 'absolute',
        top: 24, 
        left: 0, 
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    connectorLeft: {
        // Connector line needs to go from Center Dot to Left Content
    },
    connectorRight: {
        // Connector line needs to go from Center Dot to Right Content
    },
    
    cardContent: {
        width: '42%', // HTML reference uses 42%
        paddingVertical: 8,
    },
    cardLeft: {
        // justifyContent handles position (flex-start)
        // Ensure content aligns to the right edge of this container
        alignItems: 'flex-end',
        paddingRight: 12, // HTML uses 12px
    },
    cardRight: {
        // justifyContent handles position (flex-end)
        alignItems: 'flex-start',
        paddingLeft: 12, // HTML uses 12px
    },
    
    // Updated Connector Logic
    connectorLine: {
        position: 'absolute',
        height: 1, // Border width essentially
        top: 4, // distinct center offset relative to dot
        width: '8%', // Gap size
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#BDBDBD',
        zIndex: 0,
    },
    
    // We need to properly position the dashed line based on left/right
    // The previous structure had the connector inside a container.
    // Let's refine the render logic in the main component instead of just styles if needed, 
    // but we can try to achieve it with styles first.
    
    // Actually, to match the HTML's "timeline-connector absolute... width: 8%"
    // HTML: .timeline-item.left .timeline-connector { right: 50%; margin-right: 4px; }
    // We can simulate this.
    
    dot: {
        width: 12, // Increased size
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff', // White border as requested
        backgroundColor: '#333',
        position: 'absolute',
        left: '50%',
        marginLeft: -6, // Center
        top: 0, 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },

    timeText: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: 'bold', // Bolder
        color: '#111',
        marginBottom: 2,
        lineHeight: 18,
    },
    eventDesc: {
        fontSize: 10,
        color: '#888',
        marginBottom: 8,
        lineHeight: 14,
    },
    indicatorBar: {
        height: 4, // Thinner
        width: '100%',
        borderRadius: 2,
    },
    
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#111', // Darker black
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row', // For icon if added
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    }
});

// Patch styles for proper alignment
const extraStyles = StyleSheet.create({
    textAlignRight: {
        textAlign: 'right',
    },
    textAlignLeft: {
        textAlign: 'left',
    }
});
