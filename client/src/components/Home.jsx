import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from './ProductModal';
import BrandModal from './BrandModal';
import AIRecommender from './AIRecommender';
import CommandCenter from './CommandCenter';
import CompareModal from './CompareModal';
import MarketChronicle from './MarketChronicle';
import ThumbIndex from './ThumbIndex';
import IndexerDrawer from './IndexerDrawer';
import { useWatchlist } from '../context/WatchlistContext';
import SealMark from './SealMark';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { computeCodexScore } from '../lib/scoring';

const BRAND_HUES = {
  apple: 'var(--hue-brand-apple)',
  samsung: 'var(--hue-brand-samsung)',
  google: 'var(--hue-brand-google)',
  oneplus: 'var(--hue-brand-oneplus)',
  xiaomi: 'var(--hue-brand-xiaomi)',
  vivo: 'var(--hue-brand-vivo)',
  oppo: 'var(--hue-brand-oppo)',
  nothing: 'var(--hue-brand-nothing)',
  motorola: 'var(--hue-brand-motorola)',
  asus: 'var(--hue-brand-asus)',
};

const fallbackBrands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Nothing', 'Motorola', 'Asus'];

/* ═══════════════ TYPEWRITER TAGLINE ═══════════════ */
function TypewriterTagline() {
  const fullText = 'SpecPedia helps you choose with confidence — 100+ smartphones with plain-language spec explanations, natural-language AI search, and side-by-side comparisons. No ads, no jargon.';
  const [displayedText, setDisplayedText] = useState('');
  const [cursorPhase, setCursorPhase] = useState('hidden'); // hidden | typing | blink | fade | done
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setDisplayedText(fullText);
      setCursorPhase('done');
      return;
    }

    // Wait for ink-reveal to finish (900ms)
    const startDelay = setTimeout(() => {
      setCursorPhase('typing');
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setDisplayedText(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(interval);
          // Blink twice then fade
          setCursorPhase('blink');
          setTimeout(() => {
            setCursorPhase('fade');
            setTimeout(() => setCursorPhase('done'), 400);
          }, 1000); // 2 blinks at 0.5s each
        }
      }, 28);

      return () => clearInterval(interval);
    }, 900);

    return () => clearTimeout(startDelay);
  }, []);

  const cursorClass = cursorPhase === 'typing'
    ? 'codex-typewriter-cursor'
    : cursorPhase === 'blink'
    ? 'codex-typewriter-cursor codex-typewriter-cursor--blink'
    : cursorPhase === 'fade'
    ? 'codex-typewriter-cursor codex-typewriter-cursor--fade'
    : '';

  return (
    <p
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xl)',
        color: 'var(--color-text-secondary)',
        maxWidth: '500px',
        margin: '0 auto',
        lineHeight: 1.6,
        marginBottom: 'var(--space-10)',
        minHeight: '2em',
      }}
    >
      {displayedText}
      {cursorPhase !== 'done' && cursorPhase !== 'hidden' && (
        <span className={cursorClass} />
      )}
    </p>
  );
}

/* ═══════════════ STATS COUNT-UP ═══════════════ */
function StatsCountUp({ target, duration = 1200, color = 'var(--color-primary)', label, prefix = '', icon = null }) {
  const [count, setCount] = useState(0);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasIntersected]);

  useEffect(() => {
    if (!hasIntersected) return;

    if (prefersReducedMotion.current) {
      setCount(target);
      return;
    }

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hasIntersected, target, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="codex-stats-numeral" style={{ color }}>
        {icon}{prefix}{count}
      </div>
      <div className="codex-stats-label">{label}</div>
    </div>
  );
}

/* ═══════════════ CROSSED-OUT BANNER SVG ═══════════════ */
function CrossedOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '2px' }} aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" rx="1" stroke="var(--color-secondary)" strokeWidth="1.5" />
      <line x1="2" y1="4" x2="14" y2="12" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="4" x2="2" y2="12" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════ PEEK BUTTON SVG ═══════════════ */
function PeekIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState(fallbackBrands.map(b => ({ name: b })));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // For Peek modal
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [compareIds, setCompareIds] = useState(null);
  const [stagedCompareItem, setStagedCompareItem] = useState(null);
  const [sortBy, setSortBy] = useState('score_desc');
  const { isItemWatched, toggleWatchlist } = useWatchlist();

  // Archive View switcher: 'Folio Grid' | 'Ledger' | 'Stacks'
  const [archiveView, setArchiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('codex-view') || 'Folio Grid';
    }
    return 'Folio Grid';
  });

  const handleViewChange = (v) => {
    setArchiveView(v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('codex-view', v);
    }
  };

  // Indexer Desk Refine Drawer state & filters
  const [isIndexerOpen, setIsIndexerOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const min = searchParams.get('min');
    const max = searchParams.get('max');
    const tier = searchParams.get('tier');
    const batt = searchParams.get('batt');
    const display = searchParams.get('display');
    return {
      minPrice: min !== null && min !== '' ? Number(min) : '',
      maxPrice: max !== null && max !== '' ? Number(max) : '',
      tiers: tier ? tier.split(',').filter(Boolean) : [],
      minBattery: batt || '',
      displays: display ? display.split(',').filter(Boolean) : [],
    };
  });

  const updateFilters = useCallback((nextFilters) => {
    setFilters(nextFilters);
    const newParams = new URLSearchParams();
    if (nextFilters.minPrice !== '' && nextFilters.minPrice !== undefined) {
      newParams.set('min', String(nextFilters.minPrice));
    }
    if (nextFilters.maxPrice !== '' && nextFilters.maxPrice !== undefined) {
      newParams.set('max', String(nextFilters.maxPrice));
    }
    if (nextFilters.tiers && nextFilters.tiers.length > 0) {
      newParams.set('tier', nextFilters.tiers.join(','));
    }
    if (nextFilters.minBattery) {
      newParams.set('batt', String(nextFilters.minBattery));
    }
    if (nextFilters.displays && nextFilters.displays.length > 0) {
      newParams.set('display', nextFilters.displays.join(','));
    }
    setSearchParams(newParams, { replace: true });
  }, [setSearchParams]);

  // Sync state if URL query params change externally
  useEffect(() => {
    const min = searchParams.get('min');
    const max = searchParams.get('max');
    const tier = searchParams.get('tier');
    const batt = searchParams.get('batt');
    const display = searchParams.get('display');
    setFilters({
      minPrice: min !== null && min !== '' ? Number(min) : '',
      maxPrice: max !== null && max !== '' ? Number(max) : '',
      tiers: tier ? tier.split(',').filter(Boolean) : [],
      minBattery: batt || '',
      displays: display ? display.split(',').filter(Boolean) : [],
    });
  }, [searchParams]);

  const resetFilters = () => {
    updateFilters({
      minPrice: '',
      maxPrice: '',
      tiers: [],
      minBattery: '',
      displays: [],
    });
  };

  // rAF-throttled scroll listener for marginalia parallax
  const [parallaxY, setParallaxY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setParallaxY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats from API
  const [stats, setStats] = useState({ deviceCount: 0, brandCount: 0 });

  // Read ?compare=id1,id2 on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const compareParam = params.get('compare');
      if (compareParam) {
        const parts = compareParam.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          setCompareIds([parts[0], parts[1]]);
        }
      }
    }
  }, []);

  const handleCompareStage = (item) => {
    if (!stagedCompareItem) {
      setStagedCompareItem(item);
      setSelectedItem(null);
    } else if (stagedCompareItem.id !== item.id) {
      const idA = stagedCompareItem.id;
      const idB = item.id;
      setStagedCompareItem(null);
      setSelectedItem(null);
      setCompareIds([idA, idB]);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/items', { params: { limit: 200 } });
      if (Array.isArray(res.data)) {
        setItems(res.data);
        setLoading(false);
      } else {
        throw new Error('No items returned');
      }
    } catch (err) {
      console.warn('API fetch failed, querying Supabase directly:', err.message);
      try {
        const { data, error: sbErr } = await supabase
          .from('items')
          .select('*')
          .eq('category_id', 1)
          .order('id', { ascending: true })
          .limit(200);

        if (sbErr) throw sbErr;
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((item) => ({
            ...item,
            codexScore: computeCodexScore(item),
          }));
          setItems(enriched);
          setLoading(false);
        } else {
          throw new Error('No items found in database');
        }
      } catch (fallbackErr) {
        console.error('Failed to load items from both API and Supabase:', fallbackErr);
        setError('The ancient catalog could not be unsealed. The archives may be offline.');
        setLoading(false);
      }
    }

    api.get('/items/brands')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setBrands(res.data);
      })
      .catch(async () => {
        try {
          const { data } = await supabase.from('items').select('brand').eq('category_id', 1);
          if (data) {
            const counts = data.reduce((acc, row) => {
              if (row.brand) acc[row.brand] = (acc[row.brand] || 0) + 1;
              return acc;
            }, {});
            const brandList = Object.keys(counts).map(b => ({ name: b, brand: b, count: counts[b] }));
            if (brandList.length > 0) setBrands(brandList);
          }
        } catch (_e) {}
      });

    // Fetch stats for the band
    api.get('/items/stats')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(async () => {
        try {
          const { count } = await supabase.from('items').select('id', { count: 'exact', head: true }).eq('category_id', 1);
          if (count != null) setStats({ deviceCount: count, brandCount: 10 });
        } catch (_e) {}
      });
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const mobiles = items.filter(i => !i.category_id || Number(i.category_id) === 1);

  const priceBounds = useMemo(() => {
    const prices = mobiles.map(m => Number(m.price)).filter(p => !isNaN(p) && p > 0);
    if (prices.length === 0) return { min: 10000, max: 150000 };
    return {
      min: Math.floor(Math.min(...prices) / 1000) * 1000,
      max: Math.ceil(Math.max(...prices) / 1000) * 1000,
    };
  }, [mobiles]);

  const filteredMobiles = useMemo(() => {
    return mobiles.filter((item) => {
      const price = Number(item.price);
      if (filters.minPrice !== '' && filters.minPrice !== undefined && price < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice !== '' && filters.maxPrice !== undefined && price > Number(filters.maxPrice)) {
        return false;
      }
      if (filters.tiers && filters.tiers.length > 0) {
        const q = item.codexScore?.quality ?? 50;
        const matchesTier = filters.tiers.some((tierId) => {
          if (tierId === 'flagship') return q >= 80;
          if (tierId === 'upper-mid') return q >= 60 && q <= 79;
          if (tierId === 'mid') return q >= 40 && q <= 59;
          if (tierId === 'entry') return q < 40;
          return false;
        });
        if (!matchesTier) return false;
      }
      if (filters.minBattery) {
        const battStr = item.specs?.battery || (item.specs?.battery_capacity ? String(item.specs.battery_capacity) : '');
        const battNum = parseInt(battStr, 10);
        if (!battNum || battNum < Number(filters.minBattery)) {
          return false;
        }
      }
      if (filters.displays && filters.displays.length > 0) {
        const dispStr = (item.specs?.display || item.specs?.screen || '').toLowerCase();
        const matchesDisplay = filters.displays.some((d) => dispStr.includes(d.toLowerCase()));
        if (!matchesDisplay) return false;
      }
      return true;
    });
  }, [mobiles, filters]);

  const sortedMobiles = useMemo(() => {
    const list = [...filteredMobiles];
    switch (sortBy) {
      case 'score_desc':
        return list.sort((a, b) => (b.codexScore?.score ?? 50) - (a.codexScore?.score ?? 50));
      case 'price_asc':
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price_desc':
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case 'name_asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filteredMobiles, sortBy]);

  // Brand shelves for Stacks view
  const brandShelves = useMemo(() => {
    const map = new Map();
    sortedMobiles.forEach((item) => {
      const b = item.brand || 'Other';
      if (!map.has(b)) map.set(b, []);
      map.get(b).push(item);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sortedMobiles]);

  const homeSections = useMemo(() => [
    { id: 'archive', roman: 'I', label: 'Archive' },
    { id: 'oracle', roman: 'II', label: 'Oracle' },
    { id: 'chronicle', roman: 'III', label: 'Chronicle' },
  ], []);

  const getChip = (item) => item.specs?.chip || item.specs?.processor || item.specs?.soc || '—';
  const getBattery = (item) => item.specs?.battery || (item.specs?.battery_capacity ? `${item.specs.battery_capacity} mAh` : '—');
  const getDisplay = (item) => item.specs?.display || item.specs?.screen || '—';

  const activeFilterCount =
    (filters.minPrice !== '' && filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== '' && filters.maxPrice !== undefined ? 1 : 0) +
    (filters.tiers?.length || 0) +
    (filters.minBattery ? 1 : 0) +
    (filters.displays?.length || 0);

  // Navigate to folio page
  const goToDevice = useCallback((item) => {
    if (!item) return;
    const slug = item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null);
    if (slug) {
      navigate(`/device/${slug}`);
    } else {
      setSelectedItem(item); // Fallback to modal if no slug
    }
  }, [navigate]);

  // Navigate from brand/command modals
  const handleBrandSelect = useCallback((item) => {
    setSelectedBrand(null);
    goToDevice(item);
  }, [goToDevice]);

  const handleCommandSelect = useCallback((item) => {
    setIsCmdOpen(false);
    goToDevice(item);
  }, [goToDevice]);

  return (
    <div style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="codex-hero-section relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ padding: 'var(--space-10) var(--space-6)', paddingTop: '100px' }}
      >
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute right-12 top-1/4 select-none"
          style={{
            transform: `translateY(${parallaxY * 0.05}px) rotate(12deg)`,
            color: 'var(--color-primary)',
            opacity: 0.07,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 12.5V21h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-3xl mx-auto"
        >
          {/* Decorative seal */}
          <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
            <SealMark variant="colour" size={56} decorative className="codex-hero-seal" />
          </div>

          {/* Eyebrow */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-3)',
          }}>
            AI-POWERED PRODUCT ENCYCLOPEDIA
          </div>

          <h1
            className="codex-ink-reveal"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginBottom: 'var(--space-4)',
              color: 'var(--color-text-primary)',
            }}
          >
            Specs, <span style={{ color: 'var(--color-primary)' }}>reimagined.</span>
          </h1>

          {/* Hand-drawn SVG quill line */}
          <div className="flex justify-center" style={{ margin: '0 auto var(--space-6)' }}>
            <svg width="220" height="12" viewBox="0 0 220 12" fill="none" className="overflow-visible" aria-hidden="true">
              <path
                d="M 2,6 Q 55,2 110,6 T 218,6"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="codex-quill-line"
              />
            </svg>
          </div>

          {/* Typewriter tagline — no drop-cap */}
          <TypewriterTagline />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const el = document.getElementById('oracle');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="codex-btn"
              style={{ fontSize: 'var(--text-base)', padding: 'var(--space-4) var(--space-8)' }}
            >
              Ask Oracle
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('archive') || document.getElementById('products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="codex-btn-outline"
              style={{ fontSize: 'var(--text-base)', padding: 'var(--space-4) var(--space-8)' }}
            >
              Browse devices
            </button>
          </div>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              border: 'var(--border-thin)',
              padding: 'var(--space-1) var(--space-3)',
              background: 'var(--color-bg-surface)',
            }}>
              Press ⌘K or Ctrl+K to search
            </span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section style={{
        borderTop: 'var(--border-thick)',
        borderBottom: 'var(--border-thick)',
        background: 'var(--color-bg-surface)',
        padding: 'var(--space-8) var(--space-6)',
      }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center" style={{ gap: 'var(--space-6)' }}>
          <StatsCountUp
            target={stats.deviceCount || mobiles.length || 100}
            color="var(--color-primary)"
            label="Devices cataloged"
          />
          <StatsCountUp
            target={stats.brandCount || brands.length || 10}
            color="var(--color-primary)"
            label="Manufacturers"
          />
          <StatsCountUp
            target={3}
            color="var(--color-accent)"
            label="Oracle engines"
          />
          <StatsCountUp
            target={0}
            color="var(--color-secondary)"
            label="Ads, forever"
            icon={<CrossedOutIcon />}
          />
        </div>
      </section>

      {/* ═══════════════ BRANDS STRIP ═══════════════ */}
      <section style={{
        padding: 'var(--space-8) var(--space-6)',
        borderBottom: 'var(--border-thick)',
        background: 'var(--color-bg-primary)',
      }}>
        <div className="max-w-6xl mx-auto">
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}>
            Browse by brand
          </p>
          <div className="flex flex-wrap justify-center items-start" style={{ gap: 'var(--space-6)' }}>
            {brands.map(brand => {
              const bName = brand.name || brand.brand;
              const initial = (bName || '?').charAt(0).toUpperCase();
              return (
                <div key={bName} className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      btn.classList.remove('anim-stamp-thunk');
                      void btn.offsetWidth;
                      btn.classList.add('anim-stamp-thunk');
                      setSelectedBrand(bName);
                    }}
                    onAnimationEnd={(e) => {
                      e.currentTarget.classList.remove('anim-stamp-thunk');
                    }}
                    title={bName}
                    aria-label={`Filter by ${bName} (${brand.count || 0} devices)`}
                    className="codex-wax-seal-chip"
                  >
                    <span className="codex-wax-seal-letter">{initial}</span>
                  </button>
                  <div className="codex-wax-seal-tag">
                    <span className="codex-wax-seal-brand-name">{bName}</span>
                    {brand.count ? (
                      <span className="codex-wax-seal-count">{brand.count}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ ORACLE (AI Recommender) ═══════════════ */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute left-8 top-1/4 select-none"
          style={{
            transform: `translateY(${parallaxY * 0.05}px)`,
            color: 'var(--color-accent)',
            opacity: 0.06,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
        <AIRecommender onSelectItem={goToDevice} />
      </div>

      {/* ═══════════════ MARKET CHRONICLE ═══════════════ */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute right-8 top-1/3 select-none"
          style={{
            transform: `translateY(${parallaxY * 0.07}px)`,
            color: 'var(--color-wax-red, #8B1E0F)',
            opacity: 0.06,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" strokeDasharray="2 2" />
            <circle cx="12" cy="10" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
          </svg>
        </div>
        <MarketChronicle />
      </div>

      {/* ═══════════════ THE ARCHIVE (Three-View Reading Room) ═══════════════ */}
      <div id="archive" className="max-w-6xl mx-auto" style={{ padding: 'var(--space-12) var(--space-6)' }}>
        <span id="products" className="sr-only" aria-hidden="true" />
        {error ? (
          <div style={{
            background: 'var(--color-bg-surface)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-hard-md)',
            padding: 'var(--space-8) var(--space-6)',
            textAlign: 'center',
            margin: 'var(--space-8) 0',
          }}>
            <div style={{
              width: '40px',
              height: '4px',
              background: 'var(--color-error)',
              margin: '0 auto var(--space-4)',
            }} />
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: 'var(--color-error)',
              marginBottom: 'var(--space-2)',
            }}>
              Archives Temporarily Inaccessible
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              maxWidth: '460px',
              margin: '0 auto var(--space-6)',
            }}>
              {error}
            </p>
            <button
              onClick={loadCatalog}
              className="codex-btn"
              style={{ padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-xs)' }}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="codex-skeleton" style={{ height: '240px' }} />
            ))}
          </div>
        ) : (
          <section className="codex-unroll">
            {/* Header: Title, View Switcher & Refine Drawer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-baseline gap-4">
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}>
                  Device Catalog
                </h2>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}>
                  {sortedMobiles.length} devices · updated weekly
                </span>
              </div>

              {/* View Switcher Segmented Control */}
              <div className="flex items-center gap-3">
                <div className="codex-view-switcher" role="group" aria-label="Archive view switcher">
                  <button
                    type="button"
                    onClick={() => handleViewChange('Folio Grid')}
                    className={`codex-view-btn ${archiveView === 'Folio Grid' ? 'is-active' : ''}`}
                    aria-pressed={archiveView === 'Folio Grid'}
                  >
                    Folio Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange('Ledger')}
                    className={`codex-view-btn hidden md:inline-flex ${archiveView === 'Ledger' ? 'is-active' : ''}`}
                    aria-pressed={archiveView === 'Ledger'}
                  >
                    Ledger
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange('Stacks')}
                    className={`codex-view-btn hidden md:inline-flex ${archiveView === 'Stacks' ? 'is-active' : ''}`}
                    aria-pressed={archiveView === 'Stacks'}
                  >
                    Stacks
                  </button>
                </div>

                {/* Refine / Indexer Drawer Button */}
                <button
                  type="button"
                  onClick={() => setIsIndexerOpen(true)}
                  className="codex-btn-outline"
                  style={{
                    padding: 'var(--space-1) var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  aria-label="Open Indexer Desk refine drawer"
                >
                  <span>Refine</span>
                  {activeFilterCount > 0 && (
                    <span
                      className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] font-mono font-bold"
                      style={{ background: 'var(--color-wax-red, #8B1E0F)' }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Select */}
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                  <label
                    htmlFor="archive-sort-select"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Sort:
                  </label>
                  <select
                    id="archive-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: 'var(--space-1) var(--space-3)',
                      background: 'var(--color-bg-surface)',
                      border: 'var(--border-thin)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="score_desc">Codex Score ↓</option>
                    <option value="price_asc">Price ↑</option>
                    <option value="price_desc">Price ↓</option>
                    <option value="name_asc">Name A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Wax Tags */}
            {activeFilterCount > 0 && (
              <div
                className="flex flex-wrap items-center gap-2 mb-6 p-3"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-hard-sm)',
                }}
              >
                <span className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mr-1">
                  Active filters:
                </span>
                {filters.minPrice !== '' && filters.minPrice !== undefined && (
                  <span className="codex-chip">
                    Min ₹{Number(filters.minPrice).toLocaleString('en-IN')}
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, minPrice: '' })}
                      className="codex-chip-close"
                      aria-label="Remove minimum price filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.maxPrice !== '' && filters.maxPrice !== undefined && (
                  <span className="codex-chip">
                    Max ₹{Number(filters.maxPrice).toLocaleString('en-IN')}
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, maxPrice: '' })}
                      className="codex-chip-close"
                      aria-label="Remove maximum price filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.tiers?.map((tierId) => (
                  <span key={tierId} className="codex-chip">
                    Tier: {tierId}
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, tiers: filters.tiers.filter((t) => t !== tierId) })}
                      className="codex-chip-close"
                      aria-label={`Remove ${tierId} tier filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.minBattery && (
                  <span className="codex-chip">
                    Batt ≥ {filters.minBattery} mAh
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, minBattery: '' })}
                      className="codex-chip-close"
                      aria-label="Remove battery filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.displays?.map((display) => (
                  <span key={display} className="codex-chip">
                    Display: {display}
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, displays: filters.displays.filter((d) => d !== display) })}
                      className="codex-chip-close"
                      aria-label={`Remove ${display} display filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-mono text-[var(--color-wax-red)] hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Empty state */}
            {sortedMobiles.length === 0 ? (
              <div style={{
                padding: 'var(--space-12) var(--space-6)',
                textAlign: 'center',
                background: 'var(--color-bg-surface)',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow-hard-sm)',
              }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>
                  No matching devices found.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="codex-btn mt-4"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : archiveView === 'Ledger' ? (
              /* ── VIEW 2: LEDGER (Manuscript Table) ── */
              <div className="codex-ledger-container">
                <table className="codex-ledger-table" role="table" aria-label="Archive Manuscript Ledger">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Brand</th>
                      <th>Chip</th>
                      <th>Battery</th>
                      <th>Display</th>
                      <th>Price</th>
                      <th>Seals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMobiles.map((item) => (
                      <tr
                        key={item.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => goToDevice(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            goToDevice(item);
                          }
                        }}
                        className="codex-ledger-row"
                        aria-label={`View details for ${item.name}`}
                      >
                        <td className="font-heading font-bold text-[var(--color-text-primary)]">
                          {item.name}
                        </td>
                        <td className="font-mono text-xs uppercase text-[var(--color-text-muted)]">
                          {item.brand}
                        </td>
                        <td className="font-mono text-xs text-[var(--color-text-secondary)]">
                          {getChip(item)}
                        </td>
                        <td className="font-mono text-xs text-[var(--color-text-secondary)]">
                          {getBattery(item)}
                        </td>
                        <td className="font-mono text-xs text-[var(--color-text-secondary)]">
                          {getDisplay(item)}
                        </td>
                        <td className="codex-ledger-price">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="codex-quality-seal text-[10px] px-1.5 py-0.5" title="Quality">
                              Q·{item.codexScore?.quality ?? 50}
                            </span>
                            <span className="codex-value-seal text-[10px] px-1.5 py-0.5" title="Value">
                              V·{item.codexScore?.value ?? 50}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : archiveView === 'Stacks' ? (
              /* ── VIEW 3: STACKS (Brand Shelves & Book Spines) ── */
              <div className="codex-stacks-container" role="region" aria-label="Device Catalog Shelves">
                {brandShelves.map(([brandName, brandItems]) => (
                  <div key={brandName} className="codex-shelf">
                    <div className="codex-shelf-header">
                      <h3 className="codex-shelf-title">{brandName}</h3>
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">
                        ({brandItems.length} {brandItems.length === 1 ? 'tome' : 'tomes'})
                      </span>
                    </div>
                    <div className="codex-shelf-rail">
                      {brandItems.map((item) => {
                        const hue = BRAND_HUES[brandName.toLowerCase()] || 'var(--hue-brand-default)';
                        return (
                          <div
                            key={item.id}
                            tabIndex={0}
                            role="button"
                            onClick={() => goToDevice(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                goToDevice(item);
                              }
                            }}
                            className="codex-book-spine"
                            style={{
                              background: hue,
                            }}
                            aria-label={`${item.name}, ₹${Number(item.price).toLocaleString('en-IN')}`}
                          >
                            {/* Spine Popover Mini-Card */}
                            <div className="codex-spine-popover">
                              <p className="font-heading font-bold text-xs text-[var(--color-text-primary)] truncate">
                                {item.name}
                              </p>
                              <p className="font-mono font-bold text-xs text-[var(--color-accent)] mt-0.5">
                                ₹{Number(item.price).toLocaleString('en-IN')}
                              </p>
                            </div>

                            {/* Vertical Spine Title & Price */}
                            <span className="codex-spine-title">{item.name}</span>
                            <span className="codex-spine-price">₹{Number(item.price).toLocaleString('en-IN')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── VIEW 1: FOLIO GRID (Standard Grid) ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {sortedMobiles.map((item, index) => (
                  <motion.div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToDevice(item);
                      }
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: index * 0.02 }}
                    onClick={() => goToDevice(item)}
                    className="codex-card cursor-pointer group"
                  >
                    {/* Peek button */}
                    <button
                      type="button"
                      className="codex-peek-btn"
                      title="Quick peek"
                      aria-label={`Quick peek at ${item.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                    >
                      <PeekIcon />
                    </button>

                    {/* Brand tag & Dual Seals & Bookmark button */}
                    <div className="flex justify-between items-center">
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}>
                        {item.brand}
                      </span>
                      <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                        <div className="codex-seal-pair">
                          <span
                            className="codex-quality-seal codex-seal-stamp is-stamped"
                            style={{ transitionDelay: `${(index % 6) * 40}ms` }}
                            title="Quality: absolute spec tier"
                            aria-label={`Quality score ${item.codexScore?.quality ?? 50}`}
                          >
                            Q·{item.codexScore?.quality ?? 50}
                          </span>
                          <span
                            className="codex-value-seal codex-seal-stamp is-stamped"
                            style={{ transitionDelay: `${(index % 6) * 40}ms` }}
                            title="Value: spec-per-rupee index"
                            aria-label={`Value score ${item.codexScore?.value ?? 50}`}
                          >
                            V·{item.codexScore?.value ?? 50}
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label={`Bookmark ${item.name}`}
                          aria-pressed={isItemWatched(item.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(item);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: isItemWatched(item.id) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease, transform 0.15s ease',
                          }}
                          title={isItemWatched(item.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={isItemWatched(item.id) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 700,
                      marginTop: 'var(--space-2)',
                      marginBottom: 'var(--space-2)',
                      letterSpacing: '0.01em',
                      transition: 'color 0.15s ease',
                    }}
                    className="group-hover:!text-[#7A3E2C]"
                    >
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-5)',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.description}
                    </p>

                    {/* Price bar */}
                    <div className="flex justify-between items-center"
                      style={{
                        paddingTop: 'var(--space-4)',
                        borderTop: 'var(--border-thin)',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 700,
                      }}>
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        transition: 'color 0.15s ease',
                      }}
                      className="group-hover:!text-[#7A3E2C]"
                      >
                        View details →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Roadmap pointer */}
      <div id="roadmap" className="max-w-4xl mx-auto py-8 text-center">
        <p className="font-heading text-sm text-[var(--color-text-muted)]">
          Looking for our future plans?{' '}
          <a href="/about#roadmap" className="text-[var(--color-primary)] underline hover:text-[var(--color-accent)] font-bold">
            View Roadmap →
          </a>
        </p>
      </div>

      {/* Section Rail */}
      <ThumbIndex />

      {/* Indexer's Desk Drawer */}
      <AnimatePresence>
        {isIndexerOpen && (
          <IndexerDrawer
            isOpen={isIndexerOpen}
            onClose={() => setIsIndexerOpen(false)}
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            minPossiblePrice={priceBounds.min}
            maxPossiblePrice={priceBounds.max}
          />
        )}
      </AnimatePresence>

      {/* Staged Compare Floating Banner */}
      {stagedCompareItem && (
        <div
          className="fixed bottom-6 right-6 z-40 flex items-center justify-between"
          style={{
            background: 'var(--color-bg-surface)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-hard-md)',
            padding: 'var(--space-3) var(--space-5)',
            gap: 'var(--space-4)',
            maxWidth: '90vw',
          }}
        >
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
            ⚔️ Slot I: {stagedCompareItem.name} (Select second device to compare)
          </span>
          <button
            onClick={() => setStagedCompareItem(null)}
            className="codex-modal-close"
            style={{ fontSize: '18px' }}
            aria-label="Cancel comparison"
          >
            ×
          </button>
        </div>
      )}

      {/* Modals — Peek modal for quick view */}
      <AnimatePresence>
        {selectedItem && (
          <ProductModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onCompareStage={handleCompareStage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBrand && (
          <BrandModal
            brand={selectedBrand}
            onSelectItem={handleBrandSelect}
            onClose={() => setSelectedBrand(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCmdOpen && (
          <CommandCenter
            items={mobiles}
            onSelectItem={handleCommandSelect}
            onClose={() => setIsCmdOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compareIds && (
          <CompareModal
            ids={compareIds}
            onClose={() => setCompareIds(null)}
            onSelectItem={item => {
              setCompareIds(null);
              goToDevice(item);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}