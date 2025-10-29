import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
import { taskService } from '../services/taskService';
import { format } from 'date-fns';

export const useTasks = (dateRange?: { start: Date; end: Date }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Normalize date range to string to avoid unnecessary re-renders
  const dateRangeKey = useMemo(() => {
    if (!dateRange) return null;
    return `${format(dateRange.start, 'yyyy-MM-dd')}-${format(dateRange.end, 'yyyy-MM-dd')}`;
  }, [dateRange]);

  const fetchTasks = useCallback(async () => {
    if (!dateRange || !dateRangeKey) {
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);
      const startDate = format(dateRange.start, 'yyyy-MM-dd');
      const endDate = format(dateRange.end, 'yyyy-MM-dd');
      
      const data = await taskService.getByDateRange(startDate, endDate);
      
      // Only update if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        setTasks(data);
      }
    } catch (err) {
      // Don't set error for aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Only update error if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      }
    } finally {
      // Only update loading state if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [dateRange, dateRangeKey]);

  useEffect(() => {
    fetchTasks();
    
    // Cleanup: cancel request on unmount or when dateRange changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTasks]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    try {
      setSaving(true);
      const newTask = await taskService.create(input);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const updateTask = useCallback(async (input: UpdateTaskInput): Promise<Task> => {
    try {
      setSaving(true);
      const updatedTask = await taskService.update(input);
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      setSaving(true);
      await taskService.delete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const getTasksByDate = useCallback(
    (date: string): Task[] => {
      return tasks.filter((task) => task.date === date);
    },
    [tasks]
  );

  return {
    tasks,
    loading,
    error,
    saving,
    createTask,
    updateTask,
    deleteTask,
    getTasksByDate,
    refetch: fetchTasks,
  };
};
