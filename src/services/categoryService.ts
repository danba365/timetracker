import { supabase } from './supabase';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: input.name,
        color: input.color,
        icon: input.icon,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async initializeDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: 'Personal', color: '#3B82F6', icon: '👤' },
      { name: 'Work', color: '#10B981', icon: '💼' },
      { name: 'Health', color: '#EF4444', icon: '❤️' },
      { name: 'Learning', color: '#8B5CF6', icon: '📚' },
    ];

    const existingCategories = await this.getAll();
    if (existingCategories.length === 0) {
      for (const category of defaultCategories) {
        await this.create(category);
      }
    }
  },
};

