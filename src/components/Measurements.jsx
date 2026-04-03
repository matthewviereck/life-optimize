import { useState } from 'react';
import { Ruler, Trash2, Plus } from 'lucide-react';
import { todayStr, generateId } from '../data/constants';

const FIELDS = [
  { key: 'weight', label: 'Weight (lbs)', placeholder: '195' },
  { key: 'waist', label: 'Waist (in)', placeholder: '' },
  { key: 'chest', label: 'Chest (in)', placeholder: '' },
  { key: 'hips', label: 'Hips (in)', placeholder: '' },
  { key: 'lBicep', label: 'L Bicep (in)', placeholder: '' },
  { key: 'rBicep', label: 'R Bicep (in)', placeholder: '' },
  { key: 'lThigh', label: 'L Thigh (in)', placeholder: '' },
  { key: 'rThigh', label: 'R Thigh (in)', placeholder: '' },
  { key: 'bodyFat', label: 'Body Fat %', placeholder: '' },
];

export default function Measurements({ measurements, setMeasurements }) {
  const [date, setDate] = useState(todayStr());
  const [values, setValues] = useState({});

  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

  function handleSubmit(e) {
    e.preventDefault();
    const entry = { id: generateId(), date };
    FIELDS.forEach(f => { entry[f.key] = parseFloat(values[f.key]) || null; });
    setMeasurements(prev => [...prev, entry]);
    setValues({});
  }

  function handleDelete(id) {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }

  const lastEntry = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const lastDate = lastEntry ? new Date(lastEntry.date) : null;
  const nextDue = lastDate ? new Date(lastDate.getTime() + 28 * 86400000) : new Date();
  const daysUntilNext = Math.max(0, Math.ceil((nextDue - new Date()) / 86400000));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Ruler className="w-7 h-7 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">Body Measurements</h2>
      </div>

      {lastEntry && (
        <div className={`rounded-xl p-4 border ${daysUntilNext <= 0 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-sm font-medium ${daysUntilNext <= 0 ? 'text-purple-700' : 'text-gray-600'}`}>
            {daysUntilNext <= 0
              ? 'Time for your next measurement! Log it below.'
              : `Next measurement due in ${daysUntilNext} days (${nextDue.toLocaleDateString()})`}
          </p>
          <p className="text-xs text-gray-500 mt-1">Measure every 4 weeks, same day and time for consistency.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Log Measurements</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input type="number" step="0.1"
                  value={values[f.key] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
            ))}
          </div>
          <button type="submit"
            className="mt-4 bg-purple-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Save Measurements
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">History</h3>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No measurements yet. Take your first set above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">Date</th>
                  {FIELDS.map(f => (
                    <th key={f.key} className="text-right py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">{f.label}</th>
                  ))}
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, i) => {
                  const prev = i > 0 ? sorted[i - 1] : null;
                  return (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2">{m.date}</td>
                      {FIELDS.map(f => {
                        const val = m[f.key];
                        const prevVal = prev ? prev[f.key] : null;
                        const diff = val != null && prevVal != null ? val - prevVal : null;
                        return (
                          <td key={f.key} className="py-2 px-2 text-right">
                            {val != null ? (
                              <span>
                                {val}
                                {diff != null && diff !== 0 && (
                                  <span className={`text-xs ml-1 ${diff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
                                  </span>
                                )}
                              </span>
                            ) : '--'}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2">
                        <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
