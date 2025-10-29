import React from 'react';
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
  const isCompleted = task.status === 'done';
  const isReminder = task.task_type === 'reminder';
  const categoryColor = category?.color || '#E8E8E8';

  return (
    <div
      className={`${styles.taskCard} ${isCompleted ? styles.completed : ''} ${isReminder ? styles.reminder : ''}`}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${categoryColor}`,
      }}
    >
      <div className={styles.content}>
        <div className={styles.titleRow}>
          {isReminder && <span className={styles.reminderIcon}>🔔</span>}
          <h3 className={styles.title}>{task.title}</h3>
        </div>
        
        {task.start_time && (
          <div className={styles.time}>
            {formatTime(task.start_time)}
            {task.end_time && ` - ${formatTime(task.end_time)}`}
          </div>
        )}
      </div>
    </div>
  );
};

