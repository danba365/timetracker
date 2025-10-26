import { supabase } from './supabase';
import type { Event, CreateEventInput, UpdateEventInput } from '../types/event';

export const eventService = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date');

    if (error) throw error;
    return data || [];
  },

  async create(input: CreateEventInput): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateEventInput): Promise<Event> {
    const { id, ...updateData } = input;
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

