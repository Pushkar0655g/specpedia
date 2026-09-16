import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="codex-404">
      <div style={{
        width: '60px',
        height: '4px',
        background: 'var(--color-primary)',
        marginBottom: 'var(--space-6)',
      }} />
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="codex-btn" style={{ fontSize: 'var(--text-base)', padding: 'var(--space-4) var(--space-8)' }}>
        Return to Catalog
      </Link>
    </div>
  );
}
