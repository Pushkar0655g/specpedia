import { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('spec-codex-theme');
    if (saved === 'codex' || saved === 'midnight') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'midnight';
    }
    return 'codex';
  });

  const [wipe, setWipe] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('spec-codex-theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = (e) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const nextTheme = theme === 'codex' ? 'midnight' : 'codex';
    const nextBg = nextTheme === 'midnight' ? '#141210' : '#F4EFE6';

    if (prefersReducedMotion) {
      setThemeState(nextTheme);
      return;
    }

    let x = window.innerWidth / 2;
    let y = 40;
    if (e && (e.currentTarget || e.target)) {
      const el = e.currentTarget || e.target;
      if (typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect();
        x = Math.round(rect.left + rect.width / 2);
        y = Math.round(rect.top + rect.height / 2);
      }
    }

    document.documentElement.style.setProperty('--wipe-x', `${x}px`);
    document.documentElement.style.setProperty('--wipe-y', `${y}px`);

    setWipe({ x, y, bg: nextBg });

    // Swap data-theme at 250ms
    setTimeout(() => {
      setThemeState(nextTheme);
    }, 250);

    // Remove overlay at 500ms
    setTimeout(() => {
      setWipe(null);
    }, 500);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isMidnight: theme === 'midnight',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {wipe && (
        <div
          className="codex-ink-wipe-overlay"
          style={{
            '--wipe-x': `${wipe.x}px`,
            '--wipe-y': `${wipe.y}px`,
            '--wipe-bg': wipe.bg,
            background: wipe.bg,
          }}
          aria-hidden="true"
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}