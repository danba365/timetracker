import type { Handler, HandlerEvent } from '@netlify/functions';

interface TaskContext {
  dataRange: {
    start: string;
    end: string;
  };
  currentWeek: {
    range: {
      start: string;
      end: string;
    };
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalHours: number;
    tasks: Array<{
      title: string;
      date: string;
      status: string;
      category: string;
    }>;
  };
  nextWeek: {
    range: {
      start: string;
      end: string;
    };
    totalTasks: number;
    tasks: Array<{
      title: string;
      date: string;
      status: string;
      category: string;
    }>;
  };
  pastTasks: {
    total: number;
    completed: number;
    recentCompleted: Array<{
      title: string;
      date: string;
    }>;
  };
  futureTasks: {
    total: number;
    upcoming: Array<{
      title: string;
      date: string;
      category: string;
    }>;
  };
  currentStreak: number;
  topCategories: Array<{
    name: string;
    tasks: number;
    completed: number;
    hours: number;
    completionRate: number;
  }>;
}

interface CoachRequest {
  message: string;
  lang: 'he' | 'en';
  context?: TaskContext | null;
}

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message, lang, context }: CoachRequest = JSON.parse(event.body || '{}');

    if (!message || !lang) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: message and lang' }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    // Build context string if available
    let contextString = '';
    if (context) {
      if (lang === 'he') {
        contextString = `\n\n=== 📊 נתוני המשתמש המלאים (${context.dataRange.start} - ${context.dataRange.end}) ===

🔥 רצף ימים נוכחי: ${context.currentStreak} ימים

📅 שבוע נוכחי (${context.currentWeek.range.start} - ${context.currentWeek.range.end}):
- סה"כ משימות: ${context.currentWeek.totalTasks}
- הושלמו: ${context.currentWeek.completedTasks} (${context.currentWeek.completionRate}%)
- שעות עבודה: ${context.currentWeek.totalHours}
- משימות:
${context.currentWeek.tasks.map((t) => `  • ${t.title} - ${t.date} [${t.status}] (${t.category})`).join('\n')}

📅 שבוע הבא (${context.nextWeek.range.start} - ${context.nextWeek.range.end}):
- סה"כ משימות: ${context.nextWeek.totalTasks}
- משימות מתוכננות:
${context.nextWeek.tasks.length > 0 ? context.nextWeek.tasks.map((t) => `  • ${t.title} - ${t.date} [${t.status}] (${t.category})`).join('\n') : '  • אין משימות מתוכננות'}

📚 משימות עבר:
- סה"כ: ${context.pastTasks.total}
- הושלמו: ${context.pastTasks.completed}
- הושלמו לאחרונה:
${context.pastTasks.recentCompleted.map((t) => `  • ${t.title} - ${t.date}`).join('\n')}

🔮 משימות עתידיות (אחרי שבוע הבא):
- סה"כ: ${context.futureTasks.total}
- קרובות ביותר:
${context.futureTasks.upcoming.length > 0 ? context.futureTasks.upcoming.map((t) => `  • ${t.title} - ${t.date} (${t.category})`).join('\n') : '  • אין משימות מתוכננות'}

🏆 קטגוריות מובילות:
${context.topCategories.map((cat) => `- ${cat.name}: ${cat.completed}/${cat.tasks} משימות (${cat.hours} שעות, ${cat.completionRate}% הושלמו)`).join('\n')}
===`;
      } else {
        contextString = `\n\n=== 📊 User's Complete Data (${context.dataRange.start} - ${context.dataRange.end}) ===

🔥 Current Streak: ${context.currentStreak} days

📅 CURRENT WEEK (${context.currentWeek.range.start} - ${context.currentWeek.range.end}):
- Total Tasks: ${context.currentWeek.totalTasks}
- Completed: ${context.currentWeek.completedTasks} (${context.currentWeek.completionRate}%)
- Work Hours: ${context.currentWeek.totalHours}
- Tasks:
${context.currentWeek.tasks.map((t) => `  • ${t.title} - ${t.date} [${t.status}] (${t.category})`).join('\n')}

📅 NEXT WEEK (${context.nextWeek.range.start} - ${context.nextWeek.range.end}):
- Total Tasks: ${context.nextWeek.totalTasks}
- Scheduled Tasks:
${context.nextWeek.tasks.length > 0 ? context.nextWeek.tasks.map((t) => `  • ${t.title} - ${t.date} [${t.status}] (${t.category})`).join('\n') : '  • No tasks scheduled'}

📚 PAST TASKS:
- Total: ${context.pastTasks.total}
- Completed: ${context.pastTasks.completed}
- Recently Completed:
${context.pastTasks.recentCompleted.map((t) => `  • ${t.title} - ${t.date}`).join('\n')}

🔮 FUTURE TASKS (after next week):
- Total: ${context.futureTasks.total}
- Upcoming:
${context.futureTasks.upcoming.length > 0 ? context.futureTasks.upcoming.map((t) => `  • ${t.title} - ${t.date} (${t.category})`).join('\n') : '  • No tasks scheduled'}

🏆 TOP CATEGORIES:
${context.topCategories.map((cat) => `- ${cat.name}: ${cat.completed}/${cat.tasks} tasks (${cat.hours}h, ${cat.completionRate}% complete)`).join('\n')}
===`;
      }
    }

    // System prompts based on language
    const systemPrompts = {
      he: `אתה מאמן פרודוקטיביות אישי מומחה ומסור. תפקידך לעזור למשתמש לנהל את הזמן שלו טוב יותר, להישאר ממוקד ולהשיג את היעדים שלו.

תענה תמיד בעברית, בצורה קצרה וברורה (2-4 משפטים).
השתמש באמוג'ים רלוונטיים כדי להפוך את התגובות למעניינות יותר.
היה מעודד, חיובי ומעשי בעצות שלך.

יש לך גישה מלאה לנתוני המשתמש - משימות עבר, הווה ועתיד (2 חודשים אחורה ו-2 חודשים קדימה). השתמש בנתונים אלה כדי לתת תשובות מדויקות ואישיות.
כאשר משתמש שואל על שבוע הבא, משימות עתידיות, או כל מידע אחר - התבסס על הנתונים המלאים למטה.${contextString}`,
      en: `You are an expert and dedicated personal productivity coach. Your role is to help the user manage their time better, stay focused, and achieve their goals.

Always respond in English, concisely and clearly (2-4 sentences).
Use relevant emojis to make responses engaging.
Be encouraging, positive, and practical in your advice.

You have FULL access to the user's data - past, present, and future tasks (2 months back and 2 months ahead). Use this data to provide accurate, personalized responses.
When the user asks about next week, future tasks, or any other information - refer to the complete data below.${contextString}`,
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompts[lang],
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to get response from OpenAI' }),
      };
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error('Coach function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };

