import React, { useState, useEffect } from 'react';

/**
 * ThumbIndex — Fixed right-edge vertical rail for manuscript sections.
 * Displays Roman numerals with smooth-scrolling and active section tracking via IntersectionObserver.
 * Hidden on viewports < lg.
 */
export default function ThumbIndex({
  sections = [
    { id: 'archive', roman: 'I', label: 'Catalog' },
    { id: 'oracle', roman: 'II', label: 'Oracle' },
    { id: 'chronicle', roman: 'III', label: 'Price Trends' },
  ],
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');

  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const observedElements = [];
    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Sort by intersection ratio or position
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) {
        observer.observe(el);
        observedElements.push(el);
      }
    });

    return () => {
      observedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sections]);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <nav
      aria-label="Section index"
      className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center"
      style={{
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-2)',
        background: 'var(--color-bg-surface)',
        border: 'var(--border-thin)',
        boxShadow: 'var(--shadow-hard-sm)',
        borderRadius: '2px',
      }}
    >
      <div
        style={{
          width: '1px',
          height: '14px',
          background: 'var(--color-border-light)',
          marginBottom: '2px',
        }}
      />
      {sections.map((sec) => {
        const isActive = activeId === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => handleScrollTo(sec.id)}
            title={`${sec.roman} — ${sec.label}`}
            aria-label={`Scroll to section ${sec.roman}: ${sec.label}`}
            aria-current={isActive ? 'true' : undefined}
            className="group relative flex flex-col items-center justify-center transition-all"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.05em',
            }}
          >
            <span
              className="transition-colors duration-150"
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                textShadow: isActive ? '0 0 1px var(--color-accent)' : 'none',
              }}
            >
              {sec.roman}
            </span>

            {/* Wax dot indicator */}
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                marginTop: '3px',
                background: isActive ? 'var(--color-wax-red, #8B1E0F)' : 'transparent',
                border: isActive ? 'none' : '1px solid var(--color-border-light)',
                transition: 'all 0.2s ease',
              }}
            />

            {/* Tooltip on hover */}
            <span
              role="tooltip"
              className="pointer-events-none absolute right-full mr-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                background: 'var(--color-bg-primary)',
                border: 'var(--border-thin)',
                color: 'var(--color-text-primary)',
                boxShadow: 'var(--shadow-hard-sm)',
              }}
            >
              {sec.roman} · {sec.label}
            </span>
          </button>
        );
      })}
      <div
        style={{
          width: '1px',
          height: '14px',
          background: 'var(--color-border-light)',
          marginTop: '2px',
        }}
      />
    </nav>
  );
}
