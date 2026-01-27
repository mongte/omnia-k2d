import { usePreventDoubleTap } from '@/hooks/usePreventDoubleTap';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { format, set } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CalendarEventDisplayInfo,
  EventPriority,
} from '../model/calendarTypes';
import { useCalendarQueries } from '../model/useCalendarQueries';
import { MiniCalendarModal } from './MiniCalendarModal';
import { TimePickerModal } from './TimePickerModal';

interface EventDetailViewProps {
  event: CalendarEventDisplayInfo;
  onBack: () => void;
}

export const EventDetailView = ({ event, onBack }: EventDetailViewProps) => {
  const [activeSection, setActiveSection] = useState<
    'header' | 'description' | 'tasks' | 'time' | null
  >(null);

  // Date Picker State
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>(
    'start',
  );
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end'>(
    'start',
  );
  const [isAllDay, setIsAllDay] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState('');

  const { mutateAsync: createEvent } = useCalendarQueries().useCreateEvent();
  const { mutateAsync: updateEvent } = useCalendarQueries().useUpdateEvent();
  const { mutateAsync: createSubtask } =
    useCalendarQueries().useCreateSubtask();
  const { mutateAsync: updateSubtask } =
    useCalendarQueries().useUpdateSubtask();

  const { mutateAsync: deleteSubtask } =
    useCalendarQueries().useDeleteSubtask();
  const { mutateAsync: deleteEvent } = useCalendarQueries().useDeleteEvent();

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  // Fetch full details only if ID exists
  const {
    data: fullEvent,
    isLoading,
    error,
  } = useCalendarQueries().useEventDetail(event.id || null);

  const [subtitle, setSubtitle] = useState('');
  const [priority, setPriority] = useState<string>(EventPriority.MEDIUM);
  const [startTime, setStartTime] = useState(
    new Date(event.startTime).toISOString(),
  );
  const [endTime, setEndTime] = useState(new Date(event.endTime).toISOString());
  const [subtasks, setSubtasks] = useState<any[]>([]);

  // Merge basic info (from props) with full details
  const displayEvent = {
    ...event,
    description: fullEvent?.description || '',
    priority: fullEvent?.priority || EventPriority.MEDIUM,
    subtitle: fullEvent?.subtitle || '',
    subtasks: fullEvent?.subtasks || [],
  };

  useEffect(() => {
    if (fullEvent) {
      setDescription(fullEvent.description || '');
      setSubtitle(fullEvent.subtitle || '');
      setPriority(fullEvent.priority || EventPriority.MEDIUM);
      setSubtasks(fullEvent.subtasks || []);
      setIsAllDay(fullEvent.is_all_day || false);
    }
  }, [fullEvent]);

  const handleSave = usePreventDoubleTap(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      // Get current user for new events
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let targetEventId = event.id;

      if (!targetEventId) {
        if (!user) {
          Alert.alert('Error', 'You must be logged in to create events');
          return;
        }

        // --- CREATE NEW EVENT ---
        const { id } = await createEvent({
          title: title,
          description: description,
          subtitle: subtitle,
          priority: priority as EventPriority,
          start_time: startTime,
          end_time: endTime,
          is_all_day: isAllDay,
          color: event.color,
          user_id: user.id,
        });
        targetEventId = id;
      } else {
        // --- UPDATE EXISTING EVENT ---
        await updateEvent({
          id: targetEventId,
          title: title,
          description: description,
          subtitle: subtitle,
          priority: priority as EventPriority,
          start_time: startTime,
          end_time: endTime,
          is_all_day: isAllDay,
          updated_at: new Date().toISOString(),
        });
      }

      // --- HANDLE SUBTASKS ---
      const originalIds = fullEvent?.subtasks?.map((t: any) => t.id) || [];
      const currentIds = subtasks
        .filter((t) => !t.isNew && t.id)
        .map((t) => t.id);
      const toDelete = originalIds.filter(
        (id: string) => !currentIds.includes(id),
      );

      // Execute Deletes
      await Promise.all(toDelete.map((id: string) => deleteSubtask(id)));

      // Execute Updates/Creates
      await Promise.all(
        subtasks.map((task) => {
          if (task.isNew || !task.id) {
            return createSubtask({
              event_id: targetEventId,
              title: task.title,
              is_completed: task.is_completed,
              order_index: 0,
            });
          } else {
            return updateSubtask({
              id: task.id,
              title: task.title,
              is_completed: task.is_completed,
            });
          }
        }),
      );

      setActiveSection(null);

      // Close only on creation success
      if (!event.id) {
        onBack();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  });

  const handleDelete = async () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (event.id) {
              await deleteEvent(event.id);
              onBack();
            }
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  // const startEditing = () => ... removed
  // const cancelEditing = () => ... removed

  if (isLoading) {
    // Show a subtle loader over the content area or just render what we have?
    // We render what we have (title, time) and show loader for description/tasks.
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {currentUser && fullEvent && currentUser.id === fullEvent.user_id && (
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={[styles.titleBar, { backgroundColor: event.color }]} />
          <View style={styles.titleContent}>
            {activeSection === 'header' ? (
              <View>
                <TextInput
                  style={[
                    styles.title,
                    {
                      borderBottomWidth: 1,
                      borderColor: '#ccc',
                      paddingBottom: 0,
                    },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Event Title"
                  multiline
                  autoFocus
                />
                <TextInput
                  style={[
                    styles.subtitle,
                    {
                      borderBottomWidth: 1,
                      borderColor: '#ccc',
                      marginBottom: 8,
                    },
                  ]}
                  value={subtitle}
                  onChangeText={setSubtitle}
                  placeholder="Subtitle"
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  {Object.values(EventPriority).map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: priority === p ? '#0f172a' : '#f1f5f9',
                        borderWidth: 1,
                        borderColor: priority === p ? '#0f172a' : '#e2e8f0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: priority === p ? '#fff' : '#64748b',
                        }}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setActiveSection('header')}
                activeOpacity={0.7}
              >
                <Text style={styles.title}>{title}</Text>
                <View style={styles.subtitleContainer}>
                  {!!subtitle && (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                  )}
                  {!subtitle && (
                    <Text style={[styles.subtitle, { color: '#cbd5e1' }]}>
                      Add subtitle
                    </Text>
                  )}

                  {priority && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>{priority}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Description */}
        {activeSection === 'description' ? (
          <TextInput
            style={[
              styles.description,
              {
                minHeight: 100,
                textAlignVertical: 'top',
                borderWidth: 1,
                borderColor: '#f1f5f9',
                borderRadius: 12,
                padding: 12,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add description..."
            multiline
            autoFocus
          />
        ) : (
          <TouchableOpacity
            onPress={() => setActiveSection('description')}
            activeOpacity={0.7}
          >
            <Text style={styles.description}>
              {isLoading
                ? 'Loading details...'
                : description || 'No description provided'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tasks Card - Only show if we have tasks or if loading finished and list is empty (render empty state) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.taskIcon}>
                <MaterialIcons name="assignment" size={24} color="#FF9800" />
              </View>
              <View>
                <Text style={styles.cardTitle}>TASKS</Text>
                <Text style={styles.cardSubtitle}>Manage deliverables</Text>
              </View>
            </View>
            {/* Mark Complete UI - Mock functionality for now */}
            {/* 
            <View style={styles.cardHeaderRight}>
              <Text style={styles.markComplete}>MARK COMPLETE</Text>
              <Switch ... />
            </View>
            */}
          </View>

          {/* Subtasks List */}
          <View style={styles.subtasksHeader}>
            <Text style={styles.label}>SUBTASKS CHECKLIST</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {
                  displayEvent.subtasks.filter((t: any) => t.is_completed)
                    .length
                }
                /{displayEvent.subtasks.length}
              </Text>
            </View>
          </View>

          <View style={styles.checklist}>
            {activeSection === 'tasks' ? (
              <>
                {subtasks.map((task, index) => (
                  <View key={task.id || index} style={styles.checkItem}>
                    <TouchableOpacity
                      onPress={() => {
                        const newTasks = [...subtasks];
                        newTasks[index].is_completed =
                          !newTasks[index].is_completed;
                        setSubtasks(newTasks);
                      }}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          task.is_completed && styles.checkedBox,
                        ]}
                      >
                        {task.is_completed && (
                          <MaterialIcons name="check" size={14} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.checkText,
                        { flex: 1, borderBottomWidth: 1, borderColor: '#eee' },
                      ]}
                      value={task.title}
                      onChangeText={(text) => {
                        const newTasks = [...subtasks];
                        newTasks[index].title = text;
                        setSubtasks(newTasks);
                      }}
                      placeholder="Task name"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        const newTasks = subtasks.filter((_, i) => i !== index);
                        setSubtasks(newTasks);
                      }}
                    >
                      <MaterialIcons name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={[
                    styles.checkItem,
                    {
                      justifyContent: 'center',
                      borderStyle: 'dashed',
                      borderWidth: 1,
                      borderColor: '#ccc',
                    },
                  ]}
                  onPress={() => {
                    setSubtasks([
                      ...subtasks,
                      {
                        id: `temp-${Date.now()}`,
                        title: '',
                        is_completed: false,
                        isNew: true,
                      },
                    ]);
                  }}
                >
                  <MaterialIcons name="add" size={20} color="#64748b" />
                  <Text style={{ color: '#64748b' }}>Add Subtask</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => setActiveSection('tasks')}
                activeOpacity={0.7}
                style={{ width: '100%' }}
              >
                {isLoading && (
                  <ActivityIndicator size="small" color="#FF9800" />
                )}
                {!isLoading &&
                  subtasks.map((task: any) => (
                    <View key={task.id} style={styles.checkItem}>
                      <View
                        style={[
                          styles.checkbox,
                          task.is_completed && styles.checkedBox,
                        ]}
                      >
                        {task.is_completed && (
                          <MaterialIcons name="check" size={14} color="#fff" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.checkText,
                          task.is_completed && styles.checkedText,
                        ]}
                      >
                        {task.title}
                      </Text>
                    </View>
                  ))}
                {!isLoading && subtasks.length === 0 && (
                  <Text
                    style={{
                      color: '#94a3b8',
                      fontStyle: 'italic',
                      padding: 8,
                    }}
                  >
                    No subtasks
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Time Banner */}
        <View style={{ marginBottom: 24 }}>
          <View style={[styles.timeBanner, { backgroundColor: event.color }]}>
            <View style={styles.timeBannerHeader}>
              {(() => {
                const start = new Date(startTime);
                const end = new Date(endTime);
                const isSameDay =
                  start.getDate() === end.getDate() &&
                  start.getMonth() === end.getMonth() &&
                  start.getFullYear() === end.getFullYear();

                if (isSameDay) {
                  return (
                    <>
                      <Text style={styles.timeDate}>
                        {format(start, 'EEEE, MMM d').toUpperCase()}
                      </Text>
                      <Text style={styles.timeDate}>
                        {format(start, 'yyyy')}
                      </Text>
                    </>
                  );
                } else {
                  return (
                    <>
                      <Text style={styles.timeDate}>
                        {format(start, 'MMM d').toUpperCase()} -{' '}
                        {format(end, 'MMM d').toUpperCase()}
                      </Text>
                      <Text style={styles.timeDate}>
                        {format(start, 'yyyy')}
                      </Text>
                    </>
                  );
                }
              })()}
            </View>
            <View style={styles.timeDisplay}>
              {activeSection === 'time' ? (
                <View style={{ width: '100%', gap: 16 }}>
                  {/* Start Time Row */}
                  <View>
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      Start
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                        onPress={() => {
                          setDatePickerTarget('start');
                          setDateModalVisible(true);
                        }}
                      >
                        <MaterialIcons
                          name="calendar-today"
                          size={16}
                          color="rgba(255,255,255,0.8)"
                        />
                        <Text style={{ color: '#fff', fontSize: 16 }}>
                          {format(new Date(startTime), 'yyyy-MM-dd')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                        onPress={() => {
                          setTimePickerTarget('start');
                          setTimeModalVisible(true);
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 16 }}>
                          {format(new Date(startTime), 'HH:mm')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* End Time Row */}
                  <View>
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      End
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                        onPress={() => {
                          setDatePickerTarget('end');
                          setDateModalVisible(true);
                        }}
                      >
                        <MaterialIcons
                          name="calendar-today"
                          size={16}
                          color="rgba(255,255,255,0.8)"
                        />
                        <Text style={{ color: '#fff', fontSize: 16 }}>
                          {format(new Date(endTime), 'yyyy-MM-dd')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                        onPress={() => {
                          setTimePickerTarget('end');
                          setTimeModalVisible(true);
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 16 }}>
                          {format(new Date(endTime), 'HH:mm')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setActiveSection('time')}
                  activeOpacity={0.7}
                >
                  <View style={styles.startTime}>
                    <MaterialIcons name="schedule" size={24} color="#fff" />
                    <Text style={styles.bigTime}>
                      {format(
                        new Date(startTime || event.startTime),
                        'hh:mm a',
                      )}
                    </Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <Text style={styles.endTime}>
                    {format(new Date(endTime || event.endTime), 'hh:mm a')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <LinearGradient
            colors={[event.color, 'transparent']}
            style={[
              StyleSheet.absoluteFill,
              { top: '50%', bottom: -40, opacity: 0.6, zIndex: -1 },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <View style={styles.allDayRow}>
            <Switch
              trackColor={{ false: '#cbd5e1', true: event.color }}
              thumbColor={'#ffffff'}
              value={isAllDay}
              onValueChange={(val) => {
                setIsAllDay(val);
                if (!activeSection) setActiveSection('time'); // Optional: Activate time section if toggled?
              }}
            />
            <Text style={styles.allDayText}>All-day</Text>
          </View>
          {/* Only show Done/Save button if there are changes */}
          {(() => {
            const hasChanges =
              title !== displayEvent.title ||
              description !== displayEvent.description ||
              subtitle !== displayEvent.subtitle ||
              priority !== displayEvent.priority ||
              startTime !== new Date(event.startTime).toISOString() ||
              endTime !== new Date(event.endTime).toISOString() ||
              isAllDay !== (fullEvent?.is_all_day || false) ||
              // Simple subtask check (count or content)
              JSON.stringify(
                subtasks.map((t) => ({ t: t.title, c: t.is_completed })),
              ) !==
                JSON.stringify(
                  (fullEvent?.subtasks || []).map((t: any) => ({
                    t: t.title,
                    c: t.is_completed,
                  })),
                );

            if (!hasChanges) return null;

            return (
              <TouchableOpacity style={styles.doneButton} onPress={handleSave}>
                <MaterialIcons name="check" size={20} color="#fff" />
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            );
          })()}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <MiniCalendarModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        initialDate={
          new Date(datePickerTarget === 'start' ? startTime : endTime)
        }
        onDateSelect={(selectedDate) => {
          const targetTime =
            datePickerTarget === 'start'
              ? new Date(startTime)
              : new Date(endTime);
          // Merge selected date with existing time
          const newDate = set(selectedDate, {
            hours: targetTime.getHours(),
            minutes: targetTime.getMinutes(),
            seconds: targetTime.getSeconds(),
          });

          if (datePickerTarget === 'start') {
            setStartTime(newDate.toISOString());
            // Optional: Push End Time if it becomes before Start Time?
            if (newDate > new Date(endTime)) {
              // setEndTime(newDate.toISOString());
            }
          } else {
            setEndTime(newDate.toISOString());
          }
        }}
      />

      <TimePickerModal
        visible={timeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        initialTime={
          new Date(timePickerTarget === 'start' ? startTime : endTime)
        }
        onTimeSelect={(hours, minutes) => {
          const targetTime =
            timePickerTarget === 'start'
              ? new Date(startTime)
              : new Date(endTime);
          const newDate = set(targetTime, {
            hours,
            minutes,
            seconds: 0,
          });

          if (timePickerTarget === 'start') {
            setStartTime(newDate.toISOString());
          } else {
            setEndTime(newDate.toISOString());
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  titleBar: {
    width: 12,
    borderRadius: 6,
    marginRight: 20,
  },
  titleContent: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitleContainer: {
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  description: {
    paddingHorizontal: 32,
    marginTop: 24,
    marginBottom: 24,
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  card: {
    marginHorizontal: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 20,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  markComplete: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  counterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  checklist: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  checkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  checkedText: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  timeBanner: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 50,
  },
  timeBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeDate: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  startTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bigTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  timeDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  endTime: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  allDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  doneButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
