import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type View = 'day' | 'week' | 'month';

interface AppContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  dateRange: { start: Date; end: Date };
  navigateDate: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showProjects: boolean;
  setShowProjects: (show: boolean) => void;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('week');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  const dateRange = useMemo(() => {
    switch (currentView) {
      case 'day':
        return { start: currentDate, end: currentDate };
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
      default:
        return { start: currentDate, end: currentDate };
    }
  }, [currentDate, currentView]);

  const navigateDate = useCallback(
    (direction: 'prev' | 'next') => {
      const multiplier = direction === 'prev' ? -1 : 1;
      let newDate = new Date(currentDate);

      switch (currentView) {
        case 'day':
          newDate.setDate(newDate.getDate() + multiplier);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7 * multiplier);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + multiplier);
          break;
      }

      setCurrentDate(newDate);
    },
    [currentDate, currentView]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const value: AppContextType = {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    dateRange,
    navigateDate,
    goToToday,
    showSettings,
    setShowSettings,
    showProjects,
    setShowProjects,
    showAnalytics,
    setShowAnalytics,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

