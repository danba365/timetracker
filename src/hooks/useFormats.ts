import { useState, useEffect } from 'react';
import { formatService } from '../services/formatService';
import type { Format, CreateFormatInput, UpdateFormatInput } from '../types/format';

export const useFormats = () => {
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFormats = async () => {
    try {
      setLoading(true);
      const data = await formatService.getAll();
      setFormats(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading formats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormats();
  }, []);

  const createFormat = async (input: CreateFormatInput) => {
    try {
      const newFormat = await formatService.create(input);
      setFormats((prev) => [...prev, newFormat]);
      return newFormat;
    } catch (err) {
      console.error('Error creating format:', err);
      throw err;
    }
  };

  const updateFormat = async (input: UpdateFormatInput) => {
    try {
      const updatedFormat = await formatService.update(input);
      setFormats((prev) =>
        prev.map((f) => (f.id === updatedFormat.id ? updatedFormat : f))
      );
      return updatedFormat;
    } catch (err) {
      console.error('Error updating format:', err);
      throw err;
    }
  };

  const deleteFormat = async (id: string) => {
    try {
      await formatService.delete(id);
      setFormats((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Error deleting format:', err);
      throw err;
    }
  };

  const getFormatById = (id: string): Format | undefined => {
    return formats.find((f) => f.id === id);
  };

  return {
    formats,
    loading,
    error,
    createFormat,
    updateFormat,
    deleteFormat,
    getFormatById,
    refreshFormats: loadFormats,
  };
};

