import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types/task';
import type { Category } from '../../types/category';
import { formatTime } from '../../utils/dateHelpers';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onClick,
}) => {
  const { t } = useTranslation();
  const isCompleted = task.status === 'done';
  const isReminder = task.task_type === 'reminder';
  const categoryColor = category?.color || '#E8E8E8';
  
  // Check if task is overdue (past date and not completed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(task.date);
  taskDate.setHours(0, 0, 0, 0);
  const isOverdue = !isCompleted && taskDate < today;

  return (
    <div
      className={`${styles.taskCard} ${isCompleted ? styles.completed : ''} ${isReminder ? styles.reminder : ''} ${isOverdue ? styles.overdue : ''}`}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${categoryColor}`,
      }}
    >
      <div className={styles.content}>
        <div className={styles.titleRow}>
          {isOverdue && <span className={styles.overdueIcon}>⚠️</span>}
          {isReminder && <span className={styles.reminderIcon}>🔔</span>}
          <h3 className={styles.title}>{task.title}</h3>
        </div>
        
        {task.start_time && (
          <div className={styles.time}>
            {formatTime(task.start_time)}
            {task.end_time && ` - ${formatTime(task.end_time)}`}
          </div>
        )}
        {isOverdue && (
          <div className={styles.overdueLabel}>{t('task.missed', 'Missed')}</div>
        )}
      </div>
    </div>
  );
};

