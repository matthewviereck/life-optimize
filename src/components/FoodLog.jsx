import { useState } from 'react';
import { UtensilsCrossed, Trash2, Plus, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { PROFILE, todayStr, generateId } from '../data/constants';
import { MEAL_PRESETS, MEAL_TAGS } from '../data/mealPresets';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Evening'];

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  pink: 'bg-pink-100 text-pink-700',
  teal: 'bg-teal-100 text-teal-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-700',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700',
};

export default function FoodLog({ foodLog, setFoodLog }) {
  const [date, setDate] = useState(todayStr());
  const [meal, setMeal] = useState('Breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [showManual, setShowManual] = useState(false);

  const todayEntries = foodLog.filter(f => f.date === date);
  const totals = todayEntries.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein: acc.protein + f.protein,
    carbs: acc.carbs + f.carbs,
    fat: acc.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  function handleSubmit(e) {
    e.preventDefault();
    if (!description || !calories) return;
    setFoodLog(prev => [...prev, {
      id: generateId(), date, meal, description,
      calories: parseInt(calories), protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0, fat: parseInt(fat) || 0,
    }]);
    setDescription(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
  }

  function quickAdd(preset, mealType) {
    setFoodLog(prev => [...prev, {
      id: generateId(), date, meal: mealType, description: preset.name,
      calories: preset.calories, protein: preset.protein,
      carbs: preset.carbs, fat: preset.fat,
    }]);
  }

  function handleDelete(id) {
    setFoodLog(prev => prev.filter(f => f.id !== id));
  }

  function MacroBar({ label, current, target, color }) {
    const pct = Math.min((current / target) * 100, 100);
    const over = current > target;
    return (
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-600">{label}</span>
          <span className={`font-semibold ${over ? 'text-red-500' : 'text-gray-800'}`}>{current} / {target}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${over ? 'bg-red-400' : color}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  // Determine which meal type to suggest based on time of day
  function suggestedMealType() {
    const hour = new Date().getHours();
    if (hour < 10) return 'Breakfast';
    if (hour < 14) return 'Lunch';
    if (hour < 16) return 'Snack';
    if (hour < 20) return 'Dinner';
    return 'Evening';
  }

  const suggested = suggestedMealType();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="w-7 h-7 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Food Log</h2>
      </div>

      {/* Macro Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg">Daily Macros</h3>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
          </div>
          <span className="text-sm text-gray-500">{todayEntries.length} entries</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MacroBar label="Calories" current={totals.calories} target={PROFILE.dailyCal} color="bg-blue-500" />
          <MacroBar label="Protein (g)" current={totals.protein} target={PROFILE.dailyProtein} color="bg-red-400" />
          <MacroBar label="Carbs (g)" current={totals.carbs} target={PROFILE.dailyCarbs} color="bg-yellow-400" />
          <MacroBar label="Fat (g)" current={totals.fat} target={PROFILE.dailyFat} color="bg-purple-400" />
        </div>
      </div>

      {/* Quick Pick Meals - Always Visible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-1">Quick Pick a Healthy Meal</h3>
        <p className="text-sm text-gray-500 mb-4">Tap any meal to log it instantly. Based on your nutrition plan.</p>

        <div className="flex gap-2 mb-4 flex-wrap">
          {MEAL_TYPES.map(m => (
            <button key={m} onClick={() => setMeal(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                meal === m
                  ? 'bg-green-600 text-white shadow-sm'
                  : m === suggested
                    ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {m} {m === suggested && meal !== m ? '(now)' : ''}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {(MEAL_PRESETS[meal] || []).map((preset, i) => (
            <button key={i} onClick={() => quickAdd(preset, meal)}
              className="w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{preset.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{preset.summary}</div>
                </div>
                <Plus className="w-4 h-4 text-gray-300 group-hover:text-green-600 shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-semibold text-blue-600">{preset.calories} cal</span>
                <span className="text-xs text-gray-400">P:{preset.protein}g</span>
                <span className="text-xs text-gray-400">C:{preset.carbs}g</span>
                <span className="text-xs text-gray-400">F:{preset.fat}g</span>
                {preset.prepTime != null && (
                  <span className="text-xs text-gray-400 flex items-center gap-0.5 ml-auto">
                    <Clock className="w-3 h-3" />{preset.prepTime}m
                  </span>
                )}
              </div>
              {preset.tags && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {preset.tags.slice(0, 3).map(tag => {
                    const tagInfo = MEAL_TAGS[tag];
                    return tagInfo ? (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tagInfo.color] || 'bg-gray-100 text-gray-600'}`}>
                        {tagInfo.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Entry - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <button onClick={() => setShowManual(!showManual)}
          className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-lg">Manual Entry</h3>
          {showManual ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showManual && (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meal</label>
                <select value={meal} onChange={e => setMeal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
                  {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What did you eat?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Calories</label>
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Protein</label>
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Carbs</label>
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fat</label>
                  <input type="number" value={fat} onChange={e => setFat(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <button type="submit" className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Today's Entries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Today's Entries</h3>
        {todayEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No entries for this date. Pick a meal above to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Meal</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Description</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Cal</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Protein</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Carbs</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Fat</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {todayEntries.map(f => (
                  <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{f.meal}</span>
                    </td>
                    <td className="py-2 px-3">{f.description}</td>
                    <td className="py-2 px-3 text-right font-medium">{f.calories}</td>
                    <td className="py-2 px-3 text-right">{f.protein}g</td>
                    <td className="py-2 px-3 text-right">{f.carbs}g</td>
                    <td className="py-2 px-3 text-right">{f.fat}g</td>
                    <td className="py-2 px-3">
                      <button onClick={() => handleDelete(f.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2 px-3" colSpan={2}>Totals</td>
                  <td className="py-2 px-3 text-right">{totals.calories}</td>
                  <td className="py-2 px-3 text-right">{totals.protein}g</td>
                  <td className="py-2 px-3 text-right">{totals.carbs}g</td>
                  <td className="py-2 px-3 text-right">{totals.fat}g</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
