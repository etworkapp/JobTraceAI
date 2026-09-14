# Comprehensive Features Guide

This document provides an exhaustive, in-depth reference of all features, capabilities, and underlying workflows available in the **Job Application Tracker + AI Career Copilot**.

---

## Table of Contents
1. [Application Pipeline & Multi-View Architecture](#1-application-pipeline--multi-view-architecture)
2. [Detailed Application Inspector & Deep Dive](#2-detailed-application-inspector--deep-dive)
3. [Gemini AI Engine & Career Copilot](#3-gemini-ai-engine--career-copilot)
4. [Interview Tracking & Interactive Coach](#4-interview-tracking--interactive-coach)
5. [Offer Benchmark & Compensation Matrix](#5-offer-benchmark--compensation-matrix)
6. [Analytics & Conversion Funnel](#6-analytics--conversion-funnel)
7. [User Profile & Skills Engine](#7-user-profile--skills-engine)
8. [Data Portability & Offline Persistence](#8-data-portability--offline-persistence)

---

## 1. Application Pipeline & Multi-View Architecture

The application offers five tailored viewing modes suited to different workflow needs throughout the job search cycle.

### 1.1 Kanban Pipeline Board
- **6-Stage Standardized Recruiting Lifecycle**:
  1. **Wishlist & Saved**: Roles you are researching, tracking, or planning to apply to.
  2. **Applied**: Submitted applications with date, job portal/source (LinkedIn, Indeed, Referral, Company Site), and direct job posting URLs.
  3. **Recruiter Screening**: Initial telephone screens and talent acquisition reach-outs.
  4. **Interviewing**: Live technical assessments, take-home projects, design challenges, and hiring manager rounds.
  5. **Offer Received**: Official job offers undergoing evaluation or negotiation.
  6. **Rejected / Archived**: Completed processes preserved for conversion rate analytics and future re-application notes.
- **Card Highlights**:
  - Company logo initial badge, role title, and company name.
  - Work mode tags (`Remote`, `Hybrid`, `On-site`).
  - Compensation estimate chips.
  - Calculated AI Match Score badge (color-coded: Emerald $\ge 80\%$, Amber $60-79\%$, Slate $<60\%$).
  - Quick stage-progression buttons to advance or revert cards with one click.
  - Urgency indicators for upcoming interview deadlines or offer expiration dates.

### 1.2 Interactive Data Table (List View)
- High-density view optimized for scanning dozens of job applications simultaneously.
- **Dynamic Sorting**: Sort ascending or descending by Company Name, Role, Date Applied, Salary, Match Score, or Current Stage.
- **Multi-Factor Filtering**: Filter instantly by keyword search (company, title, skills, tags), recruitment stage, work mode, and priority level.
- **Inline Stage Selector**: Change stage dropdowns directly in the table row without opening the full card modal.
- **Quick Links**: One-click jump to the original job posting URL or direct note previews.

### 1.3 Timeline & Schedule View
- A chronological timeline mapping out past interactions and upcoming milestones.
- Groups interviews and follow-ups by date (`Upcoming`, `This Week`, `Later`, `Completed`).
- Shows assigned interviewers, round formats (Phone, Video, Coding, System Design, Behavioral), preparation status, and round results.

### 1.4 Global Header & Search Controls
- Global search bar with live filtering across title, company, requirements, notes, and tags.
- Stage counters (Stats Bar) highlighting active totals across each phase of your pipeline.
- Instant toggle between light and dark themes with persistent preference storage.
- Profile trigger modal for fine-tuning candidate background and credentials.

---

## 2. Detailed Application Inspector & Deep Dive

Clicking any application opens the comprehensive inspector modal, organized into dedicated functional tabs:

### 2.1 Role & Company Overview
- Edit company name, job title, location, salary range, job link, and job description.
- Manage source channels (Referral, LinkedIn, Direct, Recruiter Outreach).
- Keep freeform notes, recruiter contact info (names, emails, LinkedIn links), and personal rating/interest tier (1 to 5 stars).

### 2.2 Match & Skill Gap Tab
- **Match Score Gauge**: Real-time calculated compatibility percentage between your profile and the role requirements.
- **Matching Strengths**: Visual green tags showing qualifications you already have in your profile.
- **Missing Skills / Keyword Gaps**: Amber tags highlighting critical technical or domain keywords present in the job description but absent from your profile.
- **AI Recommendation Engine**: Provides a targeted action plan on how to bridge the gap or position adjacent experience during interviews.

### 2.3 ATS Resume Tailor Tab
- **Role-Targeted Summary**: Formats a 3-4 sentence professional summary tailored specifically to the company's domain and technology stack.
- **Action-Driven Bullet Points**: Generates 3-5 high-impact resume bullet points following the Google XYZ formula (`Accomplished [X] as measured by [Y], by doing [Z]`).
- **High-Value Keywords List**: Highlights the top ATS terms you should ensure appear in your submitted resume file.
- **One-Click Clipboard Copying**: Instant button to copy bullets or full summaries directly into your resume document editor.

### 2.4 Cover Letter Generator Tab
- Generates a complete, tailored 3-to-4 paragraph cover letter:
  - **Hook**: Compelling opening expressing genuine alignment with the company's mission and culture.
  - **Core Value Proposition**: Maps your specific past achievements to the top 2-3 requirements in the job description.
  - **Closing & Call to Action**: Professional closing requesting an interview conversation.
- **Tone & Customization**: Supports re-generating with specific tones or custom emphasis.
- **One-Click Export**: Copy to clipboard with preserved paragraph formatting.

### 2.5 Rounds & Contacts Tab
- Detailed sub-list of individual interview stages for the application.
- Add specific rounds (e.g. *Recruiter Screen*, *System Design*, *Values Interview*).
- Track interviewer names, titles, calendar invites, and specific preparation checklists for that round.

---

## 3. Gemini AI Engine & Career Copilot

All AI capabilities use Google's official `@google/genai` TypeScript SDK and are backed by high-precision structured prompts, with built-in offline fallbacks if an API key is not yet supplied.

### 3.1 Smart Job Description Parser
- Simply paste an unstructured job description, email thread, or job posting snippet into the Add Application modal.
- The AI extracts:
  - **Role Title**
  - **Company Name**
  - **Location & Workplace Model** (`Remote`, `Hybrid`, `On-site`)
  - **Salary Range / Compensation** (extracted or inferred)
  - **Primary Required Skills** (cleanly parsed into searchable tags)
- Allows one-click review before saving directly into your pipeline.

### 3.2 Floating Career Copilot (Side Drawer)
- An AI career coach accessible anywhere via the bottom-right action trigger.
- **Context-Aware Insights**: Automatically reads your current candidate profile, active applications, and stage counts.
- **Pre-Built Action Prompts**:
  - *Review my pipeline*: Diagnoses bottlenecks (e.g. high applied count but low screening conversion).
  - *Draft follow-up email*: Generates courteous, professional follow-up templates for applications awaiting responses.
  - *Thank-you note creator*: Drafts post-interview thank-you notes referencing specific discussions.
  - *General career strategy*: Guidance on negotiating multiple offers, handling tricky behavioral questions, and prioritizing companies.

---

## 4. Interview Tracking & Interactive Coach

### 4.1 Curated Question Generator
- Generates 4-6 tailored questions categorized into:
  - **Behavioral** (Conflict resolution, project ownership, leadership)
  - **Technical / System Architecture** (Coding patterns, frameworks, scalability)
  - **Role-Specific Scenarios** (Domain problems relevant to the company's product)
- **Why It's Asked**: Deconstructs what the hiring team is genuinely evaluating.
- **Strategic Tips**: Clear advice on which framework to apply (e.g., STAR method, Situation-Task-Action-Result).
- **High-Scoring Sample Answers**: Full model responses demonstrating authentic tone and quantifiable outcomes.

### 4.2 Interactive Practice & AI Grading Mode
- **Drafting Canvas**: Directly type or paste your intended practice response for any generated question.
- **Real-Time AI Critique**:
  - **Score**: Quantitative rating from 1 to 10.
  - **Key Strengths**: Highlights what you articulated well.
  - **Areas to Improve**: Specific critique on missing metrics, vague outcomes, or weak structure.
  - **Polished Version**: AI-rewritten revision of your answer preserving your authentic experience while elevating delivery and impact.

### 4.3 Reverse Interviewing (Questions for the Interviewer)
- Generates 4-5 strategic, insightful questions for you to ask the hiring team at the end of the interview.
- Covers team dynamics, tech debt, roadmap clarity, engineering autonomy, and success metrics.

---

## 5. Offer Benchmark & Compensation Matrix

When you reach the offer stage, evaluating competing packages requires looking beyond base salary.

### 5.1 Total Compensation (TC) Calculator
- Computes annual Total Compensation across 4 financial components:
  1. **Base Annual Salary**
  2. **Expected Annual Bonus** (percentage or fixed dollar amount)
  3. **Stock Grants / Equity** (annualized vesting calculation from 4-year grants)
  4. **Sign-On Bonus** (first-year booster)
- Visual side-by-side comparison cards highlighting the highest financial package.

### 5.2 Qualitative Factors Comparison
- Compare non-monetary benefits across offers:
  - Paid Time Off (PTO) days
  - 401(k) / Pension match percentage
  - Remote work stipend and hardware allowances
  - Health & wellness coverage
  - Commute expectations and office requirements
  - Decision deadlines with visual countdown timers.

### 5.3 Negotiation Strategist
- AI-calculated leverage assessment based on competing offers and market rate benchmarks.
- Recommends realistic target counter-offer numbers.
- Generates ready-to-send counter-offer email templates tailored to:
  - Higher base salary requests
  - Additional equity/options requests
  - Sign-on bonus enhancements
  - Flexible start dates or remote flexibility

---

## 6. Analytics & Conversion Funnel

The built-in analytics dashboard provides visibility into your job hunt efficiency:

- **Recruiting Conversion Funnel**:
  - Tracking conversion drop-offs from *Saved $\rightarrow$ Applied $\rightarrow$ Screened $\rightarrow$ Interviewing $\rightarrow$ Offered*.
- **Key Performance Indicators (KPIs)**:
  - Overall Offer Rate (`Offers ÷ Total Applied`)
  - Screen Rate (`Screenings ÷ Total Applied`)
  - Active Interview Velocity (Number of active interview rounds per week)
  - Average Response Latency (Days between applied and initial response)
- **Breakdowns by Category**:
  - Success rates by work mode (`Remote` vs `Hybrid` vs `On-site`)
  - Success rates by application source (`LinkedIn` vs `Referral` vs `Company Careers Page`)

---

## 7. User Profile & Skills Engine

Your candidate profile informs all AI personalization across the platform:

- **Personal Details**: Name, current job title, years of experience, and location.
- **Target Roles & Preferences**: Target compensation expectations, preferred work arrangement, and open-to-relocation status.
- **Skill Inventory**: Tag-based collection of technical languages, frameworks, cloud tools, and soft skills.
- **Resume Text Cache**: Raw text storage of your standard resume, ensuring AI prompts can draw upon your actual project history without re-uploading documents.

---

## 8. Data Portability & Offline Persistence

- **Browser Storage Synchronization**: All application cards, notes, stages, and drafts are automatically persisted locally.
- **1-Click JSON Export**: Download a timestamped backup of your entire job search database with zero vendor lock-in.
- **JSON Import & Recovery**: Seamlessly restore data or migrate between browsers and devices.
- **Confetti Celebrations**: Interactive visual reward whenever an application is moved to the "Offer Received" stage.
