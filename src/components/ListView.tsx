import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  FileText,
  MessageSquareQuote,
} from 'lucide-react';
import { ApplicationStage, JobApplication, STAGES } from '../types';

interface ListViewProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStage: (id: string, newStage: ApplicationStage) => void;
  onDeleteApplication: (id: string, e: React.MouseEvent) => void;
}

type SortField = 'company' | 'jobTitle' | 'stage' | 'matchScore' | 'appliedDate' | 'deadline';

export const ListView: React.FC<ListViewProps> = ({
  applications,
  onSelectApplication,
  onUpdateStage,
  onDeleteApplication,
}) => {
  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedApplications = [...applications].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'company') {
      comparison = a.company.localeCompare(b.company);
    } else if (sortField === 'jobTitle') {
      comparison = a.jobTitle.localeCompare(b.jobTitle);
    } else if (sortField === 'stage') {
      comparison = a.stage.localeCompare(b.stage);
    } else if (sortField === 'matchScore') {
      comparison = (a.matchScore || 0) - (b.matchScore || 0);
    } else if (sortField === 'appliedDate') {
      comparison = a.appliedDate.localeCompare(b.appliedDate);
    } else if (sortField === 'deadline') {
      comparison = (a.deadline || '').localeCompare(b.deadline || '');
    }
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Company & Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => handleSort('matchScore')}
              >
                <div className="flex items-center gap-1.5">
                  <span>AI Match</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Location & Comp</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => handleSort('deadline')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Milestone / Due</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => handleSort('appliedDate')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Date Applied</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedApplications.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                  No applications found matching your criteria.
                </td>
              </tr>
            ) : (
              sortedApplications.map((app) => {
                const stageConfig = STAGES[app.stage];

                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Company & Role */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {app.company}
                          </span>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                          {app.jobTitle}
                        </span>
                      </div>
                    </td>

                    {/* Stage selector */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.stage}
                        onChange={(e) => onUpdateStage(app.id, e.target.value as ApplicationStage)}
                        className={`text-xs font-semibold rounded-md px-2 py-1 border transition-colors ${stageConfig.badgeBg}`}
                      >
                        <option value="wishlist">Wishlist</option>
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Archived</option>
                      </select>
                    </td>

                    {/* AI Match */}
                    <td className="py-3.5 px-4">
                      {typeof app.matchScore === 'number' ? (
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            app.matchScore >= 90
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : app.matchScore >= 75
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{app.matchScore}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unanalyzed</span>
                      )}
                    </td>

                    {/* Location & Salary */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{app.location || 'Remote'}</span>
                          <span className="text-[10px] text-slate-400 uppercase">({app.workplaceType})</span>
                        </div>
                        {app.salary && (
                          <div className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[160px]">
                            {app.salary}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Milestone / Deadline */}
                    <td className="py-3.5 px-4">
                      {app.deadline ? (
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/60 max-w-[170px]">
                          <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold block text-[10px]">{app.deadline}</span>
                            <span className="text-[11px] truncate block">
                              {app.deadlineLabel || 'Scheduled'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {app.appliedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {app.tailoredBullets && (
                          <span title="Resume Tailored" className="text-blue-500">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {app.interviewQuestions && (
                          <span title="Interview Prepped" className="text-amber-500">
                            <MessageSquareQuote className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <button
                          onClick={(e) => onDeleteApplication(app.id, e)}
                          title="Delete application"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
