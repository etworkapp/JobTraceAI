export type ApplicationStage =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected';

export type ViewMode = 'kanban' | 'list' | 'timeline' | 'offers' | 'analytics';

export type WorkplaceType = 'remote' | 'hybrid' | 'onsite';
export type EmploymentType = 'full-time' | 'contract' | 'part-time' | 'internship';

export interface InterviewFeedback {
  score: number;
  rating: string;
  strengths: string[];
  areasForImprovement: string[];
  refinedAnswer: string;
  coachingTip: string;
}

export interface InterviewQuestionItem {
  id: string;
  category: 'Behavioral' | 'Role-Specific' | 'System & Design' | 'Company & Culture' | string;
  question: string;
  whyAsked: string;
  tips: string;
  sampleAnswer: string;
  userAnswer?: string;
  feedback?: InterviewFeedback;
}

export interface InterviewRound {
  id: string;
  roundName: string; // e.g. "Recruiter Screen", "Technical Round 1", "System Design", "Hiring Manager", "Executive / Culture"
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  interviewerName?: string;
  interviewerTitle?: string;
  completed: boolean;
  notes?: string;
  prepFocus?: string;
}

export interface OfferNegotiationStrategy {
  leverageLevel: 'High' | 'Medium' | 'Moderate';
  marketAnalysis: string;
  targetBaseSalary: number;
  targetTotalComp: number;
  suggestedAsks: string[];
  tacticalPoints: string[];
  counterProposalEmail: string;
}

export interface OfferDetails {
  baseSalary: number;
  annualBonus: number;
  annualEquity: number; // yearly equity grant value
  signOnBonus: number;
  otherBenefits: number; // 401k match, health stipend, etc.
  relocationOrRemoteStipend?: number;
  ptoDays?: number;
  deadlineDate?: string;
  negotiationNotes?: string;
  negotiationStrategy?: OfferNegotiationStrategy;
}

export interface JobApplication {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  salary: string;
  stage: ApplicationStage;
  appliedDate: string; // YYYY-MM-DD
  deadline?: string; // Next event or deadline
  deadlineLabel?: string; // e.g. "Final Round Interview" or "Follow-up due"
  jobUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactRole?: string;
  notes: string;
  jobDescription: string;
  // Interview Rounds Tracker
  rounds?: InterviewRound[];
  // Offer Details & Total Comp Breakdown
  offerDetails?: OfferDetails;
  // AI-generated data
  matchScore?: number; // 0 - 100
  matchingSkills?: string[];
  missingSkills?: string[];
  keyRequirements?: string[];
  strengths?: string[];
  recommendations?: string[];
  summary?: string;
  tailoredSummary?: string;
  tailoredBullets?: string[];
  atsKeywords?: string[];
  coverLetter?: string;
  coverLetterSubject?: string;
  interviewQuestions?: InterviewQuestionItem[];
  questionsToAsk?: string[];
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  targetSalary?: string;
  skills: string[];
  summary: string;
  experience: string;
  education?: string;
}

export interface StageConfig {
  id: ApplicationStage;
  label: string;
  shortLabel: string;
  color: string;
  bgLight: string;
  badgeBg: string;
  border: string;
  accent: string;
  description: string;
}

export const STAGES: Record<ApplicationStage, StageConfig> = {
  wishlist: {
    id: 'wishlist',
    label: 'Wishlist & Saved',
    shortLabel: 'Wishlist',
    color: 'text-slate-700 dark:text-slate-300',
    bgLight: 'bg-slate-50 dark:bg-slate-900/50',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    border: 'border-slate-300',
    accent: '#64748b',
    description: 'Opportunities you have identified and want to tailor applications for',
  },
  applied: {
    id: 'applied',
    label: 'Applied',
    shortLabel: 'Applied',
    color: 'text-blue-700 dark:text-blue-400',
    bgLight: 'bg-blue-50/60 dark:bg-blue-950/20',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-blue-300',
    accent: '#2563eb',
    description: 'Submitted applications awaiting response or initial screening',
  },
  screening: {
    id: 'screening',
    label: 'Recruiter Screening',
    shortLabel: 'Screening',
    color: 'text-indigo-700 dark:text-indigo-400',
    bgLight: 'bg-indigo-50/60 dark:bg-indigo-950/20',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    border: 'border-indigo-300',
    accent: '#6366f1',
    description: 'Initial HR phone screens, recruiter chats, or brief fit assessments',
  },
  interview: {
    id: 'interview',
    label: 'Interview Loops',
    shortLabel: 'Interviewing',
    color: 'text-amber-700 dark:text-amber-400',
    bgLight: 'bg-amber-50/60 dark:bg-amber-950/20',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-amber-300',
    accent: '#d97706',
    description: 'Active technical rounds, system design, leadership, or panel interviews',
  },
  offer: {
    id: 'offer',
    label: 'Offer Received',
    shortLabel: 'Offer',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgLight: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-300',
    accent: '#059669',
    description: 'Formal job offers extended; under compensation review and negotiation',
  },
  rejected: {
    id: 'rejected',
    label: 'Archived / Rejected',
    shortLabel: 'Archived',
    color: 'text-zinc-600 dark:text-zinc-400',
    bgLight: 'bg-zinc-50/60 dark:bg-zinc-900/30',
    badgeBg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    border: 'border-zinc-300',
    accent: '#71717a',
    description: 'Closed, withdrawn, or non-selected applications preserved for records',
  },
};
