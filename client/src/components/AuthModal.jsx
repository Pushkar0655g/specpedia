import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithOtp } from '../lib/supabase';
import useEscape from '../hooks/useEscape';

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEscape(onClose);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await signInWithOtp(email.trim());
      if (error) {
        throw error;
      }
      setStatus('success');
    } catch (err) {
      console.error('Sign-in OTP error:', err);
      setErrorMessage(err.message || 'Could not dispatch magic link. Please check your credentials.');
      setStatus('error');
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Sign In Modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: 'var(--space-4)', background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full relative overflow-hidden"
        style={{
          maxWidth: '460px',
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
          padding: 'var(--space-8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              Imperial Seal
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                marginTop: 'var(--space-1)',
              }}
            >
              Access the Archives
            </h2>
          </div>
          <button
            onClick={onClose}
            className="codex-modal-close"
            aria-label="Close sign in dialog"
          >
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-bg-primary)',
              border: 'var(--border-thin)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: 'var(--space-3)',
              }}
            >
              ✉️
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                marginBottom: 'var(--space-2)',
              }}
            >
              Magic Link Dispatched
            </h3>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-6)',
              }}
            >
              An ancient seal has been dispatched to{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>. Open the link in your email to sign in instantly.
            </p>
            <button
              onClick={onClose}
              className="codex-btn"
              style={{ width: '100%', padding: 'var(--space-3)' }}
            >
              Return to Catalog
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              Sign in with your email to bookmark devices, monitor price drops, and receive automatic alerts.
            </p>

            <div>
              <label
                htmlFor="auth-email-input"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Email Address
              </label>
              <input
                id="auth-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scribe@alexandria.org"
                required
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-bg-primary)',
                  border: 'var(--border-thick)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                }}
              />
            </div>

            {status === 'error' && (
              <div
                role="alert"
                style={{
                  padding: 'var(--space-3)',
                  background: 'rgba(122, 62, 44, 0.1)',
                  border: '2px solid var(--color-accent)',
                  color: 'var(--color-accent)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="codex-btn"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                marginTop: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {status === 'loading' ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  <span>Dispatching Link...</span>
                </>
              ) : (
                'Send Magic Link →'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
