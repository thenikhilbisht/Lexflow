'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatMessage, Citation, SourceStatus, Clause } from '@/types';
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Check,
  CornerDownRight,
  ArrowLeft,
  Bot,
  User as UserIcon,
  Paperclip,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface GroundedChatWindowProps {
  documentId: string;
  onSelectCitation?: (page: number, section: string) => void;
  showBackArrow?: boolean;
}

export const GroundedChatWindow: React.FC<GroundedChatWindowProps> = ({
  documentId,
  onSelectCitation,
  showBackArrow = false
}) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([
    'What are the termination requirements?',
    'Does this agreement automatically renew?',
    'What are the payment deadlines?',
    'Who owns intellectual property created under this contract?'
  ]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, 'HELPFUL' | 'UNHELPFUL'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading]);

  // Load persistent conversation history & document clauses for dynamic suggestions
  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;

    // 1. Fetch persistent chat history
    fetch(`/api/documents/${documentId}/chat/history`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(err => {
        console.warn('Failed to load chat history:', err);
      });

    // 2. Fetch document to build real suggested questions from actual clauses
    fetch(`/api/documents/${documentId}`)
      .then(res => res.json())
      .then(docData => {
        if (isMounted && docData && Array.isArray(docData.clauses) && docData.clauses.length > 0) {
          const suggestions: string[] = [];
          const categories = new Set(docData.clauses.map((c: Clause) => c.category));

          if (categories.has('Termination')) suggestions.push('What are the termination notice requirements?');
          if (categories.has('Payment & Financial')) suggestions.push('What are the payment and invoice deadlines?');
          if (categories.has('Intellectual Property')) suggestions.push('Who owns the intellectual property?');
          if (categories.has('Confidentiality')) suggestions.push('How long do confidentiality obligations last?');
          if (categories.has('Indemnity & Liability')) suggestions.push('What does the indemnity clause require?');

          if (suggestions.length > 0) {
            setDynamicSuggestions(suggestions.slice(0, 4));
          }
        }
      })
      .catch(err => {
        console.warn('Failed to load document for suggestions:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery('');
    setChatError(null);
    setLastQuery(query);

    const tempUserMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      conversationId: `conv-${documentId}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const res = await fetch(`/api/documents/${documentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ query, stream: true })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      // Check if server returned a streaming SSE response
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let finalMessage: ChatMessage | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.token) {
                  accumulatedText += parsed.token;
                  setStreamingContent(accumulatedText);
                }
                if (parsed.done && parsed.message) {
                  finalMessage = parsed.message;
                }
              } catch (e) {
                // Ignore parse errors on partial frames
              }
            }
          }
        }

        setStreamingContent(null);
        if (finalMessage) {
          setMessages(prev => [...prev, finalMessage!]);
        } else if (accumulatedText) {
          setMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}-a`,
              conversationId: `conv-${documentId}`,
              role: 'assistant',
              content: accumulatedText,
              sourceStatus: 'DIRECTLY_STATED',
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } else {
        // Standard JSON fallback
        const data: ChatMessage = await res.json();
        setStreamingContent(null);
        setMessages(prev => [...prev, data]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setStreamingContent(null);
      setChatError(err.message || 'Failed to communicate with RAG assistant.');
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          conversationId: `conv-${documentId}`,
          role: 'assistant',
          content: "I couldn't find this in the provided document. An error occurred during retrieval, or the question is outside the document's scope.",
          sourceStatus: 'NOT_FOUND',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (messages.length === 0) return;
    if (!confirm('Are you sure you want to clear your conversation history for this document?')) return;

    try {
      await fetch(`/api/documents/${documentId}/chat/history`, {
        method: 'DELETE'
      });
      setMessages([]);
      setChatError(null);
      setStreamingContent(null);
    } catch (e) {
      console.error('Failed to clear chat:', e);
    }
  };

  const handleFeedback = async (msgId: string, rating: 'HELPFUL' | 'UNHELPFUL') => {
    setFeedbackSubmitted(prev => ({ ...prev, [msgId]: rating }));
    try {
      await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId, rating })
      });
    } catch (e) {
      console.error('Feedback error:', e);
    }
  };

  const renderSourceBadge = (status?: SourceStatus) => {
    switch (status) {
      case 'DIRECTLY_STATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Directly stated
          </span>
        );
      case 'INFERRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            ≈ Inferred from document
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ? Unclear / ambiguous
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
            — Not found in document
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Top Mobile Bar Matching Image 4 */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {showBackArrow && (
            <button
              onClick={() => router.push('/app')}
              className="p-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              AI Legal Assistant
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Document-Grounded RAG Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4" tabIndex={0} aria-label="Chat Conversation Stream">
        {/* Real Zero-State Greeting when no messages exist */}
        {messages.length === 0 && !streamingContent && !isLoading && (
          <div className="my-8 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Document Analysis Grounded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Ask any question regarding this agreement. Answers are strictly extracted from verified document clauses with clickable section and page citations.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}>
              {/* LexAI Robot Avatar Header */}
              {!isUser && (
                <div className="flex items-center gap-2 pl-1">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">LexAI</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#4F46E5] text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200/70'
                }`}
              >
                {!isUser && msg.sourceStatus && (
                  <div className="mb-2">
                    {renderSourceBadge(msg.sourceStatus)}
                  </div>
                )}

                <div className="whitespace-pre-line font-sans">{msg.content}</div>

                {/* Grounded Citations Box */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Source Citations (Click to View):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.id}
                          onClick={() => onSelectCitation?.(cit.page, cit.section)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-semibold text-xs transition-all shadow-2xs hover:shadow-xs group text-left"
                          title={cit.excerpt}
                        >
                          <span className="group-hover:underline">{cit.section} • Page {cit.page}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Buttons */}
              {!isUser && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1 pt-0.5">
                  <button
                    onClick={() => handleFeedback(msg.id, 'HELPFUL')}
                    className={`hover:text-emerald-600 transition-colors p-0.5 ${
                      feedbackSubmitted[msg.id] === 'HELPFUL' ? 'text-emerald-600 font-bold' : ''
                    }`}
                    title="Mark helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'UNHELPFUL')}
                    className={`hover:text-rose-600 transition-colors p-0.5 ${
                      feedbackSubmitted[msg.id] === 'UNHELPFUL' ? 'text-rose-600 font-bold' : ''
                    }`}
                    title="Mark unhelpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  {feedbackSubmitted[msg.id] && (
                    <span className="text-[10px] text-emerald-600 font-semibold">Feedback logged</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Live Streaming Assistant Message */}
        {streamingContent !== null && (
          <div className="flex flex-col items-start space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-700">LexAI</span>
              <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Generating...
              </span>
            </div>
            <div className="max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200/70 shadow-xs">
              <div className="whitespace-pre-line">
                {streamingContent}
                <span className="inline-block w-2 h-4 ml-1 bg-indigo-600 animate-pulse align-middle" />
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && streamingContent === '' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            Searching document clauses and verifying citations...
          </div>
        )}

        {/* Error State with Retry Button */}
        {chatError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{chatError}</span>
            </div>
            {lastQuery && (
              <button
                onClick={() => handleSend(lastQuery)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips Strip (Derived dynamically from actual document clauses) */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {dynamicSuggestions.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={isLoading}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-[#4F46E5] font-semibold text-xs transition-colors border border-indigo-100 shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Bottom Input Form (Matching Image 4) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about this document..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-1"
          />
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600"
            title="Upload or change document"
            onClick={() => router.push('/app/documents')}
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
