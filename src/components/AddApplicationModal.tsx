import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Briefcase,
  FileText,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  ApplicationStage,
  EmploymentType,
  JobApplication,
  UserProfile,
  WorkplaceType,
} from '../types';
import { analyzeJobDescription } from '../utils/aiClient';

interface AddApplicationModalProps {
  isOpen: boolean;
  initialStage?: ApplicationStage;
  initialSmartMode?: boolean;
  userProfile: UserProfile;
  onClose: () => void;
  onAdd: (newApp: JobApplication) => void;
}

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  initialStage = 'wishlist',
  initialSmartMode = false,
  userProfile,
  onClose,
  onAdd,
}) => {
  const [activeMode, setActiveMode] = useState<'smart' | 'manual'>(
    initialSmartMode ? 'smart' : 'manual'
  );

  // Raw text for smart parse
  const [rawJobText, setRawJobText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Form fields
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('remote');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [salary, setSalary] = useState('');
  const [stage, setStage] = useState<ApplicationStage>(initialStage);
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState('');
  const [deadlineLabel, setDeadlineLabel] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // AI parsed data
  const [parsedData, setParsedData] = useState<{
    matchScore?: number;
    matchingSkills?: string[];
    missingSkills?: string[];
    keyRequirements?: string[];
    summary?: string;
  } | null>(null);

  // Execute AI smart parse
  const handleSmartParse = async () => {
    if (!rawJobText.trim()) {
      alert('Please paste a job description or posting text first.');
      return;
    }
    setIsParsing(true);
    try {
      const result = await analyzeJobDescription(rawJobText, userProfile);
      setCompany(result.company !== 'Unknown' ? result.company : '');
      setJobTitle(result.jobTitle);
      setLocation(result.location || 'Remote');
      setSalary(result.salaryRange !== 'Not disclosed' ? result.salaryRange : '');
      setJobDescription(rawJobText);
      setParsedData({
        matchScore: result.matchScore,
        matchingSkills: result.matchingSkills,
        missingSkills: result.missingSkills,
        keyRequirements: result.keyRequirements,
        summary: result.summary,
      });
      // Switch to manual mode to review and submit
      setActiveMode('manual');
    } catch (err: any) {
      alert('AI parsing error: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !jobTitle.trim()) {
      alert('Company and Job Title are required.');
      return;
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      location: location.trim() || 'Remote',
      workplaceType,
      employmentType,
      salary: salary.trim(),
      stage,
      appliedDate,
      deadline: deadline || undefined,
      deadlineLabel: deadlineLabel.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      notes: notes.trim(),
      jobDescription: jobDescription.trim() || rawJobText.trim(),
      matchScore: parsedData?.matchScore,
      matchingSkills: parsedData?.matchingSkills,
      missingSkills: parsedData?.missingSkills,
      keyRequirements: parsedData?.keyRequirements,
      summary: parsedData?.summary,
      updatedAt: new Date().toISOString(),
    };

    onAdd(newApp);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="add-application-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="add-application-modal-content"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Job Application
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log manually or paste raw job posting text for instant AI auto-fill
              </p>
            </div>
          </div>

          <button
            id="close-add-modal-button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-3 bg-white dark:bg-slate-900">
          <button
            id="mode-smart-tab"
            onClick={() => setActiveMode('smart')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeMode === 'smart'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Smart Parse (Paste JD)</span>
          </button>
          <button
            id="mode-manual-tab"
            onClick={() => setActiveMode('manual')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeMode === 'manual'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Structured Form {parsedData && '(Auto-Filled)'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeMode === 'smart' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Instant Extraction Engine
                </span>
                <p className="text-indigo-800/90 dark:text-indigo-300">
                  Paste any job description from LinkedIn, Indeed, Greenhouse, or Lever. Gemini
                  3.8 will extract the company, title, compensation, workplace type, and compute
                  your candidate match score automatically!
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Paste Job Description or Posting Text:
                </label>
                <textarea
                  id="smart-parse-textarea"
                  rows={10}
                  placeholder="Paste entire job posting here..."
                  value={rawJobText}
                  onChange={(e) => setRawJobText(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawJobText(`About Stripe:
At Stripe, we're building the economic infrastructure for the internet. We are looking for an experienced Senior Frontend Engineer to work on our merchant payment experience.

Requirements:
- 4+ years of professional experience building web apps with React and TypeScript.
- Strong grounding in web performance, browser APIs, and component reusability.
- Experience with real-time telemetry, design systems, and WCAG AA accessibility.
- Compensation: $165,000 - $195,000 + Equity. Location: San Francisco (Hybrid) or Remote.`);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Load sample JD
                </button>

                <button
                  id="execute-smart-parse-button"
                  type="button"
                  onClick={handleSmartParse}
                  disabled={isParsing || !rawJobText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isParsing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isParsing ? 'Analyzing with Gemini...' : 'Analyze & Auto-Fill Form'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {parsedData && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                  <span>
                    ✓ Auto-filled by Gemini AI! Match Score:{' '}
                    <strong>{parsedData.matchScore}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setParsedData(null)}
                    className="text-emerald-700 underline text-[11px]"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Company Name *
                  </label>
                  <input
                    id="input-company"
                    type="text"
                    required
                    placeholder="e.g. Netflix, Stripe, Linear"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Job Title *
                  </label>
                  <input
                    id="input-job-title"
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Stage
                  </label>
                  <select
                    id="input-stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as ApplicationStage)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="wishlist">Wishlist & Saved</option>
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview Loops</option>
                    <option value="offer">Offer Received</option>
                    <option value="rejected">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Workplace Type
                  </label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Compensation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $160,000 - $190,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Posting Link URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Next Milestone / Deadline Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Milestone Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Recruiter Call, Coding Screen, Follow-up"
                    value={deadlineLabel}
                    onChange={(e) => setDeadlineLabel(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Job Description (Needed for AI Resume Tailor & Interview Prep)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste job description text..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full text-xs rounded-lg p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  id="submit-add-job-button"
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Save Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
