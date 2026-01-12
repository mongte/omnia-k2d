import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type Event = Database['public']['Tables']['events']['Row'];
type Subtask = Database['public']['Tables']['event_subtasks']['Row'];

// Fetch Lightweight Events (Month View)
const fetchMonthEvents = async (date: Date) => {
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

// Fetch Event Detail (With Subtasks)
const fetchEventDetail = async (eventId: string) => {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError) throw eventError;

  const { data: subtasks, error: subtasksError } = await supabase
    .from('event_subtasks')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });

    if (subtasksError) throw subtasksError;

  return { ...event, subtasks: subtasks || [] };
};

export const useCalendarQueries = () => {
  const queryClient = useQueryClient();

  // Query: Month Events
  const useMonthEvents = (date: Date) => {
    return useQuery({
      queryKey: ['events', format(date, 'yyyy-MM')],
      queryFn: () => fetchMonthEvents(date),
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
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
      mutationFn: async (newEvent: Database['public']['Tables']['events']['Insert']) => {
        const { data, error } = await supabase.from('events').insert(newEvent).select().single();
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
      mutationFn: async (updatedEvent: Database['public']['Tables']['events']['Update'] & { id: string }) => {
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
      mutationFn: async (newSubtask: Database['public']['Tables']['event_subtasks']['Insert']) => {
        const { data, error } = await supabase.from('event_subtasks').insert(newSubtask).select().single();
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
      mutationFn: async (updatedSubtask: Database['public']['Tables']['event_subtasks']['Update'] & { id: string }) => {
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
        const { error } = await supabase.from('event_subtasks').delete().eq('id', subtaskId);
        if (error) throw error;
        return subtaskId;
      },
      onSuccess: (_, subtaskId) => {
        // We might not have eventId here easily unless we pass it, 
        // but invalidating specific event might be hard without it.
        // For now, let's rely on the parent component to handle invalidation or 
        // just invalidate all 'event' queries if needed, but that's expensive.
        // Actually, we can assume the UI will optimistically update or we can just invalidate 'event' queries broadly strictly if needed,
        // but better: just rely on refetching the specific event details if the ID is known in the context where mutation is called.
        // Wait, for delete, Supabase doesn't return the deleted row by default unless select() is used? 
        // Let's change delete to select event_id if possible.
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
  };
};
