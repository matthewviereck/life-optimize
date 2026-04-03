import { useState } from 'react';
import { ListChecks, Plus, X, CheckCircle2, Circle, Flame, Trash2 } from 'lucide-react';
import { DEFAULT_HABITS, todayStr, generateId } from '../data/constants';

export default function HabitsTracker({ habitsConfig, setHabitsConfig, habitsLog, setHabitsLog }) {
  const [date, setDate] = useState(todayStr());
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const habits = habitsConfig.length > 0 ? habitsConfig : DEFAULT_HABITS;
  const todayLog = habitsLog[date] || {};

  function toggleHabit(key) {
    setHabitsLog(prev => ({
      ...prev,
      [date]: { ...prev[date], [key]: !todayLog[key] },
    }));
  }

  function addHabit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    const key = 'custom_' + generateId();
    setHabitsConfig(prev => {
      const base = prev.length > 0 ? prev : [...DEFAULT_HABITS];
      return [...base, { key, label: newHabit.trim(), icon: 'star' }];
    });
    setNewHabit('');
    setShowAdd(false);
  }

  function removeHabit(key) {
    setHabitsConfig(prev => {
      const base = prev.length > 0 ? prev : [...DEFAULT_HABITS];
      return base.filter(h => h.key !== key);
    });
  }

  function getStreak(habitKey) {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 60; i++) {
      const ds = d.toISOString().slice(0, 10);
      if (habitsLog[ds]?.[habitKey]) {
        streak++;
      } else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  const completedToday = habits.filter(h => todayLog[h.key]).length;
  const totalHabits = habits.length;

  // Last 14 days for habit grid
  const gridDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    gridDays.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ListChecks className="w-7 h-7 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Daily Habits</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-emerald-600">{completedToday}/{totalHabits}</div>
          <div className="text-xs text-gray-500 mt-1">Done Today</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {Math.round(completedToday / totalHabits * 100)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Completion Rate</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            {Math.max(...habits.map(h => getStreak(h.key)), 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Best Streak</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Today's Habits</h3>
          <div className="flex items-center gap-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <button onClick={() => setShowAdd(!showAdd)}
              className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Habit
            </button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={addHabit} className="mb-4 flex gap-2">
            <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
              placeholder="New habit name..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" autoFocus />
            <button type="submit" className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Add</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </form>
        )}

        <div className="space-y-2">
          {habits.map(habit => {
            const done = todayLog[habit.key];
            const streak = getStreak(habit.key);
            return (
              <div key={habit.key} className="flex items-center gap-3 group">
                <button onClick={() => toggleHabit(habit.key)}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-lg text-left transition ${
                    done ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200 hover:border-emerald-300'
                  }`}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                  <span className={`text-sm flex-1 ${done ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
                    {habit.label}
                  </span>
                  {streak > 1 && (
                    <span className="text-xs text-orange-500 flex items-center gap-0.5">
                      <Flame className="w-3 h-3" /> {streak}d
                    </span>
                  )}
                </button>
                {habit.key.startsWith('custom_') && (
                  <button onClick={() => removeHabit(habit.key)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">14-Day Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 px-2 font-medium text-gray-500 w-40">Habit</th>
                {gridDays.map(d => (
                  <th key={d} className="text-center py-1 px-1 font-medium text-gray-400 w-8">
                    {d.slice(8)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <tr key={habit.key}>
                  <td className="py-1 px-2 text-gray-600 truncate max-w-[160px]">{habit.label}</td>
                  {gridDays.map(d => {
                    const done = habitsLog[d]?.[habit.key];
                    return (
                      <td key={d} className="text-center py-1 px-1">
                        <div className={`w-5 h-5 rounded mx-auto ${done ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
