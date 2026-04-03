import { useState } from 'react';
import { ChefHat, Clock, Plus, X, Search, ArrowLeft } from 'lucide-react';
import { MEAL_PRESETS, MEAL_TAGS } from '../data/mealPresets';
import { todayStr, generateId } from '../data/constants';

const MEAL_TYPES = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner', 'Evening'];
const ALL_TAGS = Object.keys(MEAL_TAGS);

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
};

const TAG_ACTIVE = {
  blue: 'bg-blue-600 text-white border-blue-600',
  green: 'bg-green-600 text-white border-green-600',
  purple: 'bg-purple-600 text-white border-purple-600',
  red: 'bg-red-600 text-white border-red-600',
  yellow: 'bg-yellow-500 text-white border-yellow-500',
  pink: 'bg-pink-600 text-white border-pink-600',
  teal: 'bg-teal-600 text-white border-teal-600',
  emerald: 'bg-emerald-600 text-white border-emerald-600',
  orange: 'bg-orange-600 text-white border-orange-600',
  indigo: 'bg-indigo-600 text-white border-indigo-600',
  rose: 'bg-rose-600 text-white border-rose-600',
  amber: 'bg-amber-600 text-white border-amber-600',
  slate: 'bg-slate-600 text-white border-slate-600',
  fuchsia: 'bg-fuchsia-600 text-white border-fuchsia-600',
};

export default function MealIdeas({ setFoodLog }) {
  const [activeType, setActiveType] = useState('All');
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loggedMessage, setLoggedMessage] = useState('');

  // Get all meals with their meal type attached
  function getAllMeals() {
    const meals = [];
    for (const [type, items] of Object.entries(MEAL_PRESETS)) {
      for (const item of items) {
        meals.push({ ...item, mealType: type });
      }
    }
    return meals;
  }

  const allMeals = getAllMeals();

  // Filter meals
  const filtered = allMeals.filter(m => {
    if (activeType !== 'All' && m.mealType !== activeType) return false;
    if (activeTag && (!m.tags || !m.tags.includes(activeTag))) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = m.name.toLowerCase().includes(q);
      const matchesSummary = m.summary?.toLowerCase().includes(q);
      const matchesIngredient = m.recipe?.ingredients?.some(ing => ing.toLowerCase().includes(q));
      if (!matchesName && !matchesSummary && !matchesIngredient) return false;
    }
    return true;
  });

  // Get tags that appear in current filtered results
  const visibleTags = [...new Set(filtered.flatMap(m => m.tags || []))];

  function logMeal(meal) {
    setFoodLog(prev => [...prev, {
      id: generateId(), date: todayStr(), meal: meal.mealType,
      description: meal.name, calories: meal.calories,
      protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
    }]);
    setLoggedMessage(`${meal.name} logged to today's food log!`);
    setTimeout(() => setLoggedMessage(''), 3000);
  }

  // Recipe detail view
  if (selectedMeal) {
    const meal = selectedMeal;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedMeal(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Meal Ideas
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">{meal.mealType}</span>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{meal.name}</h2>
              <p className="text-gray-500 mt-1">{meal.summary}</p>
            </div>
            <button onClick={() => logMeal(meal)}
              className="bg-green-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-700 flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Log This Meal
            </button>
          </div>

          {/* Nutrition Info */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700">{meal.calories}</div>
              <div className="text-xs text-blue-600">Calories</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-600">{meal.protein}g</div>
              <div className="text-xs text-red-500">Protein</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{meal.carbs}g</div>
              <div className="text-xs text-yellow-500">Carbs</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{meal.fat}g</div>
              <div className="text-xs text-purple-500">Fat</div>
            </div>
            {meal.prepTime != null && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-gray-700 flex items-center justify-center gap-1">
                  <Clock className="w-5 h-5" /> {meal.prepTime}
                </div>
                <div className="text-xs text-gray-500">Minutes</div>
              </div>
            )}
          </div>

          {/* Tags */}
          {meal.tags && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {meal.tags.map(tag => {
                const tagInfo = MEAL_TAGS[tag];
                return tagInfo ? (
                  <span key={tag} className={`text-xs px-2 py-1 rounded-full font-medium border ${TAG_COLORS[tagInfo.color]}`}>
                    {tagInfo.label}
                  </span>
                ) : null;
              })}
            </div>
          )}

          {/* Recipe */}
          {meal.recipe ? (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {meal.recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 text-xs font-medium mt-0.5">
                        {i + 1}
                      </span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Directions</h3>
                <ol className="space-y-3">
                  {meal.recipe.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center text-gray-400 py-6 bg-gray-50 rounded-lg">
              No recipe needed - this is a grab-and-go item!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main browse view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ChefHat className="w-7 h-7 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Meal Ideas</h2>
      </div>

      {/* Logged notification */}
      {loggedMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium animate-pulse">
          {loggedMessage}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search meals or ingredients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Meal type pills */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {MEAL_TYPES.map(type => (
            <button key={type} onClick={() => setActiveType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeType === type
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {type}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div className="flex gap-1.5 flex-wrap">
          {visibleTags.map(tag => {
            const tagInfo = MEAL_TAGS[tag];
            if (!tagInfo) return null;
            const isActive = activeTag === tag;
            return (
              <button key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border transition ${
                  isActive ? TAG_ACTIVE[tagInfo.color] : TAG_COLORS[tagInfo.color]
                }`}>
                {tagInfo.label} {isActive && '×'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filtered.length} meal{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Meal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((meal, i) => (
          <div key={`${meal.mealType}-${i}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">{meal.mealType}</span>
              {meal.prepTime != null && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {meal.prepTime} min
                </span>
              )}
            </div>

            <h4 className="font-semibold text-gray-800">{meal.name}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{meal.summary}</p>

            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className="font-semibold text-blue-600">{meal.calories} cal</span>
              <span className="text-gray-400">P:{meal.protein}g</span>
              <span className="text-gray-400">C:{meal.carbs}g</span>
              <span className="text-gray-400">F:{meal.fat}g</span>
            </div>

            {meal.tags && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {meal.tags.slice(0, 3).map(tag => {
                  const tagInfo = MEAL_TAGS[tag];
                  return tagInfo ? (
                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tagInfo.color]}`}>
                      {tagInfo.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => setSelectedMeal(meal)}
                className="flex-1 text-center py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                {meal.recipe ? 'View Recipe' : 'Details'}
              </button>
              <button onClick={() => logMeal(meal)}
                className="flex-1 text-center py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Log
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No meals match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or clearing filters</p>
        </div>
      )}
    </div>
  );
}
