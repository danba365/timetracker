import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { ProjectTemplate } from '../types/project';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTemplates = await projectService.getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getTemplateById = useCallback(
    (id: string) => {
      return templates.find((t) => t.id === id);
    },
    [templates]
  );

  const getTemplatesByType = useCallback(
    (type: string) => {
      return templates.filter((t) => t.project_type === type);
    },
    [templates]
  );

  return {
    templates,
    loading,
    error,
    getTemplateById,
    getTemplatesByType,
    fetchTemplates,
  };
};

