/**
 * AI Project Generation Service
 * Calls the Netlify Function to generate projects using OpenAI
 */

interface GenerateProjectRequest {
  prompt: string;
  preferences?: {
    available_days: number[];
    available_time_start: string;
    available_time_end: string;
    max_tasks_per_day: number;
    preferred_task_duration: number;
  };
}

interface TaskTemplate {
  title: string;
  duration: number;
  order: number;
  description?: string;
}

interface ProjectResponse {
  title: string;
  description: string;
  project_type: 'course' | 'fitness' | 'learning' | 'custom';
  tasks: TaskTemplate[];
  suggested_tasks_per_week: number;
  estimated_duration_per_task: number;
  icon: string;
  reasoning?: string;
}

export class AIProjectService {
  /**
   * Generate a project plan from natural language description
   */
  async generateProject(request: GenerateProjectRequest): Promise<ProjectResponse> {
    try {
      const response = await fetch('/.netlify/functions/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate project');
      }

      const data: ProjectResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating project:', error);
      throw error;
    }
  }

  /**
   * Check if AI generation is available (API key configured)
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try a test call to see if the function is configured
      const response = await fetch('/.netlify/functions/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'test' }),
      });

      // If we get 500 with "API key not configured", it's not available
      if (response.status === 500) {
        const data = await response.json();
        if (data.error?.includes('API key not configured')) {
          return false;
        }
      }

      // Any other response means the function exists and is configured
      return true;
    } catch (error) {
      // Function doesn't exist or network error
      return false;
    }
  }
}

export const aiProjectService = new AIProjectService();

