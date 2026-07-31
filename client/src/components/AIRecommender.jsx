import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AIRecommender({ onSelectItem }) {
  const [mode, setMode] = useState('presets');
  const [budget, setBudget] = useState('50000');
  const [p1, setP1] = useState('Camera');
  const [p2, setP2] = useState('Battery');
  const [p3, setP3] = useState('Display');
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const priorities = ['Camera', 'Battery', 'Gaming', 'Display', 'Software', 'Build Quality', 'Fast Charging'];

  const getRecommendation = async () => {
    setLoading(true);
    setResult(null);
    
    let prompt = "";
    if (mode === 'presets') {
      prompt = `I have a budget of ₹${budget}. My top priorities are 1. ${p1}, 2. ${p2}, and 3. ${p3}. Recommend the 3 best real smartphones globally that fit this criteria. Give me the exact phone name and a 1-sentence reason for each. Do not limit yourself to any specific database.`;
    } else {
      prompt = `Based on this request: "${freeText}", recommend the 3 best real smartphones globally. Give me the exact phone name and a 1-sentence reason for each.`;
    }

    try {
      const res = await axios.post(`${API}/api/ai/chat`, { message: prompt });
      setResult({ text: res.data.reply });
    } catch (error) {
      setResult({ text: "Sorry, the AI service is currently offline." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-32 border-t border-[var(--border)]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold uppercase tracking-tight mb-4">AI Recommender</h2>
        <p className="text-[var(--text-secondary)]">Not sure what to buy? Let our AI find the perfect phone for you.</p>
      </div>

      <div className="max-w-2xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border)] p-8">
        <div className="flex gap-2 mb-8 justify-center">
          <button onClick={() => setMode('presets')} className={`px-6 py-2 text-xs font-mono-tech uppercase tracking-widest ${mode === 'presets' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>Preset Options</button>
          <button onClick={() => setMode('text')} className={`px-6 py-2 text-xs font-mono-tech uppercase tracking-widest ${mode === 'text' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>Free Text</button>
        </div>

        {mode === 'presets' ? (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-mono-tech uppercase text-[var(--text-muted)] block mb-2">Budget: ₹{Number(budget).toLocaleString('en-IN')}</label>
              <input type="range" min="15000" max="150000" step="5000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full accent-[var(--accent)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono-tech uppercase text-[var(--text-muted)] block mb-2">Priority 1</label>
                <select value={p1} onChange={(e) => setP1(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono-tech uppercase text-[var(--text-muted)] block mb-2">Priority 2</label>
                <select value={p2} onChange={(e) => setP2(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono-tech uppercase text-[var(--text-muted)] block mb-2">Priority 3</label>
                <select value={p3} onChange={(e) => setP3(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="e.g., I want a phone under 40k with great battery and a clean UI for my mother." className="w-full bg-[var(--bg)] border border-[var(--border)] p-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] h-24" />
          </div>
        )}

        <button onClick={getRecommendation} disabled={loading} className="w-full mt-8 bg-[var(--accent)] text-[var(--accent-contrast)] font-bold py-3 uppercase tracking-wider text-xs hover:opacity-80 transition-opacity disabled:opacity-50">
          {loading ? 'AI is Thinking...' : 'Get Recommendation'}
        </button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-[var(--bg)] border border-[var(--border)] p-6 relative">
            <button onClick={() => setResult(null)} className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--accent)] text-xs border border-[var(--border)] px-2 py-1">Close</button>
            <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap pr-12">{result.text}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}