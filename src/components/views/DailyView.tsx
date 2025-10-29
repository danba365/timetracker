import { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useFormats } from '../../hooks/useFormats';
import { useEvents } from '../../hooks/useEvents';
import type { Task } from '../../types/task';
import { getTimeSlots } from '../../utils/dateHelpers';
import { getHebrewHolidays, getHolidayForDate } from '../../utils/hebrewCalendar';
import { TaskCard } from '../task/TaskCard';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TaskForm } from '../task/TaskForm';
import styles from './DailyView.module.css';

export const DailyView = forwardRef<{ openAddTaskModal: () => void }>((_, ref) => {
  const { t, i18n } = useTranslation();
  const { currentDate, dateRange, navigateDate, goToToday } = useAppContext();
  const { tasks, updateTask, createTask, deleteTask } = useTasks(dateRange);
  const { categories, getCategoryById } = useCategories();
  const { formats } = useFormats();
  const { getEventsForDate } = useEvents();
  
  const isHebrew = i18n.language === 'he';
  
  // Get Hebrew holidays for the current day
  const holidays = useMemo(() => {
    return getHebrewHolidays(currentDate, currentDate);
  }, [currentDate]);

  // Get events for the current day
  const dayEvents = useMemo(() => {
    return getEventsForDate(currentDate);
  }, [currentDate, getEventsForDate]);
  
  const holiday = getHolidayForDate(currentDate, holidays);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // Expose method to parent to open add task modal
  useImperativeHandle(ref, () => ({
    openAddTaskModal: () => {
      setSelectedTask(undefined);
      setIsModalOpen(true);
    },
  }));

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const allDayTasks = tasks.filter((t) => t.date === dateStr);
  
  // Separate reminders from regular tasks
  const dayReminders = allDayTasks
    .filter((t) => t.task_type === 'reminder')
    .sort((a, b) => {
      if (!a.start_time && !b.start_time) return 0;
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    });
  
  const dayTasks = allDayTasks.filter((t) => t.task_type !== 'reminder');
  const scheduledTasks = dayTasks
    .filter((t) => t.start_time)
    .sort((a, b) => {
      // Sort by start_time
      return a.start_time!.localeCompare(b.start_time!);
    });
  const unscheduledTasks = dayTasks.filter((t) => !t.start_time);

  const timeSlots = getTimeSlots();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (input: any) => {
    try {
      console.log('📝 Submitting task:', input);
      if (selectedTask) {
        await updateTask({ ...input, id: selectedTask.id });
        console.log('✅ Task updated successfully');
      } else {
        await createTask(input);
        console.log('✅ Task created successfully');
      }
      setIsModalOpen(false);
      setSelectedTask(undefined);
    } catch (error) {
      console.error('❌ Error saving task:', error);
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

  const getTasksForTimeSlot = (timeSlot: string) => {
    return scheduledTasks.filter((t) => {
      if (!t.start_time) return false;
      // Remove seconds if present (e.g., "08:00:00" -> "08:00")
      const taskTime = t.start_time.substring(0, 5);
      return taskTime === timeSlot;
    });
  };

  return (
    <div className={styles.dailyView}>
      <div className={styles.navigation}>
        <div className={styles.dateInfo}>
          <h2 className={styles.currentDate}>
            {format(currentDate, 'MMMM d, yyyy', isHebrew ? { locale: he } : {})}
          </h2>
          <p className={styles.dayName}>
            {format(currentDate, 'EEEE', isHebrew ? { locale: he } : {})}
          </p>
          {holiday && (
            <div className={styles.holidayBadge}>
              {isHebrew ? holiday.nameHe : holiday.name}
            </div>
          )}
          {(dayEvents.length > 0 || dayReminders.length > 0) && (
            <div className={styles.eventsList}>
              {dayEvents.map((event) => (
                <div key={event.id} className={styles.eventBadge}>
                  {event.icon} {event.name}
                  {event.year && ` (${new Date().getFullYear() - event.year})`}
                </div>
              ))}
              {dayReminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={styles.reminderBadge}
                  onClick={() => handleTaskClick(reminder)}
                  title={reminder.description || reminder.title}
                >
                  🔔 {reminder.title}
                  {reminder.start_time && ` • ${reminder.start_time.substring(0, 5)}`}
                </div>
              ))}
            </div>
          )}
          {dayTasks.length > 0 && (
            <div className={styles.tasksSummary}>
              {scheduledTasks.length} {t('task.scheduled', 'scheduled')} • {unscheduledTasks.length} {t('task.unscheduled', 'unscheduled')}
            </div>
          )}
        </div>
        <div className={styles.navButtons}>
          <Button variant="secondary" onClick={() => navigateDate('prev')}>
            {t('common.previous')}
          </Button>
          <Button variant="secondary" onClick={goToToday}>
            {t('common.today')}
          </Button>
          <Button variant="secondary" onClick={() => navigateDate('next')}>
            {t('common.next')}
          </Button>
        </div>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timeColumn}>
          {timeSlots.map((slot) => (
            <div key={slot} className={styles.timeSlot}>
              {slot}
            </div>
          ))}
        </div>
        <div className={styles.tasksColumn}>
          {timeSlots.map((slot) => {
            const slotTasks = getTasksForTimeSlot(slot);
            return (
              <div key={slot} className={styles.taskSlot}>
                {slotTasks.map((task) => (
                  <div key={task.id} className={styles.scheduledTask}>
                    <TaskCard
                      task={task}
                      category={task.category_id ? getCategoryById(task.category_id) : undefined}
                      onClick={() => handleTaskClick(task)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {unscheduledTasks.length > 0 && (
        <div className={styles.unscheduledSection}>
          <h3 className={styles.sectionTitle}>
            {t('task.unscheduled', 'Unscheduled Tasks')} ({unscheduledTasks.length})
          </h3>
          <div className={styles.taskList}>
            {unscheduledTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                category={task.category_id ? getCategoryById(task.category_id) : undefined}
                onClick={() => handleTaskClick(task)}
              />
            ))}
          </div>
        </div>
      )}
      
      {dayTasks.length === 0 && (
        <div className={styles.emptyState}>
          <p>{t('task.noTasks')}</p>
          <p>{t('task.createFirstTask')}</p>
        </div>
      )}

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

DailyView.displayName = 'DailyView';

