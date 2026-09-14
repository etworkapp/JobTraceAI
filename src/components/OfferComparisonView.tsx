import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Copy,
  Check,
  Plus,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  Calendar,
  Building2,
  ChevronRight,
  Loader2,
  FileText,
  Sliders,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { JobApplication, UserProfile, OfferDetails, OfferNegotiationStrategy } from '../types';
import { negotiateOffer } from '../utils/aiClient';

interface OfferComparisonViewProps {
  applications: JobApplication[];
  userProfile: UserProfile;
  onSelectApplication: (app: JobApplication) => void;
  onUpdateApplication: (app: JobApplication) => void;
}

export const OfferComparisonView: React.FC<OfferComparisonViewProps> = ({
  applications,
  userProfile,
  onSelectApplication,
  onUpdateApplication,
}) => {
  // Applications with offerDetails or stage === 'offer'
  const offerApps = applications.filter(
    (a) => a.stage === 'offer' || (a.offerDetails && a.offerDetails.baseSalary > 0)
  );

  const [selectedOfferAppId, setSelectedOfferAppId] = useState<string>(
    offerApps[0]?.id || ''
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Negotiation prompt inputs
  const [competingNotes, setCompetingNotes] = useState('');
  const [candidatePriorities, setCandidatePriorities] = useState(
    'Higher base salary, remote work flexibility, and accelerated equity grant'
  );
  const [isAnalyzingNegotiation, setIsAnalyzingNegotiation] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<OfferNegotiationStrategy | null>(
    offerApps.find((a) => a.id === selectedOfferAppId)?.offerDetails?.negotiationStrategy || null
  );

  const currentApp = applications.find((a) => a.id === selectedOfferAppId);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getYear1Comp = (details?: OfferDetails): number => {
    if (!details) return 0;
    return (
      (Number(details.baseSalary) || 0) +
      (Number(details.annualBonus) || 0) +
      (Number(details.annualEquity) || 0) +
      (Number(details.signOnBonus) || 0) +
      (Number(details.otherBenefits) || 0)
    );
  };

  const getFourYearComp = (details?: OfferDetails): number => {
    if (!details) return 0;
    const base = Number(details.baseSalary) || 0;
    const bonus = Number(details.annualBonus) || 0;
    const equityPerYear = Number(details.annualEquity) || 0;
    const signOn = Number(details.signOnBonus) || 0;
    const benefits = Number(details.otherBenefits) || 0;
    return (base + bonus + equityPerYear + benefits) * 4 + signOn;
  };

  const handleRunNegotiationAnalysis = async () => {
    if (!currentApp) return;
    setIsAnalyzingNegotiation(true);
    try {
      const result = await negotiateOffer(
        currentApp.company,
        currentApp.jobTitle,
        currentApp.offerDetails || { baseSalary: 160000, annualBonus: 16000, annualEquity: 30000, signOnBonus: 10000 },
        competingNotes,
        candidatePriorities,
        userProfile
      );
      setNegotiationResult(result);
      if (currentApp.offerDetails) {
        const updated = {
          ...currentApp,
          offerDetails: {
            ...currentApp.offerDetails,
            negotiationStrategy: result,
          },
          updatedAt: new Date().toISOString(),
        };
        onUpdateApplication(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to analyze negotiation strategy');
    } finally {
      setIsAnalyzingNegotiation(false);
    }
  };

  const maxYear1 = Math.max(...offerApps.map((a) => getYear1Comp(a.offerDetails)), 250000);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Compensation & Offer Matrix</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Offer Comparison & AI Negotiation Strategist
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
              Analyze side-by-side total compensation (Year 1 vs. 4-Year vesting), evaluate competitive leverage, and generate data-driven counter-offer scripts and emails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
              {offerApps.length} Active {offerApps.length === 1 ? 'Offer' : 'Offers'} Logged
            </span>
          </div>
        </div>
      </div>

      {offerApps.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <DollarSign className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Offers in Pipeline Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            When you receive formal or verbal offers, drag an application to the <strong>Offer Received</strong> stage or open any job card and enter offer compensation details to compare packages.
          </p>
          <button
            onClick={() => {
              if (applications.length > 0) {
                onSelectApplication(applications[0]);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Select Job to Add Offer
          </button>
        </div>
      ) : (
        <>
          {/* Side-by-Side Offer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {offerApps.map((app) => {
              const details = app.offerDetails;
              const y1 = getYear1Comp(details);
              const y4 = getFourYearComp(details);
              const isSelected = app.id === selectedOfferAppId;

              return (
                <div
                  key={app.id}
                  id={`offer-card-${app.id}`}
                  onClick={() => {
                    setSelectedOfferAppId(app.id);
                    setNegotiationResult(app.offerDetails?.negotiationStrategy || null);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white/80 dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                      Selected for AI Strategy
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {app.company}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {app.jobTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="capitalize">{app.workplaceType}</span>
                        <span>•</span>
                        <span>{app.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Big Total Comp Number */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Year 1 Total Compensation
                    </span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      ${y1.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>4-Year Est. Value:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        ${y4.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Comp Breakdown Items */}
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Base Salary:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${(details?.baseSalary || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Annual Bonus:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${(details?.annualBonus || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Annual Equity / RSUs:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${(details?.annualEquity || 0).toLocaleString()} / yr
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Sign-on Bonus:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        ${(details?.signOnBonus || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">PTO Days:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {details?.ptoDays || 20} Days
                      </span>
                    </div>
                    {details?.deadlineDate && (
                      <div className="flex items-center justify-between py-1 text-amber-700 dark:text-amber-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Decision Deadline:
                        </span>
                        <span>{details.deadlineDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Relative Comp Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${((details?.baseSalary || 0) / maxYear1) * 100}%` }}
                        title="Base Salary"
                      />
                      <div
                        className="bg-indigo-500 h-full"
                        style={{ width: `${((details?.annualBonus || 0) / maxYear1) * 100}%` }}
                        title="Bonus"
                      />
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${((details?.annualEquity || 0) / maxYear1) * 100}%` }}
                        title="Equity"
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${((details?.signOnBonus || 0) / maxYear1) * 100}%` }}
                        title="Sign-on"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Base • Bonus • Equity • Sign-on</span>
                      <span>{Math.round((y1 / maxYear1) * 100)}% of ceiling</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApplication(app);
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Edit Offer Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Offer Negotiation Strategist Panel */}
          {currentApp && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Negotiation Strategist</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Counter-Proposal & Leverage Plan for {currentApp.company}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Role: {currentApp.jobTitle} • Current Base: ${(currentApp.offerDetails?.baseSalary || 160000).toLocaleString()}
                  </p>
                </div>

                <button
                  id="generate-negotiation-strategy-button"
                  onClick={handleRunNegotiationAnalysis}
                  disabled={isAnalyzingNegotiation}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
                >
                  {isAnalyzingNegotiation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>
                    {negotiationResult ? 'Recalculate Strategy' : 'Generate Negotiation Plan'}
                  </span>
                </button>
              </div>

              {/* Input context for negotiation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Competing Offers / Leverage Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. In final loop with Stripe, or have an offer of $180k from Datadog"
                    value={competingNotes}
                    onChange={(e) => setCompetingNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Priorities
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Higher base salary, remote flexibility, or additional sign-on bonus"
                    value={candidatePriorities}
                    onChange={(e) => setCandidatePriorities(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Strategy Results */}
              {negotiationResult ? (
                <div className="space-y-6 pt-2">
                  {/* Leverage Badges & Targets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Negotiation Leverage
                      </span>
                      <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1 flex items-center gap-2">
                        <span>{negotiationResult.leverageLevel} Leverage</span>
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300 mt-1">
                        High probability of favorable counter adjustment.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                      <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                        Recommended Base Counter
                      </span>
                      <div className="text-xl font-black text-blue-900 dark:text-blue-200 mt-1">
                        ${negotiationResult.targetBaseSalary.toLocaleString()}
                      </div>
                      <p className="text-[11px] text-blue-800/80 dark:text-blue-300 mt-1">
                        +${(negotiationResult.targetBaseSalary - (currentApp.offerDetails?.baseSalary || 160000)).toLocaleString()} over current offer
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                      <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
                        Target Total Compensation
                      </span>
                      <div className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
                        ${negotiationResult.targetTotalComp.toLocaleString()}
                      </div>
                      <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300 mt-1">
                        Combined base, bonus, equity & sign-on
                      </p>
                    </div>
                  </div>

                  {/* Market Analysis */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Market Benchmark & Leverage Evaluation
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {negotiationResult.marketAnalysis}
                    </p>
                  </div>

                  {/* 2-Column: Asks and Phone Talking Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Recommended Asks & Concessions</span>
                      </h4>
                      <ul className="space-y-2">
                        {negotiationResult.suggestedAsks.map((ask, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{ask}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        <span>Phone Script & Recruiter Talking Points</span>
                      </h4>
                      <ul className="space-y-2">
                        {negotiationResult.tacticalPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <span>"{point}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Counter-Proposal Email Draft */}
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span>Ready-to-Send Counter-Proposal Email</span>
                      </h4>
                      <button
                        onClick={() => handleCopy(negotiationResult.counterProposalEmail, 'counter-email')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-100 transition-colors"
                      >
                        {copiedKey === 'counter-email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy Email Draft</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                      {negotiationResult.counterProposalEmail}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Click "Generate Negotiation Plan" to get customized counter-proposal figures, tactical phone talking points, and an email draft.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
