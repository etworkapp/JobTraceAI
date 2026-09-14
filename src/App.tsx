/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Bot,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  ApplicationStage,
  JobApplication,
  UserProfile,
  ViewMode,
  WorkplaceType,
} from './types';
import {
  loadApplications,
  saveApplications,
  loadUserProfile,
  saveUserProfile,
  resetToDefaultData,
  exportDataAsJSON,
  importDataFromJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { AnalyticsView } from './components/AnalyticsView';
import { ApplicationModal } from './components/ApplicationModal';
import { AddApplicationModal } from './components/AddApplicationModal';
import { ProfileModal } from './components/ProfileModal';
import { CopilotDrawer } from './components/CopilotDrawer';
import { TimelineView } from './components/TimelineView';
import { OfferComparisonView } from './components/OfferComparisonView';

export default function App() {
  // Core application data
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile());
  const [isLoaded, setIsLoaded] = useState(false);

  // View and filtering states
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<ApplicationStage | 'all'>('all');
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceType | 'all'>('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('job_tracker_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  // Modals & Panels
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalStage, setAddModalStage] = useState<ApplicationStage>('wishlist');
  const [addModalSmartMode, setAddModalSmartMode] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadedApps = loadApplications();
    const loadedProf = loadUserProfile();
    setApplications(loadedApps);
    setUserProfile(loadedProf);
    setIsLoaded(true);
  }, []);

  // Sync Dark Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('job_tracker_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('job_tracker_theme', 'light');
    }
  }, [isDark]);

  // Sync changes to storage
  const handleUpdateApplications = (updatedList: JobApplication[]) => {
    setApplications(updatedList);
    saveApplications(updatedList);
  };

  const handleUpdateApplication = (updatedApp: JobApplication) => {
    const updatedList = applications.map((a) => (a.id === updatedApp.id ? updatedApp : a));
    setApplications(updatedList);
    saveApplications(updatedList);
    if (selectedApp && selectedApp.id === updatedApp.id) {
      setSelectedApp(updatedApp);
    }
  };

  const handleAddApplication = (newApp: JobApplication) => {
    const updatedList = [newApp, ...applications];
    handleUpdateApplications(updatedList);
    // Optionally open the details modal immediately
    setSelectedApp(newApp);
  };

  const handleDeleteApplication = (id: string) => {
    const updatedList = applications.filter((a) => a.id !== id);
    handleUpdateApplications(updatedList);
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp(null);
    }
  };

  const handleUpdateStage = (id: string, newStage: ApplicationStage) => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      const updated: JobApplication = {
        ...app,
        stage: newStage,
        updatedAt: new Date().toISOString(),
      };
      handleUpdateApplication(updated);
    }
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const handleResetData = () => {
    if (confirm('Reset application pipeline to the curated sample demo applications?')) {
      const resetApps = resetToDefaultData();
      setApplications(resetApps);
      setSelectedApp(null);
    }
  };

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Stage filter
      if (selectedStage !== 'all' && app.stage !== selectedStage) return false;

      // 2. Workplace filter
      if (selectedWorkplace !== 'all' && app.workplaceType !== selectedWorkplace) return false;

      // 3. Match score filter
      if (minMatchScore > 0 && (app.matchScore || 0) < minMatchScore) return false;

      // 4. Search query (search in company, title, location, notes, keywords)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCompany = app.company.toLowerCase().includes(q);
        const matchesTitle = app.jobTitle.toLowerCase().includes(q);
        const matchesLocation = (app.location || '').toLowerCase().includes(q);
        const matchesNotes = (app.notes || '').toLowerCase().includes(q);
        const matchesSkills = (app.matchingSkills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesCompany && !matchesTitle && !matchesLocation && !matchesNotes && !matchesSkills) {
          return false;
        }
      }

      return true;
    });
  }, [applications, selectedStage, selectedWorkplace, minMatchScore, searchQuery]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        setIsCopilotOpen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setAddModalStage('wishlist');
        setAddModalSmartMode(false);
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
          <span>Loading Career Pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stageFilter={selectedStage}
        onStageFilterChange={setSelectedStage}
        workplaceFilter={selectedWorkplace}
        onWorkplaceFilterChange={setSelectedWorkplace}
        onOpenAddModal={(smartMode) => {
          setAddModalStage('wishlist');
          setAddModalSmartMode(!!smartMode);
          setIsAddModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
        onExport={exportDataAsJSON}
        onImport={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = importDataFromJSON(e.target?.result as string);
            if (result.success) {
              setApplications(loadApplications());
              setUserProfile(loadUserProfile());
              alert(result.message);
            } else {
              alert(result.message);
            }
          };
          reader.readAsText(file);
        }}
        onResetDefaults={handleResetData}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-16">
        {/* KPI Stats Bar & Action Agenda */}
        <StatsBar
          applications={applications}
          onSelectApplication={(app) => setSelectedApp(app)}
          onFilterStage={(stage) => setSelectedStage(stage)}
        />

        {/* View Switcher: Kanban Board, List View, or Analytics */}
        {currentView === 'kanban' && (
          <KanbanBoard
            applications={filteredApplications}
            onSelectApplication={(app) => setSelectedApp(app)}
            onUpdateStage={handleUpdateStage}
            onDeleteApplication={(id, e) => {
              e.stopPropagation();
              if (confirm('Delete this job application?')) {
                handleDeleteApplication(id);
              }
            }}
            onAddApplicationInStage={(stage) => {
              setAddModalStage(stage);
              setAddModalSmartMode(false);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {currentView === 'list' && (
          <ListView
            applications={filteredApplications}
            onSelectApplication={(app) => setSelectedApp(app)}
            onUpdateStage={handleUpdateStage}
            onDeleteApplication={(id, e) => {
              e.stopPropagation();
              if (confirm('Delete this job application?')) {
                handleDeleteApplication(id);
              }
            }}
          />
        )}

        {currentView === 'timeline' && (
          <TimelineView
            applications={applications}
            userProfile={userProfile}
            onSelectApplication={(app) => setSelectedApp(app)}
            onUpdateApplication={handleUpdateApplication}
          />
        )}

        {currentView === 'offers' && (
          <OfferComparisonView
            applications={applications}
            userProfile={userProfile}
            onSelectApplication={(app) => setSelectedApp(app)}
            onUpdateApplication={handleUpdateApplication}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            applications={applications}
            onSelectApplication={(app) => setSelectedApp(app)}
          />
        )}
      </main>

      {/* Floating Career Copilot Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="floating-copilot-button"
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl shadow-xl shadow-indigo-600/30 font-semibold text-xs transition-all hover:scale-102 active:scale-98"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">AI Career Copilot</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono hidden md:inline">
            Press 'C'
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
          </span>
        </button>
      </div>

      {/* Footer Utility Bar */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              CareerTrack AI
            </span>
            <span>•</span>
            <span>Grounding Profile: {userProfile.name}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetData}
              className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample Data</span>
            </button>
            <span>•</span>
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Panels */}
      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          userProfile={userProfile}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdateApplication}
          onDelete={handleDeleteApplication}
        />
      )}

      {isAddModalOpen && (
        <AddApplicationModal
          isOpen={isAddModalOpen}
          initialStage={addModalStage}
          initialSmartMode={addModalSmartMode}
          userProfile={userProfile}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddApplication}
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          profile={userProfile}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {isCopilotOpen && (
        <CopilotDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          applications={applications}
          userProfile={userProfile}
          onSelectApplication={(app) => {
            setSelectedApp(app);
            setIsCopilotOpen(false);
          }}
        />
      )}
    </div>
  );
}
