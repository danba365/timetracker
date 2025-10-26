import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../hooks/useCategories';
import { useFormats } from '../../hooks/useFormats';
import { useEvents } from '../../hooks/useEvents';
import { Input, Select, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { defaultColors } from '../../utils/colorHelpers';
import styles from './SettingsView.module.css';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { formats, createFormat, updateFormat, deleteFormat } = useFormats();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddFormatForm, setShowAddFormatForm] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingFormatId, setEditingFormatId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: '',
  });
  const [formatFormData, setFormatFormData] = useState({
    name: '',
    icon: '',
  });
  const [eventFormData, setEventFormData] = useState<{
    name: string;
    event_type: 'birthday' | 'anniversary' | 'custom';
    icon: string;
    date: string;
    year: string;
    notes: string;
  }>({
    name: '',
    event_type: 'birthday',
    icon: '',
    date: '',
    year: '',
    notes: '',
  });

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await updateCategory({ id: editingCategoryId, ...categoryFormData });
        setEditingCategoryId(null);
      } else {
        await createCategory(categoryFormData);
      }
      setCategoryFormData({ name: '', color: '#3B82F6', icon: '' });
      setShowAddCategoryForm(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Failed to save category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCategoryEdit = (category: any) => {
    setCategoryFormData({
      name: category.name,
      color: category.color,
      icon: category.icon || '',
    });
    setEditingCategoryId(category.id);
    setShowAddCategoryForm(true);
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm(t('messages.deleteCategoryConfirm'))) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCategoryCancel = () => {
    setCategoryFormData({ name: '', color: '#3B82F6', icon: '' });
    setEditingCategoryId(null);
    setShowAddCategoryForm(false);
  };

  const handleFormatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFormatId) {
        await updateFormat({ id: editingFormatId, ...formatFormData });
        setEditingFormatId(null);
      } else {
        await createFormat(formatFormData);
      }
      setFormatFormData({ name: '', icon: '' });
      setShowAddFormatForm(false);
    } catch (error) {
      console.error('Error saving format:', error);
      alert(`Failed to save format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFormatEdit = (format: any) => {
    setFormatFormData({
      name: format.name,
      icon: format.icon || '',
    });
    setEditingFormatId(format.id);
    setShowAddFormatForm(true);
  };

  const handleFormatDelete = async (id: string) => {
    if (window.confirm(t('messages.deleteFormatConfirm'))) {
      try {
        await deleteFormat(id);
      } catch (error) {
        console.error('Error deleting format:', error);
        alert(`Failed to delete format: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleFormatCancel = () => {
    setFormatFormData({ name: '', icon: '' });
    setEditingFormatId(null);
    setShowAddFormatForm(false);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        name: eventFormData.name,
        event_type: eventFormData.event_type,
        icon: eventFormData.icon || null,
        date: eventFormData.date,
        year: eventFormData.year ? parseInt(eventFormData.year) : null,
        notes: eventFormData.notes || null,
      };

      if (editingEventId) {
        await updateEvent({ id: editingEventId, ...eventData });
        setEditingEventId(null);
      } else {
        await createEvent(eventData);
      }
      setEventFormData({ name: '', event_type: 'birthday', icon: '', date: '', year: '', notes: '' });
      setShowAddEventForm(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Failed to save event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEventEdit = (event: any) => {
    setEventFormData({
      name: event.name,
      event_type: event.event_type,
      icon: event.icon || '',
      date: event.date,
      year: event.year ? String(event.year) : '',
      notes: event.notes || '',
    });
    setEditingEventId(event.id);
    setShowAddEventForm(true);
  };

  const handleEventDelete = async (id: string) => {
    if (window.confirm(t('messages.deleteEventConfirm'))) {
      try {
        await deleteEvent(id);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleEventCancel = () => {
    setEventFormData({ name: '', event_type: 'birthday', icon: '', date: '', year: '', notes: '' });
    setEditingEventId(null);
    setShowAddEventForm(false);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💍';
      default:
        return '📅';
    }
  };

  return (
    <div className={styles.settingsView}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.settings')}</h1>
        <p className={styles.subtitle}>Manage your categories and preferences</p>
      </div>

      {/* Categories Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('category.categories', 'Categories')}</h2>
          {!showAddCategoryForm && (
            <Button onClick={() => setShowAddCategoryForm(true)}>
              + {t('category.addCategory')}
            </Button>
          )}
        </div>

        {showAddCategoryForm && (
          <form className={styles.addCategoryForm} onSubmit={handleCategorySubmit}>
            <div className={styles.formRow}>
              <Input
                label={t('category.name')}
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
                placeholder="e.g. Tennis, Meetings"
              />
              <Input
                label={t('category.icon')}
                value={categoryFormData.icon}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                placeholder="e.g. 🎾 ⚽ 💼"
              />
            </div>

            <div className={styles.colorPicker}>
              <label className={styles.colorPickerLabel}>{t('category.color')}</label>
              <input
                type="color"
                className={styles.colorInput}
                value={categoryFormData.color}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
              />
              <div className={styles.colorPresets}>
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={styles.colorPreset}
                    style={{ backgroundColor: color }}
                    onClick={() => setCategoryFormData({ ...categoryFormData, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={handleCategoryCancel}>
                {t('task.cancel')}
              </Button>
              <Button type="submit">
                {editingCategoryId ? t('common.save') : t('category.addCategory')}
              </Button>
            </div>
          </form>
        )}

        <div className={styles.categoriesList}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <div
                className={styles.colorIndicator}
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryColor}>{category.color}</p>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" size="small" onClick={() => handleCategoryEdit(category)}>
                  {t('category.editCategory', 'Edit')}
                </Button>
                <Button variant="text" size="small" onClick={() => handleCategoryDelete(category.id)}>
                  {t('task.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formats Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('format.formats', 'Formats')}</h2>
          {!showAddFormatForm && (
            <Button onClick={() => setShowAddFormatForm(true)}>
              + {t('format.addFormat')}
            </Button>
          )}
        </div>

        {showAddFormatForm && (
          <form className={styles.addCategoryForm} onSubmit={handleFormatSubmit}>
            <div className={styles.formRow}>
              <Input
                label={t('format.name')}
                value={formatFormData.name}
                onChange={(e) => setFormatFormData({ ...formatFormData, name: e.target.value })}
                required
                placeholder="e.g. Online Course, Podcast, Book"
              />
              <Input
                label={t('format.icon')}
                value={formatFormData.icon}
                onChange={(e) => setFormatFormData({ ...formatFormData, icon: e.target.value })}
                placeholder="e.g. 🎓 🎙️ 📚"
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={handleFormatCancel}>
                {t('task.cancel')}
              </Button>
              <Button type="submit">
                {editingFormatId ? t('common.save') : t('format.addFormat')}
              </Button>
            </div>
          </form>
        )}

        <div className={styles.categoriesList}>
          {formats.map((format) => (
            <div key={format.id} className={styles.categoryItem}>
              <div className={styles.colorIndicator} style={{ backgroundColor: '#E8E8E8' }}>
                {format.icon}
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{format.name}</h3>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" size="small" onClick={() => handleFormatEdit(format)}>
                  {t('format.editFormat', 'Edit')}
                </Button>
                <Button variant="text" size="small" onClick={() => handleFormatDelete(format.id)}>
                  {t('task.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('event.events', 'Events')}</h2>
          {!showAddEventForm && (
            <Button onClick={() => setShowAddEventForm(true)}>
              + {t('event.addEvent')}
            </Button>
          )}
        </div>

        {showAddEventForm && (
          <form className={styles.addCategoryForm} onSubmit={handleEventSubmit}>
            <div className={styles.formRow}>
              <Input
                label={t('event.name')}
                value={eventFormData.name}
                onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                required
                placeholder="e.g. Mom's Birthday"
              />
              <Select
                label={t('event.type')}
                value={eventFormData.event_type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEventFormData({ ...eventFormData, event_type: e.target.value as 'birthday' | 'anniversary' | 'custom' })}
                options={[
                  { value: 'birthday', label: t('event.birthday', 'Birthday') },
                  { value: 'anniversary', label: t('event.anniversary', 'Anniversary') },
                  { value: 'custom', label: t('event.custom', 'Custom') },
                ]}
              />
            </div>

            <div className={styles.formRow}>
              <Input
                label={t('event.date')}
                value={eventFormData.date}
                onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                required
                placeholder="DD-MM (e.g., 15-03)"
                pattern="[0-9]{2}-[0-9]{2}"
              />
              <Input
                label={t('event.year')}
                value={eventFormData.year}
                onChange={(e) => setEventFormData({ ...eventFormData, year: e.target.value })}
                placeholder="e.g., 1990 (optional)"
                type="number"
              />
              <Input
                label={t('event.icon')}
                value={eventFormData.icon}
                onChange={(e) => setEventFormData({ ...eventFormData, icon: e.target.value })}
                placeholder="e.g. 🎂 💍 🎉"
              />
            </div>

            <div className={styles.fullWidth}>
              <Textarea
                label={t('event.notes')}
                value={eventFormData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventFormData({ ...eventFormData, notes: e.target.value })}
                placeholder="Add any notes or reminders..."
                rows={3}
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={handleEventCancel}>
                {t('task.cancel')}
              </Button>
              <Button type="submit">
                {editingEventId ? t('common.save') : t('event.addEvent')}
              </Button>
            </div>
          </form>
        )}

        <div className={styles.categoriesList}>
          {events.map((event) => (
            <div key={event.id} className={styles.categoryItem}>
              <div className={styles.colorIndicator} style={{ backgroundColor: '#F3F4F6' }}>
                {event.icon || getEventTypeIcon(event.event_type)}
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>
                  {event.name}
                  {event.year && <span className={styles.eventYear}> ({event.year})</span>}
                </h3>
                <p className={styles.categoryColor}>
                  {t(`event.${event.event_type}`, event.event_type)} • {event.date}
                  {event.notes && ` • ${event.notes}`}
                </p>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" size="small" onClick={() => handleEventEdit(event)}>
                  {t('event.editEvent', 'Edit')}
                </Button>
                <Button variant="text" size="small" onClick={() => handleEventDelete(event.id)}>
                  {t('task.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

