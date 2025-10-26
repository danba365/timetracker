import { supabase } from './supabase';
import type { Format, CreateFormatInput, UpdateFormatInput } from '../types/format';

export const formatService = {
  async getAll(): Promise<Format[]> {
    const { data, error } = await supabase
      .from('formats')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(input: CreateFormatInput): Promise<Format> {
    const { data, error } = await supabase
      .from('formats')
      .insert({
        name: input.name,
        icon: input.icon,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateFormatInput): Promise<Format> {
    const { id, ...updateData } = input;
    
    const { data, error } = await supabase
      .from('formats')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('formats')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

