import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onAddTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddTask }) => {
  const { t } = useTranslation();
  const { showSettings, setShowSettings, showProjects, setShowProjects, showAnalytics, setShowAnalytics } = useAppContext();

  const handleNavigate = (target: 'tasks' | 'projects' | 'analytics' | 'settings') => {
    setShowSettings(target === 'settings');
    setShowProjects(target === 'projects');
    setShowAnalytics(target === 'analytics');
  };

  return (
    <aside className={styles.sidebar}>
      <button className={styles.addButton} onClick={onAddTask}>
        <span>+</span>
        {t('task.addTask')}
      </button>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('nav.dashboard')}</h3>
        <button 
          className={`${styles.navItem} ${!showSettings && !showProjects && !showAnalytics ? styles.active : ''}`}
          onClick={() => handleNavigate('tasks')}
        >
          <span className={styles.navIcon}>📋</span>
          {t('nav.tasks')}
        </button>
        <button 
          className={`${styles.navItem} ${showProjects ? styles.active : ''}`}
          onClick={() => handleNavigate('projects')}
        >
          <span className={styles.navIcon}>🚀</span>
          {t('nav.projects', 'Projects')}
        </button>
        <button 
          className={`${styles.navItem} ${showAnalytics ? styles.active : ''}`}
          onClick={() => handleNavigate('analytics')}
        >
          <span className={styles.navIcon}>📊</span>
          {t('nav.analytics')}
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>📅</span>
          {t('nav.calendar')}
        </button>
        <button 
          className={`${styles.navItem} ${showSettings ? styles.active : ''}`}
          onClick={() => handleNavigate('settings')}
        >
          <span className={styles.navIcon}>⚙️</span>
          {t('nav.settings')}
        </button>
      </div>

      <div className={styles.timer}>
        <h3 className={styles.timerTitle}>{t('timer.activeTimer')}</h3>
        <p className={styles.timerContent}>{t('timer.noActiveTimer')}</p>
      </div>
    </aside>
  );
};

