import Colors from '@/constants/Colors';
import { format, isSameDay } from 'date-fns';
import { BlurView } from 'expo-blur';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCalendarQueries } from '../model/useCalendarQueries';
import { useCalendarStore } from '../model/useCalendarStore';
import { EventDetailView } from './EventDetailView';

import { ConnectorArrow } from '@/components/ui/icons/ConnectorArrow';
import { CalendarEventDisplayInfo } from '../model/calendarTypes';

interface EventDotStyle {
  backgroundColor: string;
  marginLeft: number;
}

export const EventDetailModal = () => {
  const { detailModal, setDetailModal } = useCalendarStore();
  const { isOpen, date, range } = detailModal;
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventDisplayInfo | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // Fetch events for the month of the selected date/range
  const queryDate = date || range?.start || new Date();
  const { data: monthEvents } = useCalendarQueries().useMonthEvents(queryDate);

  // Helper to filter events from the fetched month data
  const getEventsForDate = (
    targetDate: Date,
    allEvents: any[] | undefined,
  ): CalendarEventDisplayInfo[] => {
    if (!allEvents) return [];

    // Filter events valid for this day
    // DB events have start_time/end_time as ISO strings
    const eventsOnDay = allEvents.filter((e) => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);

      // Check overlap (same logic as before effectively)
      return (
        isSameDay(start, targetDate) ||
        isSameDay(end, targetDate) ||
        (start < targetDate && end > targetDate)
      );
    });

    return eventsOnDay.map((e: any) => {
      const startTime = new Date(e.start_time);
      const endTime = new Date(e.end_time);

      const isMultiDay = !isSameDay(startTime, endTime);
      const isRangeStart = isSameDay(startTime, targetDate);
      const isRangeEnd = isSameDay(endTime, targetDate);
      const isContinuing = isMultiDay && !isRangeStart && !isRangeEnd;

      return {
        id: e.id,
        title: e.title,
        color: e.color || '#ccc',
        startTime,
        endTime,
        isMultiDay,
        isRangeStart,
        isRangeEnd,
        isContinuing,
      };
    });
  };

  const getEventDotStyle = (
    event: CalendarEventDisplayInfo,
    isLeft: boolean,
  ): EventDotStyle => {
    const { color } = event;
    return {
      backgroundColor: color,
      marginLeft: -6,
    };
  };

  const eventsGrouped = useMemo(() => {
    if (range) {
      const groups: { date: Date; events: CalendarEventDisplayInfo[] }[] = [];
      let current = new Date(range.start);
      const end = new Date(range.end);

      while (current <= end) {
        const dayEvents = getEventsForDate(new Date(current), monthEvents);
        if (dayEvents.length > 0) {
          groups.push({ date: new Date(current), events: dayEvents });
        }
        current.setDate(current.getDate() + 1);
      }
      return groups;
    } else if (date) {
      return [{ date: date, events: getEventsForDate(date, monthEvents) }];
    }
    return [];
  }, [date, range, monthEvents]);

  // Flatten for rendering but keep headers
  const renderItems = useMemo(() => {
    const items: any[] = [];
    eventsGrouped.forEach((group) => {
      items.push({ type: 'header', date: group.date });
      group.events.forEach((e) => items.push({ type: 'event', data: e }));
    });
    return items;
  }, [eventsGrouped]);

  const onClose = () => {
    setDetailModal(false, null, null);
    setTimeout(() => {
      setSelectedEvent(null);
      setIsReturning(false);
    }, 300);
  };

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
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFill}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={onClose}
              />
            </BlurView>
          </Animated.View>

          {/* Modal Content */}
          <Animated.View
            entering={ZoomIn.springify().damping(20).mass(1).stiffness(150)}
            exiting={ZoomOut.springify().damping(20).mass(1).stiffness(150)}
            style={styles.modalContainer}
          >
            {displayDate &&
              (selectedEvent ? (
                <Animated.View
                  key="detail-view"
                  style={{ flex: 1 }}
                  entering={SlideInRight}
                  exiting={SlideOutRight}
                >
                  <EventDetailView
                    event={selectedEvent}
                    onBack={() => {
                      setIsReturning(true);
                      setSelectedEvent(null);
                    }}
                  />
                </Animated.View>
              ) : (
                <Animated.View
                  key="list-view"
                  style={{ flex: 1 }}
                  entering={isReturning ? SlideInLeft : undefined}
                  exiting={SlideOutLeft}
                >
                  <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
                    <View style={styles.header}>
                      <View>
                        <Text style={styles.headerTitle}>Events</Text>
                        <Text style={styles.headerSubtitle}>
                          {range
                            ? `${format(range.start, 'MMM d')} — ${format(
                                range.end,
                                'd, yyyy',
                              )}`
                            : format(displayDate, 'MMM d, yyyy')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                      >
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      style={styles.scrollView}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {/* Center Line */}
                      <View style={styles.centerLine} />

                      {renderItems.map((item, index) => {
                        if (item.type === 'header') {
                          return (
                            <View
                              key={`header-${item.date.toISOString()}`}
                              style={styles.dateMarkerContainer}
                            >
                              <View style={styles.dateMarker}>
                                <Text style={styles.dateMarkerText}>
                                  {format(item.date, 'MMM d').toUpperCase()}
                                </Text>
                              </View>
                            </View>
                          );
                        }

                        const event = item.data as CalendarEventDisplayInfo;
                        const isLeft = index % 2 !== 0;
                        const {
                          isMultiDay,
                          isRangeStart,
                          isRangeEnd,
                          isContinuing,
                        } = event;

                        const dotStyle = getEventDotStyle(event, isLeft);

                        return (
                          <View
                            key={`${event.id}_${index}`}
                            style={[
                              styles.timelineItem,
                              isLeft ? styles.leftItem : styles.rightItem,
                            ]}
                          >
                            {/* Connector & Dot */}
                            <View style={[styles.connectorContainer]}>
                              <View
                                style={[
                                  styles.connectorLine,
                                  isLeft
                                    ? { right: '50%', marginRight: 5 }
                                    : { left: '50%', marginLeft: 5 },
                                ]}
                              />

                              {!isRangeStart && (
                                <View
                                  style={{
                                    position: 'absolute',
                                    top: -20,
                                    left: '50%',
                                    marginLeft:
                                      (dotStyle.marginLeft as number) - 1,
                                  }}
                                >
                                  <ConnectorArrow
                                    direction="up"
                                    color={event.color}
                                  />
                                </View>
                              )}
                              {!isRangeEnd && (
                                <View
                                  style={{
                                    position: 'absolute',
                                    top: 12,
                                    left: '50%',
                                    marginLeft:
                                      (dotStyle.marginLeft as number) - 1,
                                  }}
                                >
                                  <ConnectorArrow
                                    direction="down"
                                    color={event.color}
                                  />
                                </View>
                              )}

                              <View style={[styles.dot, dotStyle]} />
                            </View>

                            {/* Content Card */}
                            <TouchableOpacity
                              activeOpacity={0.9}
                              onPress={() => setSelectedEvent(event)}
                              style={[
                                styles.cardContent,
                                isLeft ? styles.cardLeft : styles.cardRight,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.timeText,
                                  { color: event.color },
                                  isLeft
                                    ? extraStyles.textAlignRight
                                    : extraStyles.textAlignLeft,
                                ]}
                              >
                                {format(event.startTime, 'hh:mm a')}
                              </Text>
                              <Text
                                style={[
                                  styles.eventTitle,
                                  isLeft
                                    ? extraStyles.textAlignRight
                                    : extraStyles.textAlignLeft,
                                ]}
                              >
                                {event.title}
                              </Text>
                              <Text
                                style={[
                                  styles.eventDesc,
                                  isLeft
                                    ? extraStyles.textAlignRight
                                    : extraStyles.textAlignLeft,
                                ]}
                                numberOfLines={2}
                              >
                                Tap for details
                              </Text>

                              <View
                                style={[
                                  styles.indicatorBar,
                                  { backgroundColor: event.color },
                                ]}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}

                      <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                          const start = displayDate
                            ? new Date(displayDate)
                            : new Date();
                          // Default to next hour if it's "now", or just use the date if it's a specific day?
                          // If displayDate is "today" (from date state), maybe set time to next hour.
                          // But displayDate is usually 00:00 if coming from grid selection?
                          // Let's set it to current time if isSameDay(displayDate, new Date()), else 9am.

                          const Now = new Date();
                          if (isSameDay(start, Now)) {
                            start.setHours(Now.getHours() + 1, 0, 0, 0);
                          } else {
                            start.setHours(9, 0, 0, 0);
                          }

                          const end = new Date(start);

                          // Reset end date if a multi-day range is selected
                          if (range && !isSameDay(range.start, range.end)) {
                            end.setFullYear(
                              range.end.getFullYear(),
                              range.end.getMonth(),
                              range.end.getDate(),
                            );
                          }

                          end.setHours(start.getHours() + 1);

                          const randomColor = Colors.getRandomEventColor();

                          const newEvent: CalendarEventDisplayInfo = {
                            id: '', // Empty ID signals new event
                            title: '',
                            startTime: start,
                            endTime: end,
                            color: randomColor,
                            isMultiDay: false,
                            isRangeStart: true,
                            isRangeEnd: true,
                            isContinuing: false,
                          };
                          setSelectedEvent(newEvent);
                        }}
                      >
                        <Text style={styles.addButtonText}>
                          + Add New Event
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </SafeAreaView>
                </Animated.View>
              ))}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    height: '70%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
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
    height: 80,
    paddingHorizontal: 16,
  },
  leftItem: {
    justifyContent: 'flex-start',
  },
  rightItem: {
    justifyContent: 'flex-end',
  },
  connectorContainer: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cardContent: {
    width: '42%',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    zIndex: 10,
  },
  cardLeft: {
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  cardRight: {
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  connectorLine: {
    position: 'absolute',
    height: 2,
    top: 6,
    width: '50%',
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#BDBDBD',
    zIndex: -1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#333',
    position: 'absolute',
    left: '50%',
    top: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
    lineHeight: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    right: -6, // Correction from previous file, kept relative
  },
  eventDesc: {
    fontSize: 10,
    color: '#888',
    marginBottom: 8,
    lineHeight: 14,
  },
  indicatorBar: {
    height: 4,
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
    backgroundColor: '#111',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

const extraStyles = StyleSheet.create({
  textAlignRight: {
    textAlign: 'right',
  },
  textAlignLeft: {
    textAlign: 'left',
  },
});
