import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentView, setCurrentView } = useAppContext();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{t('app.title')}</h1>
        <p className={styles.subtitle}>{t('app.subtitle')}</p>
      </div>
      <div className={styles.right}>
        <div className={styles.viewTabs}>
          <button
            className={`${styles.viewTab} ${currentView === 'day' ? styles.active : ''}`}
            onClick={() => setCurrentView('day')}
          >
            {t('nav.daily')}
          </button>
          <button
            className={`${styles.viewTab} ${currentView === 'week' ? styles.active : ''}`}
            onClick={() => setCurrentView('week')}
          >
            {t('nav.weekly')}
          </button>
          <button
            className={`${styles.viewTab} ${currentView === 'month' ? styles.active : ''}`}
            onClick={() => setCurrentView('month')}
          >
            {t('nav.monthly')}
          </button>
        </div>
        <button className={styles.languageToggle} onClick={toggleLanguage}>
          {i18n.language === 'en' ? 'HE' : 'EN'}
        </button>
      </div>
    </header>
  );
};

