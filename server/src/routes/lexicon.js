import express from 'express';
import { GLOSSARY_TERMS } from '../ai/glossary.js';
import { snapshot } from '../ai/cache.js';

const router = express.Router();

/**
 * GET /api/v1/ai/lexicon
 * Merges curated glossary with live explain-cache snapshots,
 * dedupes by term (case-insensitive), and sorts alphabetically.
 */
router.get('/', (req, res) => {
  try {
    const termMap = new Map();

    // 1. Seed curated glossary terms
    for (const item of GLOSSARY_TERMS) {
      if (item.term && item.definition) {
        termMap.set(item.term.toLowerCase().trim(), {
          term: item.term,
          definition: item.definition,
        });
      }
    }

    // 2. Merge live explain-cache snapshots
    const liveSnapshots = snapshot();
    for (const entry of liveSnapshots) {
      if (entry.key && entry.value) {
        const normalized = entry.key.toLowerCase().trim();
        if (!termMap.has(normalized)) {
          termMap.set(normalized, {
            term: entry.key,
            definition: typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value),
          });
        }
      }
    }

    // 3. Sort alphabetically by term
    const result = Array.from(termMap.values()).sort((a, b) =>
      a.term.localeCompare(b.term, undefined, { sensitivity: 'base' })
    );

    res.json(result);
  } catch (err) {
    console.error('Error fetching lexicon:', err);
    res.status(500).json({ error: 'Failed to fetch lexicon' });
  }
});

export default router;
