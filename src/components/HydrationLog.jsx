import { useState } from 'react';
import { Droplets, Plus, Minus, RotateCcw } from 'lucide-react';
import { PROFILE, todayStr } from '../data/constants';

export default function HydrationLog({ hydration, setHydration }) {
  const [date, setDate] = useState(todayStr());

  const todayOz = hydration[date] || 0;
  const goal = PROFILE.dailyWater;
  const pct = Math.min((todayOz / goal) * 100, 100);
  const glasses = Math.round(todayOz / 8);

  function addWater(oz) {
    setHydration(prev => ({ ...prev, [date]: Math.max(0, (prev[date] || 0) + oz) }));
  }

  const recentDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    recentDays.push({ date: ds, oz: hydration[ds] || 0 });
  }
  const avg7 = recentDays.length > 0 ? Math.round(recentDays.reduce((a, d) => a + d.oz, 0) / recentDays.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Droplets className="w-7 h-7 text-cyan-600" />
        <h2 className="text-2xl font-bold text-gray-800">Hydration</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Today's Water Intake</h3>
            <p className="text-sm text-gray-500">Goal: {goal} oz per day</p>
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              <circle cx="100" cy="100" r="85" fill="none" stroke={pct >= 100 ? '#10b981' : '#06b6d4'}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${pct * 5.34} 534`}
                className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{todayOz}</span>
              <span className="text-sm text-gray-500">of {goal} oz</span>
              <span className="text-xs text-gray-400 mt-1">{glasses} glasses</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => addWater(8)}
              className="flex items-center gap-2 bg-cyan-600 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-cyan-700 transition">
              <Plus className="w-4 h-4" /> 8 oz
            </button>
            <button onClick={() => addWater(16)}
              className="flex items-center gap-2 bg-cyan-500 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-cyan-600 transition">
              <Plus className="w-4 h-4" /> 16 oz
            </button>
            <button onClick={() => addWater(24)}
              className="flex items-center gap-2 bg-cyan-400 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-cyan-500 transition">
              <Plus className="w-4 h-4" /> 24 oz
            </button>
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => addWater(-8)}
              className="flex items-center gap-2 text-gray-500 bg-gray-100 rounded-lg px-4 py-2 text-sm hover:bg-gray-200">
              <Minus className="w-3 h-3" /> 8 oz
            </button>
            <button onClick={() => setHydration(prev => ({ ...prev, [date]: 0 }))}
              className="flex items-center gap-2 text-gray-500 bg-gray-100 rounded-lg px-4 py-2 text-sm hover:bg-gray-200">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {pct >= 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-700 font-medium">
            You hit your water goal today! Great hydration.
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Last 7 Days</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {recentDays.reverse().map(d => {
            const barPct = Math.min((d.oz / goal) * 100, 100);
            const isToday = d.date === todayStr();
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{d.oz}oz</span>
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                  <div className={`absolute bottom-0 w-full rounded-t-lg transition-all ${barPct >= 100 ? 'bg-green-400' : 'bg-cyan-400'} ${isToday ? 'ring-2 ring-cyan-600' : ''}`}
                    style={{ height: `${barPct}%` }} />
                </div>
                <span className={`text-[10px] ${isToday ? 'font-bold text-cyan-700' : 'text-gray-400'}`}>
                  {d.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-3 text-sm text-gray-500">7-day average: <strong className="text-gray-800">{avg7} oz</strong></div>
      </div>
    </div>
  );
}
