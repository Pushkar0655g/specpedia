import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import useEscape from '../hooks/useEscape';
import OracleSeal from './OracleSeal';

export const formatBold = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Markdown formatter splitting on escaped and literal backslash-n
export const formatAIResponse = (text) => {
  if (!text) return null;
  const normalized = text.replace(/\\n/g, '\n');
  return normalized.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <h4 key={i} style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontWeight: 600, marginTop: 'var(--space-4)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>{line.replace('### ', '')}</h4>;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={i} style={{ marginLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', listStyleType: 'disc' }}>{formatBold(line.slice(2))}</li>;
    }
    if (line.match(/^\d+\.\s/)) {
      return <li key={i} style={{ marginLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', listStyleType: 'decimal' }}>{formatBold(line.replace(/^\d+\.\s/, ''))}</li>;
    }
    if (!line.trim()) return <br key={i} />;
    return <p key={i} style={{ marginBottom: '6px', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{formatBold(line)}</p>;
  });
};

export default function ChatModal({ item, initialPrompt, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEscape(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  });

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-scroll inside the messages container only (does NOT scroll the parent page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading, isStreaming]);

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setLoading(false);
  };

  const sendMessage = async (customMessage) => {
    const textToSend = typeof customMessage === 'string' ? customMessage : input;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend };
    const currentHistory = messages.slice(-8).map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg, { role: 'ai', content: '' }]);
    setInput('');
    setLoading(true);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const apiBase =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      'http://localhost:5000';
    const streamUrl = `${apiBase}/api/v1/ai/chat/stream`;

    try {
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          context: item || null,
          history: currentHistory,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      setLoading(false); // Transition from spinner to live token reception
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.trim();
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(raw);
              if (parsed.token) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'ai') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: updated[lastIdx].content + parsed.token,
                    };
                  }
                  return updated;
                });
              } else if (parsed.error) {
                console.warn('Stream chunk reported error:', parsed.error);
              }
            } catch (_jsonErr) {
              // Ignore partial frame
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Chat error:', error);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'ai' && !updated[lastIdx].content) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: 'Something went wrong. Please try again.',
            };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const starterChips = [
    'Best value under ₹30k?',
    'What does LTPO 120Hz mean?',
    'Compare camera vs battery tradeoffs',
  ];

  const followUpChips = [
    'Explain simpler',
    'Compare with a rival',
  ];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: 'var(--space-4)', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full flex flex-col relative"
        style={{
          maxWidth: '520px',
          height: '620px',
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center" style={{
          padding: 'var(--space-5)',
          borderBottom: 'var(--border-thick)',
        }}>
          <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
            <OracleSeal size={24} thinking={isStreaming} />
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              {item ? `Oracle — ${item.name}` : "Oracle — AI Assistant"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="codex-modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          {messages.length === 0 && (
            <div className="text-center" style={{ marginTop: 'var(--space-8)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                Ask anything about specs, comparisons or buying advice
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-6)' }}>
                {item ? `About the ${item.name}` : 'Compare specs, find devices, or explore features'}
              </p>

              {/* Starter Chips */}
              <div className="flex flex-col items-center" style={{ gap: 'var(--space-2)' }}>
                {starterChips.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    className="codex-chip"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    {chip} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col" style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{ maxWidth: '85%' }}>
                {msg.role === 'ai' && (
                  <OracleSeal size={24} thinking={isStreaming && i === messages.length - 1} className="mt-1 flex-shrink-0" />
                )}
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  ...(msg.role === 'user' ? {
                    background: 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
                    border: 'var(--border-thin)',
                  } : {
                    background: 'var(--color-bg-primary)',
                    border: 'var(--border-thin)',
                    color: 'var(--color-text-secondary)',
                  }),
                }}>
                  {msg.role === 'ai' ? (
                    <div>
                      {formatAIResponse(msg.content)}
                      {isStreaming && i === messages.length - 1 && (
                        <span className="codex-ink-cursor" aria-hidden="true" />
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 'var(--text-sm)' }}>{msg.content}</span>
                  )}
                </div>
              </div>

              {/* Follow-up Context Chips after the latest AI message */}
              {msg.role === 'ai' && i === messages.length - 1 && !loading && !isStreaming && (
                <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  {followUpChips.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => sendMessage(chip)}
                      className="codex-chip"
                      style={{ fontSize: '11px', padding: 'var(--space-1) var(--space-3)' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div style={{
                background: 'var(--color-bg-primary)',
                border: 'var(--border-thin)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                gap: '6px',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    style={{
                      width: '6px',
                      height: '6px',
                      background: 'var(--color-accent)',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input & Disclaimer */}
        <div style={{ borderTop: 'var(--border-thick)', background: 'var(--color-bg-surface)' }}>
          <div className="flex items-center" style={{
            padding: 'var(--space-4)',
            gap: 'var(--space-2)',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isStreaming && sendMessage()}
              disabled={isStreaming}
              placeholder={isStreaming ? 'Analyzing spec sheets…' : 'Type your question…'}
              className="codex-input flex-1"
              style={{ fontSize: 'var(--text-sm)' }}
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="codex-btn-secondary"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                }}
                title="Halt Oracle transmission"
              >
                <span>■</span>
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="codex-btn"
                style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }}
              >
                Send
              </button>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            paddingBottom: 'var(--space-3)',
            paddingLeft: 'var(--space-4)',
            paddingRight: 'var(--space-4)',
            margin: 0,
          }}>
            Oracle responses are AI-generated. Verify critical specifications before purchase.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}