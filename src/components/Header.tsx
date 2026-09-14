import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  Search,
  Plus,
  SlidersHorizontal,
  Download,
  Upload,
  User,
  Kanban,
  List,
  BarChart3,
  Bot,
  RotateCcw,
  Sun,
  Moon,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { ApplicationStage, WorkplaceType } from '../types';

interface HeaderProps {
  currentView: 'kanban' | 'list' | 'timeline' | 'offers' | 'analytics';
  onViewChange: (view: 'kanban' | 'list' | 'timeline' | 'offers' | 'analytics') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  stageFilter: ApplicationStage | 'all';
  onStageFilterChange: (s: ApplicationStage | 'all') => void;
  workplaceFilter: WorkplaceType | 'all';
  onWorkplaceFilterChange: (w: WorkplaceType | 'all') => void;
  onOpenAddModal: (smartMode?: boolean) => void;
  onOpenProfileModal: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetDefaults: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  workplaceFilter,
  onWorkplaceFilterChange,
  onOpenAddModal,
  onOpenProfileModal,
  onToggleCopilot,
  isCopilotOpen,
  onExport,
  onImport,
  onResetDefaults,
  isDark,
  onToggleDark,
}) => {
  const [showDataMenu, setShowDataMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setShowDataMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand + Search + Primary Actions */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  JobTrace<span className="text-blue-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Application Pipeline & Career Assistant
              </p>
            </div>
          </div>

          {/* Global Search Input */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-applications-input"
                type="text"
                placeholder="Search company, role, skill, or notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* AI Career Copilot Toggle */}
            <button
              id="toggle-copilot-button"
              onClick={onToggleCopilot}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                isCopilotOpen
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-700'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
              }`}
              title="Open AI Career Copilot"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">AI Copilot</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </button>

            {/* User Profile */}
            <button
              id="profile-modal-button"
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Edit Profile & Resume Info"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">My Resume</span>
            </button>

            {/* Add Application Button */}
            <div className="relative inline-flex rounded-lg shadow-xs">
              <button
                id="add-application-button"
                onClick={() => onOpenAddModal(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-l-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Job</span>
              </button>
              <button
                id="smart-parse-button"
                onClick={() => onOpenAddModal(true)}
                title="AI Smart Parse Job Posting"
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-r-lg text-white bg-indigo-600 hover:bg-indigo-700 border-l border-indigo-500 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">AI Parse</span>
              </button>
            </div>

            {/* Theme Toggle */}
            {onToggleDark && (
              <button
                id="theme-toggle-button"
                onClick={onToggleDark}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Backup / Data Menu */}
            <div className="relative">
              <button
                id="data-menu-button"
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title="Backup & Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {showDataMenu && (
                <div
                  id="data-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200"
                >
                  <button
                    id="export-data-button"
                    onClick={() => {
                      onExport();
                      setShowDataMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export Data (JSON Backup)</span>
                  </button>
                  <label className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Import JSON Backup</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button
                    id="reset-defaults-button"
                    onClick={() => {
                      if (confirm('Reset to initial sample applications and profile?')) {
                        onResetDefaults();
                        setShowDataMenu(false);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Sample Applications</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar: View Switcher + Filter chips */}
        <div className="flex flex-wrap items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/80 gap-2">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              id="view-kanban-button"
              onClick={() => onViewChange('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline Board</span>
            </button>
            <button
              id="view-list-button"
              onClick={() => onViewChange('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
            <button
              id="view-timeline-button"
              onClick={() => onViewChange('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline & Rounds</span>
            </button>
            <button
              id="view-offers-button"
              onClick={() => onViewChange('offers')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'offers'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offer Benchmark</span>
            </button>
            <button
              id="view-analytics-button"
              onClick={() => onViewChange('analytics')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Funnel & Insights</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {/* Stage filter */}
            <select
              id="filter-stage-select"
              value={stageFilter}
              onChange={(e) => onStageFilterChange(e.target.value as any)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Archived</option>
            </select>

            {/* Workplace filter */}
            <select
              id="filter-workplace-select"
              value={workplaceFilter}
              onChange={(e) => onWorkplaceFilterChange(e.target.value as any)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Workplaces</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
