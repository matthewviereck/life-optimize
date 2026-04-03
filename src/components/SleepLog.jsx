import { useState } from 'react';
import { Moon, Trash2, Plus, Star } from 'lucide-react';
import { todayStr, generateId } from '../data/constants';

export default function SleepLog({ sleepLog, setSleepLog }) {
  const [date, setDate] = useState(todayStr());
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');

  const sorted = [...sleepLog].sort((a, b) => b.date.localeCompare(a.date));

  function calcHours(bed, wake) {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff / 6) / 10;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const hours = calcHours(bedtime, wakeTime);
    setSleepLog(prev => [...prev, { id: generateId(), date, bedtime, wakeTime, hours, quality, notes }]);
    setNotes('');
  }

  const last7 = sorted.slice(0, 7);
  const avgHours = last7.length > 0 ? (last7.reduce((a, s) => a + s.hours, 0) / last7.length).toFixed(1) : '--';
  const avgQuality = last7.length > 0 ? (last7.reduce((a, s) => a + s.quality, 0) / last7.length).toFixed(1) : '--';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Moon className="w-7 h-7 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Sleep Tracking</h2>
      </div>

      {last7.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-2xl font-bold text-indigo-600">{avgHours}h</div>
            <div className="text-xs text-gray-500 mt-1">7-Day Avg Sleep</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-2xl font-bold text-indigo-600">{avgQuality}/5</div>
            <div className="text-xs text-gray-500 mt-1">Avg Quality</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-2xl font-bold text-indigo-600">{last7[0]?.hours || '--'}h</div>
            <div className="text-xs text-gray-500 mt-1">Last Night</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Log Sleep</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bedtime</label>
              <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Wake Time</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quality</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setQuality(v)}
                    className={`p-1 ${v <= quality ? 'text-yellow-400' : 'text-gray-300'}`}>
                    <Star className="w-5 h-5" fill={v <= quality ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Log
              </button>
            </div>
          </div>
          <div className="mt-3">
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes (e.g., woke up once, felt rested...)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Sleep History</h3>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sleep entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Bedtime</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Wake</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Hours</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Quality</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Notes</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(s => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{s.date}</td>
                    <td className="py-2 px-3 text-center">{s.bedtime}</td>
                    <td className="py-2 px-3 text-center">{s.wakeTime}</td>
                    <td className={`py-2 px-3 text-center font-medium ${s.hours >= 7 ? 'text-green-600' : s.hours >= 6 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {s.hours}h
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(v => (
                          <Star key={v} className={`w-3.5 h-3.5 ${v <= s.quality ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill={v <= s.quality ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-500">{s.notes}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => setSleepLog(prev => prev.filter(x => x.id !== s.id))}
                        className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
