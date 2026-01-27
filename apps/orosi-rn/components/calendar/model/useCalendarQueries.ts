import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type Event = Database['public']['Tables']['events']['Row'];
type Subtask = Database['public']['Tables']['event_subtasks']['Row'];

// Fetch Lightweight Events (Month View)
export const fetchMonthEvents = async (date: Date) => {
  const start = startOfMonth(date).toISOString();
  const end = endOfMonth(date).toISOString();

  // Find events that OVERLAP the month:
  // Event Start <= Month End AND Event End >= Month Start
  const { data, error } = await supabase
    .from('events')
    .select('id, title, start_time, end_time, color, is_all_day')
    .lte('start_time', end)
    .gte('end_time', start)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data;
};

// Fetch Event Detail (With Subtasks in ONE Query)
const fetchEventDetail = async (eventId: string) => {
  const start = Date.now();
  console.log('[Supabase] Starting fetch for event:', eventId);

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      id, title, description, subtitle, start_time, end_time, color, is_all_day, priority,
      subtasks:event_subtasks (
        id, event_id, title, is_completed, order_index, created_at
      )
    `,
    )
    .eq('id', eventId)
    .order('order_index', { foreignTable: 'event_subtasks', ascending: true })
    .single();

  const duration = Date.now() - start;
  console.log(
    `[Supabase Latency] fetchEventDetail took ${duration}ms for event ${eventId}`,
  );

  if (error) {
    console.error('[Supabase Error]', error);
    throw error;
  }
  if (!data) throw new Error('Event not found');

  // Supabase returns the relation as a property 'subtasks' (aliased above)
  // We don't need to manually merge.
  return data;
};

export const useCalendarQueries = () => {
  const queryClient = useQueryClient();

  // Query: Month Events
  const useMonthEvents = (date: Date, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['events', format(date, 'yyyy-MM')],
      queryFn: () => fetchMonthEvents(date),
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      enabled: options?.enabled ?? true,
    });
  };

  // Query: Event Detail
  const useEventDetail = (eventId: string | null) => {
    return useQuery({
      queryKey: ['event', eventId],
      queryFn: () => fetchEventDetail(eventId!),
      enabled: !!eventId, // Only fetch when ID exists
      staleTime: 1000 * 60 * 5,
    });
  };

  // Mutation: Create Event
  const useCreateEvent = () => {
    return useMutation({
      mutationFn: async (
        newEvent: Database['public']['Tables']['events']['Insert'],
      ) => {
        const { data, error } = await supabase
          .from('events')
          .insert(newEvent)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        // Invalidate month view to show new dot
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    });
  };

  // Mutation: Update Event
  const useUpdateEvent = () => {
    return useMutation({
      mutationFn: async (
        updatedEvent: Database['public']['Tables']['events']['Update'] & {
          id: string;
        },
      ) => {
        const { data, error } = await supabase
          .from('events')
          .update(updatedEvent)
          .eq('id', updatedEvent.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.id] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    });
  };

  // Mutation: Create Subtask
  const useCreateSubtask = () => {
    return useMutation({
      mutationFn: async (
        newSubtask: Database['public']['Tables']['event_subtasks']['Insert'],
      ) => {
        const { data, error } = await supabase
          .from('event_subtasks')
          .insert(newSubtask)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
      },
    });
  };

  // Mutation: Update Subtask
  const useUpdateSubtask = () => {
    return useMutation({
      mutationFn: async (
        updatedSubtask: Database['public']['Tables']['event_subtasks']['Update'] & {
          id: string;
        },
      ) => {
        const { data, error } = await supabase
          .from('event_subtasks')
          .update(updatedSubtask)
          .eq('id', updatedSubtask.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
      },
    });
  };

  // Mutation: Delete Subtask
  const useDeleteSubtask = () => {
    return useMutation({
      mutationFn: async (subtaskId: string) => {
        // Select event_id to invalidate query
        const { data, error } = await supabase
          .from('event_subtasks')
          .delete()
          .eq('id', subtaskId)
          .select('event_id')
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        if (data?.event_id) {
          queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
        }
      },
    });
  };

  // Mutation: Delete Event
  const useDeleteEvent = () => {
    return useMutation({
      mutationFn: async (eventId: string) => {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    });
  };

  return {
    useMonthEvents,
    useEventDetail,
    useCreateEvent,
    useUpdateEvent,
    useCreateSubtask,
    useUpdateSubtask,
    useDeleteSubtask,
    useDeleteEvent,
  };
};
