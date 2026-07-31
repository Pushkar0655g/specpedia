import { useTheme } from './ThemeContext';

const LABELS = { blueprint: 'Blueprint', midnight: 'Midnight', minimal: 'Minimal' };

export default function ThemeSwitcher() {
  const { theme, setTheme, THEMES } = useTheme();

  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 999,
    }}>
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            background: theme === t ? 'var(--accent)' : 'transparent',
            color: theme === t ? 'var(--accent-contrast)' : 'var(--text-secondary)',
            transition: 'background 0.15s ease',
          }}
        >
          {LABELS[t]}
        </button>
      ))}
    </div>
  );
}