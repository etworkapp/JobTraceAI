import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
  Sparkles,
  Download,
  ExternalLink,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Building2,
  User,
  BookOpen,
  Filter,
  Loader2,
} from 'lucide-react';
import { JobApplication, InterviewRound, UserProfile } from '../types';
import { generateSmartFollowup } from '../utils/aiClient';

interface TimelineViewProps {
  applications: JobApplication[];
  userProfile: UserProfile;
  onSelectApplication: (app: JobApplication) => void;
  onUpdateApplication: (app: JobApplication) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  applications,
  userProfile,
  onSelectApplication,
  onUpdateApplication,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'interviews' | 'followups'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Smart follow-up state
  const [generatingFollowupId, setGeneratingFollowupId] = useState<string | null>(null);
  const [followupDrafts, setFollowupDrafts] = useState<{
    [appId: string]: { recommendation: string; subject: string; body: string };
  }>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculate days since application or update
  const getDaysAgo = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Collect all interview rounds across all applications
  const allEvents: Array<{
    app: JobApplication;
    round?: InterviewRound;
    isDeadline?: boolean;
    date: string;
    title: string;
    time?: string;
    completed: boolean;
  }> = [];

  applications.forEach((app) => {
    // Add interview rounds
    if (app.rounds && app.rounds.length > 0) {
      app.rounds.forEach((round) => {
        allEvents.push({
          app,
          round,
          date: round.date,
          time: round.time,
          title: `${app.company} — ${round.roundName}`,
          completed: !!round.completed,
        });
      });
    }

    // Add deadlines
    if (app.deadline) {
      allEvents.push({
        app,
        isDeadline: true,
        date: app.deadline,
        title: `${app.company} — ${app.deadlineLabel || 'Target Deadline'}`,
        completed: app.stage === 'offer' || app.stage === 'rejected',
      });
    }
  });

  // Sort chronologically
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Stale applications needing follow-up (applied or screening, >= 5 days ago)
  const staleApps = applications.filter((app) => {
    if (app.stage !== 'applied' && app.stage !== 'screening') return false;
    const days = getDaysAgo(app.appliedDate);
    return days >= 5;
  });

  const handleToggleRoundComplete = (app: JobApplication, roundId: string) => {
    if (!app.rounds) return;
    const updatedRounds = app.rounds.map((r) =>
      r.id === roundId ? { ...r, completed: !r.completed } : r
    );
    onUpdateApplication({
      ...app,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleGenerateFollowup = async (app: JobApplication) => {
    setGeneratingFollowupId(app.id);
    try {
      const days = getDaysAgo(app.appliedDate);
      const res = await generateSmartFollowup(
        app.company,
        app.jobTitle,
        app.contactName || 'Hiring Team',
        days,
        app.stage,
        userProfile
      );
      setFollowupDrafts((prev) => ({ ...prev, [app.id]: res }));
    } catch (err: any) {
      alert(err.message || 'Failed to generate follow-up email');
    } finally {
      setGeneratingFollowupId(null);
    }
  };

  // Export Calendar as standard .ics file
  const handleExportICS = () => {
    const calendarEvents = allEvents.map((evt) => {
      const dateFormatted = evt.date.replace(/-/g, '');
      const uid = `${evt.app.id}-${evt.round?.id || 'deadline'}-${dateFormatted}@jobtracker`;
      return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${dateFormatted}
SUMMARY:${evt.title}
DESCRIPTION:${evt.round?.prepFocus || evt.app.notes || 'Job Application milestone'}
END:VEVENT`;
    });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Job Application Tracker AI//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${calendarEvents.join('\n')}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'job_application_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-violet-950/30 border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Interview Timeline & Radar</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Application Milestones & Smart Follow-Up Radar
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
              Never miss an interview loop or critical recruiter deadline. Sync milestone dates to your calendar and automatically trigger proactive AI follow-up emails.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="export-ics-calendar-button"
              onClick={handleExportICS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Calendar (.ICS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smart Follow-Up Radar (Stale Applications) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Smart Follow-Up Radar
              </h3>
              <p className="text-[11px] text-slate-500">
                Applications with no recruiter update in 5+ days. Proactive follow-ups increase reply rates by 38%.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {staleApps.length} Candidates for Follow-up
          </span>
        </div>

        {staleApps.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            All applications have had recent activity or are actively scheduled. Radar is clear!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staleApps.map((app) => {
              const days = getDaysAgo(app.appliedDate);
              const draft = followupDrafts[app.id];
              const isGen = generatingFollowupId === app.id;

              return (
                <div
                  key={app.id}
                  id={`radar-app-${app.id}`}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {app.company}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {app.jobTitle}
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                        Applied {days} days ago ({app.appliedDate || 'No date'}) • Stage: {app.stage}
                      </p>
                    </div>

                    <button
                      id={`generate-radar-followup-${app.id}`}
                      onClick={() => handleGenerateFollowup(app)}
                      disabled={isGen}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                    >
                      {isGen ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Draft Check-in</span>
                    </button>
                  </div>

                  {draft && (
                    <div className="p-3.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          Subject: {draft.subject}
                        </span>
                        <button
                          onClick={() => handleCopy(draft.body, `draft-${app.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          {copiedKey === `draft-${app.id}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-sans whitespace-pre-wrap text-[11px] leading-relaxed">
                        {draft.body}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Milestones Chronology */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interview Rounds & Milestone Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological pipeline of upcoming coding screens, architecture reviews, and offer decision dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {allEvents.length} Total Events
            </span>
          </div>
        </div>

        {allEvents.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              No interview rounds or deadlines scheduled yet. Open any application to add interview stages.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-6">
            {allEvents.map((evt, idx) => {
              const isPast = new Date(evt.date) < new Date(new Date().toDateString());

              return (
                <div key={idx} className="relative pl-6 group">
                  {/* Timeline node icon */}
                  <button
                    onClick={() => {
                      if (evt.round) {
                        handleToggleRoundComplete(evt.app, evt.round.id);
                      }
                    }}
                    className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      evt.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isPast
                        ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-400 text-amber-700'
                        : 'bg-white dark:bg-slate-850 border-blue-500 text-blue-600'
                    }`}
                    title={evt.completed ? 'Marked complete' : 'Click to toggle completion'}
                  >
                    {evt.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Card Container */}
                  <div
                    onClick={() => onSelectApplication(evt.app)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {evt.app.company}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {evt.app.jobTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {evt.date}
                        </span>
                        {evt.time && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {evt.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4
                      className={`text-sm font-bold ${
                        evt.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {evt.title}
                    </h4>

                    {evt.round?.interviewerName && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Interviewer: <strong>{evt.round.interviewerName}</strong>{' '}
                          {evt.round.interviewerTitle && `(${evt.round.interviewerTitle})`}
                        </span>
                      </div>
                    )}

                    {evt.round?.prepFocus && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Prep Focus: </strong>
                          <span>{evt.round.prepFocus}</span>
                        </div>
                      </div>
                    )}

                    {evt.round?.notes && (
                      <p className="mt-2 text-xs text-slate-500 italic">
                        "{evt.round.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
