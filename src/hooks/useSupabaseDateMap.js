import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useSupabaseDateMap(tableName, localStorageKey, userId, valueField = null) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
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
      .then(({ data: rows, error }) => {
        if (error) { console.error(`Error loading ${tableName}:`, error); }
        else {
          const map = {};
          for (const row of (rows || [])) {
            // For simple value tables (hydration: date -> oz), extract the value field
            // For JSONB tables (checklist: date -> {items}), extract the data field
            if (valueField) {
              map[row.date] = row[valueField];
            } else {
              map[row.date] = row.data;
            }
          }
          setData(map);
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

      // Find changed dates
      const allDates = new Set([...Object.keys(prev), ...Object.keys(next)]);
      for (const date of allDates) {
        const oldVal = prev[date];
        const newVal = next[date];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          if (newVal === undefined || newVal === null) {
            // Deleted
            supabase.from(tableName).delete().eq('user_id', userId).eq('date', date)
              .then(({ error }) => { if (error) console.error(`Delete ${tableName}:`, error); });
          } else {
            // Upsert
            const row = { user_id: userId, date };
            if (valueField) {
              row[valueField] = newVal;
            } else {
              row.data = newVal;
            }
            supabase.from(tableName).upsert(row, { onConflict: 'user_id,date' })
              .then(({ error }) => { if (error) console.error(`Upsert ${tableName}:`, error); });
          }
        }
      }

      return next;
    });
  }, [tableName, userId, localStorageKey, valueField]);

  return [data, setDataWrapped, loading];
}
