import SealMark from './SealMark';

const Footer = () => {
  return (
    <footer style={{
      borderTop: 'var(--border-thin)',
      background: 'var(--color-bg-primary)',
      padding: 'var(--space-8) var(--space-6)',
    }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Product branding */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <SealMark variant="mono" size={40} style={{ transform: 'rotate(-6deg)' }} />
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--color-text-primary)',
            }}>
              Spec<span style={{ color: 'var(--color-primary)' }}>Pedia</span>
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
              — The AI-powered product encyclopedia.
            </span>
          </div>
        </div>

        {/* Center: Navigation links */}
        <div className="flex items-center gap-6">
          <a href="/about" className="codex-footer-link" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            About
          </a>
          <a href="/lexicon" className="codex-footer-link" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Glossary
          </a>
          <a href="/#chronicle" className="codex-footer-link" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Price Trends
          </a>
          <a
            href="https://github.com/Pushkar0655g/specpedia"
            target="_blank"
            rel="noopener noreferrer"
            className="codex-footer-link flex items-center gap-1.5"
            aria-label="GitHub repository"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.39-1.335-1.76-1.335-1.76-1.09-.745.082-.73.082-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.694.825.577C20.565 21.795 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        {/* Right: Copyright & Tech */}
        <div className="text-center md:text-right">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            © 2025 SpecPedia. Built with React, Express, Supabase & Groq.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;