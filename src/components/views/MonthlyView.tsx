import { useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useFormats } from '../../hooks/useFormats';
import { useEvents } from '../../hooks/useEvents';
import type { Task } from '../../types/task';
import { getMonthDays } from '../../utils/dateHelpers';
import { getHebrewHolidays, getHolidayForDate } from '../../utils/hebrewCalendar';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TaskForm } from '../task/TaskForm';
import styles from './MonthlyView.module.css';

export const MonthlyView = forwardRef<{ openAddTaskModal: () => void }>((_, ref) => {
  const { t, i18n } = useTranslation();
  const { currentDate, navigateDate, goToToday } = useAppContext();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dateRange = { start: monthStart, end: monthEnd };
  const { tasks, createTask, updateTask, deleteTask } = useTasks(dateRange);
  const { categories, getCategoryById } = useCategories();
  const { formats } = useFormats();
  const { getEventsForDate } = useEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // Expose method to parent to open add task modal
  useImperativeHandle(ref, () => ({
    openAddTaskModal: () => {
      setSelectedTask(undefined);
      setIsModalOpen(true);
    },
  }));

  const monthDays = getMonthDays(currentDate);
  const isHebrew = i18n.language === 'he';
  const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  // Get Hebrew holidays for the current month
  const holidays = useMemo(() => {
    return getHebrewHolidays(dateRange.start, dateRange.end);
  }, [dateRange]);

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks
      .filter((t) => t.date === dateStr && t.task_type !== 'reminder')
      .sort((a, b) => {
        // Tasks without start_time go to the end
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        // Sort by start_time
        return a.start_time.localeCompare(b.start_time);
      });
  };

  const getRemindersForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks
      .filter((t) => t.date === dateStr && t.task_type === 'reminder')
      .sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
      });
  };

  const handleDayClick = (date: Date) => {
    // In a complete implementation, this would open a modal or sidebar with day tasks
    console.log('Day clicked:', date);
  };

  const handleSubmit = async (input: any) => {
    try {
      if (selectedTask) {
        await updateTask({ ...input, id: selectedTask.id });
      } else {
        await createTask(input);
      }
      setIsModalOpen(false);
      setSelectedTask(undefined);
    } catch (error) {
      console.error('Error saving task:', error);
      alert(`Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (selectedTask && window.confirm(t('messages.deleteConfirm'))) {
      await deleteTask(selectedTask.id);
      setIsModalOpen(false);
      setSelectedTask(undefined);
    }
  };

  return (
    <div className={styles.monthlyView}>
      <div className={styles.navigation}>
        <h2 className={styles.currentMonth}>
          {format(currentDate, 'MMMM yyyy', isHebrew ? { locale: he } : {})}
        </h2>
        <div className={styles.navButtons}>
          <Button variant="secondary" onClick={() => navigateDate('prev')}>
            ←
          </Button>
          <Button variant="secondary" onClick={goToToday}>
            {t('common.today')}
          </Button>
          <Button variant="secondary" onClick={() => navigateDate('next')}>
            →
          </Button>
        </div>
      </div>

      <div className={styles.calendar}>
        <div className={styles.weekdays}>
          {weekDays.map((day) => (
            <div key={day} className={styles.weekday}>
              {t(`days.${day}`)}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {monthDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const dayReminders = getRemindersForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const holiday = getHolidayForDate(day, holidays);
            const dayEvents = getEventsForDate(day);

            // Get unique categories for this day
            const categoryColors = Array.from(
              new Set(
                dayTasks
                  .map((t) => t.category_id)
                  .filter(Boolean)
                  .map((id) => getCategoryById(id!)?.color)
                  .filter(Boolean)
              )
            ).slice(0, 5); // Max 5 dots

            return (
              <div
                key={index}
                className={`${styles.dayCell} ${isToday ? styles.today : ''} ${
                  !isCurrentMonth ? styles.otherMonth : ''
                }`}
                onClick={() => handleDayClick(day)}
              >
                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                {holiday && (
                  <span className={styles.holidayIndicator} title={isHebrew ? holiday.nameHe : holiday.name}>
                    🕎
                  </span>
                )}
                {(dayEvents.length > 0 || dayReminders.length > 0) && (
                  <div className={styles.eventIndicators}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <span key={event.id} className={styles.eventIndicator} title={event.name}>
                        {event.icon}
                      </span>
                    ))}
                    {dayReminders.slice(0, 2).map((reminder) => (
                      <span key={reminder.id} className={styles.reminderIndicator} title={reminder.title}>
                        🔔
                      </span>
                    ))}
                  </div>
                )}
                {dayTasks.length > 0 && (
                  <>
                    <div className={styles.taskIndicators}>
                      {categoryColors.map((color, i) => (
                        <div
                          key={i}
                          className={styles.taskDot}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {dayTasks.length > 5 && (
                      <span className={styles.taskCount}>+{dayTasks.length - 5}</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(undefined);
        }}
        title={selectedTask ? t('task.editTask') : t('task.createTask')}
      >
        <TaskForm
          key={selectedTask?.id || 'new'}
          task={selectedTask}
          categories={categories}
          formats={formats}
          onSubmit={handleSubmit}
          onDelete={selectedTask ? handleDelete : undefined}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedTask(undefined);
          }}
        />
      </Modal>
    </div>
  );
});

MonthlyView.displayName = 'MonthlyView';

