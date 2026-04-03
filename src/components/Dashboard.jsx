import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { TrendingDown, Target, Flame, Footprints, CheckCircle2, Circle, Moon, Droplets, Heart, Zap } from 'lucide-react';
import { PROFILE, MILESTONES, calcBMI, todayStr, ACTIVITY_CHECKLIST_ITEMS, DEFAULT_SUPPLEMENTS, DEFAULT_HABITS, MOOD_LEVELS } from '../data/constants';
import DailyCoach from './DailyCoach';

export default function Dashboard({ weighIns, foodLog, workouts, checklist, sleepLog, hydration, moodLog, energyLog, habitsConfig, habitsLog, supplementsConfig, supplementsLog }) {
  const today = todayStr();
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const currentWeight = latest ? latest.weight : PROFILE.startWeight;
  const totalLost = PROFILE.startWeight - currentWeight;
  const remaining = currentWeight - PROFILE.goalWeight;
  const pctComplete = Math.min(Math.max((totalLost / (PROFILE.startWeight - PROFILE.goalWeight)) * 100, 0), 100);
  const bmi = calcBMI(currentWeight, PROFILE.heightInches);
  const weeksActive = sorted.length;
  const avgLoss = weeksActive > 1 ? totalLost / (weeksActive - 1) : 0;

  const todayFood = foodLog.filter(f => f.date === today);
  const macros = todayFood.reduce((a, f) => ({
    calories: a.calories + f.calories, protein: a.protein + f.protein,
    carbs: a.carbs + f.carbs, fat: a.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const todayWorkouts = workouts.filter(w => w.date === today);
  const totalCalsBurned = todayWorkouts.reduce((a, w) => a + (w.caloriesBurned || 0), 0);
  const totalSteps = todayWorkouts.reduce((a, w) => a + (w.steps || 0), 0);

  const todayChecklist = checklist[today] || {};
  const checkedCount = ACTIVITY_CHECKLIST_ITEMS.filter(i => todayChecklist[i.key]).length;

  const chartData = sorted.map(w => ({ date: w.date.slice(5), weight: w.weight }));

  function StatCard({ icon: Icon, iconColor, label, value, sub }) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
    );
  }

  function MacroRing({ label, current, target, color }) {
    const pct = Math.min((current / target) * 100, 100);
    const over = current > target;
    return (
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-20 h-20">
          <svg className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle cx="40" cy="40" r="34" fill="none"
              stroke={over ? '#ef4444' : color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 2.136} 213.6`} />
          </svg>
          <span className="absolute text-sm font-bold">{current}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
        <div className="text-xs text-gray-400">{target - current > 0 ? `${target - current} left` : 'Hit!'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500">Your weight management overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingDown} iconColor="bg-blue-500" label="Current Weight" value={`${currentWeight} lbs`} sub={`BMI: ${bmi.toFixed(1)}`} />
        <StatCard icon={Target} iconColor="bg-green-500" label="Total Lost" value={`${totalLost.toFixed(1)} lbs`} sub={`${remaining.toFixed(1)} lbs to go`} />
        <StatCard icon={Flame} iconColor="bg-orange-500" label="Today's Calories" value={`${macros.calories} / ${PROFILE.dailyCal}`} sub={`${totalCalsBurned} burned`} />
        <StatCard icon={Footprints} iconColor="bg-purple-500" label="Today's Steps" value={totalSteps.toLocaleString()} sub={`Goal: ${PROFILE.stepsGoal.toLocaleString()}`} />
      </div>

      {/* Wellness Summary Row */}
      {(() => {
        const todaySleep = [...(sleepLog || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
        const todayWater = (hydration || {})[today] || 0;
        const todayMood = [...(moodLog || [])].find(m => m.date === today);
        const todayEnergy = [...(energyLog || [])].find(e => e.date === today);
        const energyVals = todayEnergy ? Object.values(todayEnergy.energy || {}) : [];
        const avgEnergy = energyVals.length > 0 ? (energyVals.reduce((a, v) => a + v, 0) / energyVals.length).toFixed(1) : '--';
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Moon} iconColor="bg-indigo-500" label="Last Sleep"
              value={todaySleep ? `${todaySleep.hours}h` : '--'}
              sub={todaySleep ? `Quality: ${todaySleep.quality}/5` : 'Not logged'} />
            <StatCard icon={Droplets} iconColor="bg-cyan-500" label="Water Today"
              value={`${todayWater} oz`}
              sub={`${Math.max(0, PROFILE.dailyWater - todayWater)} oz remaining`} />
            <StatCard icon={Heart} iconColor="bg-pink-500" label="Mood"
              value={todayMood ? `${todayMood.mood}/5` : '--'}
              sub={todayMood ? `Stress: ${todayMood.stress}/10` : 'Not checked in'} />
            <StatCard icon={Zap} iconColor="bg-amber-500" label="Energy"
              value={avgEnergy !== '--' ? `${avgEnergy}/5` : '--'}
              sub={todayEnergy ? `Productivity: ${todayEnergy.productivity}/10` : 'Not logged'} />
          </div>
        );
      })()}

      <DailyCoach foodLog={foodLog} workouts={workouts} checklist={checklist} weighIns={weighIns}
        sleepLog={sleepLog} hydration={hydration} moodLog={moodLog} energyLog={energyLog}
        habitsConfig={habitsConfig} habitsLog={habitsLog}
        supplementsConfig={supplementsConfig} supplementsLog={supplementsLog} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4">Weight Progress</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">195 lbs</span>
              <span className="font-semibold text-blue-600">{pctComplete.toFixed(0)}% complete</span>
              <span className="text-gray-500">170 lbs</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                style={{ width: `${pctComplete}%` }} />
            </div>
          </div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 12 }} />
                <Tooltip />
                <ReferenceLine y={170} stroke="#10b981" strokeDasharray="5 5"
                  label={{ value: 'Goal', fill: '#10b981', fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2}
                  dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
              Log 2+ weigh-ins to see your trend chart
            </div>
          )}
          {weeksActive > 1 && (
            <div className="flex gap-6 mt-4 text-sm text-gray-500">
              <span>Weeks tracked: <strong className="text-gray-800">{weeksActive}</strong></span>
              <span>Avg loss/week: <strong className="text-gray-800">{avgLoss.toFixed(1)} lbs</strong></span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Today's Macros</h3>
            <div className="flex justify-around">
              <MacroRing label="Calories" current={macros.calories} target={PROFILE.dailyCal} color="#3b82f6" />
              <MacroRing label="Protein" current={macros.protein} target={PROFILE.dailyProtein} color="#ef4444" />
              <MacroRing label="Carbs" current={macros.carbs} target={PROFILE.dailyCarbs} color="#eab308" />
              <MacroRing label="Fat" current={macros.fat} target={PROFILE.dailyFat} color="#8b5cf6" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-3">Milestones</h3>
            <div className="space-y-2">
              {MILESTONES.map(m => {
                const achieved = currentWeight <= m.weight;
                return (
                  <div key={m.weight} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${achieved ? 'bg-green-50' : ''}`}>
                    {achieved
                      ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
                    <span className={achieved ? 'text-green-700 font-medium' : 'text-gray-600'}>
                      {m.label} ({m.weight} lbs)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-3">Today's Activity</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">{checkedCount}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{checkedCount} of {ACTIVITY_CHECKLIST_ITEMS.length} activities</div>
              <div className="text-xs text-gray-500">Daily checklist progress</div>
            </div>
          </div>
          {todayWorkouts.length > 0 && (
            <div className="ml-auto text-sm text-gray-600">
              {todayWorkouts.length} workout{todayWorkouts.length > 1 ? 's' : ''} logged | {totalCalsBurned} cal burned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
