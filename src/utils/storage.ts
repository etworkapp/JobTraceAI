import { JobApplication, UserProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  title: 'Senior Frontend & Full Stack Engineer',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 349-8201',
  location: 'San Francisco, CA (Open to Remote)',
  targetSalary: '$160,000 - $195,000',
  skills: [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'Tailwind CSS',
    'GraphQL',
    'REST APIs',
    'System Design',
    'Performance Optimization',
    'State Management',
    'CI/CD',
    'Jest & Cypress',
  ],
  summary:
    'Product-minded Senior Frontend Engineer with 6+ years of experience crafting high-performance, accessible web applications and developer tools. Track record of improving frontend latency, architecting design systems, and partnering directly with design and product teams to ship delightful customer experiences.',
  experience:
    '- Senior Frontend Engineer at CloudScale (2022 - Present): Led migration to React 18 & Vite, decreasing bundle size by 38% and initial load time by 1.2s. Spearheaded internal UI component library adopted across 14 product squads.\n- Full Stack Engineer at TechFlow (2019 - 2022): Developed real-time collaborative workspace canvas using WebSockets and TypeScript, supporting 250,000+ daily active users with 99.98% uptime.\n- Software Developer at DevLaunch (2017 - 2019): Built customer onboarding workflows and automated billing integrations with Stripe.',
  education: 'B.S. in Computer Science, UC Berkeley (2017)',
};

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-stripe-01',
    company: 'Stripe',
    jobTitle: 'Senior Frontend Engineer, Dashboard',
    location: 'San Francisco, CA',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    salary: '$175,000 - $210,000 + Equity',
    stage: 'interview',
    appliedDate: '2026-08-28',
    deadline: '2026-09-18',
    deadlineLabel: 'Final Virtual Onsite (4 Rounds)',
    jobUrl: 'https://stripe.com/jobs/frontend-dashboard',
    contactName: 'Elena Rostova',
    contactEmail: 'elena.r@stripe.com',
    contactRole: 'Lead Technical Recruiter',
    notes:
      'Completed hiring manager chat and technical screen with great feedback! Round 4 on Friday covers System Design & UI performance deep-dive.',
    jobDescription: `About the role:
At Stripe, our dashboard is the central nerve center for millions of businesses worldwide. We are looking for an experienced Senior Frontend Engineer to build resilient, accessible, and ultra-fast financial interfaces.

Requirements:
- 5+ years building complex web applications with React and TypeScript.
- Strong mental model of browser rendering, web performance, and state architecture.
- Passion for visual craft, typography, accessibility (WCAG AA), and ergonomic API design.
- Experience with real-time financial telemetry, data visualization, and large-scale design systems.`,
    matchScore: 94,
    matchingSkills: ['React', 'TypeScript', 'System Design', 'Performance Optimization', 'Tailwind CSS'],
    missingSkills: ['FinTech Compliance', 'Protobuf'],
    keyRequirements: [
      '5+ years with React and modern TypeScript in high-scale web applications',
      'Deep expertise in browser performance profiling and memory optimization',
      'Track record building robust design systems and accessible UI components',
    ],
    strengths: [
      'Your work reducing bundle size by 38% at CloudScale is a direct match for Stripe Dashboard latency goals.',
      'Strong architecture track record across multi-team component libraries.',
    ],
    recommendations: [
      'Prepare a clear narrative on how you handle telemetry reliability during network degradation.',
      'Mention your experience with financial data tables, accessibility shortcuts, and keyboard navigation.',
    ],
    summary:
      'Exceptional match for Stripe Dashboard engineering. Your profile directly satisfies 90%+ of their technical prerequisites.',
    tailoredSummary:
      'Product-focused Senior Frontend Engineer with 6+ years driving web application performance, complex state architectures, and scalable UI systems. Proven success decreasing load latency by 1.2s and architecting enterprise design systems supporting millions of transactions.',
    tailoredBullets: [
      'Architected high-throughput data tables and financial telemetry views in React and TypeScript, handling 50,000+ real-time row updates with 60fps rendering.',
      'Engineered core design system primitives with 100% WCAG AA compliance and comprehensive keyboard navigation, cutting UI implementation defects by 45%.',
      'Identified and resolved main-thread blocking bottlenecks using Chrome DevTools memory profilers, improving Core Web Vitals (LCP & INP) by 32%.',
      'Collaborated with product designers to introduce fluid micro-interactions and optimistic mutations, boosting transaction workflow completion rates.',
    ],
    atsKeywords: ['React 18', 'TypeScript', 'Design Systems', 'Web Performance', 'WCAG AA', 'Telemetry', 'Core Web Vitals'],
    rounds: [
      {
        id: 'r1',
        roundName: 'Recruiter Screening',
        date: '2026-09-01',
        time: '14:00',
        interviewerName: 'Elena Rostova',
        interviewerTitle: 'Lead Technical Recruiter',
        completed: true,
        notes: 'Great conversation regarding CloudScale latency work and team leadership goals.',
      },
      {
        id: 'r2',
        roundName: 'Technical Coding & Architecture',
        date: '2026-09-08',
        time: '11:00',
        interviewerName: 'Kenji Sato',
        interviewerTitle: 'Staff UI Engineer',
        completed: true,
        notes: 'Built an optimized virtualized feed with debounced search. 100% positive feedback.',
      },
      {
        id: 'r3',
        roundName: 'System Design: Real-time Telemetry & Edge Caching',
        date: '2026-09-18',
        time: '10:00',
        interviewerName: 'Amara Walker',
        interviewerTitle: 'Engineering Director',
        completed: false,
        notes: 'Focus on Web Workers, websocket burst buffers, and state normalization.',
        prepFocus: 'Review TanStack Virtual, Web Workers, and idempotent websocket batching.',
      },
      {
        id: 'r4',
        roundName: 'Values & Product Collaboration',
        date: '2026-09-18',
        time: '13:30',
        interviewerName: 'Marcus Vance',
        interviewerTitle: 'Product Design VP',
        completed: false,
        notes: 'Review how engineering and design collaborate on ambiguous design system specs.',
      },
    ],
    interviewQuestions: [
      {
        id: 'q1',
        category: 'System & Design',
        question: 'How would you architect an ultra-fast, virtualized transaction ledger in React that updates in real time?',
        whyAsked: 'Tests ability to balance DOM virtualization, memory management, and websocket burst rates.',
        tips: 'Discuss windowing/virtualization (e.g., TanStack Virtual), immutable state patches, debounce frames, and memoization boundaries.',
        sampleAnswer: 'I would decouple websocket ingestion into an off-thread Web Worker or batched queue, normalize transaction state by ID, and utilize a lightweight virtualized list to render only the visible viewport nodes.',
        userAnswer: 'I would use a virtualized list so only the rows in view are rendered, batch incoming websocket updates using requestAnimationFrame, and store data in normalized state.',
        feedback: {
          score: 92,
          rating: 'Strong',
          strengths: ['Mentions viewport virtualization', 'Identifies frame-rate batching via requestAnimationFrame'],
          areasForImprovement: ['Mention handling memory limits when streaming millions of events over long sessions.'],
          refinedAnswer: 'I would virtualize the DOM viewport with TanStack Virtual, batch incoming websocket updates with requestAnimationFrame, and keep an off-screen ring buffer to cap memory consumption under heavy traffic spikes.',
          coachingTip: 'Always mention how you safeguard client memory from runaway streaming data!',
        },
      },
      {
        id: 'q2',
        category: 'Behavioral',
        question: 'Tell me about a time you had to push back on a product feature because of performance or technical debt implications.',
        whyAsked: 'Assesses senior-level judgment, cross-functional communication, and engineering rigor.',
        tips: 'Use the STAR format. Explain how you offered a constructive alternative rather than just saying no.',
        sampleAnswer: 'When a stakeholder proposed rendering uncapped charts on dashboard startup, I demonstrated the 3-second TTI impact with DevTools traces and proposed on-demand lazy-loading with skeleton placeholders, satisfying both business needs and speed benchmarks.',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-linear-02',
    company: 'Linear',
    jobTitle: 'Product Engineer',
    location: 'Remote (Worldwide)',
    workplaceType: 'remote',
    employmentType: 'full-time',
    salary: '$160,000 - $190,000 + Equity',
    stage: 'screening',
    appliedDate: '2026-09-02',
    deadline: '2026-09-15',
    deadlineLabel: 'Recruiter Chat with Marcus',
    jobUrl: 'https://linear.app/careers/product-engineer',
    contactName: 'Marcus Lindqvist',
    contactEmail: 'marcus@linear.app',
    contactRole: 'Talent Lead',
    notes:
      'Recruiter intro call scheduled for Tuesday 10am PT. Review Linear sync engine blog post and client-first sync architecture beforehand.',
    jobDescription: `Linear is looking for a Product Engineer who obsesses over speed, keyboard shortcuts, and seamless offline-first synchronization.

What we value:
- Full-stack mindset: Comfortable moving between React client code, local SQLite/IndexedDB caching, and backend API endpoints.
- Uncompromising eye for UI detail and micro-interactions.
- Passion for developer workflows and issue tracking productivity.`,
    matchScore: 89,
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Performance Optimization'],
    missingSkills: ['SQLite WASM', 'CRDTs'],
    keyRequirements: [
      'Proven expertise building snappy, keyboard-driven desktop-grade web applications',
      'Understanding of optimistic UI mutations and local-first data caching',
      'High autonomy and cross-functional product taste',
    ],
    strengths: [
      'Prior experience building real-time collaborative workspaces with WebSockets aligns closely with Linear philosophy.',
      'Strong aesthetic and typography instincts in personal projects.',
    ],
    recommendations: [
      'Showcase your deep appreciation for keyboard-first navigation and sub-100ms response latencies in the interview.',
    ],
    summary:
      'High synergy with Linear’s engineering culture. Emphasize your real-time collaborative experience at TechFlow.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-vercel-03',
    company: 'Vercel',
    jobTitle: 'Senior Full Stack Engineer, Developer Experience',
    location: 'Remote (US/Canada)',
    workplaceType: 'remote',
    employmentType: 'full-time',
    salary: '$170,000 base + $45,000 Equity',
    stage: 'offer',
    appliedDate: '2026-08-14',
    deadline: '2026-09-21',
    deadlineLabel: 'Offer Acceptance Deadline',
    jobUrl: 'https://vercel.com/careers/dx-engineer',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sarah.j@vercel.com',
    contactRole: 'Head of Technical Recruiting',
    notes:
      'Received official written offer! $170k base + equity. Evaluating against Stripe timeline. AI Copilot recommended counter-proposal strategy for sign-on bonus.',
    jobDescription: `At Vercel, our mission is to enable frontend developers to do their best work. You will join the Developer Experience engineering team creating CLI tools, web preview workflows, and Next.js developer instrumentation.`,
    matchScore: 96,
    matchingSkills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'CI/CD', 'REST APIs'],
    missingSkills: [],
    keyRequirements: [
      'Extensive production experience with Next.js App Router and Edge runtime',
      'Passion for developer tooling, CLI ergonomics, and build pipelines',
      'Strong technical writing and community communication',
    ],
    summary: 'Offer in hand! Outstanding fit with high compensation and remote flexibility.',
    offerDetails: {
      baseSalary: 170000,
      annualBonus: 17000,
      annualEquity: 45000,
      signOnBonus: 20000,
      otherBenefits: 9500,
      relocationOrRemoteStipend: 3000,
      ptoDays: 25,
      deadlineDate: '2026-09-21',
      negotiationNotes: 'Strong package. Plan to negotiate base to $182k using Stripe final round leverage.',
      negotiationStrategy: {
        leverageLevel: 'High',
        marketAnalysis: 'Vercel package is in the top 15% for remote DX engineering roles. The equity component is very strong with high growth upside.',
        targetBaseSalary: 182000,
        targetTotalComp: 264000,
        suggestedAsks: [
          'Request an increase in base salary from $170k to $182k to match Bay Area cost benchmarks.',
          'Propose accelerating first-year equity vest or standard 1-year cliff with quarterly vesting.',
          'Request $3,500 annual home-office and wellness expense reimbursement.',
        ],
        tacticalPoints: [
          'Highlight that you are currently in final-round loops with Stripe and require parity in base compensation.',
          'Confirm that if base is adjusted to $182k, you will sign the offer within 24 hours and withdraw from other loops.',
        ],
        counterProposalEmail: 'Dear Sarah,\n\nThank you again for extending this offer to join Vercel as Senior Full Stack Engineer! I am beyond excited about the mission and the Developer Experience team.\n\nAfter reviewing the details alongside other active processes, I would love to see if we can adjust base salary to $182,000. If we are able to meet this benchmark, I would be thrilled to sign immediately and begin onboarding!\n\nBest,\nAlex Rivera',
      },
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-datadog-06',
    company: 'Datadog',
    jobTitle: 'Senior Frontend Engineer, Observability',
    location: 'San Francisco, CA / Remote',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    salary: '$165,000 base + $40,000 Equity',
    stage: 'offer',
    appliedDate: '2026-08-20',
    deadline: '2026-09-25',
    deadlineLabel: 'Offer Review & Comparison',
    jobUrl: 'https://careers.datadoghq.com/detail/frontend-obs',
    contactName: 'Chloe Bennett',
    contactEmail: 'chloe.bennett@datadoghq.com',
    contactRole: 'Senior Talent Acquisition',
    notes: 'Offer received! 2 days in office in SF. Solid base salary and established public RSU liquidity.',
    jobDescription: `Join Datadog to build the future of real-time monitoring and visualization. You will build high-density charts and complex interactive dashboards for global infrastructure teams.`,
    matchScore: 92,
    matchingSkills: ['React', 'TypeScript', 'Performance Optimization', 'System Design', 'REST APIs'],
    missingSkills: ['Go'],
    summary: 'Second competitive offer received! Liquid public RSUs provide strong downside protection.',
    offerDetails: {
      baseSalary: 165000,
      annualBonus: 24750,
      annualEquity: 40000,
      signOnBonus: 15000,
      otherBenefits: 11000,
      relocationOrRemoteStipend: 1500,
      ptoDays: 22,
      deadlineDate: '2026-09-25',
      negotiationNotes: 'Public company RSUs (DDOG) are liquid. Use Vercel offer to negotiate sign-on bonus to $25k.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-airbnb-04',
    company: 'Airbnb',
    jobTitle: 'Software Engineer, Core Guest UI',
    location: 'Seattle, WA',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    salary: '$165,000 - $195,000',
    stage: 'applied',
    appliedDate: '2026-09-08',
    deadline: '2026-09-17',
    deadlineLabel: 'Send 1-week follow-up email',
    jobUrl: 'https://careers.airbnb.com/positions/guest-ui',
    contactName: 'David Chen',
    contactEmail: 'david.chen@airbnb.com',
    contactRole: 'Engineering Manager',
    notes: 'Submitted application through employee referral from UC Berkeley alumni network. Sent confirmation note.',
    jobDescription: `Airbnb is building the next generation of travel experiences. The Core Guest team crafts search, discovery, and listing pages visited by millions every day.`,
    matchScore: 85,
    matchingSkills: ['React', 'TypeScript', 'Performance Optimization', 'Tailwind CSS'],
    missingSkills: ['Mobile React Native'],
    summary: 'Awaiting recruiter review. Follow-up email prepared in AI Drafter.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-figma-05',
    company: 'Figma',
    jobTitle: 'Frontend Engineer, Design Systems',
    location: 'San Francisco, CA',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    salary: '$165,000 - $190,000',
    stage: 'wishlist',
    appliedDate: '2026-09-12',
    deadline: '2026-09-16',
    deadlineLabel: 'Tailor resume & submit',
    jobUrl: 'https://figma.com/careers/design-systems',
    notes:
      'Saved posting to customize resume bullets with AI tailor before submitting. Target applying by Wednesday.',
    jobDescription: `Help build the foundational design tokens and component systems that power Figma and FigJam across web and desktop.`,
    matchScore: 91,
    matchingSkills: ['React', 'TypeScript', 'System Design', 'Tailwind CSS', 'State Management'],
    missingSkills: ['WebGL/WebAssembly', 'Canvas APIs'],
    summary: 'Ideal match for design systems background. Customize resume before submission.',
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEYS = {
  APPLICATIONS: 'job_app_tracker_applications_v1',
  USER_PROFILE: 'job_app_tracker_profile_v1',
};

export function loadApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      saveApplications(INITIAL_APPLICATIONS);
      return INITIAL_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPLICATIONS;
  } catch (err) {
    console.error('Error loading applications from localStorage:', err);
    return INITIAL_APPLICATIONS;
  }
}

export function saveApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (err) {
    console.error('Error saving applications to localStorage:', err);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading user profile:', err);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export function exportDataAsJSON(): void {
  const data = {
    exportedAt: new Date().toISOString(),
    profile: loadUserProfile(),
    applications: loadApplications(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `job-applications-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDataFromJSON(
  jsonString: string
): { success: boolean; message: string; count?: number } {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && Array.isArray(parsed.applications)) {
      saveApplications(parsed.applications);
      if (parsed.profile) {
        saveUserProfile(parsed.profile);
      }
      return {
        success: true,
        message: `Successfully imported ${parsed.applications.length} applications and user profile.`,
        count: parsed.applications.length,
      };
    }
    return { success: false, message: 'Invalid JSON backup format. Missing applications array.' };
  } catch (err: any) {
    return { success: false, message: `Failed to import JSON: ${err.message}` };
  }
}

export function resetToDefaultData(): JobApplication[] {
  saveApplications(INITIAL_APPLICATIONS);
  saveUserProfile(DEFAULT_USER_PROFILE);
  return INITIAL_APPLICATIONS;
}
