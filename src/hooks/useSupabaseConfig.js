import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useSupabaseConfig(tableName, localStorageKey, userId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) {
      try {
        const stored = localStorage.getItem(localStorageKey);
        if (stored) setData(JSON.parse(stored));
      } catch {}
      setLoading(false);
      return;
    }

    supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .order('sort_order')
      .then(({ data: rows, error }) => {
        if (error) { console.error(`Error loading ${tableName}:`, error); }
        else {
          setData((rows || []).map(r => {
            const { user_id, sort_order, ...rest } = r;
            return rest;
          }));
        }
        setLoading(false);
      });
  }, [tableName, userId]);

  const setDataWrapped = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      if (!isSupabaseConfigured() || !userId) {
        localStorage.setItem(localStorageKey, JSON.stringify(next));
        return next;
      }

      // Replace entire config: delete all then insert
      const prevKeys = new Set(prev.map(r => r.key));
      const nextKeys = new Set(next.map(r => r.key));

      const added = next.filter(r => !prevKeys.has(r.key));
      const removed = prev.filter(r => !nextKeys.has(r.key));

      if (removed.length) {
        const keys = removed.map(r => r.key);
        supabase.from(tableName).delete().eq('user_id', userId).in('key', keys)
          .then(({ error }) => { if (error) console.error(`Delete ${tableName}:`, error); });
      }
      if (added.length) {
        const rows = added.map((r, i) => ({ ...r, user_id: userId, sort_order: prev.length + i }));
        supabase.from(tableName).insert(rows)
          .then(({ error }) => { if (error) console.error(`Insert ${tableName}:`, error); });
      }

      return next;
    });
  }, [tableName, userId, localStorageKey]);

  return [data, setDataWrapped, loading];
}
