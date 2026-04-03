import { useState } from 'react';
import { Pill, Plus, X, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { DEFAULT_SUPPLEMENTS, todayStr, generateId } from '../data/constants';

export default function SupplementLog({ supplementsConfig, setSupplementsConfig, supplementsLog, setSupplementsLog }) {
  const [date, setDate] = useState(todayStr());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('morning');

  const supplements = supplementsConfig.length > 0 ? supplementsConfig : DEFAULT_SUPPLEMENTS;
  const todayLog = supplementsLog[date] || {};

  function toggleSupplement(key) {
    setSupplementsLog(prev => ({
      ...prev,
      [date]: { ...prev[date], [key]: !todayLog[key] },
    }));
  }

  function addSupplement(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const key = 'custom_' + generateId();
    setSupplementsConfig(prev => {
      const base = prev.length > 0 ? prev : [...DEFAULT_SUPPLEMENTS];
      return [...base, { key, label: newName.trim(), time: newTime }];
    });
    setNewName('');
    setShowAdd(false);
  }

  function removeSupplement(key) {
    setSupplementsConfig(prev => {
      const base = prev.length > 0 ? prev : [...DEFAULT_SUPPLEMENTS];
      return base.filter(s => s.key !== key);
    });
  }

  const takenToday = supplements.filter(s => todayLog[s.key]).length;

  // 7-day adherence
  const last7 = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const log = supplementsLog[ds] || {};
    const taken = supplements.filter(s => log[s.key]).length;
    last7.push({ date: ds, taken, total: supplements.length });
  }
  const adherence7 = last7.reduce((a, d) => a + d.taken, 0) / Math.max(last7.reduce((a, d) => a + d.total, 0), 1) * 100;

  const groupedByTime = {};
  supplements.forEach(s => {
    if (!groupedByTime[s.time]) groupedByTime[s.time] = [];
    groupedByTime[s.time].push(s);
  });

  const timeLabels = { morning: 'Morning', 'with meal': 'With Meal', 'post-workout': 'Post-Workout', 'before bed': 'Before Bed', anytime: 'Anytime' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Pill className="w-7 h-7 text-teal-600" />
        <h2 className="text-2xl font-bold text-gray-800">Supplements</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-teal-600">{takenToday}/{supplements.length}</div>
          <div className="text-xs text-gray-500 mt-1">Taken Today</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-teal-600">{Math.round(adherence7)}%</div>
          <div className="text-xs text-gray-500 mt-1">7-Day Adherence</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className={`text-2xl font-bold ${takenToday === supplements.length ? 'text-green-600' : 'text-gray-400'}`}>
            {takenToday === supplements.length ? 'All Done' : `${supplements.length - takenToday} left`}
          </div>
          <div className="text-xs text-gray-500 mt-1">Status</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Daily Supplements</h3>
          <div className="flex items-center gap-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <button onClick={() => setShowAdd(!showAdd)}
              className="text-sm bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-100 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={addSupplement} className="mb-4 flex gap-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Supplement name..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" autoFocus />
            <select value={newTime} onChange={e => setNewTime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="morning">Morning</option>
              <option value="with meal">With Meal</option>
              <option value="post-workout">Post-Workout</option>
              <option value="before bed">Before Bed</option>
              <option value="anytime">Anytime</option>
            </select>
            <button type="submit" className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Add</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </form>
        )}

        <div className="space-y-4">
          {Object.entries(groupedByTime).map(([time, items]) => (
            <div key={time}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {timeLabels[time] || time}
              </h4>
              <div className="space-y-1.5">
                {items.map(s => {
                  const done = todayLog[s.key];
                  return (
                    <div key={s.key} className="flex items-center gap-2 group">
                      <button onClick={() => toggleSupplement(s.key)}
                        className={`flex-1 flex items-center gap-3 p-3 rounded-lg text-left transition ${
                          done ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200 hover:border-teal-300'
                        }`}>
                        {done
                          ? <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                          : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                        <span className={`text-sm ${done ? 'text-teal-700 line-through' : 'text-gray-700'}`}>
                          {s.label}
                        </span>
                      </button>
                      {s.key.startsWith('custom_') && (
                        <button onClick={() => removeSupplement(s.key)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
