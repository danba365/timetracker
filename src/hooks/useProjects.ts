import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput,
  ProjectTask,
  CreateProjectTaskInput,
  UpdateProjectTaskInput
} from '../types/project';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProjects = await projectService.getAllProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (input: CreateProjectInput) => {
    try {
      const newProject = await projectService.createProject(input);
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project.');
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (input: UpdateProjectInput) => {
    try {
      const updated = await projectService.updateProject(input);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project.');
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project.');
      throw err;
    }
  }, []);

  const getProjectById = useCallback(
    (id: string) => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  const getActiveProjects = useCallback(() => {
    return projects.filter((p) => p.status === 'active');
  }, [projects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getActiveProjects,
    fetchProjects,
  };
};

export const useProjectTasks = (projectId: string | null) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await projectService.getProjectTasks(projectId);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to fetch project tasks:', err);
      setError('Failed to load project tasks.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (input: CreateProjectTaskInput) => {
    try {
      const newTask = await projectService.createProjectTask(input);
      setTasks((prev) => [...prev, newTask].sort((a, b) => a.task_order - b.task_order));
      return newTask;
    } catch (err) {
      console.error('Failed to create project task:', err);
      setError('Failed to create project task.');
      throw err;
    }
  }, []);

  const createTasks = useCallback(async (inputs: CreateProjectTaskInput[]) => {
    try {
      const newTasks = await projectService.createProjectTasks(inputs);
      setTasks((prev) => [...prev, ...newTasks].sort((a, b) => a.task_order - b.task_order));
      return newTasks;
    } catch (err) {
      console.error('Failed to create project tasks:', err);
      setError('Failed to create project tasks.');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (input: UpdateProjectTaskInput) => {
    try {
      const updated = await projectService.updateProjectTask(input);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (err) {
      console.error('Failed to update project task:', err);
      setError('Failed to update project task.');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await projectService.deleteProjectTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete project task:', err);
      setError('Failed to delete project task.');
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    createTasks,
    updateTask,
    deleteTask,
    fetchTasks,
  };
};

