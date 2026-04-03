import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Scale, Trash2, Plus } from 'lucide-react';
import { PROFILE, calcBMI, todayStr, generateId } from '../data/constants';

export default function WeighIn({ weighIns, setWeighIns }) {
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));

  function handleSubmit(e) {
    e.preventDefault();
    if (!weight) return;
    setWeighIns(prev => [...prev, { id: generateId(), date, weight: parseFloat(weight), notes }]);
    setWeight('');
    setNotes('');
  }

  function handleDelete(id) {
    setWeighIns(prev => prev.filter(w => w.id !== id));
  }

  const chartData = sorted.map(w => ({
    date: w.date.slice(5),
    weight: w.weight,
    goal: PROFILE.goalWeight,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="w-7 h-7 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Weekly Weigh-In</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Log Weight</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Weight (lbs)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="195.0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Optional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex items-end">
            <button type="submit"
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Log
            </button>
          </div>
        </div>
      </form>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 12 }} />
              <Tooltip />
              <ReferenceLine y={PROFILE.goalWeight} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Goal: 170', fill: '#10b981', fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">History</h3>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No weigh-ins yet. Log your first one above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Weight</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Change</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Total Lost</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">BMI</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Notes</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((w, i) => {
                  const prev = i > 0 ? sorted[i - 1].weight : w.weight;
                  const change = w.weight - prev;
                  const totalLost = PROFILE.startWeight - w.weight;
                  const bmi = calcBMI(w.weight, PROFILE.heightInches);
                  return (
                    <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">{w.date}</td>
                      <td className="py-2 px-3 text-right font-medium">{w.weight} lbs</td>
                      <td className={`py-2 px-3 text-right font-medium ${change < 0 ? 'text-green-600' : change > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {change === 0 ? '--' : `${change > 0 ? '+' : ''}${change.toFixed(1)}`}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-blue-600">{totalLost.toFixed(1)} lbs</td>
                      <td className="py-2 px-3 text-right">{bmi.toFixed(1)}</td>
                      <td className="py-2 px-3 text-gray-500">{w.notes}</td>
                      <td className="py-2 px-3">
                        <button onClick={() => handleDelete(w.id)} className="text-gray-400 hover:text-red-500">
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
