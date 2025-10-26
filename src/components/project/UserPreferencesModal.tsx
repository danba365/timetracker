import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserPreferences } from '../../types/project';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './UserPreferencesModal.module.css';

interface UserPreferencesModalProps {
  preferences: UserPreferences | null;
  onClose: () => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ preferences, onClose }) => {
  const { t } = useTranslation();
  const { updatePreferences } = useUserPreferences();
  
  const [loading, setLoading] = useState(false);
  
  // Default values if no preferences exist
  const defaultPreferences = {
    available_days: [1, 2, 3, 4, 5], // Monday to Friday
    available_time_start: '09:00',
    available_time_end: '18:00',
    max_tasks_per_day: 3,
    preferred_task_duration: 60,
    break_between_tasks: 15,
    prefer_morning: false,
    prefer_evening: false,
    weekend_schedule: false,
    ai_scheduling_enabled: true,
    auto_reschedule: true,
  };
  
  const [formData, setFormData] = useState({
    available_days: preferences?.available_days || defaultPreferences.available_days,
    available_time_start: preferences?.available_time_start || defaultPreferences.available_time_start,
    available_time_end: preferences?.available_time_end || defaultPreferences.available_time_end,
    max_tasks_per_day: preferences?.max_tasks_per_day || defaultPreferences.max_tasks_per_day,
    preferred_task_duration: preferences?.preferred_task_duration || defaultPreferences.preferred_task_duration,
    break_between_tasks: preferences?.break_between_tasks || defaultPreferences.break_between_tasks,
    prefer_morning: preferences?.prefer_morning || defaultPreferences.prefer_morning,
    prefer_evening: preferences?.prefer_evening || defaultPreferences.prefer_evening,
    weekend_schedule: preferences?.weekend_schedule || defaultPreferences.weekend_schedule,
    ai_scheduling_enabled: preferences?.ai_scheduling_enabled ?? defaultPreferences.ai_scheduling_enabled,
    auto_reschedule: preferences?.auto_reschedule ?? defaultPreferences.auto_reschedule,
  });

  const dayOptions = [
    { value: 1, label: t('days.sunday', 'Sunday') },
    { value: 2, label: t('days.monday', 'Monday') },
    { value: 3, label: t('days.tuesday', 'Tuesday') },
    { value: 4, label: t('days.wednesday', 'Wednesday') },
    { value: 5, label: t('days.thursday', 'Thursday') },
    { value: 6, label: t('days.friday', 'Friday') },
    { value: 7, label: t('days.saturday', 'Saturday') },
  ];

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day].sort((a, b) => a - b),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (preferences?.id) {
        // Update existing preferences
        await updatePreferences({
          id: preferences.id,
          ...formData,
        });
      } else {
        // Create new preferences
        await updatePreferences({
          id: 'new', // Will be handled by the service
          ...formData,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(`Failed to save preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.preferencesForm} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('project.availability', 'Availability')}</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('project.availableDays', 'Available Days')}</label>
          <div className={styles.daysGrid}>
            {dayOptions.map((day) => (
              <button
                key={day.value}
                type="button"
                className={`${styles.dayButton} ${
                  formData.available_days.includes(day.value) ? styles.active : ''
                }`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formRow}>
          <Input
            label={t('project.startTime', 'Start Time')}
            type="time"
            value={formData.available_time_start}
            onChange={(e) => setFormData({ ...formData, available_time_start: e.target.value })}
          />
          <Input
            label={t('project.endTime', 'End Time')}
            type="time"
            value={formData.available_time_end}
            onChange={(e) => setFormData({ ...formData, available_time_end: e.target.value })}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label={t('project.maxTasksPerDay', 'Max Tasks per Day')}
            type="number"
            min={1}
            max={10}
            value={formData.max_tasks_per_day}
            onChange={(e) => setFormData({ ...formData, max_tasks_per_day: parseInt(e.target.value) })}
          />
          <Input
            label={t('project.preferredDuration', 'Preferred Task Duration (min)')}
            type="number"
            min={15}
            max={240}
            step={15}
            value={formData.preferred_task_duration}
            onChange={(e) => setFormData({ ...formData, preferred_task_duration: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('project.schedulingPreferences', 'Scheduling Preferences')}</h3>
        
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.prefer_morning}
              onChange={(e) => setFormData({ ...formData, prefer_morning: e.target.checked })}
              className={styles.checkbox}
            />
            <span>{t('project.preferMorning', 'Prefer morning slots (before 12:00)')}</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.prefer_evening}
              onChange={(e) => setFormData({ ...formData, prefer_evening: e.target.checked })}
              className={styles.checkbox}
            />
            <span>{t('project.preferEvening', 'Prefer evening slots (after 17:00)')}</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.weekend_schedule}
              onChange={(e) => setFormData({ ...formData, weekend_schedule: e.target.checked })}
              className={styles.checkbox}
            />
            <span>{t('project.weekendSchedule', 'Schedule tasks on weekends')}</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('project.aiSettings', 'AI Settings')}</h3>
        
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.ai_scheduling_enabled}
              onChange={(e) => setFormData({ ...formData, ai_scheduling_enabled: e.target.checked })}
              className={styles.checkbox}
            />
            <span>{t('project.enableAIScheduling', 'Enable AI scheduling')}</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.auto_reschedule}
              onChange={(e) => setFormData({ ...formData, auto_reschedule: e.target.checked })}
              className={styles.checkbox}
            />
            <span>{t('project.autoReschedule', 'Automatically reschedule missed tasks')}</span>
          </label>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
        </Button>
      </div>
    </form>
  );
};

