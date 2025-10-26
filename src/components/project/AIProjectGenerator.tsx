import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aiProjectService } from '../../services/aiProjectService';
import type { UserPreferences } from '../../types/project';
import { Textarea } from '../common/Input';
import { Button } from '../common/Button';
import styles from './AIProjectGenerator.module.css';

interface AIProjectGeneratorProps {
  preferences: UserPreferences | null;
  onProjectGenerated: (projectData: any) => void;
  onCancel: () => void;
}

export const AIProjectGenerator: React.FC<AIProjectGeneratorProps> = ({
  preferences,
  onProjectGenerated,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    'Learn React and build a full-stack web application',
    'Train for a 5K run in 8 weeks',
    'Read and summarize "Atomic Habits" book',
    'Complete an online Python programming course',
    'Start a daily meditation practice for 30 days',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(t('project.ai.promptRequired', 'Please describe your project'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiProjectService.generateProject({
        prompt: prompt.trim(),
        preferences: preferences ? {
          available_days: preferences.available_days,
          available_time_start: preferences.available_time_start,
          available_time_end: preferences.available_time_end,
          max_tasks_per_day: preferences.max_tasks_per_day,
          preferred_task_duration: preferences.preferred_task_duration,
        } : undefined,
      });

      onProjectGenerated({
        title: result.title,
        description: result.description,
        project_type: result.project_type,
        icon: result.icon,
        tasks_per_week: result.suggested_tasks_per_week,
        estimated_duration_per_task: result.estimated_duration_per_task,
        tasks: result.tasks,
        ai_reasoning: result.reasoning,
      });
    } catch (err) {
      console.error('Error generating project:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : t('project.ai.generationError', 'Failed to generate project. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  return (
    <div className={styles.aiGenerator}>
      <div className={styles.header}>
        <div className={styles.aiIcon}>🤖</div>
        <div>
          <h3 className={styles.title}>
            {t('project.ai.title', 'AI Project Generator')}
          </h3>
          <p className={styles.subtitle}>
            {t('project.ai.subtitle', 'Describe your project in natural language and let AI create a structured plan')}
          </p>
        </div>
      </div>

      <div className={styles.promptSection}>
        <Textarea
          label={t('project.ai.promptLabel', 'What do you want to accomplish?')}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          placeholder={t('project.ai.promptPlaceholder', 'e.g., "Learn React and build a full-stack application" or "Train for a marathon in 12 weeks"')}
          rows={4}
          disabled={loading}
        />
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      <div className={styles.examples}>
        <p className={styles.examplesLabel}>
          {t('project.ai.examples', 'Try these examples:')}
        </p>
        <div className={styles.examplesList}>
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              className={styles.exampleButton}
              onClick={() => handleExampleClick(example)}
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
          {loading ? (
            <>
              <span className={styles.spinner}>⏳</span>
              {t('project.ai.generating', 'Generating...')}
            </>
          ) : (
            <>
              <span>✨</span>
              {t('project.ai.generate', 'Generate Project')}
            </>
          )}
        </Button>
      </div>

      {!preferences && (
        <div className={styles.warning}>
          <span>💡</span>
          {t('project.ai.preferencesHint', 'Tip: Configure your preferences for more personalized suggestions')}
        </div>
      )}
    </div>
  );
};

