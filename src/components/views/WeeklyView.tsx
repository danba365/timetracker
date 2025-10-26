import { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useFormats } from '../../hooks/useFormats';
import { useEvents } from '../../hooks/useEvents';
import type { Task } from '../../types/task';
import { getWeekDays, areDatesEqual } from '../../utils/dateHelpers';
import { getHebrewHolidays, getHolidayForDate } from '../../utils/hebrewCalendar';
import { TaskCard } from '../task/TaskCard';
import { DraggableTaskCard } from '../task/DraggableTaskCard';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TaskForm } from '../task/TaskForm';
import styles from './WeeklyView.module.css';
import { DroppableDay } from './DroppableDay';

export const WeeklyView = forwardRef<{ openAddTaskModal: () => void }>((_, ref) => {
  const { t, i18n } = useTranslation();
  const { currentDate, dateRange, navigateDate, goToToday } = useAppContext();
  const { tasks, updateTask, createTask, deleteTask } = useTasks(dateRange);
  const { categories, getCategoryById } = useCategories();
  const { formats } = useFormats();
  const { getEventsForDate } = useEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Expose method to parent to open add task modal
  useImperativeHandle(ref, () => ({
    openAddTaskModal: () => {
      setSelectedTask(undefined);
      setSelectedDate(undefined);
      setIsModalOpen(true);
    },
  }));

  const weekDays = getWeekDays(currentDate);
  const isHebrew = i18n.language === 'he';
  
  // Get Hebrew holidays for the current week
  const holidays = useMemo(() => {
    return getHebrewHolidays(dateRange.start, dateRange.end);
  }, [dateRange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const newDate = over.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.date !== newDate) {
      await updateTask({ id: taskId, date: newDate });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedTask(undefined);
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSubmit = async (input: any) => {
    try {
      console.log('📝 Submitting task:', input);
      if (selectedTask) {
        await updateTask({ ...input, id: selectedTask.id });
        console.log('✅ Task updated successfully');
      } else {
        // If we have a selectedDate, use it; otherwise use the input date
        const taskData = selectedDate ? { ...input, date: selectedDate } : input;
        await createTask(taskData);
        console.log('✅ Task created successfully');
      }
      setIsModalOpen(false);
      setSelectedTask(undefined);
      setSelectedDate(undefined);
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

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <div className={styles.weeklyView}>
      <div className={styles.navigation}>
        <div className={styles.dateInfo}>
          <h2 className={styles.currentMonth}>{format(currentDate, 'MMMM yyyy')}</h2>
          <p className={styles.dateRange}>
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </p>
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
        <div className={styles.weekGrid}>
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks
            .filter((t) => t.date === dateStr)
            .sort((a, b) => {
              // Tasks without start_time go to the end
              if (!a.start_time && !b.start_time) return 0;
              if (!a.start_time) return 1;
              if (!b.start_time) return -1;
              // Sort by start_time
              return a.start_time.localeCompare(b.start_time);
            });
          const isToday = areDatesEqual(day, new Date());
          const holiday = getHolidayForDate(day, holidays);
          const dayEvents = getEventsForDate(day);

          return (
            <DroppableDay key={dateStr} id={dateStr}>
              <div className={styles.dayColumn}>
                <div 
                  className={`${styles.dayHeader} ${isToday ? styles.today : ''} ${styles.clickable}`}
                  onClick={() => handleDayClick(dateStr)}
                  title={t('task.addTaskToDate', 'Add task to this date')}
                >
                  <span className={styles.dayName}>
                    {format(day, 'EEE', isHebrew ? { locale: he } : {})}
                  </span>
                  <span className={styles.dayDate}>{format(day, 'd')}</span>
                  <span className={styles.addIcon}>+</span>
                </div>
                  {holiday && (
                    <div className={styles.holidayBadge} title={holiday.name}>
                      {isHebrew ? holiday.nameHe : holiday.name}
                    </div>
                  )}
                  {dayEvents.length > 0 && (
                    <div className={styles.eventsList}>
                      {dayEvents.map((event) => (
                        <div key={event.id} className={styles.eventBadge} title={event.notes || event.name}>
                          {event.icon} {event.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.tasksContainer}>
                    {dayTasks.length === 0 ? (
                      <div className={styles.emptyState}>{t('task.noTasks')}</div>
                    ) : (
                      dayTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          category={task.category_id ? getCategoryById(task.category_id) : undefined}
                          onClick={() => handleTaskClick(task)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </DroppableDay>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              category={activeTask.category_id ? getCategoryById(activeTask.category_id) : undefined}
              onClick={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(undefined);
          setSelectedDate(undefined);
        }}
        title={selectedTask ? t('task.editTask') : t('task.createTask')}
      >
        <TaskForm
          key={selectedTask?.id || selectedDate || 'new'}
          task={selectedTask}
          categories={categories}
          formats={formats}
          defaultDate={selectedDate}
          onSubmit={handleSubmit}
          onDelete={selectedTask ? handleDelete : undefined}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedTask(undefined);
            setSelectedDate(undefined);
          }}
        />
      </Modal>
    </div>
  );
});

WeeklyView.displayName = 'WeeklyView';

