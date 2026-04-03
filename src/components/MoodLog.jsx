import { useState } from 'react';
import { Heart, Trash2, Plus, Frown, Meh, Smile, SmilePlus, Laugh } from 'lucide-react';
import { MOOD_LEVELS, todayStr, generateId } from '../data/constants';

const MOOD_ICONS = [Frown, Meh, Meh, Smile, Laugh];
const MOOD_COLORS = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];
const MOOD_BG = ['bg-red-50 border-red-200', 'bg-orange-50 border-orange-200', 'bg-yellow-50 border-yellow-200', 'bg-lime-50 border-lime-200', 'bg-green-50 border-green-200'];

export default function MoodLog({ moodLog, setMoodLog }) {
  const [date, setDate] = useState(todayStr());
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(5);
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [mindfulness, setMindfulness] = useState('');
  const [notes, setNotes] = useState('');

  const sorted = [...moodLog].sort((a, b) => b.date.localeCompare(a.date));
  const todayEntry = sorted.find(m => m.date === date);

  function handleSubmit(e) {
    e.preventDefault();
    setMoodLog(prev => [...prev.filter(m => m.date !== date), {
      id: generateId(), date, mood, stress,
      gratitude: gratitude.filter(g => g.trim()),
      mindfulness: parseInt(mindfulness) || 0, notes,
    }]);
    setGratitude(['', '', '']); setMindfulness(''); setNotes('');
  }

  const last7 = sorted.slice(0, 7);
  const avgMood = last7.length > 0 ? (last7.reduce((a, m) => a + m.mood, 0) / last7.length).toFixed(1) : '--';
  const avgStress = last7.length > 0 ? (last7.reduce((a, m) => a + m.stress, 0) / last7.length).toFixed(1) : '--';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-7 h-7 text-pink-600" />
        <h2 className="text-2xl font-bold text-gray-800">Mood & Mind</h2>
      </div>

      {last7.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-2xl font-bold text-pink-600">{avgMood}/5</div>
            <div className="text-xs text-gray-500 mt-1">Avg Mood (7 days)</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-2xl font-bold text-orange-500">{avgStress}/10</div>
            <div className="text-xs text-gray-500 mt-1">Avg Stress</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {last7.reduce((a, m) => a + (m.mindfulness || 0), 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Mindful Min (7 days)</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Daily Check-In</h3>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>

        {todayEntry && (
          <div className={`mb-4 rounded-lg p-3 border text-sm ${MOOD_BG[todayEntry.mood - 1]}`}>
            Already logged for this date: Mood {todayEntry.mood}/5, Stress {todayEntry.stress}/10.
            Submitting again will update it.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">How are you feeling?</label>
            <div className="flex gap-3">
              {MOOD_LEVELS.map((level, i) => {
                const Icon = MOOD_ICONS[i];
                return (
                  <button key={level.value} type="button" onClick={() => setMood(level.value)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${
                      mood === level.value ? MOOD_BG[i] + ' border-current ' + MOOD_COLORS[i] : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}>
                    <Icon className="w-7 h-7" />
                    <span className="text-xs font-medium">{level.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Stress Level: {stress}/10</label>
            <input type="range" min="1" max="10" value={stress} onChange={e => setStress(parseInt(e.target.value))}
              className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Relaxed</span><span>Moderate</span><span>Very Stressed</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Gratitude -- 3 things that went well today</label>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <input key={i} type="text" value={gratitude[i]}
                  onChange={e => { const g = [...gratitude]; g[i] = e.target.value; setGratitude(g); }}
                  placeholder={`${i + 1}. Something you're grateful for...`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mindfulness / Meditation (min)</label>
              <input type="number" value={mindfulness} onChange={e => setMindfulness(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Journal Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="How was your day?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <button type="submit"
            className="w-full bg-pink-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-pink-700 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Save Check-In
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Check-Ins</h3>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No check-ins yet.</p>
        ) : (
          <div className="space-y-3">
            {sorted.slice(0, 10).map(m => {
              const Icon = MOOD_ICONS[m.mood - 1];
              return (
                <div key={m.id} className={`p-4 rounded-lg border ${MOOD_BG[m.mood - 1]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${MOOD_COLORS[m.mood - 1]}`} />
                      <div>
                        <span className="font-medium text-sm">{m.date}</span>
                        <span className="text-xs text-gray-500 ml-3">Mood: {m.mood}/5 | Stress: {m.stress}/10</span>
                        {m.mindfulness > 0 && <span className="text-xs text-purple-600 ml-2">| {m.mindfulness} min mindful</span>}
                      </div>
                    </div>
                    <button onClick={() => setMoodLog(prev => prev.filter(x => x.id !== m.id))}
                      className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {m.gratitude?.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {m.gratitude.map((g, i) => <div key={i} className="ml-9">+ {g}</div>)}
                    </div>
                  )}
                  {m.notes && <div className="mt-1 ml-9 text-sm text-gray-500 italic">{m.notes}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
