import type { Handler, HandlerEvent } from '@netlify/functions';

interface TaskContext {
  currentDate: string;
  currentDay: string;
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
      description?: string;
      date: string;
      start_time?: string;
      end_time?: string;
      status: string;
      priority: string;
      category: string;
      format?: string;
      tags?: string[];
      is_recurring?: boolean;
      recurrence_type?: string;
    }>;
    reminders: Array<{
      title: string;
      description?: string;
      date: string;
      start_time?: string;
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
      description?: string;
      date: string;
      start_time?: string;
      end_time?: string;
      status: string;
      priority: string;
      category: string;
      format?: string;
      tags?: string[];
      is_recurring?: boolean;
      recurrence_type?: string;
    }>;
    reminders: Array<{
      title: string;
      description?: string;
      date: string;
      start_time?: string;
      category: string;
    }>;
  };
  pastTasks: {
    total: number;
    completed: number;
    recentCompleted: Array<{
      title: string;
      description?: string;
      date: string;
      category?: string;
    }>;
  };
  futureTasks: {
    total: number;
    upcoming: Array<{
      title: string;
      description?: string;
      date: string;
      start_time?: string;
      priority?: string;
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
  overdueTasks: {
    total: number;
    tasks: Array<{
      title: string;
      description?: string;
      date: string;
      start_time?: string;
      daysOverdue: number;
      priority?: string;
      category: string;
    }>;
  };
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
      // Helper function to format task details
      const formatTask = (t: any, isHebrew: boolean) => {
        let taskInfo = `  • ${t.title} - ${t.date} [${t.status}]`;
        if (t.priority) taskInfo += ` [${isHebrew ? (t.priority === 'high' ? 'גבוה' : t.priority === 'medium' ? 'בינוני' : 'נמוך') : t.priority}]`;
        taskInfo += ` (${t.category})`;
        if (t.start_time && t.end_time) taskInfo += ` ${t.start_time}-${t.end_time}`;
        else if (t.start_time) taskInfo += ` ${t.start_time}`;
        if (t.description) taskInfo += `\n    📝 ${t.description}`;
        if (t.format) taskInfo += ` | ${isHebrew ? 'פורמט' : 'Format'}: ${t.format}`;
        if (t.tags && t.tags.length > 0) taskInfo += ` | ${isHebrew ? 'תגיות' : 'Tags'}: ${t.tags.join(', ')}`;
        if (t.is_recurring) taskInfo += ` | ${isHebrew ? 'חוזר' : 'Recurring'}: ${t.recurrence_type || 'custom'}`;
        return taskInfo;
      };

      const formatReminder = (r: any, isHebrew: boolean) => {
        let reminderInfo = `  🔔 ${r.title} - ${r.date} (${r.category})`;
        if (r.start_time) reminderInfo += ` ${r.start_time}`;
        if (r.description) reminderInfo += `\n    📝 ${r.description}`;
        return reminderInfo;
      };

      if (lang === 'he') {
        contextString = `\n\n=== 📅 היום: ${context.currentDate} (${context.currentDay}) ===

=== 📊 נתוני המשתמש המלאים (${context.dataRange.start} - ${context.dataRange.end}) ===

🔥 רצף ימים נוכחי: ${context.currentStreak} ימים

📅 שבוע נוכחי (${context.currentWeek.range.start} - ${context.currentWeek.range.end}):
- סה"כ משימות פעולה: ${context.currentWeek.totalTasks}
- הושלמו: ${context.currentWeek.completedTasks} (${context.currentWeek.completionRate}%)
- שעות עבודה: ${context.currentWeek.totalHours}
- משימות פעולה (דורשות השלמה):
${context.currentWeek.tasks.length > 0 ? context.currentWeek.tasks.map((t) => formatTask(t, true)).join('\n') : '  • אין משימות'}
- תזכורות (אינפורמטיביות בלבד):
${context.currentWeek.reminders.length > 0 ? context.currentWeek.reminders.map((r) => formatReminder(r, true)).join('\n') : '  • אין תזכורות'}

📅 שבוע הבא (${context.nextWeek.range.start} - ${context.nextWeek.range.end}):
- סה"כ משימות פעולה: ${context.nextWeek.totalTasks}
- משימות פעולה מתוכננות:
${context.nextWeek.tasks.length > 0 ? context.nextWeek.tasks.map((t) => formatTask(t, true)).join('\n') : '  • אין משימות מתוכננות'}
- תזכורות (אינפורמטיביות בלבד):
${context.nextWeek.reminders.length > 0 ? context.nextWeek.reminders.map((r) => formatReminder(r, true)).join('\n') : '  • אין תזכורות'}

📚 משימות עבר:
- סה"כ: ${context.pastTasks.total}
- הושלמו: ${context.pastTasks.completed}
- הושלמו לאחרונה:
${context.pastTasks.recentCompleted.map((t) => {
  let info = `  • ${t.title} - ${t.date}`;
  if (t.category) info += ` (${t.category})`;
  if (t.description) info += `\n    📝 ${t.description}`;
  return info;
}).join('\n')}

🔮 משימות עתידיות (אחרי שבוע הבא):
- סה"כ: ${context.futureTasks.total}
- קרובות ביותר:
${context.futureTasks.upcoming.length > 0 ? context.futureTasks.upcoming.map((t) => {
  let info = `  • ${t.title} - ${t.date}`;
  if (t.start_time) info += ` ${t.start_time}`;
  if (t.priority) info += ` [${t.priority === 'high' ? 'גבוה' : t.priority === 'medium' ? 'בינוני' : 'נמוך'}]`;
  info += ` (${t.category})`;
  if (t.description) info += `\n    📝 ${t.description}`;
  return info;
}).join('\n') : '  • אין משימות מתוכננות'}

🏆 קטגוריות מובילות:
${context.topCategories.map((cat) => `- ${cat.name}: ${cat.completed}/${cat.tasks} משימות (${cat.hours} שעות, ${cat.completionRate}% הושלמו)`).join('\n')}

⚠️ משימות שהוחמצו (לא הושלמו בזמן):
- סה"כ משימות שהוחמצו: ${context.overdueTasks.total}
${context.overdueTasks.total > 0 ? `- משימות שהוחמצו:\n${context.overdueTasks.tasks.map((t) => {
  let info = `  • ${t.title} - ${t.date} (${t.daysOverdue} ימים באיחור)`;
  if (t.start_time) info += ` ${t.start_time}`;
  if (t.priority) info += ` [${t.priority === 'high' ? 'גבוה' : t.priority === 'medium' ? 'בינוני' : 'נמוך'}]`;
  info += ` [${t.category}]`;
  if (t.description) info += `\n    📝 ${t.description}`;
  return info;
}).join('\n')}` : '- אין משימות שהוחמצו - עבודה מצוינת! 🎉'}
===`;
      } else {
        contextString = `\n\n=== 📅 TODAY: ${context.currentDate} (${context.currentDay}) ===

=== 📊 User's Complete Data (${context.dataRange.start} - ${context.dataRange.end}) ===

🔥 Current Streak: ${context.currentStreak} days

📅 CURRENT WEEK (${context.currentWeek.range.start} - ${context.currentWeek.range.end}):
- Total Actionable Tasks: ${context.currentWeek.totalTasks}
- Completed: ${context.currentWeek.completedTasks} (${context.currentWeek.completionRate}%)
- Work Hours: ${context.currentWeek.totalHours}
- Actionable Tasks (require completion):
${context.currentWeek.tasks.length > 0 ? context.currentWeek.tasks.map((t) => formatTask(t, false)).join('\n') : '  • No tasks'}
- Reminders (informational only):
${context.currentWeek.reminders.length > 0 ? context.currentWeek.reminders.map((r) => formatReminder(r, false)).join('\n') : '  • No reminders'}

📅 NEXT WEEK (${context.nextWeek.range.start} - ${context.nextWeek.range.end}):
- Total Actionable Tasks: ${context.nextWeek.totalTasks}
- Scheduled Actionable Tasks:
${context.nextWeek.tasks.length > 0 ? context.nextWeek.tasks.map((t) => formatTask(t, false)).join('\n') : '  • No tasks scheduled'}
- Reminders (informational only):
${context.nextWeek.reminders.length > 0 ? context.nextWeek.reminders.map((r) => formatReminder(r, false)).join('\n') : '  • No reminders'}

📚 PAST TASKS:
- Total: ${context.pastTasks.total}
- Completed: ${context.pastTasks.completed}
- Recently Completed:
${context.pastTasks.recentCompleted.map((t) => {
  let info = `  • ${t.title} - ${t.date}`;
  if (t.category) info += ` (${t.category})`;
  if (t.description) info += `\n    📝 ${t.description}`;
  return info;
}).join('\n')}

🔮 FUTURE TASKS (after next week):
- Total: ${context.futureTasks.total}
- Upcoming:
${context.futureTasks.upcoming.length > 0 ? context.futureTasks.upcoming.map((t) => {
  let info = `  • ${t.title} - ${t.date}`;
  if (t.start_time) info += ` ${t.start_time}`;
  if (t.priority) info += ` [${t.priority}]`;
  info += ` (${t.category})`;
  if (t.description) info += `\n    📝 ${t.description}`;
  return info;
}).join('\n') : '  • No tasks scheduled'}

🏆 TOP CATEGORIES:
${context.topCategories.map((cat) => `- ${cat.name}: ${cat.completed}/${cat.tasks} tasks (${cat.hours}h, ${cat.completionRate}% complete)`).join('\n')}

⚠️ OVERDUE TASKS (not completed on time):
- Total Overdue: ${context.overdueTasks.total}
${context.overdueTasks.total > 0 ? `- Overdue Tasks:\n${context.overdueTasks.tasks.map((t) => {
  let info = `  • ${t.title} - ${t.date} (${t.daysOverdue} days overdue)`;
  if (t.start_time) info += ` ${t.start_time}`;
  if (t.priority) info += ` [${t.priority}]`;
  info += ` [${t.category}]`;
  if (t.description) info += `\n    📝 ${t.description}`;
  return info;
}).join('\n')}` : '- No overdue tasks - great job! 🎉'}
===`;
      }
    }

    // System prompts based on language
    const systemPrompts = {
      he: `אתה מאמן פרודוקטיביות אישי מומחה ומסור. תפקידך לעזור למשתמש לנהל את הזמן שלו טוב יותר, להישאר ממוקד ולהשיג את היעדים שלו.

תענה תמיד בעברית, בצורה קצרה וברורה (2-4 משפטים).
השתמש באמוג'ים רלוונטיים כדי להפוך את התגובות למעניינות יותר.
היה מעודד, חיובי ומעשי בעצות שלך.

יש לך גישה מלאה לנתוני המשתמש - משימות עבר, הווה ועתיד (2 חודשים אחורה ו-2 חודשים קדימה). 

הבחנה חשובה:
- משימות פעולה (Tasks) = פריטים שדורשים השלמה ומעקב סטטוס
- תזכורות (Reminders) = הערות אינפורמטיביות בלבד (כמו "טיול של האישה", "פגישה אצל הרופא")

אתה יודע בדיוק אילו משימות פעולה הושלמו, אילו ממתינות, ואילו הוחמצו.
כאשר משתמש שואל על "משימות" - התייחס רק למשימות פעולה, לא לתזכורות.
כאשר משתמש שואל "איזה יום היום" או "מה התאריך" - השתמש בשדה "היום" למטה.
כאשר יש משימות שהוחמצו - עודד את המשתמש בצורה חיובית ועזור לו לתעדף אותן.
תזכורות הן אינפורמטיביות בלבד - אין צורך לעקוב אחריהן או להשלים אותן.${contextString}`,
      en: `You are an expert and dedicated personal productivity coach. Your role is to help the user manage their time better, stay focused, and achieve their goals.

Always respond in English, concisely and clearly (2-4 sentences).
Use relevant emojis to make responses engaging.
Be encouraging, positive, and practical in your advice.

You have FULL access to the user's data - past, present, and future tasks (2 months back and 2 months ahead).

Important distinction:
- Actionable Tasks = Items that require completion and status tracking
- Reminders = Informational notes only (like "Wife's trip", "Doctor appointment")

You know exactly which actionable tasks are completed, pending, and overdue (missed their deadline).
When user asks about "tasks" - refer only to actionable tasks, not reminders.
When user asks "what day is today" or "what's the date" - use the "TODAY" field below.
When there are overdue tasks - encourage the user positively and help them prioritize.
Reminders are informational only - no need to track or complete them.${contextString}`,
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

