# Job Application Tracker + AI Career Copilot

An intelligent, full-featured Job Search Command Center and Applicant Tracking System (ATS) designed for job seekers. Organizes application pipelines, interview stages, and multiple job offers while integrating Google Gemini AI to automate resume tailoring, cover letter drafting, interview practice, and salary negotiation.

---

## Key Features

A detailed, comprehensive breakdown of every feature, algorithm, and user workflow is documented in [FEATURES.md](./FEATURES.md).

### Summary Highlights
- **Kanban Board**: Drag-and-drop or one-click stage progression across 6 standardized recruiting phases:
  - *Wishlist & Saved*
  - *Applied*
  - *Recruiter Screening*
  - *Interviewing*
  - *Offer Received*
  - *Rejected / Archived*
- **List & Table View**: Dense, filterable, and sortable view for rapid scanning of companies, roles, locations, compensation, and statuses.
- **Timeline & Interview Rounds**: Chronological view of interview rounds, scheduled dates, interview formats, and recruiter contact details.
- **Offer Comparison Matrix**: Side-by-side total compensation (TC) calculator comparing base salaries, annual bonuses, equity/stock grants, and sign-on incentives across offers.
- **Funnel Analytics**: Live metrics tracking application volume, response rates, and interview conversion ratios.

### 2. Built-in Gemini AI Capabilities
- **Smart Job Description Parser**: Paste unformatted job descriptions or requirements to extract role title, company, salary estimates, location, and key skills.
- **Match Score & Skill Gap Analysis**: Computes a 0–100% role match score comparing your profile skills with job requirements, highlighting matching strengths and missing keywords.
- **ATS Resume Tailoring**: Generates targeted summary statements and metric-driven bullet points formatted for Applicant Tracking Systems.
- **1-Click Cover Letter Generator**: Drafts personalized, role-specific cover letters aligned with company mission and required skills.
- **Interactive Interview Coach**:
  - Predicts behavioral, technical, and role-specific questions for any saved job.
  - Explains the recruiter's intent behind each question, provides structured answering tips, and offers sample answers.
  - **Interactive Practice**: Type in practice answers to receive real-time scoring, constructive critique, and suggested improvements.
  - Suggests thoughtful questions to ask the interviewer.
- **Salary Negotiation Strategist**: Recommends counter-offer figures, strategic talking points, and ready-to-use email templates.
- **AI Career Copilot**: Persistent chat drawer accessible across all screens for quick career advice, follow-up message drafts, and application reviews.

### 3. Data & Personalization
- **Candidate Profile**: Configures your professional background, current role, core skills, target compensation, and work mode preferences.
- **Import / Export**: Backup and restore your job search data anytime via JSON import/export.
- **Theme Support**: Clean, high-contrast dark and light themes.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations & Visuals**: Motion (`motion/react`), Canvas-Confetti
- **AI SDK**: `@google/genai` (Google Gemini API)

---

## Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm or yarn
- *(Optional for live AI features)* Gemini API Key (`GEMINI_API_KEY`)

### Installation

1. Clone or extract the project:
   ```bash
   git clone <repository-url>
   cd job-application-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: The app also provides smart fallback analysis when an API key is not configured.)*

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AddApplicationModal.tsx     # Add/Parse job modal (manual or AI parse)
│   │   ├── AnalyticsView.tsx           # Conversion funnel & statistics view
│   │   ├── ApplicationModal.tsx        # Deep-dive modal with AI tools & tabs
│   │   ├── CopilotDrawer.tsx           # Floating AI Career Copilot chat
│   │   ├── Header.tsx                  # Top navigation, views, search, & profile
│   │   ├── KanbanBoard.tsx             # Visual drag/move pipeline board
│   │   ├── ListView.tsx                # Data table view of applications
│   │   ├── OfferComparisonView.tsx     # Side-by-side compensation comparison
│   │   ├── ProfileModal.tsx            # Candidate profile & skills settings
│   │   ├── StatsBar.tsx                # Quick stage count summary bar
│   │   └── TimelineView.tsx            # Upcoming interviews & deadline schedule
│   ├── utils/
│   │   ├── aiClient.ts                 # Gemini API integration & prompt logic
│   │   └── storage.ts                  # Local storage persistence & initial seeds
│   ├── types.ts                        # TypeScript interfaces & stage definitions
│   ├── App.tsx                         # Main app component & state management
│   ├── main.tsx                        # Entry point
│   └── index.css                       # Global styles & Tailwind directives
├── package.json
└── README.md
```

---

## License

MIT License. Free to use, modify, and distribute for personal or commercial projects.
