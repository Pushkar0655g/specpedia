import React, { useEffect, useRef } from 'react';

/**
 * Astrolabe Inline SVG for ancient astronomical precision motif
 */
function AstrolabeSVG({ className = '', style = {} }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Outer Ring */}
      <circle cx="50" cy="50" r="46" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="42" stroke="var(--color-primary)" strokeWidth="1.5" />
      {/* Astrolabe Throne Top */}
      <path d="M42 4 C42 0, 58 0, 58 4 L54 8 L46 8 Z" fill="var(--color-accent)" />
      <circle cx="50" cy="4" r="3" stroke="var(--color-primary)" strokeWidth="1" fill="none" />
      {/* Coordinate Crosshairs */}
      <line x1="8" y1="50" x2="92" y2="50" stroke="var(--color-border-light)" strokeWidth="0.8" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="var(--color-border-light)" strokeWidth="0.8" />
      {/* Celestial Circles & Rete Stars */}
      <circle cx="50" cy="38" r="26" stroke="var(--color-accent)" strokeWidth="1" />
      <circle cx="50" cy="62" r="22" stroke="var(--color-primary)" strokeWidth="0.8" strokeDasharray="2 2" />
      {/* Rete Pointer Stars */}
      <polygon points="50,14 52,18 50,22 48,18" fill="var(--color-accent)" />
      <polygon points="76,50 80,52 84,50 80,48" fill="var(--color-accent)" />
      <polygon points="24,50 20,52 16,50 20,48" fill="var(--color-accent)" />
      {/* Center Pivot Pin */}
      <circle cx="50" cy="50" r="3.5" fill="var(--color-wax-red, #8B1E0F)" stroke="var(--color-border-heavy)" strokeWidth="1" />
    </svg>
  );
}

export default function Scriptorium() {
  const unrollRef = useRef(null);

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
  }, []);

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
      <div className="text-center mb-16">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          Product Mission & Architecture
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '0.02em',
            marginTop: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
          }}
        >
          About SpecPedia
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          In a world of marketing noise and spec overload, SpecPedia delivers verified hardware data, plain-language explanations, and unbiased AI buying advice.
        </p>
      </div>

      {/* Two-Column Illuminated Spread (md+) */}
      <div ref={unrollRef} className="codex-unroll grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 items-start">
        {/* Left Column: Prose Blocks with Drop-Caps */}
        <div className="md:col-span-8 space-y-12">
          {/* Block 1: The Problem */}
          <section className="space-y-4">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              The Problem: Spec-Sheet Overload
            </h2>
            <p className="codex-dropcap text-base leading-relaxed text-[var(--color-text-secondary)]">
              Modern consumer electronics have descended into deliberate spec overload. Technical specification sheets spanning eighty obscure parameters are authored not to clarify, but to obscure compromises in thermal management, display sub-pixel arrangements, and storage standards. Buyers are trapped between promotional influencer reviews and dense technical jargon. SpecPedia was created to replace marketing noise with clear, factual, and actionable hardware insights.
            </p>
          </section>

          {/* Block 2: How SpecPedia Helps */}
          <section className="space-y-4">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              How SpecPedia Helps
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              Whether you are buying your first smartphone or evaluating silicon architectures, SpecPedia tailors information to your needs:
            </p>

            <div
              style={{
                border: 'var(--border-thick)',
                background: 'var(--color-bg-surface)',
                overflowX: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-surface-2)', borderBottom: 'var(--border-thin)' }}>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Buyer Persona</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Key Challenge</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>How SpecPedia Helps</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: 'var(--font-body)' }}>
                  <tr style={{ borderBottom: 'var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Everyday Buyers</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>Overwhelmed by technical specs</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Plain-language summaries, battery endurance context, and clear camera ratings.</td>
                  </tr>
                  <tr style={{ borderBottom: 'var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Non-Technical Users</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>Unfamiliar jargon & buzzwords</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Interactive one-click spec explanations and an A–Z Silicon Glossary.</td>
                  </tr>
                  <tr style={{ borderBottom: 'var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Power Users</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>Superficial marketing specs</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Deep architectural parameters: sensor models, SoC clock nodes, and panel technologies.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Gift Buyers</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>Strict budget constraints</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Oracle AI advisor matches priorities and exact price limits in seconds.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Block 3: The Method */}
          <section className="space-y-6">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              How Oracle Works: Retrieve → Ground → Verdict
            </h2>
            <p className="codex-dropcap text-base leading-relaxed text-[var(--color-text-secondary)]">
              Unlike generic chatbots that hallucinate outdated specs, Oracle executes a grounded three-step analysis for every recommendation and comparison:
            </p>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div
                className="p-5 flex flex-col justify-between"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-hard-sm)',
                }}
              >
                <div>
                  <span
                    className="codex-quality-seal inline-block mb-3"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    Step I · Retrieve
                  </span>
                  <h3 className="font-heading font-bold text-sm mb-2">Verified Ingestion</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                    Queries our structured database of verified component specifications, sensor models, and tested battery capacities.
                  </p>
                </div>
              </div>

              <div
                className="p-5 flex flex-col justify-between"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-hard-sm)',
                }}
              >
                <div>
                  <span
                    className="codex-value-seal inline-block mb-3"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    Step II · Ground
                  </span>
                  <h3 className="font-heading font-bold text-sm mb-2">Segment Anchoring</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                    Normalizes performance against price percentiles and current market segment benchmarks without sponsored bias.
                  </p>
                </div>
              </div>

              <div
                className="p-5 flex flex-col justify-between"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-hard-sm)',
                }}
              >
                <div>
                  <span
                    className="codex-price-seal inline-block mb-3"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    Step III · Verdict
                  </span>
                  <h3 className="font-heading font-bold text-sm mb-2">Plain Verdict</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                    Delivers explainable, plain-language recommendations balancing hardware Quality (Q) and economic Value (V).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Block 4: Our Principles */}
          <section className="space-y-4">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              Our Principles
            </h2>
            <p className="codex-dropcap text-base leading-relaxed text-[var(--color-text-secondary)]">
              We operate under an uncompromising pledge to clarity and user trust. SpecPedia carries zero paid product placements, hosts no disruptive ads, and collects no telemetry for brokers. Recommendations are grounded purely in hardware capabilities and real market pricing.
            </p>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm font-mono"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>100% Ad-Free:</strong> No sponsored rankings, affiliate traps, or banner clutter.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>Verified Data:</strong> Every spec entry is sourced and audited against manufacturer data sheets.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>Explainable AI:</strong> Every pick includes transparent reasoning detailing why it was chosen.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>Lightweight & Accessible:</strong> Fast page loads, keyboard navigation, and high-contrast dark modes.
              </li>
            </ul>
          </section>

          {/* Block 5: Built With */}
          <section className="space-y-4">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              Built With: Modern Web Engineering
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              SpecPedia combines clean typography with high-performance web engineering:
            </p>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm font-mono"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>React 19 & Vite:</strong> Ultra-fast client interface with responsive interactions.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>Express & Node.js:</strong> Deterministic REST contracts with OpenAPI 3.0 specifications.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>Supabase PostgreSQL:</strong> Relational catalog with structured JSONB hardware matrices.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
                <strong>Groq Llama 3.3:</strong> Sub-second streaming inference powering Oracle.
              </li>
              <li className="p-3 bg-[var(--color-bg-surface)] border-[var(--border-thin)] sm:col-span-2">
                <strong>Vanilla Design System:</strong> Refined CSS tokens supporting Parchment and Midnight themes.
              </li>
            </ul>
          </section>
        </div>

        {/* Right Column: Sticky Marginalia Spread */}
        <aside className="md:col-span-4 md:sticky md:top-28 space-y-8">
          {/* Pull Quote 1 */}
          <div
            className="p-6 bg-[var(--color-bg-surface)] border-[var(--border-thin)] shadow-[var(--shadow-hard-sm)]"
            style={{ borderLeft: '4px solid var(--color-wax-red, #8B1E0F)' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                lineHeight: 1.4,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              “Clarity in specifications empowers confident decisions. Technology should serve people, not marketing departments.”
            </p>
            <span className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider block">
              — SpecPedia Manifesto
            </span>
          </div>

          {/* Pull Quote 2 */}
          <div
            className="p-6 bg-[var(--color-bg-surface)] border-[var(--border-thin)] shadow-[var(--shadow-hard-sm)]"
            style={{ borderLeft: '4px solid var(--color-wax-red, #8B1E0F)' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                lineHeight: 1.4,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              “Every device evaluated on hardware merits, never on promotional spend.”
            </p>
            <span className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider block">
              — Core Principles
            </span>
          </div>

          {/* Astrolabe Illustration */}
          <div className="flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-surface)] border-[var(--border-thin)]">
            <AstrolabeSVG />
            <span className="font-mono text-xs text-[var(--color-text-muted)] mt-3">
              Fig. I · SpecPedia Evaluation Engine
            </span>
          </div>
        </aside>
      </div>

      {/* ═══════════════ ROADMAP ═══════════════ */}
      <section
        id="roadmap"
        className="codex-deckle-top pt-12"
        style={{
          borderTop: 'var(--border-thick)',
        }}
      >
        <div className="text-center mb-10">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Future Expansion
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              letterSpacing: '0.02em',
              marginTop: 'var(--space-2)',
            }}
          >
            Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              vol: 'Volume I',
              title: 'Electronics & Computing',
              desc: 'Laptops, tablets, and personal computing hardware cataloged with deep performance benchmarks.',
              status: 'PLANNED',
            },
            {
              vol: 'Volume II',
              title: 'Automobiles',
              desc: 'Electric vehicles and automobiles with standardized battery capacities, range, and charging metrics.',
              status: 'PLANNED',
            },
            {
              vol: 'Volume III',
              title: 'Wearables & Audio',
              desc: 'Smartwatches, earbuds, and audio gear with real-world battery endurance and acoustic tests.',
              status: 'PLANNED',
            },
          ].map((ch) => (
            <div
              key={ch.vol}
              style={{
                background: 'var(--color-bg-surface)',
                border: 'var(--border-thin)',
                boxShadow: 'var(--shadow-hard-sm)',
                padding: 'var(--space-6)',
              }}
            >
              <span className="codex-badge" style={{ marginBottom: 'var(--space-3)' }}>
                {ch.status}
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: 'var(--space-2)',
                }}
              >
                {ch.vol}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  marginTop: 'var(--space-1)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {ch.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {ch.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
