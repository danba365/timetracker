import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { UserPreferences, UpdateUserPreferencesInput } from '../types/project';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPreferences = await projectService.getUserPreferences();
      setPreferences(fetchedPreferences);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setError('Failed to load preferences.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (input: UpdateUserPreferencesInput) => {
    try {
      const updated = await projectService.updateUserPreferences(input);
      setPreferences(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update preferences.');
      throw err;
    }
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    fetchPreferences,
  };
};

