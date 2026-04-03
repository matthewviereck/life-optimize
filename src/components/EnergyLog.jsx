import { useState } from 'react';
import { Zap, Plus, Trash2, Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging } from 'lucide-react';
import { ENERGY_PERIODS, todayStr, generateId } from '../data/constants';

const ENERGY_ICONS = [BatteryLow, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging];
const ENERGY_COLORS = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];
const ENERGY_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Peak'];

export default function EnergyLog({ energyLog, setEnergyLog }) {
  const [date, setDate] = useState(todayStr());
  const [focusMin, setFocusMin] = useState('');
  const [productivity, setProductivity] = useState(5);
  const [notes, setNotes] = useState('');

  const sorted = [...energyLog].sort((a, b) => b.date.localeCompare(a.date));
  const todayEntry = sorted.find(e => e.date === date);
  const [energyLevels, setEnergyLevels] = useState(todayEntry?.energy || {});

  function handleSubmit(e) {
    e.preventDefault();
    setEnergyLog(prev => [...prev.filter(x => x.date !== date), {
      id: generateId(), date, energy: energyLevels,
      focusMin: parseInt(focusMin) || 0,
      productivity, notes,
    }]);
    setFocusMin(''); setNotes('');
  }

  function setEnergy(period, level) {
    setEnergyLevels(prev => ({ ...prev, [period]: level }));
  }

  const last7 = sorted.slice(0, 7);
  const avgProductivity = last7.length > 0 ? (last7.reduce((a, e) => a + e.productivity, 0) / last7.length).toFixed(1) : '--';
  const totalFocus7 = last7.reduce((a, e) => a + (e.focusMin || 0), 0);
  const avgEnergy = last7.length > 0 ? (
    last7.reduce((a, e) => {
      const vals = Object.values(e.energy || {});
      return a + (vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0);
    }, 0) / last7.length
  ).toFixed(1) : '--';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="w-7 h-7 text-amber-500" />
        <h2 className="text-2xl font-bold text-gray-800">Energy & Productivity</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-amber-500">{avgEnergy}/5</div>
          <div className="text-xs text-gray-500 mt-1">Avg Energy (7d)</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-blue-600">{avgProductivity}/10</div>
          <div className="text-xs text-gray-500 mt-1">Avg Productivity</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalFocus7}m</div>
          <div className="text-xs text-gray-500 mt-1">Focus Time (7d)</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-purple-600">{last7.length > 0 ? Math.round(totalFocus7 / last7.length) : 0}m</div>
          <div className="text-xs text-gray-500 mt-1">Avg Focus/Day</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Daily Energy Check-In</h3>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">Energy Levels Throughout the Day</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ENERGY_PERIODS.map(period => (
                <div key={period.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">{period.label}</div>
                  <div className="text-xs text-gray-400 mb-3">{period.time}</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(level => {
                      const Icon = ENERGY_ICONS[level - 1];
                      const active = energyLevels[period.key] === level;
                      return (
                        <button key={level} type="button" onClick={() => setEnergy(period.key, level)}
                          className={`flex-1 flex flex-col items-center gap-0.5 p-1.5 rounded transition ${
                            active ? 'bg-white shadow-sm border border-gray-300' : 'hover:bg-white'
                          }`}>
                          <Icon className={`w-5 h-5 ${active ? ENERGY_COLORS[level - 1] : 'text-gray-300'}`} />
                          <span className={`text-[9px] ${active ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                            {level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Focus / Deep Work (minutes)</label>
              <input type="number" value={focusMin} onChange={e => setFocusMin(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Productivity: {productivity}/10</label>
              <input type="range" min="1" max="10" value={productivity} onChange={e => setProductivity(parseInt(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low</span><span>Average</span><span>Crushing it</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">What affected your energy today?</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g., slept well, skipped lunch, great workout..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <button type="submit"
            className="w-full bg-amber-500 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-amber-600 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Save Check-In
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Entries</h3>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No energy logs yet.</p>
        ) : (
          <div className="space-y-3">
            {sorted.slice(0, 10).map(entry => {
              const energyVals = Object.values(entry.energy || {});
              const avg = energyVals.length > 0 ? Math.round(energyVals.reduce((a, v) => a + v, 0) / energyVals.length) : 0;
              return (
                <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-800 w-24">{entry.date}</div>
                  <div className="flex items-center gap-4 flex-1">
                    {ENERGY_PERIODS.map(p => {
                      const val = entry.energy?.[p.key];
                      return val ? (
                        <div key={p.key} className="text-center">
                          <div className={`text-xs ${ENERGY_COLORS[val - 1]} font-semibold`}>{val}/5</div>
                          <div className="text-[10px] text-gray-400">{p.label}</div>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">{entry.productivity}/10</div>
                  {entry.focusMin > 0 && <div className="text-sm text-purple-600">{entry.focusMin}m focus</div>}
                  <button onClick={() => setEnergyLog(prev => prev.filter(x => x.id !== entry.id))}
                    className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
