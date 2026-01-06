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
    const { isOpen, date, range } = detailModal;

    const eventsGrouped = useMemo(() => {
      console.log('range',  range)
        if (range) {
            const groups: { date: Date, events: CalendarEvent[] }[] = [];
            let current = new Date(range.start);
            const end = new Date(range.end);
            
            while (current <= end) {
                const dayEvents = getEventsForDate(new Date(current));
                if (dayEvents.length > 0) {
                     groups.push({ date: new Date(current), events: dayEvents });
                }
                current.setDate(current.getDate() + 1);
            }
            return groups;
        } else if (date) {
            return [{ date: date, events: getEventsForDate(date) }];
        }
        return [];
    }, [date, range]);

    // Flatten for rendering but keep headers
    const renderItems = useMemo(() => {
        const items: any[] = [];
        eventsGrouped.forEach(group => {
            items.push({ type: 'header', date: group.date });
            group.events.forEach(e => items.push({ type: 'event', data: e }));
        });
        return items;
    }, [eventsGrouped]);
    
    // ... logic for close
    const onClose = () => setDetailModal(false, null, null);

    // Initial render check
    const displayDate = range ? range.start : date;

    return (
        <View style={styles.absoluteContainer} pointerEvents="box-none"> 
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
                    {displayDate && (
                     <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.headerTitle}>Events</Text>
                                <Text style={styles.headerSubtitle}>
                                    {range 
                                      ? `${format(range.start, 'MMM d')} — ${format(range.end, 'd, yyyy')}`
                                      : format(displayDate, 'MMM d, yyyy')
                                    }
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                            {/* Center Line */}
                            <View style={styles.centerLine} />

                            {renderItems.map((item, index) => {
                                if (item.type === 'header') {
                                    return (
                                        <View key={`header-${item.date.toISOString()}`} style={styles.dateMarkerContainer}>
                                            <View style={styles.dateMarker}>
                                                <Text style={styles.dateMarkerText}>{format(item.date, 'MMM d').toUpperCase()}</Text>
                                            </View>
                                        </View>
                                    );
                                }
                                
                                const event = item.data as CalendarEvent;
                                // We need index relative to events only for left/right? 
                                // Actually let's just use total index or calculate based on filtered events count?
                                // Simple alternating is fine for visual flow.
                                const isLeft = index % 2 !== 0; // Header is even (0), so first event (1) is Left? Let's check.
                                // If item 0 is header, item 1 is event -> Left.
                                // If item 2 is event -> Right.
                                
                                return (
                                    <View key={`${event.id}_${index}`} style={[styles.timelineItem, isLeft ? styles.leftItem : styles.rightItem]}>
                                        {/* Connector & Dot */}
                                        <View style={[styles.connectorContainer]}>
                                            <View style={[
                                                styles.connectorLine, 
                                                isLeft ? { right: '50%', marginRight: 5 } : { left: '50%', marginLeft: 5 }
                                            ]} />
                                            <View style={[styles.dot, { 
                                                  backgroundColor: event.color, 
                                                  marginLeft: -6
                                                  // marginLeft: isLeft ? -8 : -2,
                                                }]} />
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
        paddingVertical: 24, // Keep vertical, check if it affects absolute. Ideally remove this too if centerLine top is affected.
        // removing horizontal padding to ensure centerLine (50%) is relative to full width
        // and items handle their own padding.
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
        paddingHorizontal: 16, // Moved padding here
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
        backgroundColor: 'rgba(255, 255, 255, 0)', // Masking the connector line
        zIndex: 10, // Ensure it sits on top of the connector
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
        height: 2, // Slight increase for visibility
        top: 6, 
        width: '50%', // FORCE OVERLAP: Fixed large width instead of % to guarantee it goes under the card
        borderTopWidth: 1.5, // Thicker dash
        borderStyle: 'dashed',
        borderColor: '#BDBDBD',
        zIndex: -1, // Behind card
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
        backgroundColor: '#fff',
        paddingHorizontal: 6,
        boxSizing: 'border-box',
        position: 'relative',
        right: -6,
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
