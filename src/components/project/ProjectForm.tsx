import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { Project, ProjectTemplate, UserPreferences } from '../../types/project';
import { useProjects } from '../../hooks/useProjects';
import { useProjectTasks } from '../../hooks/useProjects';
import { aiSchedulingService } from '../../services/aiSchedulingService';
import { useTasks } from '../../hooks/useTasks';
import { Input, Select, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  project?: Project;
  templates: ProjectTemplate[];
  preferences: UserPreferences | null;
  aiGeneratedData?: any;
  onClose: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, templates, preferences, aiGeneratedData, onClose }) => {
  const { t } = useTranslation();
  const { createProject, updateProject } = useProjects();
  const { createTasks } = useProjectTasks(project?.id || null);
  const { tasks: existingTasks } = useTasks({ start: new Date(), end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: aiGeneratedData?.title || project?.title || '',
    description: aiGeneratedData?.description || project?.description || '',
    project_type: aiGeneratedData?.project_type || project?.project_type || ('custom' as const),
    template_id: project?.template_id || '',
    start_date: project?.start_date || format(new Date(), 'yyyy-MM-dd'),
    target_end_date: project?.target_end_date || '',
    tasks_per_week: aiGeneratedData?.tasks_per_week || project?.tasks_per_week || 3,
    estimated_duration_per_task: aiGeneratedData?.estimated_duration_per_task || project?.estimated_duration_per_task || 60,
    color: project?.color || '#4F46E5',
    icon: aiGeneratedData?.icon || project?.icon || '📋',
    use_ai_scheduling: !project, // Default to true for new projects
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  useEffect(() => {
    if (formData.template_id) {
      const template = templates.find((t) => t.id === formData.template_id);
      setSelectedTemplate(template || null);
      
      if (template) {
        setFormData((prev) => ({
          ...prev,
          project_type: template.project_type,
          tasks_per_week: template.default_tasks_per_week,
          estimated_duration_per_task: template.default_duration_per_task,
          icon: template.icon || prev.icon,
        }));
      }
    }
  }, [formData.template_id, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferences && formData.use_ai_scheduling) {
      alert(t('project.preferencesRequired', 'Please configure your preferences first'));
      return;
    }

    setLoading(true);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description || null,
        project_type: formData.project_type,
        template_id: formData.template_id || null,
        start_date: formData.start_date,
        target_end_date: formData.target_end_date || null,
        tasks_per_week: formData.tasks_per_week,
        estimated_duration_per_task: formData.estimated_duration_per_task,
        color: formData.color,
        icon: formData.icon || null,
        category_id: null,
      };

      if (project) {
        // Update existing project
        await updateProject({ id: project.id, ...projectData });
      } else {
        // Create new project
        const newProject = await createProject(projectData);
        
        // Generate tasks from AI, template, or default structure
        const taskTemplates = aiGeneratedData?.tasks || selectedTemplate?.task_structure || [
          { title: 'Task 1', duration: formData.estimated_duration_per_task, order: 1 },
          { title: 'Task 2', duration: formData.estimated_duration_per_task, order: 2 },
          { title: 'Task 3', duration: formData.estimated_duration_per_task, order: 3 },
        ];

        if (formData.use_ai_scheduling && preferences) {
          // Use AI scheduling
          const existingTasksForScheduling = existingTasks.map((t) => ({
            date: t.date,
            start_time: t.start_time || '00:00',
            duration: 60,
          }));

          const scheduleResponse = await aiSchedulingService.scheduleProject({
            project_id: newProject.id,
            tasks: taskTemplates,
            start_date: formData.start_date,
            target_end_date: formData.target_end_date,
            preferences,
            existing_tasks: existingTasksForScheduling,
          });

          // Create scheduled tasks
          const tasksToCreate = scheduleResponse.scheduled_tasks.map((st) => ({
            project_id: newProject.id,
            title: st.title,
            description: st.description || null,
            task_order: st.task_order,
            scheduled_date: st.scheduled_date,
            scheduled_start_time: st.scheduled_start_time,
            scheduled_duration: st.scheduled_duration,
            depends_on_task_id: null,
          }));

          await createTasks(tasksToCreate);

          // Update project to mark as AI scheduled
          await updateProject({
            id: newProject.id,
            ai_scheduled: true,
            total_tasks: tasksToCreate.length,
            last_scheduled_at: new Date().toISOString(),
          });
        } else {
          // Create unscheduled tasks
          const tasksToCreate = taskTemplates.map((tt: any, index: number) => ({
            project_id: newProject.id,
            title: tt.title,
            description: tt.description || null,
            task_order: tt.order || index + 1,
            scheduled_date: null,
            scheduled_start_time: null,
            scheduled_duration: tt.duration,
            depends_on_task_id: null,
          }));

          await createTasks(tasksToCreate);

          await updateProject({
            id: newProject.id,
            total_tasks: tasksToCreate.length,
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.projectForm} onSubmit={handleSubmit}>
      {aiGeneratedData && (
        <div className={styles.aiNotice}>
          <span>✨</span>
          <div>
            <strong>{t('project.ai.generatedNotice', 'AI Generated Project')}</strong>
            {aiGeneratedData.ai_reasoning && (
              <p>{aiGeneratedData.ai_reasoning}</p>
            )}
          </div>
        </div>
      )}

      <div className={styles.formRow}>
        <Input
          label={t('project.title', 'Project Title')}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder={t('project.titlePlaceholder', 'e.g., Complete React Course')}
        />
      </div>

      <div className={styles.formRow}>
        <Textarea
          label={t('project.description', 'Description')}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('project.descriptionPlaceholder', 'Describe your project goals...')}
          rows={3}
        />
      </div>

      <div className={styles.formRow}>
        <Select
          label={t('project.template', 'Template')}
          value={formData.template_id}
          onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
          options={[
            { value: '', label: t('project.customProject', 'Custom Project') },
            ...templates.map((t) => ({ value: t.id, label: `${t.icon || ''} ${t.name}`.trim() })),
          ]}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <Input
            label={t('project.startDate', 'Start Date')}
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div className={styles.formCol}>
          <Input
            label={t('project.targetEndDate', 'Target End Date (optional)')}
            type="date"
            value={formData.target_end_date}
            onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <Input
            label={t('project.tasksPerWeek', 'Tasks per Week')}
            type="number"
            min={1}
            max={14}
            value={formData.tasks_per_week}
            onChange={(e) => setFormData({ ...formData, tasks_per_week: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className={styles.formCol}>
          <Input
            label={t('project.taskDuration', 'Task Duration (minutes)')}
            type="number"
            min={15}
            max={240}
            step={15}
            value={formData.estimated_duration_per_task}
            onChange={(e) => setFormData({ ...formData, estimated_duration_per_task: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <Input
            label={t('project.icon', 'Icon (Emoji)')}
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="📋"
          />
        </div>
        <div className={styles.formCol}>
          <label className={styles.colorLabel}>{t('project.color', 'Color')}</label>
          <input
            type="color"
            className={styles.colorInput}
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
      </div>

      {!project && (
        <div className={styles.formRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.use_ai_scheduling}
              onChange={(e) => setFormData({ ...formData, use_ai_scheduling: e.target.checked })}
              className={styles.checkbox}
            />
            <div>
              <span className={styles.checkboxText}>
                🤖 {t('project.useAIScheduling', 'Use AI Scheduling')}
              </span>
              <p className={styles.checkboxHint}>
                {t('project.aiSchedulingHint', 'Automatically schedule all tasks based on your preferences')}
              </p>
            </div>
          </label>
        </div>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? t('common.saving', 'Saving...')
            : project
            ? t('common.save', 'Save')
            : t('project.createProject', 'Create Project')}
        </Button>
      </div>
    </form>
  );
};

