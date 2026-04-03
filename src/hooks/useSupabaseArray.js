import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Column name mapping: JS camelCase -> SQL snake_case
const COLUMN_MAP = {
  kidsPlay: 'kids_play',
  extraWalking: 'extra_walking',
  caloriesBurned: 'calories_burned',
  lBicep: 'l_bicep',
  rBicep: 'r_bicep',
  lThigh: 'l_thigh',
  rThigh: 'r_thigh',
  bodyFat: 'body_fat',
  bedtime: 'bedtime',
  wakeTime: 'wake_time',
  focusMin: 'focus_min',
  startTime: 'start_time',
  endTime: 'end_time',
  targetHours: 'target_hours',
};

const REVERSE_MAP = Object.fromEntries(Object.entries(COLUMN_MAP).map(([k, v]) => [v, k]));

function toSnake(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[COLUMN_MAP[k] || k] = v;
  }
  return out;
}

function toCamel(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = REVERSE_MAP[k] || k;
    if (key === 'user_id' || key === 'created_at') continue;
    out[key] = v;
  }
  return out;
}

export function useSupabaseArray(tableName, localStorageKey, userId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef([]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) {
      // Fallback to localStorage
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
        else { setData((rows || []).map(toCamel)); }
        setLoading(false);
      });
  }, [tableName, userId]);

  // Keep prevRef in sync
  useEffect(() => { prevRef.current = data; }, [data]);

  // The setter that maintains backward compat with `prev => [...]` pattern
  const setDataWrapped = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      if (!isSupabaseConfigured() || !userId) {
        localStorage.setItem(localStorageKey, JSON.stringify(next));
        return next;
      }

      // Diff to find additions and deletions
      const prevIds = new Set(prev.map(r => r.id));
      const nextIds = new Set(next.map(r => r.id));

      const added = next.filter(r => !prevIds.has(r.id));
      const removed = prev.filter(r => !nextIds.has(r.id));
      const updated = next.filter(r => {
        if (!prevIds.has(r.id)) return false;
        const old = prev.find(o => o.id === r.id);
        return JSON.stringify(old) !== JSON.stringify(r);
      });

      // Execute Supabase operations (fire and forget for responsiveness)
      if (added.length) {
        const rows = added.map(r => ({ ...toSnake(r), user_id: userId }));
        supabase.from(tableName).insert(rows).then(({ error }) => {
          if (error) console.error(`Insert ${tableName}:`, error);
        });
      }
      if (removed.length) {
        const ids = removed.map(r => r.id);
        supabase.from(tableName).delete().in('id', ids).then(({ error }) => {
          if (error) console.error(`Delete ${tableName}:`, error);
        });
      }
      if (updated.length) {
        for (const row of updated) {
          const snaked = { ...toSnake(row), user_id: userId };
          supabase.from(tableName).upsert(snaked).then(({ error }) => {
            if (error) console.error(`Update ${tableName}:`, error);
          });
        }
      }

      return next;
    });
  }, [tableName, userId, localStorageKey]);

  return [data, setDataWrapped, loading];
}
