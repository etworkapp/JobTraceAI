import React from 'react';
import {
  TrendingUp,
  Calendar,
  Award,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { JobApplication, STAGES } from '../types';

interface AnalyticsViewProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  applications,
  onSelectApplication,
}) => {
  const total = applications.length;
  const wishlist = applications.filter((a) => a.stage === 'wishlist').length;
  const applied = applications.filter((a) => a.stage === 'applied').length;
  const screening = applications.filter((a) => a.stage === 'screening').length;
  const interview = applications.filter((a) => a.stage === 'interview').length;
  const offer = applications.filter((a) => a.stage === 'offer').length;
  const rejected = applications.filter((a) => a.stage === 'rejected').length;

  const activeTotal = applied + screening + interview + offer;
  const responseCount = screening + interview + offer + rejected;
  const responseRate = total > 0 ? Math.round((responseCount / total) * 100) : 0;
  const interviewRate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;
  const offerRate = interview > 0 || offer > 0 ? Math.round((offer / (interview + offer)) * 100) : 0;

  // Workplace breakdown
  const remote = applications.filter((a) => a.workplaceType === 'remote').length;
  const hybrid = applications.filter((a) => a.workplaceType === 'hybrid').length;
  const onsite = applications.filter((a) => a.workplaceType === 'onsite').length;

  // Upcoming 14-day agenda
  const scheduledApps = applications
    .filter((a) => a.deadline && a.stage !== 'rejected')
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Response Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {responseRate}%
            </span>
            <span className="text-xs text-slate-500">of applications heard back</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, responseRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Interview Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {interviewRate}%
            </span>
            <span className="text-xs text-slate-500">reached interview stage</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, interviewRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Offer Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {offer}
            </span>
            <span className="text-xs text-slate-500">official offers extended</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (offer / Math.max(1, total)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Application Conversion Funnel
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Wishlist */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Saved / Wishlist</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{wishlist}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Ready to apply</span>
          </div>

          {/* Applied */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 block mb-1">Applied</span>
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{applied}</span>
            <span className="text-[11px] text-blue-600/70 block mt-1">Submitted</span>
          </div>

          {/* Screening */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block mb-1">Screening</span>
            <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{screening}</span>
            <span className="text-[11px] text-indigo-600/70 block mt-1">HR Chats</span>
          </div>

          {/* Interview */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 block mb-1">Interview Loops</span>
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">{interview}</span>
            <span className="text-[11px] text-amber-600/70 block mt-1">Active Rounds</span>
          </div>

          {/* Offer */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">Offer</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{offer}</span>
            <span className="text-[11px] text-emerald-600/70 block mt-1">Winner</span>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Milestones & Workplace Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Milestones Agenda */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            Upcoming Milestones & Deadlines
          </h3>

          {scheduledApps.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming scheduled events.</p>
          ) : (
            <div className="space-y-2.5">
              {scheduledApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold">
                        {app.deadline ? new Date(app.deadline).toLocaleDateString('en-US', { month: 'short' }) : 'DUE'}
                      </span>
                      <span className="text-xs font-extrabold leading-none">
                        {app.deadline ? new Date(app.deadline).getDate() : ''}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {app.company}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            STAGES[app.stage].badgeBg
                          }`}
                        >
                          {STAGES[app.stage].shortLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {app.deadlineLabel || 'Scheduled Milestone'} — <span className="font-medium">{app.jobTitle}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workplace Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Workplace Preference
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Remote</span>
                  <span className="text-slate-500">{remote} jobs ({total > 0 ? Math.round((remote / total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${total ? (remote / total) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Hybrid</span>
                  <span className="text-slate-500">{hybrid} jobs ({total > 0 ? Math.round((hybrid / total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${total ? (hybrid / total) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Onsite</span>
                  <span className="text-slate-500">{onsite} jobs ({total > 0 ? Math.round((onsite / total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${total ? (onsite / total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Pipeline Recommendation</span>
            </div>
            <p className="text-indigo-800/90 dark:text-indigo-300">
              You have {interview} active interview loops. To maximize offer leverage and concurrent compensation timelines, schedule mock prep before Friday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
