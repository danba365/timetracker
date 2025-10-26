import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  onAddTask: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onAddTask }) => {
  const { t } = useTranslation();
  const { currentView, setCurrentView } = useAppContext();

  return (
    <nav className={styles.mobileNav}>
      <button
        className={`${styles.navButton} ${currentView === 'week' ? styles.active : ''}`}
        onClick={() => setCurrentView('week')}
      >
        <span className={styles.navIcon}>📅</span>
        <span>{t('nav.weekly')}</span>
      </button>
      <button
        className={`${styles.navButton} ${currentView === 'day' ? styles.active : ''}`}
        onClick={() => setCurrentView('day')}
      >
        <span className={styles.navIcon}>📆</span>
        <span>{t('nav.daily')}</span>
      </button>
      <button className={styles.addButton} onClick={onAddTask}>
        +
      </button>
      <button
        className={`${styles.navButton} ${currentView === 'month' ? styles.active : ''}`}
        onClick={() => setCurrentView('month')}
      >
        <span className={styles.navIcon}>📊</span>
        <span>{t('nav.monthly')}</span>
      </button>
      <button className={styles.navButton}>
        <span className={styles.navIcon}>⚙️</span>
        <span>{t('nav.settings')}</span>
      </button>
    </nav>
  );
};

