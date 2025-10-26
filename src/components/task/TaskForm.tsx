import React, { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task, CreateTaskInput, Priority, RecurrenceType } from '../../types/task';
import type { Category } from '../../types/category';
import type { Format } from '../../types/format';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { getTimeSlots } from '../../utils/dateHelpers';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  task?: Task;
  categories: Category[];
  formats: Format[];
  defaultDate?: string;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onDelete?: () => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  categories,
  formats,
  defaultDate,
  onSubmit,
  onDelete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: task?.title || '',
    description: task?.description || '',
    date: task?.date || defaultDate || new Date().toISOString().split('T')[0],
    start_time: task?.start_time ?? '',
    end_time: task?.end_time ?? '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    category_id: task?.category_id ?? '',
    format_id: task?.format_id ?? '',
    tags: task?.tags || [],
    is_recurring: task?.is_recurring || false,
    recurrence_type: task?.recurrence_type,
    recurrence_days: task?.recurrence_days || [],
    recurrence_end_date: task?.recurrence_end_date ?? '',
  });

  const [tagInput, setTagInput] = useState('');

  // Update form data when task prop changes
  useEffect(() => {
    if (task) {
      // Strip seconds from time values (09:30:00 -> 09:30)
      const stripSeconds = (time: string | null | undefined): string => {
        if (!time) return '';
        return time.substring(0, 5); // Get only HH:MM
      };
      
      const newFormData = {
        title: task.title || '',
        description: task.description || '',
        date: task.date || new Date().toISOString().split('T')[0],
        start_time: stripSeconds(task.start_time),
        end_time: stripSeconds(task.end_time),
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        category_id: task.category_id ?? '',
        format_id: task.format_id ?? '',
        tags: task.tags || [],
        is_recurring: task.is_recurring || false,
        recurrence_type: task.recurrence_type,
        recurrence_days: task.recurrence_days || [],
        recurrence_end_date: task.recurrence_end_date ?? '',
      };
      
      setFormData(newFormData);
    } else if (defaultDate) {
      // Reset form for new task with default date
      setFormData({
        title: '',
        description: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        priority: 'medium',
        status: 'todo',
        category_id: '',
        format_id: '',
        tags: [],
        is_recurring: false,
        recurrence_type: undefined,
        recurrence_days: [],
        recurrence_end_date: '',
      });
    }
  }, [task, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up the data before submitting - convert empty strings to null
      const cleanedData = {
        ...formData,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        category_id: formData.category_id || null,
        format_id: formData.format_id || null,
        recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
        recurrence_days: formData.is_recurring ? formData.recurrence_days : null,
        recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : null,
      };
      
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tagInput.trim()],
        });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  const toggleRecurrenceDay = (day: number) => {
    const days = formData.recurrence_days || [];
    const newDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];
    setFormData({ ...formData, recurrence_days: newDays });
  };

  const timeSlots = getTimeSlots();

  const recurrenceOptions = [
    { value: '', label: t('recurrence.none') },
    { value: 'daily', label: t('recurrence.daily') },
    { value: 'weekly', label: t('recurrence.weekly') },
    { value: 'custom', label: t('recurrence.custom') },
  ];

  const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label={t('task.title')}
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder={t('task.title')}
      />

      <Textarea
        label={t('task.description')}
        value={formData.description ?? ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder={t('task.description')}
      />

      <div className={styles.row}>
        <Input
          label={t('task.date')}
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <Select
          label={t('task.startTime')}
          value={formData.start_time ?? ''}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          options={[{ value: '', label: t('common.none') }, ...timeSlots.map(t => ({ value: t, label: t }))]}
        />
      </div>

      <div className={styles.row}>
        <Select
          label={t('task.category')}
          value={formData.category_id ?? ''}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          options={[
            { value: '', label: t('common.none') },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
        />
        <Select
          label={t('task.endTime')}
          value={formData.end_time ?? ''}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          options={[{ value: '', label: t('common.none') }, ...timeSlots.map(t => ({ value: t, label: t }))]}
        />
      </div>

      <div className={styles.fullWidth}>
        <Select
          label={t('task.format')}
          value={formData.format_id ?? ''}
          onChange={(e) => setFormData({ ...formData, format_id: e.target.value })}
          options={[
            { value: '', label: t('common.none') },
            ...formats.map((fmt) => ({ value: fmt.id, label: `${fmt.icon || ''} ${fmt.name}`.trim() })),
          ]}
        />
      </div>

      <div className={styles.fullWidth}>
        <label>{t('task.priority')}</label>
        <div className={styles.priorityOptions}>
          {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
            <button
              key={priority}
              type="button"
              className={`${styles.radioOption} ${styles[priority]} ${
                formData.priority === priority ? styles.selected : ''
              }`}
              onClick={() => setFormData({ ...formData, priority })}
            >
              {t(`priority.${priority}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.fullWidth}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.status === 'done'}
            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'done' : 'todo' })}
            className={styles.checkbox}
          />
          <span>{t('status.done')}</span>
        </label>
      </div>

      <div className={styles.fullWidth}>
        <label>{t('task.tags')}</label>
        <div className={styles.tagsInput}>
          {formData.tags?.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
              <button
                type="button"
                className={styles.tagRemove}
                onClick={() => removeTag(tag)}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            className={styles.tagInput}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={t('task.tags')}
          />
        </div>
      </div>

      <Select
        label={t('task.recurrence')}
        value={formData.is_recurring ? (formData.recurrence_type ?? '') : ''}
        onChange={(e) => {
          const value = e.target.value as RecurrenceType | '';
          setFormData({
            ...formData,
            is_recurring: !!value,
            recurrence_type: value || undefined,
          });
        }}
        options={recurrenceOptions}
      />

      {formData.is_recurring && (formData.recurrence_type === 'weekly' || formData.recurrence_type === 'custom') && (
        <div className={styles.fullWidth}>
          <label>{t('recurrence.selectDays')}</label>
          <div className={styles.daySelector}>
            {weekDays.map((day, index) => (
              <button
                key={day}
                type="button"
                className={`${styles.dayButton} ${
                  formData.recurrence_days?.includes(index) ? styles.selected : ''
                }`}
                onClick={() => toggleRecurrenceDay(index)}
              >
                {t(`days.${day}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {formData.is_recurring && (
        <Input
          label={t('recurrence.endDate')}
          type="date"
          value={formData.recurrence_end_date ?? ''}
          onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
        />
      )}

      <div className={styles.actions}>
        {onDelete && (
          <Button type="button" variant="text" onClick={onDelete}>
            {t('task.delete')}
          </Button>
        )}
        <div className={styles.actionButtons}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('task.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {t('task.save')}
          </Button>
        </div>
      </div>
    </form>
  );
};

