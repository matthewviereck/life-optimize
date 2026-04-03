import { useState } from 'react';
import { Dumbbell, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import { ACTIVITY_CHECKLIST_ITEMS, todayStr, generateId } from '../data/constants';
import { WORKOUT_TYPES, CALORIE_ESTIMATES } from '../data/workoutPresets';

export default function WorkoutLog({ workouts, setWorkouts, checklist, setChecklist }) {
  const [date, setDate] = useState(todayStr());
  const [type, setType] = useState(WORKOUT_TYPES[0]);
  const [duration, setDuration] = useState('');
  const [steps, setSteps] = useState('');
  const [kidsPlay, setKidsPlay] = useState('');
  const [stairs, setStairs] = useState('');
  const [extraWalking, setExtraWalking] = useState('');
  const [notes, setNotes] = useState('');

  const todayChecklist = checklist[date] || {};
  const todayWorkouts = workouts.filter(w => w.date === date);

  function handleSubmit(e) {
    e.preventDefault();
    if (!duration && !steps) return;
    const dur = parseInt(duration) || 0;
    const calsPerMin = CALORIE_ESTIMATES[type] || 5;
    setWorkouts(prev => [...prev, {
      id: generateId(), date, type, duration: dur,
      steps: parseInt(steps) || 0, kidsPlay: parseInt(kidsPlay) || 0,
      stairs: parseInt(stairs) || 0, extraWalking: parseInt(extraWalking) || 0,
      caloriesBurned: dur * calsPerMin, notes,
    }]);
    setDuration(''); setSteps(''); setKidsPlay(''); setStairs('');
    setExtraWalking(''); setNotes('');
  }

  function toggleCheckItem(key) {
    setChecklist(prev => ({
      ...prev,
      [date]: { ...prev[date], [key]: !todayChecklist[key] },
    }));
  }

  function handleDelete(id) {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }

  const checkedCount = ACTIVITY_CHECKLIST_ITEMS.filter(item => todayChecklist[item.key]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Dumbbell className="w-7 h-7 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-800">Workout & Activity Log</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Daily Activity Checklist</h3>
            <div className="flex items-center gap-2">
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
              <span className="text-sm font-medium text-orange-600">{checkedCount}/{ACTIVITY_CHECKLIST_ITEMS.length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {ACTIVITY_CHECKLIST_ITEMS.map(item => (
              <button key={item.key} onClick={() => toggleCheckItem(item.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${todayChecklist[item.key] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200 hover:border-orange-300'}`}>
                {todayChecklist[item.key]
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                <span className={`text-sm ${todayChecklist[item.key] ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4">Log Workout</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="30"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Steps</label>
                <input type="number" value={steps} onChange={e => setSteps(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kids Play (min)</label>
                <input type="number" value={kidsPlay} onChange={e => setKidsPlay(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Stairs (flights)</label>
                <input type="number" value={stairs} onChange={e => setStairs(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Extra Walking (min)</label>
                <input type="number" value={extraWalking} onChange={e => setExtraWalking(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="How did it go?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit"
              className="w-full bg-orange-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Log Workout
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Workout History</h3>
        {todayWorkouts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No workouts logged for this date.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Duration</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Steps</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Kids Play</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Stairs</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Cal Burned</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Notes</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {todayWorkouts.map(w => (
                  <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{w.type}</span>
                    </td>
                    <td className="py-2 px-3 text-right">{w.duration} min</td>
                    <td className="py-2 px-3 text-right">{w.steps || '--'}</td>
                    <td className="py-2 px-3 text-right">{w.kidsPlay ? `${w.kidsPlay} min` : '--'}</td>
                    <td className="py-2 px-3 text-right">{w.stairs || '--'}</td>
                    <td className="py-2 px-3 text-right font-medium text-orange-600">{w.caloriesBurned}</td>
                    <td className="py-2 px-3 text-gray-500">{w.notes}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => handleDelete(w.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
