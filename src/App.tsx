import React, { useRef } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { WeeklyView } from './components/views/WeeklyView';
import { DailyView } from './components/views/DailyView';
import { MonthlyView } from './components/views/MonthlyView';
import { SettingsView } from './components/views/SettingsView';
import { ProjectsView } from './components/views/ProjectsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ChatWidget } from './components/common/ChatWidget';
import styles from './App.module.css';
import './i18n/config';

const AppContent: React.FC = () => {
  const { currentView, showSettings, showProjects, showAnalytics } = useAppContext();
  const viewRef = useRef<any>(null);

  const handleAddTask = () => {
    // Trigger the add task modal in the current view
    if (viewRef.current?.openAddTaskModal) {
      viewRef.current.openAddTaskModal();
    }
  };

  const renderView = () => {
    if (showSettings) {
      return <SettingsView />;
    }

    if (showProjects) {
      return <ProjectsView />;
    }

    if (showAnalytics) {
      return <AnalyticsView />;
    }
    
    switch (currentView) {
      case 'day':
        return <DailyView ref={viewRef} />;
      case 'week':
        return <WeeklyView ref={viewRef} />;
      case 'month':
        return <MonthlyView ref={viewRef} />;
      default:
        return <WeeklyView ref={viewRef} />;
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.main}>
        <Sidebar onAddTask={handleAddTask} />
        <main className={styles.content}>{renderView()}</main>
      </div>
      <MobileNav onAddTask={handleAddTask} />
      <ChatWidget />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
