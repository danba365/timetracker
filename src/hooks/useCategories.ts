import { useState, useEffect, useCallback } from 'react';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
      
      // Initialize default categories if none exist
      if (data.length === 0) {
        await categoryService.initializeDefaultCategories();
        const updatedData = await categoryService.getAll();
        setCategories(updatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (input: CreateCategoryInput): Promise<Category> => {
    try {
      const newCategory = await categoryService.create(input);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateCategory = useCallback(async (input: UpdateCategoryInput): Promise<Category> => {
    try {
      const updatedCategory = await categoryService.update(input);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
      );
      return updatedCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refetch: fetchCategories,
  };
};

