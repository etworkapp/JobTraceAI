import { JobApplication, UserProfile, InterviewFeedback, InterviewQuestionItem } from '../types';

export interface AnalyzeJobResponse {
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  keyRequirements: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface TailorResumeResponse {
  tailoredSummary: string;
  suggestedBullets: string[];
  atsKeywords: string[];
}

export interface CoverLetterResponse {
  coverLetter: string;
  subjectLine?: string;
}

export interface InterviewPrepResponse {
  questions: Array<{
    category: string;
    question: string;
    whyAsked: string;
    tips: string;
    sampleAnswer: string;
  }>;
  questionsToAsk: string[];
}

export interface DraftEmailResponse {
  subject: string;
  body: string;
}

export async function analyzeJobDescription(
  jobDescription: string,
  userProfile?: UserProfile
): Promise<AnalyzeJobResponse> {
  const res = await fetch('/api/ai/analyze-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription, userProfile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Analysis failed (${res.status})`);
  }
  return res.json();
}

export async function tailorResume(
  jobTitle: string,
  company: string,
  jobDescription: string,
  userProfile: UserProfile
): Promise<TailorResumeResponse> {
  const res = await fetch('/api/ai/tailor-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobTitle, company, jobDescription, userProfile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Resume tailoring failed (${res.status})`);
  }
  return res.json();
}

export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  jobDescription: string,
  userProfile: UserProfile,
  tone: string
): Promise<CoverLetterResponse> {
  const res = await fetch('/api/ai/generate-cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobTitle, company, jobDescription, userProfile, tone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Cover letter generation failed (${res.status})`);
  }
  return res.json();
}

export async function generateInterviewPrep(
  jobTitle: string,
  company: string,
  jobDescription: string,
  stage?: string
): Promise<InterviewPrepResponse> {
  const res = await fetch('/api/ai/interview-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobTitle, company, jobDescription, stage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Interview prep failed (${res.status})`);
  }
  return res.json();
}

export async function reviewInterviewAnswer(
  question: string,
  answer: string,
  jobTitle: string,
  company: string
): Promise<InterviewFeedback> {
  const res = await fetch('/api/ai/interview-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, jobTitle, company }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Answer critique failed (${res.status})`);
  }
  return res.json();
}

export async function draftEmail(
  emailType: string,
  company: string,
  jobTitle: string,
  contactName?: string,
  contextNotes?: string,
  userProfile?: UserProfile
): Promise<DraftEmailResponse> {
  const res = await fetch('/api/ai/draft-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailType, company, jobTitle, contactName, contextNotes, userProfile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Drafting email failed (${res.status})`);
  }
  return res.json();
}

export async function negotiateOffer(
  company: string,
  jobTitle: string,
  currentOffer: any,
  competingOffers: string,
  userPriorities: string,
  userProfile?: UserProfile
): Promise<any> {
  const res = await fetch('/api/ai/negotiate-offer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company,
      jobTitle,
      currentOffer,
      competingOffers,
      userPriorities,
      userProfile,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Offer negotiation failed (${res.status})`);
  }
  return res.json();
}

export async function generateSmartFollowup(
  company: string,
  jobTitle: string,
  contactName: string,
  daysSinceApplied: number,
  stage: string,
  userProfile?: UserProfile
): Promise<{ recommendation: string; subject: string; body: string }> {
  const res = await fetch('/api/ai/smart-followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company,
      jobTitle,
      contactName,
      daysSinceApplied,
      stage,
      userProfile,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Smart follow-up failed (${res.status})`);
  }
  return res.json();
}

export async function askCopilot(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  applications: JobApplication[],
  userProfile: UserProfile
): Promise<string> {
  const activeSummary = applications
    .slice(0, 10)
    .map(
      (a) =>
        `- ${a.company} (${a.jobTitle}): Stage=[${a.stage}], Deadline=[${a.deadline || 'None'}: ${a.deadlineLabel || ''}], Match=[${a.matchScore || 'N/A'}%], Salary=[${a.salary || 'N/A'}]`
    )
    .join('\n');

  const res = await fetch('/api/ai/copilot-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      activeApplicationsSummary: activeSummary,
      userProfile,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI Copilot request failed (${res.status})`);
  }
  const data = await res.json();
  return data.reply;
}
