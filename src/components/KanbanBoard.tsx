import React, { useState } from 'react';
import {
  Plus,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  FileText,
  MessageSquareQuote,
  GripVertical,
} from 'lucide-react';
import { ApplicationStage, JobApplication, STAGES } from '../types';

interface KanbanBoardProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStage: (id: string, newStage: ApplicationStage) => void;
  onDeleteApplication: (id: string, e: React.MouseEvent) => void;
  onAddApplicationInStage: (stage: ApplicationStage) => void;
}

const STAGE_ORDER: ApplicationStage[] = [
  'wishlist',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectApplication,
  onUpdateStage,
  onDeleteApplication,
  onAddApplicationInStage,
}) => {
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStage | null>(null);

  const getNextStage = (current: ApplicationStage): ApplicationStage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx >= 0 && idx < STAGE_ORDER.length - 2) {
      return STAGE_ORDER[idx + 1];
    }
    if (current === 'interview') return 'offer';
    return null;
  };

  const getPrevStage = (current: ApplicationStage): ApplicationStage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx > 0 && idx < STAGE_ORDER.length - 1) {
      return STAGE_ORDER[idx - 1];
    }
    if (current === 'offer') return 'interview';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-8 overflow-x-auto min-h-[600px]">
      {STAGE_ORDER.map((stageKey) => {
        const config = STAGES[stageKey];
        const stageApps = applications.filter((app) => app.stage === stageKey);
        const isColumnActive = dragOverStage === stageKey;

        return (
          <div
            key={stageKey}
            id={`kanban-column-${stageKey}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverStage !== stageKey) {
                setDragOverStage(stageKey);
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverStage(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain') || draggingAppId;
              if (id) {
                onUpdateStage(id, stageKey);
              }
              setDragOverStage(null);
              setDraggingAppId(null);
            }}
            className={`flex flex-col rounded-2xl border p-3 min-w-[280px] xl:min-w-0 transition-all duration-150 ${
              isColumnActive
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-400/40'
                : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 shadow-xs'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.accent }}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {config.shortLabel}
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {stageApps.length}
                </span>
              </div>
              <button
                id={`add-job-to-${stageKey}-button`}
                onClick={() => onAddApplicationInStage(stageKey)}
                title={`Add job to ${config.label}`}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drag drop target hint banner */}
            {isColumnActive && (
              <div className="mb-2 p-2 rounded-lg border-2 border-dashed border-blue-400 dark:border-blue-500 bg-blue-100/50 dark:bg-blue-900/40 text-center text-xs font-semibold text-blue-700 dark:text-blue-300 animate-pulse">
                Drop to move to {config.shortLabel}
              </div>
            )}

            {/* Column Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5">
              {stageApps.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 text-xs">
                  <p>No jobs in {config.shortLabel.toLowerCase()}</p>
                  <button
                    onClick={() => onAddApplicationInStage(stageKey)}
                    className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium"
                  >
                    + Add one now
                  </button>
                </div>
              ) : (
                stageApps.map((app) => {
                  const nextStage = getNextStage(app.stage);
                  const prevStage = getPrevStage(app.stage);
                  const isDraggingThis = draggingAppId === app.id;

                  return (
                    <div
                      key={app.id}
                      id={`kanban-card-${app.id}`}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', app.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingAppId(app.id);
                      }}
                      onDragEnd={() => {
                        setDraggingAppId(null);
                        setDragOverStage(null);
                      }}
                      onClick={() => onSelectApplication(app)}
                      className={`group relative bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border transition-all cursor-grab active:cursor-grabbing ${
                        isDraggingThis
                          ? 'opacity-40 scale-95 border-dashed border-blue-500'
                          : 'border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/80'
                      }`}
                    >
                      {/* Drag handle & Company & Job Title */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                              {app.company}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {app.jobTitle}
                          </h4>
                        </div>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Open Job Posting"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Location & Workplace type */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 flex-wrap">
                        {app.location && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {app.location}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 capitalize">
                          {app.workplaceType}
                        </span>
                      </div>

                      {/* Salary if present */}
                      {app.salary && (
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium mb-2.5">
                          <DollarSign className="w-3 h-3 text-emerald-500" />
                          <span className="truncate">{app.salary}</span>
                        </div>
                      )}

                      {/* AI Match Score Pill & Badges */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/70 text-xs">
                        {typeof app.matchScore === 'number' ? (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              app.matchScore >= 90
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                                : app.matchScore >= 75
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
                            }`}
                            title={`AI Job Fit Match: ${app.matchScore}%`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{app.matchScore}% Fit</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI ready
                          </span>
                        )}

                        {/* Badges for AI artifacts created */}
                        <div className="flex items-center gap-1 text-slate-400">
                          {app.tailoredBullets && app.tailoredBullets.length > 0 && (
                            <span title="Resume tailored" className="text-blue-600 dark:text-blue-400">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {app.interviewQuestions && app.interviewQuestions.length > 0 && (
                            <span title="Interview prep generated" className="text-amber-600 dark:text-amber-400">
                              <MessageSquareQuote className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestone / Deadline Badge if present */}
                      {app.deadline && (
                        <div className="mt-2 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200/70 dark:border-amber-800/50 flex items-center gap-1 truncate">
                          <Calendar className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="truncate">{app.deadlineLabel || app.deadline}</span>
                        </div>
                      )}

                      {/* Card Quick Actions (on hover) */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {prevStage && (
                            <button
                              id={`move-prev-${app.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStage(app.id, prevStage);
                              }}
                              title={`Move back to ${STAGES[prevStage].shortLabel}`}
                              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextStage && (
                            <button
                              id={`move-next-${app.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStage(app.id, nextStage);
                              }}
                              title={`Advance to ${STAGES[nextStage].shortLabel}`}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-[11px] hover:bg-blue-100 transition-colors"
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <button
                          id={`delete-card-${app.id}`}
                          onClick={(e) => onDeleteApplication(app.id, e)}
                          title="Delete Application"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
