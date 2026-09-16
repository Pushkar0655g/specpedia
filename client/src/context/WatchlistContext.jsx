import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';
import api from '../lib/api';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWatchlistDrawerOpen, setIsWatchlistDrawerOpen] = useState(false);

  // Sync auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch watchlist when user changes
  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/watchlist');
      setWatchlist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not fetch watchlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const isItemWatched = useCallback((itemId) => {
    return watchlist.some((entry) => Number(entry.itemId) === Number(itemId));
  }, [watchlist]);

  const getWatchlistEntry = useCallback((itemId) => {
    return watchlist.find((entry) => Number(entry.itemId) === Number(itemId));
  }, [watchlist]);

  const toggleWatchlist = useCallback(async (item) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return false;
    }

    const itemId = item.id;
    const isCurrentlyWatched = isItemWatched(itemId);

    if (isCurrentlyWatched) {
      // Optimistically remove
      setWatchlist((prev) => prev.filter((entry) => Number(entry.itemId) !== Number(itemId)));
      try {
        await api.delete(`/watchlist/${itemId}`);
      } catch (err) {
        console.error('Failed to remove from watchlist:', err);
        fetchWatchlist(); // Revert on failure
      }
      return false;
    } else {
      // Optimistically add
      const optimisticEntry = {
        userId: user.id,
        itemId,
        targetPrice: null,
        notifiedAt: null,
        createdAt: new Date().toISOString(),
        item,
        name: item.name,
        brand: item.brand,
        price: Number(item.price),
      };
      setWatchlist((prev) => [optimisticEntry, ...prev]);

      try {
        await api.post('/watchlist', { itemId });
      } catch (err) {
        console.error('Failed to add to watchlist:', err);
        fetchWatchlist(); // Revert on failure
      }
      return true;
    }
  }, [user, isItemWatched, fetchWatchlist]);

  const updateTargetPrice = useCallback(async (itemId, targetPrice) => {
    if (!user) return;

    setWatchlist((prev) =>
      prev.map((entry) =>
        Number(entry.itemId) === Number(itemId)
          ? { ...entry, targetPrice: targetPrice !== null ? Number(targetPrice) : null }
          : entry
      )
    );

    try {
      await api.post('/watchlist', {
        itemId,
        targetPrice: targetPrice !== null ? Number(targetPrice) : null,
      });
    } catch (err) {
      console.error('Failed to update target price:', err);
      fetchWatchlist();
    }
  }, [user, fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (itemId) => {
    if (!user) return;
    setWatchlist((prev) => prev.filter((entry) => Number(entry.itemId) !== Number(itemId)));
    try {
      await api.delete(`/watchlist/${itemId}`);
    } catch (err) {
      console.error('Failed to remove item:', err);
      fetchWatchlist();
    }
  }, [user, fetchWatchlist]);

  const logout = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    setWatchlist([]);
    setIsWatchlistDrawerOpen(false);
  }, []);

  return (
    <WatchlistContext.Provider
      value={{
        user,
        session,
        watchlist,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isWatchlistDrawerOpen,
        setIsWatchlistDrawerOpen,
        isItemWatched,
        getWatchlistEntry,
        toggleWatchlist,
        updateTargetPrice,
        removeFromWatchlist,
        refreshWatchlist: fetchWatchlist,
        logout,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

export default WatchlistContext;
