import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  ChevronRight,
  Briefcase,
  Lightbulb,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { JobApplication, UserProfile } from '../types';
import { askCopilot } from '../utils/aiClient';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  userProfile: UserProfile;
  onSelectApplication: (app: JobApplication) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  applications,
  userProfile,
  onSelectApplication,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${userProfile.name.split(' ')[0]}! I am your AI Career Copilot. I have analyzed your pipeline of **${applications.length} applications**.\n\nHere are some things we can work on right now:\n- **Offer Strategy:** Evaluating or negotiating your current compensation package.\n- **Interview Prep:** Mock coaching for your upcoming rounds.\n- **Application Triage:** Identifying stale applications that need follow-up emails.\n\nWhat would you like advice on today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Suggested prompt chips based on current applications
  const offers = applications.filter((a) => a.stage === 'offer');
  const interviews = applications.filter((a) => a.stage === 'interview');
  const upcomingDeadlines = applications.filter((a) => a.deadline);

  const quickPrompts: string[] = [];
  if (offers.length > 0) {
    quickPrompts.push(`How should I evaluate and negotiate my ${offers[0].company} offer?`);
  }
  if (interviews.length > 0) {
    quickPrompts.push(`What questions should I prepare for ${interviews[0].company} (${interviews[0].jobTitle})?`);
  }
  if (upcomingDeadlines.length > 0) {
    quickPrompts.push('What are my most urgent application deadlines this week?');
  }
  quickPrompts.push('Review my current skills and suggest how to improve my ATS fit');

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const reply = await askCopilot(
        text,
        newHistory.map((m) => ({ role: m.role, content: m.content })),
        applications,
        userProfile
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect to AI server. Please verify your GEMINI_API_KEY is configured in Settings > Secrets.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              AI Career Copilot
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Aware of {applications.length} jobs in your pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (confirm('Clear conversation history?')) {
                setMessages([]);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-[10px] font-bold text-slate-400">
                {m.role === 'user' ? 'You' : 'AI Copilot'}
              </span>
              <span className="text-[10px] text-slate-400">• {m.timestamp}</span>
            </div>
            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700/60'
              }`}
            >
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="prose prose-xs dark:prose-invert max-w-none text-xs space-y-2">
                  <Markdown>{m.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 text-xs max-w-[70%]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>AI Copilot is analyzing your pipeline...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Suggested Strategies
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-left text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors truncate max-w-full"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask your career copilot anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
