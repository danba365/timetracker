import { Handler } from '@netlify/functions';

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

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check for API key
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your Netlify environment variables.' 
      }),
    };
  }

  try {
    const body: GenerateProjectRequest = JSON.parse(event.body || '{}');
    const { prompt, preferences } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or 'gpt-4' for better results
        messages: [
          {
            role: 'system',
            content: `You are a project planning assistant. Your job is to create structured, actionable project plans from user descriptions.

IMPORTANT: You must respond with ONLY a valid JSON object, no markdown formatting, no code blocks, no additional text.

The JSON should follow this exact structure:
{
  "title": "Project Title",
  "description": "Detailed project description",
  "project_type": "course" | "fitness" | "learning" | "custom",
  "tasks": [
    {
      "title": "Task name",
      "description": "What to do",
      "duration": 60,
      "order": 1
    }
  ],
  "suggested_tasks_per_week": 3,
  "estimated_duration_per_task": 60,
  "icon": "📋",
  "reasoning": "Brief explanation of the plan"
}

Guidelines:
- Create 5-15 tasks depending on project complexity
- Tasks should be specific and actionable
- Duration in minutes (15-240)
- Order tasks logically (foundational first)
- Choose appropriate icon emoji
- Set realistic tasks_per_week (1-5)
- project_type: "course" for learning, "fitness" for exercise, "learning" for books/study, "custom" for other`
          },
          {
            role: 'user',
            content: `Create a project plan for: ${prompt}

${preferences ? `User preferences:
- Available days: ${preferences.available_days.length} days/week
- Available time: ${preferences.available_time_start} - ${preferences.available_time_end}
- Max tasks per day: ${preferences.max_tasks_per_day}
- Preferred task duration: ${preferences.preferred_task_duration} minutes` : ''}

Remember: Respond with ONLY the JSON object, no markdown or extra text.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'OpenAI API error', 
          details: errorData 
        }),
      };
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content;

    if (!content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No response from OpenAI' }),
      };
    }

    // Clean up the response (remove markdown code blocks if present)
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse the JSON response
    const projectPlan: ProjectResponse = JSON.parse(content);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectPlan),
    };
  } catch (error) {
    console.error('Error generating project:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate project', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};

