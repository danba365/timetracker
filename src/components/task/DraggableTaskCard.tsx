import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import type { Category } from '../../types/category';
import { TaskCard } from './TaskCard';

interface DraggableTaskCardProps {
  task: Task;
  category?: Category;
  onClick: () => void;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  category,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} category={category} onClick={onClick} />
    </div>
  );
};

