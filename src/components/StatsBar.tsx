import React from 'react';
import {
  Briefcase,
  Users,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { JobApplication } from '../types';

interface StatsBarProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onFilterStage: (stage: any) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  applications,
  onSelectApplication,
  onFilterStage,
}) => {
  const total = applications.length;
  const activePipeline = applications.filter((a) =>
    ['applied', 'screening', 'interview'].includes(a.stage)
  ).length;
  const interviews = applications.filter((a) => a.stage === 'interview').length;
  const offers = applications.filter((a) => a.stage === 'offer').length;

  // Average match score
  const appsWithScore = applications.filter((a) => typeof a.matchScore === 'number');
  const avgMatch = appsWithScore.length
    ? Math.round(appsWithScore.reduce((acc, a) => acc + (a.matchScore || 0), 0) / appsWithScore.length)
    : 0;

  // Find upcoming deadlines / interviews in chronological order
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingEvents = applications
    .filter((a) => a.deadline && a.stage !== 'rejected')
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));

  const urgentEvent = upcomingEvents[0];

  return (
    <div className="space-y-3 mb-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Apps */}
        <div
          id="stat-total-apps"
          onClick={() => onFilterStage('all')}
          className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tracked</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs text-slate-400">jobs</span>
          </div>
        </div>

        {/* Active Pipeline */}
        <div
          id="stat-active-pipeline"
          onClick={() => onFilterStage('applied')}
          className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Active Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{activePipeline}</span>
            <span className="text-xs text-slate-400">in motion</span>
          </div>
        </div>

        {/* In Interview Loops */}
        <div
          id="stat-interviews"
          onClick={() => onFilterStage('interview')}
          className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Interviewing</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{interviews}</span>
            <span className="text-xs text-slate-400">rounds</span>
          </div>
        </div>

        {/* Offers */}
        <div
          id="stat-offers"
          onClick={() => onFilterStage('offer')}
          className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Offers Extended</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{offers}</span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">congrats!</span>
          </div>
        </div>

        {/* Average AI Match */}
        <div
          id="stat-ai-match"
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl p-3.5 border border-indigo-100 dark:border-indigo-900/60 shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Avg Match Score
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <span className="text-xs font-bold">%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-950 dark:text-indigo-200">{avgMatch}%</span>
            <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80">ATS target</span>
          </div>
        </div>
      </div>

      {/* Urgent / Upcoming Agenda Notification Banner */}
      {urgentEvent && (
        <div
          id="urgent-deadline-banner"
          onClick={() => onSelectApplication(urgentEvent)}
          className="flex items-center justify-between px-4 py-2.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 cursor-pointer hover:bg-amber-100/90 dark:hover:bg-amber-950/50 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-amber-200/80 dark:bg-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap truncate">
              <span className="font-bold text-amber-950 dark:text-amber-100">
                Next Milestone:
              </span>
              <span className="font-medium truncate">
                {urgentEvent.company} — {urgentEvent.deadlineLabel || 'Scheduled Event'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 font-semibold text-[11px] text-amber-900 dark:text-amber-100">
                {urgentEvent.deadline}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 shrink-0 pl-2">
            <span>View Job & Prep</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
