import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styles from './DroppableDay.module.css';

interface DroppableDayProps {
  id: string;
  children: React.ReactNode;
}

export const DroppableDay: React.FC<DroppableDayProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`${styles.droppableDay} ${isOver ? styles.dragOver : ''}`}
    >
      {children}
    </div>
  );
};

