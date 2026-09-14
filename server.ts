import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. Analyze Job Description & Match Score
app.post('/api/ai/analyze-job', async (req: Request, res: Response) => {
  try {
    const { jobDescription, userProfile } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string') {
      res.status(400).json({ error: 'Job description is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback heuristics if API key is not present
      res.json({
        jobTitle: 'Software Engineer',
        company: 'Prospective Employer',
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: '$120,000 - $160,000',
        matchScore: 82,
        matchingSkills: ['TypeScript', 'React', 'Problem Solving', 'Communication'],
        missingSkills: ['Kubernetes', 'GraphQL'],
        keyRequirements: [
          '3+ years of experience with modern frontend frameworks',
          'Strong UI/UX sensibility and component architecture',
          'Experience collaborating with cross-functional teams',
        ],
        strengths: [
          'Your profile aligns closely with the core frontend tech stack.',
          'Experience in agile team dynamics fits the team culture.',
        ],
        recommendations: [
          'Highlight specific metrics and business impact in your past projects.',
          'Address any familiarity with modern cloud and API tooling during interviews.',
        ],
        summary: 'Strong candidate match with high probability of passing the initial resume screen.',
      });
      return;
    }

    const profileText = userProfile
      ? `Candidate Profile:
Name: ${userProfile.name || 'Candidate'}
Target Role: ${userProfile.title || ''}
Key Skills: ${(userProfile.skills || []).join(', ')}
Summary: ${userProfile.summary || ''}
Experience Highlights: ${userProfile.experience || ''}`
      : 'No candidate profile provided. Provide general best-practice analysis.';

    const prompt = `Analyze the following job description and evaluate the fit with the candidate's profile.
Extract key metadata (job title, company, location, employment type, salary if mentioned).
Calculate a realistic match score from 0 to 100 based on overlap.
Identify matching skills, missing/gap skills, key requirements, strengths, actionable recommendations, and a brief executive summary.

${profileText}

Job Description:
"""
${jobDescription.slice(0, 10000)}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert technical recruiter, executive career coach, and ATS parser. Provide structured, accurate, and highly actionable analysis in JSON format.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobTitle: { type: Type.STRING, description: 'Extracted job title' },
            company: { type: Type.STRING, description: 'Extracted company name or Unknown' },
            location: { type: Type.STRING, description: 'Location or Remote/Hybrid/On-site' },
            employmentType: { type: Type.STRING, description: 'Full-time, Part-time, Contract, or Internship' },
            salaryRange: { type: Type.STRING, description: 'Salary range if specified or Not disclosed' },
            matchScore: { type: Type.INTEGER, description: 'Overall candidate match percentage 0-100' },
            matchingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills candidate possesses that match this role',
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key skills/keywords in the JD not clearly found in candidate profile',
            },
            keyRequirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3-5 core requirements extracted from the job description',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 key competitive advantages for the candidate',
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable tips to boost interview chances for this specific role',
            },
            summary: {
              type: Type.STRING,
              description: '2-3 sentences summarizing the fit and angle of approach',
            },
          },
          required: [
            'jobTitle',
            'company',
            'location',
            'employmentType',
            'salaryRange',
            'matchScore',
            'matchingSkills',
            'missingSkills',
            'keyRequirements',
            'strengths',
            'recommendations',
            'summary',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing job:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze job description' });
  }
});

// 2. Tailor Resume & Bullet Points
app.post('/api/ai/tailor-resume', async (req: Request, res: Response) => {
  try {
    const { jobTitle, company, jobDescription, userProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        tailoredSummary: `Proven ${jobTitle || 'Professional'} with strong expertise delivering high-performance solutions. Adept at cross-functional collaboration and aligning technical execution with ${company || 'organizational'} objectives.`,
        suggestedBullets: [
          `Architected and shipped key features utilizing modern best practices, resulting in a 35% reduction in latency and improved user engagement.`,
          `Collaborated with cross-functional product and engineering teams to refine specifications, reducing deployment cycle times by 20%.`,
          `Spearheaded automated testing and code review guidelines, elevating overall system reliability and sprint velocity.`,
        ],
        atsKeywords: ['Scalability', 'Cross-functional Collaboration', 'CI/CD', 'Agile Architecture'],
      });
      return;
    }

    const prompt = `You are a top-tier resume strategist. Given this target role and the candidate profile, generate ATS-optimized resume enhancements.
Target Job: ${jobTitle || 'Role'} at ${company || 'Company'}
Job Description:
"""
${(jobDescription || '').slice(0, 6000)}
"""

Candidate Profile:
Name: ${userProfile?.name || 'Candidate'}
Current Role: ${userProfile?.title || 'Professional'}
Skills: ${(userProfile?.skills || []).join(', ')}
Current Summary: ${userProfile?.summary || ''}
Past Experience & Notes: ${userProfile?.experience || ''}

Generate:
1. A tailored 2-3 sentence executive professional summary for this specific application.
2. 4-6 high-impact resume achievement bullet points crafted with the STAR/XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]), incorporating keywords from the JD without fabricating impossible facts.
3. Top 6-8 crucial ATS keywords to feature.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tailoredSummary: { type: Type.STRING },
            suggestedBullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            atsKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['tailoredSummary', 'suggestedBullets', 'atsKeywords'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error tailoring resume:', err);
    res.status(500).json({ error: err.message || 'Failed to tailor resume' });
  }
});

// 3. Generate Cover Letter
app.post('/api/ai/generate-cover-letter', async (req: Request, res: Response) => {
  try {
    const { jobTitle, company, jobDescription, userProfile, tone = 'Confident & Professional' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        coverLetter: `Dear Hiring Team at ${company || 'the company'},\n\nI am writing to express my enthusiasm for the ${jobTitle || 'open position'} role. With my background in building robust, scalable solutions and driving measurable product outcomes, I am eager to contribute to your team's ongoing success.\n\nThroughout my career, I have focused on delivering high quality results, collaborating closely with cross-functional stakeholders, and continuously expanding my technical toolkit. The challenges outlined in your job description closely align with my core strengths and professional passions.\n\nThank you for considering my application. I welcome the opportunity to discuss how my experience and perspective will bring immediate value to ${company || 'your team'}.\n\nSincerely,\n${userProfile?.name || 'Applicant'}`,
      });
      return;
    }

    const prompt = `Write a compelling, human, and tailored cover letter for:
Role: ${jobTitle}
Company: ${company}
Desired Tone: ${tone}

Job Description Context:
"""
${(jobDescription || '').slice(0, 6000)}
"""

Candidate Profile:
Name: ${userProfile?.name || 'Candidate'}
Background: ${userProfile?.title || ''}
Key Skills: ${(userProfile?.skills || []).join(', ')}
Summary: ${userProfile?.summary || ''}
Key Experience: ${userProfile?.experience || ''}

Rules:
- Make it punchy, engaging, and specifically relevant to ${company}.
- Avoid cliché phrases like "I am writing this letter to apply for...". Start with a strong hook or alignment with their mission/product.
- 3 to 4 well-structured paragraphs.
- Keep the candidate's authentic voice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coverLetter: { type: Type.STRING, description: 'The complete cover letter formatted with paragraphs' },
            subjectLine: { type: Type.STRING, description: 'Recommended email subject line if sending via email' },
          },
          required: ['coverLetter', 'subjectLine'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error generating cover letter:', err);
    res.status(500).json({ error: err.message || 'Failed to generate cover letter' });
  }
});

// 4. Interview Prep & Questions
app.post('/api/ai/interview-prep', async (req: Request, res: Response) => {
  try {
    const { jobTitle, company, jobDescription, stage = 'Technical / Behavioral' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        questions: [
          {
            category: 'Behavioral',
            question: `Describe a time when you faced a difficult technical roadblock at work. How did you resolve it?`,
            whyAsked: 'Evaluates resilience, problem-solving methodology, and technical grit.',
            tips: 'Use the STAR format: Situation, Task, Action, Result. Emphasize what YOU personally drove.',
            sampleAnswer: 'In my last role, we experienced a performance bottleneck in our data sync pipeline. I isolated the memory leak using profiling tools, refactored the caching layer, and reduced response latency by 45%.',
          },
          {
            category: 'Role-Specific',
            question: `How do you approach designing scalable systems or maintainable component architecture for high-traffic apps?`,
            whyAsked: `Directly assesses alignment with ${jobTitle} responsibilities.`,
            tips: 'Mention modularity, error boundaries, state normalization, and documentation.',
            sampleAnswer: 'I start with domain boundaries, ensure strict type safety, establish shared utility abstractions, and write integration tests for critical paths.',
          },
          {
            category: 'Company & Culture',
            question: `Why are you interested in joining ${company || 'our company'} specifically at this stage?`,
            whyAsked: 'Tests genuine interest, company research, and cultural alignment.',
            tips: `Cite a specific recent product launch or engineering challenge ${company} is tackling.`,
            sampleAnswer: `I have been following ${company}'s work on developer experience and product velocity. The opportunity to contribute to this exact scale is where my background creates immediate impact.`,
          },
        ],
        questionsToAsk: [
          `What does success look like for this role in the first 90 days?`,
          `What is the current team's biggest technical challenge or bottleneck?`,
          `How does the engineering and product team handle prioritization conflicts?`,
        ],
      });
      return;
    }

    const prompt = `Generate tailored interview preparation for:
Role: ${jobTitle}
Company: ${company}
Interview Stage: ${stage}

Job Description Context:
"""
${(jobDescription || '').slice(0, 6000)}
"""

Provide:
1. 5-7 realistic, role-specific questions categorized by (Behavioral, Technical, System/Strategy, Company Culture).
For each question:
- The question text
- Why the interviewer asks this (intent)
- Strategy/Tips to answer effectively
- A model framework or sample response structure (STAR technique)
2. 3-4 insightful questions the candidate should ask the interviewer to stand out.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  whyAsked: { type: Type.STRING },
                  tips: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                },
                required: ['category', 'question', 'whyAsked', 'tips', 'sampleAnswer'],
              },
            },
            questionsToAsk: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['questions', 'questionsToAsk'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error generating interview prep:', err);
    res.status(500).json({ error: err.message || 'Failed to generate interview prep' });
  }
});

// 5. Interview Answer Critique & Coaching
app.post('/api/ai/interview-feedback', async (req: Request, res: Response) => {
  try {
    const { question, answer, jobTitle, company } = req.body;
    if (!answer) {
      res.status(400).json({ error: 'Candidate answer is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        score: 85,
        rating: 'Strong',
        strengths: ['Directly addresses the question prompt', 'Shows clear personal initiative'],
        areasForImprovement: ['Include more quantifiable metrics (e.g., % time saved or revenue impact)'],
        refinedAnswer: answer + ' As a measurable outcome, this initiative improved our release cadence by 25%.',
        coachingTip: 'Always conclude your STAR story with a crisp business or team outcome.',
      });
      return;
    }

    const prompt = `Critique this candidate's interview answer:
Target Role: ${jobTitle || 'Role'} at ${company || 'Company'}
Question: "${question}"
Candidate Answer: "${answer}"

Evaluate:
- Score (0 to 100)
- Rating ("Needs Work", "Good", "Strong", "Exceptional")
- Key Strengths
- Constructive Areas for Improvement
- Refined / Polished Version of their answer using the STAR method
- Quick Coaching Tip`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            rating: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            refinedAnswer: { type: Type.STRING },
            coachingTip: { type: Type.STRING },
          },
          required: ['score', 'rating', 'strengths', 'areasForImprovement', 'refinedAnswer', 'coachingTip'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error reviewing interview answer:', err);
    res.status(500).json({ error: err.message || 'Failed to review answer' });
  }
});

// 6. Draft Outreach / Follow-up / Negotiation Email
app.post('/api/ai/draft-email', async (req: Request, res: Response) => {
  try {
    const { emailType, company, jobTitle, contactName, contextNotes, userProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        subject: `Following up: ${jobTitle || 'Application'} - ${userProfile?.name || 'Applicant'}`,
        body: `Hi ${contactName || 'Hiring Team'},\n\nI hope you are having a wonderful week. I wanted to follow up on my recent application for the ${jobTitle || 'Role'} at ${company}.\n\nI remain very enthusiastic about the opportunity and would love to answer any additional questions. Thank you for your time and consideration!\n\nBest regards,\n${userProfile?.name || 'Applicant'}`,
      });
      return;
    }

    const prompt = `Draft a professional job search email:
Type: ${emailType} (e.g., Application Follow-up, Post-Interview Thank You, Recruiter Cold Outreach, or Offer Negotiation Counter)
Company: ${company}
Role: ${jobTitle}
Recipient Name: ${contactName || 'Hiring Manager / Recruiter'}
Additional Details / Context: ${contextNotes || 'Standard cordial follow-up'}
Candidate Name: ${userProfile?.name || 'Candidate'}

Ensure the email is concise, polite, professional, and directly actionable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['subject', 'body'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error drafting email:', err);
    res.status(500).json({ error: err.message || 'Failed to draft email' });
  }
});

// 7. Offer Evaluation & Compensation Negotiation Strategist
app.post('/api/ai/negotiate-offer', async (req: Request, res: Response) => {
  try {
    const { company, jobTitle, currentOffer, competingOffers, userPriorities, userProfile } = req.body;
    const ai = getGeminiClient();

    const base = Number(currentOffer?.baseSalary) || 160000;
    const bonus = Number(currentOffer?.annualBonus) || 15000;
    const equity = Number(currentOffer?.annualEquity) || 30000;
    const signOn = Number(currentOffer?.signOnBonus) || 10000;
    const currentTotal = base + bonus + equity + signOn;

    if (!ai) {
      const targetBase = Math.round(base * 1.08 / 1000) * 1000;
      const targetTotal = Math.round((currentTotal * 1.1) / 1000) * 1000;
      res.json({
        leverageLevel: competingOffers && competingOffers.length > 0 ? 'High' : 'Medium',
        marketAnalysis: `Based on current tech market benchmarks for ${jobTitle || 'this role'} at ${company || 'tier-1 tech firms'}, this package is competitive on equity but has room for a 7-10% base adjustment or a sign-on buffer.`,
        targetBaseSalary: targetBase,
        targetTotalComp: targetTotal,
        suggestedAsks: [
          `Propose a base salary adjustment from $${base.toLocaleString()} to $${targetBase.toLocaleString()}.`,
          `Request an initial sign-on bonus increase of $10,000 - $15,000 to bridge any unvested equity gap.`,
          `Clarify the annual performance review cycle and equity refresh grant cadence.`,
          `Confirm remote work equipment stipend or home-office setup allowance.`,
        ],
        tacticalPoints: [
          `Express genuine excitement for the team and product mission before discussing compensation numbers.`,
          `Anchor your counter around the specialized technical impact and immediate velocity you bring to the table.`,
          `Frame the counter as: 'If we can reach $${targetBase.toLocaleString()} base and adjust the sign-on bonus, I am thrilled and ready to sign immediately today.'`,
        ],
        counterProposalEmail: `Dear ${company || 'Hiring'} Team,\n\nThank you very much for extending this offer to join as ${jobTitle || 'Software Engineer'}. I am truly thrilled about the team's mission and the impactful work we discussed during my interviews.\n\nAfter carefully reviewing the total compensation structure in light of market benchmarks and my current interview processes, I would love to discuss a few adjustments. Specifically, if we are able to adjust the base salary to $${targetBase.toLocaleString()} (or bridge this with an adjusted sign-on bonus of $${(signOn + 10000).toLocaleString()}), I would be ready to accept and sign right away.\n\nI am confident I will deliver outsized value to the team from day one, and I look forward to your thoughts!\n\nWarm regards,\n${userProfile?.name || 'Applicant'}`,
      });
      return;
    }

    const prompt = `You are an elite Silicon Valley executive compensation negotiator and career strategist.
Evaluate this job offer and develop a data-driven, tactical counter-negotiation plan:

Role: ${jobTitle || 'Software Engineer'}
Company: ${company || 'Prospective Company'}
Current Offer Structure:
- Base Salary: $${base}
- Annual Bonus: $${bonus}
- Annual Equity (Year 1): $${equity}
- Sign-on Bonus: $${signOn}
- Current Year 1 Total Comp: $${currentTotal}
Competing Offers or Notes: ${competingOffers || 'None explicitly reported, but candidate is actively interviewing.'}
Candidate Priorities: ${userPriorities || 'Higher base salary, remote flexibility, and equity growth'}
Candidate Profile: ${userProfile?.name || 'Candidate'} (${userProfile?.title || 'Engineer'})

Provide a structured negotiation plan:
1. Leverage Level ('High', 'Medium', 'Moderate')
2. Concise market benchmark analysis (2-3 sentences)
3. Target recommended base salary (number)
4. Target recommended total compensation (number)
5. 4 concrete suggested asks
6. 3 high-impact tactical phone talking points (exact phrasing)
7. A polished, respectful, and effective counter-proposal email ready to send.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            leverageLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Moderate'] },
            marketAnalysis: { type: Type.STRING },
            targetBaseSalary: { type: Type.INTEGER },
            targetTotalComp: { type: Type.INTEGER },
            suggestedAsks: { type: Type.ARRAY, items: { type: Type.STRING } },
            tacticalPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            counterProposalEmail: { type: Type.STRING },
          },
          required: [
            'leverageLevel',
            'marketAnalysis',
            'targetBaseSalary',
            'targetTotalComp',
            'suggestedAsks',
            'tacticalPoints',
            'counterProposalEmail',
          ],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error in offer negotiation:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze offer' });
  }
});

// 8. Smart Follow-Up Generator (Radar)
app.post('/api/ai/smart-followup', async (req: Request, res: Response) => {
  try {
    const { company, jobTitle, contactName, daysSinceApplied, stage, userProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        recommendation: `It has been ${daysSinceApplied || 7} days since your last status update with ${company}. Sending a polite, value-additive follow-up email helps reactivate your file in the recruiter's inbox.`,
        subject: `Follow-up regarding ${jobTitle || 'Role'} application - ${userProfile?.name || 'Applicant'}`,
        body: `Hi ${contactName || 'Hiring Team'},\n\nI hope your week is off to a great start! I am following up on my application for the ${jobTitle || 'position'} at ${company} submitted about ${daysSinceApplied || 7} days ago.\n\nI remain very enthusiastic about the work your team is doing, particularly regarding your recent technical roadmap. If you need any additional materials or details on my background, please let me know.\n\nThank you again for your time and consideration!\n\nBest regards,\n${userProfile?.name || 'Applicant'}`,
      });
      return;
    }

    const prompt = `Write a smart, tactical job application follow-up:
Company: ${company}
Role: ${jobTitle}
Contact: ${contactName || 'Recruiter'}
Current Stage: ${stage}
Days since application/last interaction: ${daysSinceApplied || 7} days
Candidate: ${userProfile?.name || 'Candidate'}

Provide:
1. recommendation: A 1-2 sentence coaching advice on timing and tone.
2. subject: A clean subject line.
3. body: A concise (2 short paragraphs), non-pushy, high-value check-in email.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING },
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['recommendation', 'subject', 'body'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error in smart follow-up:', err);
    res.status(500).json({ error: err.message || 'Failed to generate follow-up' });
  }
});

// 9. AI Career Copilot Interactive Chat
app.post('/api/ai/copilot-chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], activeApplicationsSummary, userProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        reply: `I can help you strategize your job search, optimize applications, and prep for upcoming interviews. (Tip: Connect your Gemini API Key in Settings > Secrets to unlock live interactive AI generation!)`,
      });
      return;
    }

    const systemInstruction = `You are a world-class executive career mentor, technical recruiter, and job search copilot.
You have visibility into the user's active job pipeline:
${activeApplicationsSummary || 'No active applications logged yet.'}

Candidate Profile:
Name: ${userProfile?.name || 'Job Seeker'}
Target Role: ${userProfile?.title || 'Professional'}
Skills: ${(userProfile?.skills || []).join(', ')}

Help the user with practical, empathetic, high-leverage advice on:
- Prioritizing application follow-ups
- Offer evaluation & salary negotiation tactics
- Behavioral & technical interview mindset
- Overcoming career rejections and maintaining momentum
Keep responses structured with markdown, bullet points, and concise action steps.`;

    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || 'I am here to support your job search journey. What would you like to tackle next?' });
  } catch (err: any) {
    console.error('Error in copilot chat:', err);
    res.status(500).json({ error: err.message || 'Failed to process chat message' });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
