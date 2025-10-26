import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../../hooks/useProjects';
import { useTemplates } from '../../hooks/useTemplates';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ProjectForm } from '../project/ProjectForm';
import { ProjectCard } from '../project/ProjectCard';
import { UserPreferencesModal } from '../project/UserPreferencesModal';
import { AIProjectGenerator } from '../project/AIProjectGenerator';
import styles from './ProjectsView.module.css';
import type { Project } from '../../types/project';

export const ProjectsView: React.FC = () => {
  const { t } = useTranslation();
  const { projects, deleteProject } = useProjects();
  const { templates } = useTemplates();
  const { preferences, loading: preferencesLoading } = useUserPreferences();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [aiGeneratedData, setAIGeneratedData] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('messages.deleteProjectConfirm', 'Are you sure you want to delete this project?'))) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedProject(undefined);
    setAIGeneratedData(null);
  };

  const handleAIGenerated = (projectData: any) => {
    setAIGeneratedData(projectData);
    setIsAIGeneratorOpen(false);
    setIsCreateModalOpen(true);
  };

  return (
    <div className={styles.projectsView}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('project.projects', 'Projects')}</h1>
          <p className={styles.subtitle}>
            {t('project.subtitle', 'AI-powered project planning and task scheduling')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setIsPreferencesModalOpen(true)}>
            ⚙️ {t('project.preferences', 'Preferences')}
          </Button>
          <Button variant="secondary" onClick={() => setIsAIGeneratorOpen(true)}>
            ✨ {t('project.ai.generate', 'AI Generate')}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + {t('project.createProject', 'Create Project')}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          {t('project.active', 'Active')} ({projects.filter((p) => p.status === 'active').length})
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          {t('project.completed', 'Completed')} ({projects.filter((p) => p.status === 'completed').length})
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('common.all', 'All')} ({projects.length})
        </button>
      </div>

      {/* Projects grid */}
      <div className={styles.projectsGrid}>
        {filteredProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>{t('project.noProjects', 'No projects yet')}</h3>
            <p>{t('project.createFirstProject', 'Create your first AI-scheduled project!')}</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + {t('project.createProject', 'Create Project')}
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
              onDelete={() => handleDelete(project.id)}
            />
          ))
        )}
      </div>

      {/* AI Project Generator Modal */}
      {isAIGeneratorOpen && (
        <Modal
          isOpen={isAIGeneratorOpen}
          onClose={() => setIsAIGeneratorOpen(false)}
          title={t('project.ai.title', 'AI Project Generator')}
        >
          <AIProjectGenerator
            preferences={preferences}
            onProjectGenerated={handleAIGenerated}
            onCancel={() => setIsAIGeneratorOpen(false)}
          />
        </Modal>
      )}

      {/* Create/Edit Project Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          title={selectedProject ? t('project.editProject') : t('project.createProject')}
        >
          <ProjectForm
            project={selectedProject}
            templates={templates}
            preferences={preferences}
            aiGeneratedData={aiGeneratedData}
            onClose={handleCloseModal}
          />
        </Modal>
      )}

      {/* User Preferences Modal */}
      {isPreferencesModalOpen && (
        <Modal
          isOpen={isPreferencesModalOpen}
          onClose={() => setIsPreferencesModalOpen(false)}
          title={t('project.preferences', 'Scheduling Preferences')}
        >
          {preferencesLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {t('common.loading', 'Loading...')}
            </div>
          ) : (
            <UserPreferencesModal
              preferences={preferences}
              onClose={() => setIsPreferencesModalOpen(false)}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

