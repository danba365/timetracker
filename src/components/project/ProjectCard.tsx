import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '../../types/project';
import { Button } from '../common/Button';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const { t } = useTranslation();

  const getProjectTypeLabel = (type: string) => {
    return t(`project.type.${type}`, type);
  };

  const getStatusLabel = (status: string) => {
    return t(`project.status.${status}`, status);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={styles.projectCard}
      onClick={onClick}
      style={{ borderLeftColor: project.color || '#4F46E5' }}
    >
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          {project.icon && <span className={styles.icon}>{project.icon}</span>}
        </div>
        <div className={styles.actions}>
          <Button variant="text" size="small" onClick={handleDelete}>
            🗑️
          </Button>
        </div>
      </div>

      <h3 className={styles.title}>{project.title}</h3>
      
      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          {getProjectTypeLabel(project.project_type)}
        </span>
        <span className={`${styles.status} ${styles[project.status]}`}>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>
            {t('project.progress', 'Progress')}
          </span>
          <span className={styles.progressPercentage}>
            {project.completion_percentage}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${project.completion_percentage}%` }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>
            {project.tasks_completed} / {project.total_tasks} {t('project.tasks', 'tasks')}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>{t('project.startDate', 'Start')}:</span>
          <span>{new Date(project.start_date).toLocaleDateString()}</span>
        </div>
        {project.target_end_date && (
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>{t('project.targetEnd', 'Target')}:</span>
            <span>{new Date(project.target_end_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {project.ai_scheduled && (
        <div className={styles.aiBadge}>
          <span>🤖</span> {t('project.aiScheduled', 'AI Scheduled')}
        </div>
      )}
    </div>
  );
};

