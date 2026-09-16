import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../lib/api';
import ChatModal from './ChatModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function Lexicon() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTerms, setExpandedTerms] = useState(new Set());
  const [chatModalPrompt, setChatModalPrompt] = useState(null);
  const unrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLexicon() {
      try {
        setLoading(true);
        const res = await api.get('/ai/lexicon');
        if (isMounted) {
          setTerms(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (isMounted) setError('The glossary could not be loaded.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLexicon();
    return () => {
      isMounted = false;
    };
  }, []);

  // IntersectionObserver for .codex-unroll
  useEffect(() => {
    const el = unrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-unrolled');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  const toggleTerm = (termKey) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(termKey)) {
        next.delete(termKey);
      } else {
        next.add(termKey);
      }
      return next;
    });
  };

  // Group terms by initial letter
  const alphabetIndex = useMemo(() => {
    const set = new Set();
    terms.forEach((t) => {
      if (t.term && t.term[0]) {
        set.add(t.term[0].toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [terms]);

  const scrollToLetter = (letter) => {
    const el = document.getElementById(`lexicon-letter-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="min-h-screen py-16 px-6 max-w-6xl mx-auto"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        paddingTop: '100px',
      }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          Silicon Glossary & Vocabulary
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            marginTop: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Spec Glossary
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Plain translations for obscure mobile terminology, explained for everyone.
        </p>
      </div>

      {/* Rune Index (A-Z Anchor Letters) */}
      {alphabetIndex.length > 0 && (
        <nav
          aria-label="Lexicon letter index"
          className="flex flex-wrap items-center justify-center gap-2 mb-12 p-3"
          style={{
            background: 'var(--color-bg-surface)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-hard-sm)',
          }}
        >
          {alphabetIndex.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => scrollToLetter(letter)}
              className="px-3 py-1 font-heading font-bold text-sm transition-transform hover:scale-110"
              style={{
                color: 'var(--color-accent)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              title={`Scroll to terms starting with ${letter}`}
            >
              {letter}
            </button>
          ))}
        </nav>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 bg-[var(--color-bg-surface)] border-[var(--border-thin)] shadow-[var(--shadow-hard-sm)] space-y-3"
            >
              <div className="h-4 w-24 bg-[var(--color-border-light)] mb-2" />
              <div className="codex-quill-skeleton">
                <div className="codex-quill-line" />
                <div className="codex-quill-line" />
                <div className="codex-quill-line" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-center font-mono text-sm text-[var(--color-text-muted)]">{error}</p>
      ) : (
        <div ref={unrollRef} className="codex-unroll space-y-12">
          {alphabetIndex.map((letter) => {
            const letterTerms = terms.filter(
              (t) => t.term && t.term[0].toUpperCase() === letter
            );
            return (
              <section key={letter} id={`lexicon-letter-${letter}`} className="space-y-4">
                <div
                  className="flex items-baseline gap-3 pb-2"
                  style={{ borderBottom: 'var(--border-thin)' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 700,
                      color: 'var(--color-accent)',
                    }}
                  >
                    {letter}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {letterTerms.length} {letterTerms.length === 1 ? 'term' : 'terms'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {letterTerms.map((item) => {
                    const isExpanded = expandedTerms.has(item.term);
                    return (
                      <article
                        key={item.term}
                        onClick={() => toggleTerm(item.term)}
                        className="codex-card flex flex-col justify-between cursor-pointer group"
                        style={{
                          background: 'var(--color-bg-surface)',
                          padding: 'var(--space-5)',
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h2
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--color-text-primary)',
                              }}
                            >
                              {item.term}
                            </h2>
                            <span
                              className="font-mono text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>

                          <p
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-secondary)',
                              lineHeight: 1.6,
                              ...(isExpanded
                                ? {}
                                : {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }),
                            }}
                          >
                            {item.definition || item.plain}
                          </p>
                        </div>

                        {/* Card Footer Chip: Ask Oracle more */}
                        <div
                          className="pt-4 mt-4 flex items-center justify-between"
                          style={{ borderTop: 'var(--border-subtle)' }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatModalPrompt(`Explain ${item.term} like I'm twelve.`);
                            }}
                            className="codex-chip hover:bg-[var(--color-bg-surface-2)] transition-colors cursor-pointer"
                            style={{ fontSize: '11px' }}
                            title={`Ask Oracle about ${item.term}`}
                          >
                            <span>Ask Oracle more</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ChatModal Popup when Ask Oracle clicked */}
      <AnimatePresence>
        {chatModalPrompt && (
          <ChatModal
            initialPrompt={chatModalPrompt}
            onClose={() => setChatModalPrompt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
