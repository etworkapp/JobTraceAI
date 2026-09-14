import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileText,
  MessageSquareQuote,
  Mail,
  FileCode,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  Trash2,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Award,
  Plus,
  Clock,
  User,
  Briefcase,
  CheckCircle2,
  Circle,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  JobApplication,
  UserProfile,
  ApplicationStage,
  STAGES,
  InterviewQuestionItem,
  InterviewRound,
  OfferDetails,
  OfferNegotiationStrategy,
} from '../types';
import {
  analyzeJobDescription,
  tailorResume,
  generateCoverLetter,
  generateInterviewPrep,
  reviewInterviewAnswer,
  draftEmail,
  negotiateOffer,
} from '../utils/aiClient';

interface ApplicationModalProps {
  application: JobApplication;
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: JobApplication) => void;
  onDelete: (id: string) => void;
}

type TabType = 'match' | 'resume' | 'coverLetter' | 'interview' | 'rounds' | 'offer' | 'email' | 'details';

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  userProfile,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('match');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable fields for Details tab
  const [formData, setFormData] = useState<JobApplication>({ ...application });

  // Interview Rounds Form State
  const [showAddRoundForm, setShowAddRoundForm] = useState(false);
  const [roundNameInput, setRoundNameInput] = useState('');
  const [roundDateInput, setRoundDateInput] = useState('');
  const [roundTimeInput, setRoundTimeInput] = useState('');
  const [roundInterviewerInput, setRoundInterviewerInput] = useState('');
  const [roundInterviewerTitleInput, setRoundInterviewerTitleInput] = useState('');
  const [roundPrepFocusInput, setRoundPrepFocusInput] = useState('');
  const [roundNotesInput, setRoundNotesInput] = useState('');

  // Offer Details Form State
  const [offerForm, setOfferForm] = useState<OfferDetails>(
    formData.offerDetails || {
      baseSalary: 160000,
      annualBonus: 16000,
      annualEquity: 35000,
      signOnBonus: 10000,
      otherBenefits: 8500,
      relocationOrRemoteStipend: 2500,
      ptoDays: 22,
      deadlineDate: '',
      negotiationNotes: '',
    }
  );
  const [isAnalyzingModalNegotiation, setIsAnalyzingModalNegotiation] = useState(false);
  const [modalNegotiationNotes, setModalNegotiationNotes] = useState('');
  const [modalCandidatePriorities, setModalCandidatePriorities] = useState('Base salary increase & remote stipend');

  // AI Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isPreppingInterview, setIsPreppingInterview] = useState(false);
  const [critiqueLoadingId, setCritiqueLoadingId] = useState<string | null>(null);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  // Cover Letter options
  const [coverLetterTone, setCoverLetterTone] = useState('Confident & Impactful');

  // Email Drafter options
  const [emailType, setEmailType] = useState<'follow_up' | 'thank_you' | 'outreach' | 'negotiation'>('thank_you');
  const [emailContext, setEmailContext] = useState('');
  const [draftedEmail, setDraftedEmail] = useState<{ subject: string; body: string } | null>(null);

  // Mock practice draft answers per question ID
  const [userDraftAnswers, setUserDraftAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({ ...application });
    if (application.offerDetails) {
      setOfferForm(application.offerDetails);
    }
  }, [application]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStageChange = (newStage: ApplicationStage) => {
    if (newStage === 'offer' && application.stage !== 'offer') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
    const updated = { ...application, stage: newStage, updatedAt: new Date().toISOString() };
    setFormData(updated);
    onUpdate(updated);
  };

  // Round Handlers
  const handleAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundNameInput.trim()) return;

    const newRound: InterviewRound = {
      id: 'round-' + Date.now(),
      roundName: roundNameInput.trim(),
      date: roundDateInput || new Date().toISOString().split('T')[0],
      time: roundTimeInput || undefined,
      interviewerName: roundInterviewerInput.trim() || undefined,
      interviewerTitle: roundInterviewerTitleInput.trim() || undefined,
      prepFocus: roundPrepFocusInput.trim() || undefined,
      notes: roundNotesInput.trim() || undefined,
      completed: false,
    };

    const existingRounds = formData.rounds || [];
    const updatedRounds = [...existingRounds, newRound];
    const updated: JobApplication = {
      ...formData,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdate(updated);

    // Reset inputs
    setRoundNameInput('');
    setRoundDateInput('');
    setRoundTimeInput('');
    setRoundInterviewerInput('');
    setRoundInterviewerTitleInput('');
    setRoundPrepFocusInput('');
    setRoundNotesInput('');
    setShowAddRoundForm(false);
  };

  const handleToggleRoundComplete = (roundId: string) => {
    const existingRounds = formData.rounds || [];
    const updatedRounds = existingRounds.map((r) =>
      r.id === roundId ? { ...r, completed: !r.completed } : r
    );
    const updated: JobApplication = {
      ...formData,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleDeleteRound = (roundId: string) => {
    const existingRounds = formData.rounds || [];
    const updatedRounds = existingRounds.filter((r) => r.id !== roundId);
    const updated: JobApplication = {
      ...formData,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdate(updated);
  };

  // Offer Details Handlers
  const handleSaveOfferDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: JobApplication = {
      ...formData,
      stage: formData.stage === 'wishlist' || formData.stage === 'applied' ? 'offer' : formData.stage,
      offerDetails: offerForm,
      updatedAt: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdate(updated);
    alert('Offer details saved successfully!');
  };

  const handleRunOfferNegotiation = async () => {
    setIsAnalyzingModalNegotiation(true);
    try {
      const result = await negotiateOffer(
        formData.company,
        formData.jobTitle,
        offerForm,
        modalNegotiationNotes,
        modalCandidatePriorities,
        userProfile
      );
      const updatedOffer: OfferDetails = {
        ...offerForm,
        negotiationStrategy: result,
      };
      setOfferForm(updatedOffer);
      const updated: JobApplication = {
        ...formData,
        offerDetails: updatedOffer,
        updatedAt: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdate(updated);
    } catch (err: any) {
      alert('Negotiation analysis error: ' + err.message);
    } finally {
      setIsAnalyzingModalNegotiation(false);
    }
  };

  // 1. Run AI Job Fit & Match Analysis
  const handleRunAnalysis = async () => {
    if (!formData.jobDescription) {
      alert('Please provide a job description first in the Details tab.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeJobDescription(formData.jobDescription, userProfile);
      const updated: JobApplication = {
        ...formData,
        jobTitle: formData.jobTitle || result.jobTitle,
        company: formData.company || result.company,
        location: formData.location || result.location,
        salary: formData.salary || result.salaryRange,
        matchScore: result.matchScore,
        matchingSkills: result.matchingSkills,
        missingSkills: result.missingSkills,
        keyRequirements: result.keyRequirements,
        strengths: result.strengths,
        recommendations: result.recommendations,
        summary: result.summary,
        updatedAt: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdate(updated);
    } catch (err: any) {
      alert('Analysis error: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Run AI Resume Tailor
  const handleTailorResume = async () => {
    setIsTailoring(true);
    try {
      const result = await tailorResume(
        formData.jobTitle,
        formData.company,
        formData.jobDescription,
        userProfile
      );
      const updated: JobApplication = {
        ...formData,
        tailoredSummary: result.tailoredSummary,
        tailoredBullets: result.suggestedBullets,
        atsKeywords: result.atsKeywords,
        updatedAt: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdate(updated);
    } catch (err: any) {
      alert('Resume tailoring error: ' + err.message);
    } finally {
      setIsTailoring(false);
    }
  };

  // 3. Generate Cover Letter
  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCover(true);
    try {
      const result = await generateCoverLetter(
        formData.jobTitle,
        formData.company,
        formData.jobDescription,
        userProfile,
        coverLetterTone
      );
      const updated: JobApplication = {
        ...formData,
        coverLetter: result.coverLetter,
        coverLetterSubject: result.subjectLine,
        updatedAt: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdate(updated);
    } catch (err: any) {
      alert('Cover letter generation error: ' + err.message);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // 4. Generate Interview Prep
  const handleGenerateInterviewPrep = async () => {
    setIsPreppingInterview(true);
    try {
      const result = await generateInterviewPrep(
        formData.jobTitle,
        formData.company,
        formData.jobDescription,
        formData.stage
      );
      const questions: InterviewQuestionItem[] = result.questions.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        category: q.category,
        question: q.question,
        whyAsked: q.whyAsked,
        tips: q.tips,
        sampleAnswer: q.sampleAnswer,
      }));
      const updated: JobApplication = {
        ...formData,
        interviewQuestions: questions,
        questionsToAsk: result.questionsToAsk,
        updatedAt: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdate(updated);
    } catch (err: any) {
      alert('Interview prep generation error: ' + err.message);
    } finally {
      setIsPreppingInterview(false);
    }
  };

  // 5. Submit Mock Answer for AI Critique
  const handleSubmitAnswerForCritique = async (questionItem: InterviewQuestionItem) => {
    const answer = userDraftAnswers[questionItem.id] || questionItem.userAnswer;
    if (!answer || !answer.trim()) {
      alert('Please type your draft answer first before requesting AI critique.');
      return;
    }
    setCritiqueLoadingId(questionItem.id);
    try {
      const feedback = await reviewInterviewAnswer(
        questionItem.question,
        answer,
        formData.jobTitle,
        formData.company
      );
      const updatedQuestions = (formData.interviewQuestions || []).map((q) => {
        if (q.id === questionItem.id) {
          return { ...q, userAnswer: answer, feedback };
        }
        return q;
      });
      const updated: JobApplication = {
        ...formData,
        interviewQuestions: updatedQuestions,
        updatedAt: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdate(updated);
    } catch (err: any) {
      alert('Feedback error: ' + err.message);
    } finally {
      setCritiqueLoadingId(null);
    }
  };

  // 6. Draft Email
  const handleDraftEmail = async () => {
    setIsDraftingEmail(true);
    try {
      const result = await draftEmail(
        emailType,
        formData.company,
        formData.jobTitle,
        formData.contactName,
        emailContext,
        userProfile
      );
      setDraftedEmail(result);
    } catch (err: any) {
      alert('Email drafting error: ' + err.message);
    } finally {
      setIsDraftingEmail(false);
    }
  };

  // Save manual edits in Details tab
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...formData, updatedAt: new Date().toISOString() };
    onUpdate(updated);
    alert('Application details updated successfully!');
  };

  if (!isOpen) return null;

  const stageConfig = STAGES[formData.stage];

  return (
    <div
      id="application-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="application-modal-content"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {formData.company}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>{formData.location || 'Remote'}</span>
                <span className="capitalize">({formData.workplaceType})</span>
              </div>
              {formData.salary && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-3 h-3" />
                    <span>{formData.salary}</span>
                  </div>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {formData.jobTitle}
            </h2>
          </div>

          {/* Right controls: Stage Selector & Close */}
          <div className="flex items-center gap-2.5">
            {/* Stage Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Stage:</span>
              <select
                id="modal-stage-select"
                value={formData.stage}
                onChange={(e) => handleStageChange(e.target.value as ApplicationStage)}
                className={`text-xs font-bold rounded-lg px-3 py-1.5 border shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${stageConfig.badgeBg}`}
              >
                <option value="wishlist">Wishlist & Saved</option>
                <option value="applied">Applied</option>
                <option value="screening">Recruiter Screening</option>
                <option value="interview">Interview Loops</option>
                <option value="offer">Offer Received</option>
                <option value="rejected">Archived / Rejected</option>
              </select>
            </div>

            {formData.jobUrl && (
              <a
                href={formData.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open Job Posting"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              id="modal-delete-button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${formData.company} - ${formData.jobTitle}?`)) {
                  onDelete(formData.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="modal-close-button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-2 sm:gap-4 overflow-x-auto bg-white dark:bg-slate-900 shrink-0">
          <button
            id="tab-match-button"
            onClick={() => setActiveTab('match')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'match'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Match Fit</span>
            {typeof formData.matchScore === 'number' && (
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {formData.matchScore}%
              </span>
            )}
          </button>

          <button
            id="tab-resume-button"
            onClick={() => setActiveTab('resume')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'resume'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI Resume Tailor</span>
          </button>

          <button
            id="tab-cover-button"
            onClick={() => setActiveTab('coverLetter')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'coverLetter'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>AI Cover Letter</span>
          </button>

          <button
            id="tab-interview-button"
            onClick={() => setActiveTab('interview')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'interview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>AI Interview Coach</span>
          </button>

          <button
            id="tab-rounds-button"
            onClick={() => setActiveTab('rounds')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'rounds'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Interview Rounds</span>
            {(formData.rounds || []).length > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                {(formData.rounds || []).length}
              </span>
            )}
          </button>

          <button
            id="tab-offer-button"
            onClick={() => setActiveTab('offer')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'offer'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Offer & Compensation</span>
            {formData.stage === 'offer' && (
              <span className="ml-1 text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Offer
              </span>
            )}
          </button>

          <button
            id="tab-email-button"
            onClick={() => setActiveTab('email')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>AI Email Drafter</span>
          </button>

          <button
            id="tab-details-button"
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Details & Notes</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI MATCH & FIT */}
          {activeTab === 'match' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/60">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                    <span className="text-2xl font-black leading-none">
                      {typeof formData.matchScore === 'number' ? formData.matchScore : '--'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Match %
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Candidate Fit Evaluation
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                      {formData.summary ||
                        'Run AI match analysis to evaluate overlap with your resume profile, identify gap keywords, and extract core requirements.'}
                    </p>
                  </div>
                </div>

                <button
                  id="re-analyze-button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{formData.matchScore ? 'Re-Analyze Fit' : 'Analyze Fit Now'}</span>
                </button>
              </div>

              {/* Skills Overlap & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matching Skills */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Matching Skills & Strengths
                  </h4>
                  {formData.matchingSkills && formData.matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.matchingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Run analysis to see matching skills.</p>
                  )}
                </div>

                {/* Missing / Gap Skills */}
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Identified Gap Skills (ATS Keywords)
                  </h4>
                  {formData.missingSkills && formData.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No major missing skills identified.</p>
                  )}
                </div>
              </div>

              {/* Core Requirements */}
              {formData.keyRequirements && formData.keyRequirements.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    Key Extracted Requirements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {formData.keyRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Recommendations */}
              {formData.recommendations && formData.recommendations.length > 0 && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Tactical Strategy to Win the Role
                  </h4>
                  <ul className="space-y-1.5 text-xs text-indigo-900 dark:text-indigo-200">
                    {formData.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI RESUME TAILOR */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                <div>
                  <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Targeted Resume Bullet Points (XYZ Formula)
                  </h3>
                  <p className="text-xs text-blue-800/80 dark:text-blue-300">
                    AI crafts high-impact accomplishment bullets tailored to {formData.company} using
                    ATS keywords from the job description.
                  </p>
                </div>
                <button
                  id="tailor-resume-button"
                  onClick={handleTailorResume}
                  disabled={isTailoring}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0 disabled:opacity-50"
                >
                  {isTailoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{formData.tailoredBullets ? 'Regenerate Bullets' : 'Generate Bullets'}</span>
                </button>
              </div>

              {/* Tailored Summary */}
              {formData.tailoredSummary && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Tailored Executive Summary
                    </h4>
                    <button
                      onClick={() => handleCopy(formData.tailoredSummary || '', 'summary')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
                    >
                      {copiedKey === 'summary' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {formData.tailoredSummary}
                  </p>
                </div>
              )}

              {/* Bullet Points */}
              {formData.tailoredBullets && formData.tailoredBullets.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Accomplishment Bullets for this Application
                    </h4>
                    <button
                      onClick={() =>
                        handleCopy((formData.tailoredBullets || []).join('\n• '), 'all-bullets')
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {copiedKey === 'all-bullets' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy All Bullets</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.tailoredBullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold leading-relaxed">•</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(bullet, `bullet-${idx}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md shrink-0 transition-colors"
                          title="Copy bullet point"
                        >
                          {copiedKey === `bullet-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">
                    Click "Generate Bullets" to produce tailored accomplishment bullets based on your
                    profile and this job description.
                  </p>
                </div>
              )}

              {/* ATS Keywords */}
              {formData.atsKeywords && formData.atsKeywords.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Priority ATS Keywords to Include in Your Resume
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.atsKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleCopy(kw, `kw-${idx}`)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                        title="Click to copy"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI COVER LETTER */}
          {activeTab === 'coverLetter' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Generate Tailored Cover Letter
                    </h3>
                    <p className="text-xs text-blue-800/80 dark:text-blue-300">
                      Crafts a custom narrative matching your experience to {formData.company}'s requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={coverLetterTone}
                    onChange={(e) => setCoverLetterTone(e.target.value)}
                    className="text-xs font-semibold rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Confident & Impactful">Tone: Confident & Impactful</option>
                    <option value="Warm & Enthusiastic">Tone: Warm & Enthusiastic</option>
                    <option value="Senior & Executive">Tone: Senior & Strategic</option>
                    <option value="Crisp & Concise">Tone: Crisp & Concise</option>
                  </select>

                  <button
                    id="generate-cover-letter-button"
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingCover}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    {isGeneratingCover ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileCode className="w-4 h-4" />
                    )}
                    <span>{formData.coverLetter ? 'Regenerate' : 'Generate'}</span>
                  </button>
                </div>
              </div>

              {formData.coverLetter ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {formData.coverLetterSubject || 'Generated Letter'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(formData.coverLetter || '', 'cover-letter')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {copiedKey === 'cover-letter' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy to Clipboard</span>
                      </button>

                      <button
                        onClick={() => {
                          const blob = new Blob([formData.coverLetter || ''], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Cover-Letter-${formData.company}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={formData.coverLetter}
                    onChange={(e) => {
                      const updated = { ...formData, coverLetter: e.target.value };
                      setFormData(updated);
                      onUpdate(updated);
                    }}
                    rows={14}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileCode className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">
                    Click "Generate" to craft a personalized cover letter.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI INTERVIEW PREP & MOCK PRACTICE */}
          {activeTab === 'interview' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
                <div>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Role-Specific Interview Prep & Interactive Mock Coach
                  </h3>
                  <p className="text-xs text-amber-900/80 dark:text-amber-300">
                    Practice realistic questions with AI grading on your STAR technique and actionable coaching!
                  </p>
                </div>
                <button
                  id="generate-interview-prep-button"
                  onClick={handleGenerateInterviewPrep}
                  disabled={isPreppingInterview}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0 disabled:opacity-50"
                >
                  {isPreppingInterview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>
                    {formData.interviewQuestions && formData.interviewQuestions.length > 0
                      ? 'Regenerate Questions'
                      : 'Generate Questions'}
                  </span>
                </button>
              </div>

              {formData.interviewQuestions && formData.interviewQuestions.length > 0 ? (
                <div className="space-y-5">
                  {formData.interviewQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {q.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                            {idx + 1}. {q.question}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/60">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            🎯 Interviewer Intent:
                          </span>
                          <p className="text-slate-600 dark:text-slate-400">{q.whyAsked}</p>
                        </div>
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                            💡 STAR Strategy Tips:
                          </span>
                          <p className="text-blue-800/90 dark:text-blue-300">{q.tips}</p>
                        </div>
                      </div>

                      {/* Sample Star Answer Accordion */}
                      <details className="text-xs group">
                        <summary className="font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer list-none flex items-center gap-1">
                          <span>▸ View Exemplary STAR Model Answer</span>
                        </summary>
                        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 italic border-l-2 border-blue-500">
                          "{q.sampleAnswer}"
                        </div>
                      </details>

                      {/* Interactive Mock Practice Box */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Practice Your Answer (Interactive Coach):</span>
                          {q.feedback && (
                            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> Score: {q.feedback.score}/100 ({q.feedback.rating})
                            </span>
                          )}
                        </label>
                        <textarea
                          placeholder="Type your draft answer here (e.g. In my last role, we experienced... so I decided to... resulting in...)"
                          value={userDraftAnswers[q.id] ?? q.userAnswer ?? ''}
                          onChange={(e) =>
                            setUserDraftAnswers({ ...userDraftAnswers, [q.id]: e.target.value })
                          }
                          rows={3}
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSubmitAnswerForCritique(q)}
                            disabled={critiqueLoadingId === q.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {critiqueLoadingId === q.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>Get AI Answer Critique</span>
                          </button>
                        </div>

                        {/* AI Feedback Display */}
                        {q.feedback && (
                          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                AI Critique & Score: {q.feedback.score}/100
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-[10px] font-bold text-emerald-900 dark:text-emerald-100">
                                {q.feedback.rating}
                              </span>
                            </div>
                            <div className="text-emerald-950 dark:text-emerald-100">
                              <p className="font-semibold">Coaching Tip: {q.feedback.coachingTip}</p>
                            </div>
                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900 text-slate-800 dark:text-slate-200">
                              <span className="font-bold block text-[11px] text-slate-500 uppercase mb-1">
                                Polished STAR Version:
                              </span>
                              <p className="italic">"{q.feedback.refinedAnswer}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Questions to Ask Interviewer */}
                  {formData.questionsToAsk && formData.questionsToAsk.length > 0 && (
                    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 mb-2">
                        High-Impact Questions to Ask Your Interviewer
                      </h4>
                      <ul className="space-y-1.5 text-xs text-indigo-900 dark:text-indigo-200">
                        {formData.questionsToAsk.map((questionText, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">?</span>
                            <span>{questionText}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <MessageSquareQuote className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">
                    Click "Generate Questions" to create company-specific behavioral and technical interview questions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI EMAIL DRAFTER */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Draft Outreach & Follow-up Communications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Email Purpose
                    </label>
                    <select
                      value={emailType}
                      onChange={(e) => setEmailType(e.target.value as any)}
                      className="w-full text-xs font-medium rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="thank_you">Post-Interview Thank You Note</option>
                      <option value="follow_up">Application Status Follow-up</option>
                      <option value="outreach">Recruiter Cold Outreach / InMail</option>
                      <option value="negotiation">Offer Negotiation Counter-Proposal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova or Hiring Manager"
                      value={formData.contactName || ''}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full text-xs font-medium rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Specific Context / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. We discussed web vitals during round 2, or requesting 10k additional base salary"
                    value={emailContext}
                    onChange={(e) => setEmailContext(e.target.value)}
                    className="w-full text-xs font-medium rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    id="draft-email-button"
                    onClick={handleDraftEmail}
                    disabled={isDraftingEmail}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    {isDraftingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Draft Email with AI</span>
                  </button>
                </div>
              </div>

              {draftedEmail && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Subject Line
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {draftedEmail.subject}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(`Subject: ${draftedEmail.subject}\n\n${draftedEmail.body}`, 'full-email')
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
                    >
                      {copiedKey === 'full-email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Email</span>
                    </button>
                  </div>

                  <textarea
                    value={draftedEmail.body}
                    onChange={(e) => setDraftedEmail({ ...draftedEmail, body: e.target.value })}
                    rows={8}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB: INTERVIEW ROUNDS & STAGES */}
          {activeTab === 'rounds' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/60">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Interview Loop & Round Tracker
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Track each interview stage for {formData.company}, prepare targeted talking points, and mark completion.
                  </p>
                </div>
                <button
                  id="toggle-add-round-form-button"
                  onClick={() => setShowAddRoundForm(!showAddRoundForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddRoundForm ? 'Cancel' : 'Add Round'}</span>
                </button>
              </div>

              {/* Add Round Form */}
              {showAddRoundForm && (
                <form
                  onSubmit={handleAddRound}
                  className="p-5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 space-y-4 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    Schedule New Interview Round
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Round Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. System Design Loop"
                        value={roundNameInput}
                        onChange={(e) => setRoundNameInput(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={roundDateInput}
                        onChange={(e) => setRoundDateInput(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={roundTimeInput}
                        onChange={(e) => setRoundTimeInput(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Interviewer Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Connor"
                        value={roundInterviewerInput}
                        onChange={(e) => setRoundInterviewerInput(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Interviewer Title / Department
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Principal UI Architect"
                        value={roundInterviewerTitleInput}
                        onChange={(e) => setRoundInterviewerTitleInput(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Prep Focus & Key Topics
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed caching, micro-frontends, state synchronization..."
                      value={roundPrepFocusInput}
                      onChange={(e) => setRoundPrepFocusInput(e.target.value)}
                      className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Notes / Debrief
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Post-interview feedback or questions to remember..."
                      value={roundNotesInput}
                      onChange={(e) => setRoundNotesInput(e.target.value)}
                      className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRoundForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                    >
                      Save Round
                    </button>
                  </div>
                </form>
              )}

              {/* Rounds List */}
              <div className="space-y-3">
                {(!formData.rounds || formData.rounds.length === 0) ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 mb-2">
                      No interview rounds recorded for this application yet.
                    </p>
                    <button
                      onClick={() => setShowAddRoundForm(true)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add Your First Round
                    </button>
                  </div>
                ) : (
                  formData.rounds.map((round, idx) => (
                    <div
                      key={round.id || idx}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        round.completed
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleRoundComplete(round.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                          title={round.completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {round.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                round.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {round.roundName}
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              {round.date} {round.time ? `• ${round.time}` : ''}
                            </span>
                          </div>

                          {round.interviewerName && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>
                                {round.interviewerName}{' '}
                                {round.interviewerTitle ? `(${round.interviewerTitle})` : ''}
                              </span>
                            </p>
                          )}

                          {round.prepFocus && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              Focus: {round.prepFocus}
                            </p>
                          )}

                          {round.notes && (
                            <p className="text-xs text-slate-500 italic">
                              "{round.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleDeleteRound(round.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Delete round"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: OFFER & COMPENSATION BREAKDOWN */}
          {activeTab === 'offer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Offer Compensation Breakdown & AI Counter-Strategist
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Break down total compensation packages (Base, Bonus, Equity, Sign-on) and simulate counter-offers.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    Year 1 Total Comp
                  </span>
                  <span className="text-lg font-black text-emerald-900 dark:text-white">
                    ${(
                      (Number(offerForm.baseSalary) || 0) +
                      (Number(offerForm.annualBonus) || 0) +
                      (Number(offerForm.annualEquity) || 0) +
                      (Number(offerForm.signOnBonus) || 0) +
                      (Number(offerForm.otherBenefits) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Offer input grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Base Salary ($ / year) *
                  </label>
                  <input
                    type="number"
                    value={offerForm.baseSalary || 0}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, baseSalary: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Bonus / Target Incentive ($)
                  </label>
                  <input
                    type="number"
                    value={offerForm.annualBonus || 0}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, annualBonus: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Equity / RSUs ($ / year)
                  </label>
                  <input
                    type="number"
                    value={offerForm.annualEquity || 0}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, annualEquity: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sign-on Bonus ($)
                  </label>
                  <input
                    type="number"
                    value={offerForm.signOnBonus || 0}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, signOnBonus: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Stipends / Wellness / Benefits ($ / yr)
                  </label>
                  <input
                    type="number"
                    value={offerForm.otherBenefits || 0}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, otherBenefits: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    PTO Days (Annual)
                  </label>
                  <input
                    type="number"
                    value={offerForm.ptoDays || 20}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, ptoDays: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Offer Acceptance Deadline
                  </label>
                  <input
                    type="date"
                    value={offerForm.deadlineDate || ''}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, deadlineDate: e.target.value })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Personal Negotiation Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plan to counter for $15k sign-on bump before Friday deadline"
                    value={offerForm.negotiationNotes || ''}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, negotiationNotes: e.target.value })
                    }
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  id="save-offer-details-button"
                  onClick={() => handleSaveOfferDetails()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Save Offer Details
                </button>
              </div>

              {/* AI Negotiation Strategist Box */}
              <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>AI Offer Counter & Negotiation Strategist</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluate leverage and generate ready-to-send counter-offer proposals.
                    </p>
                  </div>

                  <button
                    id="run-modal-negotiation-button"
                    onClick={handleRunOfferNegotiation}
                    disabled={isAnalyzingModalNegotiation}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isAnalyzingModalNegotiation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    <span>Analyze & Counter</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Competing Offers / Interview Status
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. In final loop at Stripe; have $175k offer elsewhere"
                      value={modalNegotiationNotes}
                      onChange={(e) => setModalNegotiationNotes(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Top Priorities
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Higher base salary and remote flexibility"
                      value={modalCandidatePriorities}
                      onChange={(e) => setModalCandidatePriorities(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {offerForm.negotiationStrategy && (
                  <div className="space-y-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/60">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Leverage
                        </span>
                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {offerForm.negotiationStrategy.leverageLevel} Leverage
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Target Base
                        </span>
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          ${offerForm.negotiationStrategy.targetBaseSalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Target Total Comp
                        </span>
                        <span className="text-base font-bold text-emerald-600">
                          ${offerForm.negotiationStrategy.targetTotalComp.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <strong className="text-slate-800 dark:text-slate-200 block">Market Evaluation:</strong>
                      <p className="text-slate-600 dark:text-slate-400">
                        {offerForm.negotiationStrategy.marketAnalysis}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-slate-800 dark:text-slate-200">
                          Counter-Proposal Email Draft
                        </strong>
                        <button
                          onClick={() =>
                            handleCopy(
                              offerForm.negotiationStrategy?.counterProposalEmail || '',
                              'modal-counter'
                            )
                          }
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
                        >
                          {copiedKey === 'modal-counter' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy Email</span>
                        </button>
                      </div>
                      <pre className="text-xs text-slate-600 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                        {offerForm.negotiationStrategy.counterProposalEmail}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DETAILS & NOTES */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Workplace Type
                  </label>
                  <select
                    value={formData.workplaceType}
                    onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value as any })}
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
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Salary / Compensation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $160,000 - $190,000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Next Milestone Date
                  </label>
                  <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Milestone Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technical Round 2, Follow-up"
                    value={formData.deadlineLabel || ''}
                    onChange={(e) => setFormData({ ...formData, deadlineLabel: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Recruiter / Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName || ''}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    value={formData.jobUrl || ''}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Personal Notes & Interview Debriefs
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key observations, interview feedback, referral contacts..."
                  className="w-full text-xs rounded-lg p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Job Description (Used by AI tools)
                </label>
                <textarea
                  rows={6}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full text-xs rounded-lg p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
