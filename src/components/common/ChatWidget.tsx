import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { startOfWeek, endOfWeek, format as formatDate } from 'date-fns';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useFormats } from '../../hooks/useFormats';
import { calculateMetrics, getCategoryStats } from '../../services/analyticsService';
import styles from './ChatWidget.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export const ChatWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language === 'he' ? 'he' : 'en';

  // Get ALL tasks (past 2 months + future 2 months) for comprehensive context
  const now = new Date();
  const fullRange = {
    start: new Date(now.getFullYear(), now.getMonth() - 2, 1), // 2 months ago
    end: new Date(now.getFullYear(), now.getMonth() + 3, 0), // 2 months ahead
  };
  const { tasks } = useTasks(fullRange);
  const { categories } = useCategories();
  const { formats } = useFormats();

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    } else {
      // Show welcome message on first open
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text:
          lang === 'he'
            ? 'שלום! 👋 אני מאמן הפרודוקטיביות שלך. רוצה לשמוע סיכום שבועי או טיפים לשיפור הפרודוקטיביות?'
            : 'Hi! 👋 I\'m your productivity coach. Want your weekly summary or some focus tips?',
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [lang]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Always send task context with EVERY message for full access to data
      // Get fresh current date/time for accurate context
      const now = new Date();
      
      let taskContext = null;
      if (tasks.length > 0) {
        const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
        const currentWeekEnd = endOfWeek(now, { weekStartsOn: 0 });
        const nextWeekStart = new Date(currentWeekEnd);
        nextWeekStart.setDate(nextWeekStart.getDate() + 1);
        const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 });

        // Separate tasks by time period
        const pastTasks = tasks.filter((t) => new Date(t.date) < currentWeekStart);
        const currentWeekTasks = tasks.filter(
          (t) =>
            new Date(t.date) >= currentWeekStart && new Date(t.date) <= currentWeekEnd
        );
        const nextWeekTasks = tasks.filter(
          (t) => new Date(t.date) >= nextWeekStart && new Date(t.date) <= nextWeekEnd
        );
        const futureTasks = tasks.filter((t) => new Date(t.date) > nextWeekEnd);

        // Calculate overdue tasks (past date and not completed)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const allOverdueTasks = tasks.filter((t) => {
          const taskDate = new Date(t.date);
          taskDate.setHours(0, 0, 0, 0);
          return t.status !== 'done' && taskDate < today;
        });

        // Calculate metrics for current week
        const currentMetrics = calculateMetrics(currentWeekTasks, 'week');
        const categoryStats = getCategoryStats(tasks, categories, 'all');

        taskContext = {
          currentDate: formatDate(now, 'MMMM d, yyyy'),
          currentDay: formatDate(now, 'EEEE'),
          dataRange: {
            start: formatDate(fullRange.start, 'MMM d, yyyy'),
            end: formatDate(fullRange.end, 'MMM d, yyyy'),
          },
          currentWeek: {
            range: {
              start: formatDate(currentWeekStart, 'MMM d'),
              end: formatDate(currentWeekEnd, 'MMM d, yyyy'),
            },
            totalTasks: currentWeekTasks.filter((t) => t.task_type !== 'reminder').length,
            completedTasks: currentWeekTasks.filter((t) => t.task_type !== 'reminder' && t.status === 'done').length,
            completionRate: currentMetrics.completionRate,
            totalHours: Math.round(currentMetrics.totalMinutes / 60 * 10) / 10,
            tasks: currentWeekTasks
              .filter((t) => t.task_type !== 'reminder')
              .map((t) => ({
                title: t.title,
                description: t.description || undefined,
                date: t.date,
                start_time: t.start_time || undefined,
                end_time: t.end_time || undefined,
                status: t.status,
                priority: t.priority,
                category: categories.find((c) => c.id === t.category_id)?.name || 'None',
                format: formats.find((f) => f.id === t.format_id)?.name || undefined,
                tags: t.tags && t.tags.length > 0 ? t.tags : undefined,
                is_recurring: t.is_recurring || false,
                recurrence_type: t.recurrence_type || undefined,
              })),
            reminders: currentWeekTasks
              .filter((t) => t.task_type === 'reminder')
              .map((t) => ({
                title: t.title,
                description: t.description || undefined,
                date: t.date,
                start_time: t.start_time || undefined,
                category: categories.find((c) => c.id === t.category_id)?.name || 'None',
              })),
          },
          nextWeek: {
            range: {
              start: formatDate(nextWeekStart, 'MMM d'),
              end: formatDate(nextWeekEnd, 'MMM d, yyyy'),
            },
            totalTasks: nextWeekTasks.filter((t) => t.task_type !== 'reminder').length,
            tasks: nextWeekTasks
              .filter((t) => t.task_type !== 'reminder')
              .map((t) => ({
                title: t.title,
                description: t.description || undefined,
                date: t.date,
                start_time: t.start_time || undefined,
                end_time: t.end_time || undefined,
                status: t.status,
                priority: t.priority,
                category: categories.find((c) => c.id === t.category_id)?.name || 'None',
                format: formats.find((f) => f.id === t.format_id)?.name || undefined,
                tags: t.tags && t.tags.length > 0 ? t.tags : undefined,
                is_recurring: t.is_recurring || false,
                recurrence_type: t.recurrence_type || undefined,
              })),
            reminders: nextWeekTasks
              .filter((t) => t.task_type === 'reminder')
              .map((t) => ({
                title: t.title,
                description: t.description || undefined,
                date: t.date,
                start_time: t.start_time || undefined,
                category: categories.find((c) => c.id === t.category_id)?.name || 'None',
              })),
          },
          pastTasks: {
            total: pastTasks.length,
            completed: pastTasks.filter((t) => t.status === 'done').length,
            recentCompleted: pastTasks
              .filter((t) => t.status === 'done')
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((t) => ({
                title: t.title,
                description: t.description || undefined,
                date: t.date,
                category: categories.find((c) => c.id === t.category_id)?.name || undefined,
              })),
          },
          futureTasks: {
            total: futureTasks.length,
            upcoming: futureTasks
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
              .map((t) => ({
                title: t.title,
                description: t.description || undefined,
                date: t.date,
                start_time: t.start_time || undefined,
                priority: t.priority,
                category: categories.find((c) => c.id === t.category_id)?.name || 'None',
              })),
          },
          currentStreak: currentMetrics.currentStreak,
          topCategories: categoryStats.slice(0, 5).map((cat) => ({
            name: cat.name,
            tasks: cat.count,
            completed: cat.completed,
            hours: Math.round(cat.totalMinutes / 60 * 10) / 10,
            completionRate: cat.completionRate,
          })),
          overdueTasks: {
            total: allOverdueTasks.length,
            tasks: allOverdueTasks
              .sort((a, b) => a.date.localeCompare(b.date)) // Oldest first
              .map((t) => {
                const taskDate = new Date(t.date);
                const daysOverdue = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
                return {
                  title: t.title,
                  description: t.description || undefined,
                  date: t.date,
                  start_time: t.start_time || undefined,
                  daysOverdue: daysOverdue,
                  priority: t.priority,
                  category: categories.find((c) => c.id === t.category_id)?.name || 'None',
                };
              }),
          },
        };
      }

      const response = await fetch('/.netlify/functions/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          lang,
          context: taskContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from coach');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'bot',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          lang === 'he'
            ? '😔 מצטער, אירעה שגיאה. נסה שוב בעוד רגע.'
            : '😔 Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(t('chat.clearHistoryConfirm', 'Clear all chat history?'))) {
      localStorage.removeItem('chatMessages');
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text:
          lang === 'he'
            ? 'שלום! 👋 אני מאמן הפרודוקטיביות שלך. איך אני יכול לעזור לך היום?'
            : 'Hi! 👋 I\'m your productivity coach. How can I help you today?',
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          aria-label={t('chat.openCoach', 'Open AI Coach')}
        >
          <span className={styles.icon}>💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`${styles.chatWindow} ${lang === 'he' ? styles.rtl : ''}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.headerIcon}>🤖</span>
              <span>{t('chat.title', 'AI Productivity Coach')}</span>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerButton}
                onClick={handleClearHistory}
                title={t('chat.clearHistory', 'Clear history')}
              >
                🗑️
              </button>
              <button
                className={styles.headerButton}
                onClick={() => setIsOpen(false)}
                title={t('common.close', 'Close')}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.sender === 'user' ? styles.userMessage : styles.botMessage
                }`}
              >
                <div className={styles.messageContent}>{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.messageContent}>
                  <span className={styles.typing}>
                    {t('chat.thinking', 'Coach is thinking...')} 💭
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <button
              className={styles.quickButton}
              onClick={() => {
                setInputValue(
                  lang === 'he' ? 'תן לי סיכום של השבוע שלי' : 'Give me my weekly summary'
                );
              }}
            >
              📊 {t('chat.weeklySummary', 'Weekly Summary')}
            </button>
            <button
              className={styles.quickButton}
              onClick={() => {
                setInputValue(
                  lang === 'he'
                    ? 'איך אני יכול לשפר את איזון העבודה-חיים?'
                    : 'How can I improve my work-life balance?'
                );
              }}
            >
              ⚖️ {t('chat.workLifeBalance', 'Balance')}
            </button>
            <button
              className={styles.quickButton}
              onClick={() => {
                setInputValue(
                  lang === 'he' ? 'תן לי מוטיבציה לעבודה' : 'Give me some motivation'
                );
              }}
            >
              ⚡ {t('chat.motivation', 'Motivation')}
            </button>
          </div>

          {/* Input Area */}
          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.placeholder', 'Ask me anything...')}
              rows={2}
              disabled={isLoading}
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
            >
              {t('chat.send', 'Send')} 📤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

