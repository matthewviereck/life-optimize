import { MessageCircle, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, Utensils, Dumbbell, Droplets, Moon, Heart, Zap, ListChecks, Pill } from 'lucide-react';
import { PROFILE, ACTIVITY_CHECKLIST_ITEMS, DEFAULT_SUPPLEMENTS, DEFAULT_HABITS, todayStr } from '../data/constants';
import { MEAL_PRESETS } from '../data/mealPresets';

export default function DailyCoach({ foodLog, workouts, checklist, weighIns, sleepLog = [], hydration = {}, moodLog = [], energyLog = [], habitsConfig = [], habitsLog = {}, supplementsConfig = [], supplementsLog = {} }) {
  const today = todayStr();
  const hour = new Date().getHours();

  const todayFood = foodLog.filter(f => f.date === today);
  const todayWorkouts = workouts.filter(w => w.date === today);
  const todayChecklist = checklist[today] || {};
  const checkedCount = ACTIVITY_CHECKLIST_ITEMS.filter(i => todayChecklist[i.key]).length;

  const macros = todayFood.reduce((a, f) => ({
    calories: a.calories + f.calories,
    protein: a.protein + f.protein,
    carbs: a.carbs + f.carbs,
    fat: a.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealsLogged = {
    Breakfast: todayFood.some(f => f.meal === 'Breakfast'),
    Lunch: todayFood.some(f => f.meal === 'Lunch'),
    Snack: todayFood.some(f => f.meal === 'Snack'),
    Dinner: todayFood.some(f => f.meal === 'Dinner'),
    Evening: todayFood.some(f => f.meal === 'Evening'),
  };

  const totalCalsBurned = todayWorkouts.reduce((a, w) => a + (w.caloriesBurned || 0), 0);
  const totalSteps = todayWorkouts.reduce((a, w) => a + (w.steps || 0), 0);
  const kidsPlayMin = todayWorkouts.reduce((a, w) => a + (w.kidsPlay || 0), 0);

  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = sorted.length > 0 ? sorted[sorted.length - 1].weight : PROFILE.startWeight;

  // --- Generate insights ---
  const insights = [];

  // Time-based meal suggestions
  if (hour >= 6 && hour < 10 && !mealsLogged.Breakfast) {
    insights.push({
      type: 'suggestion',
      icon: Utensils,
      title: 'Time for breakfast',
      message: `You haven't logged breakfast yet. Starting with protein keeps you full longer. Try the Egg Scramble (390 cal, 33g protein) or Overnight Oats for something quick.`,
    });
  }
  if (hour >= 11 && hour < 14 && !mealsLogged.Lunch) {
    insights.push({
      type: 'suggestion',
      icon: Utensils,
      title: 'Lunch time',
      message: `Don't skip lunch -- it leads to overeating later. You have ${PROFILE.dailyCal - macros.calories} calories remaining. A Chicken & Rice Bowl or Turkey Wrap would fit well.`,
    });
  }
  if (hour >= 14 && hour < 17 && !mealsLogged.Snack && macros.calories > 0) {
    insights.push({
      type: 'suggestion',
      icon: Utensils,
      title: 'Afternoon snack window',
      message: `A high-protein snack now prevents the 4pm crash. You need ${PROFILE.dailyProtein - macros.protein}g more protein today. Try jerky + string cheese (24g protein) or a protein shake.`,
    });
  }
  if (hour >= 17 && hour < 20 && !mealsLogged.Dinner && macros.calories > 0) {
    const calsLeft = PROFILE.dailyCal - macros.calories;
    const proteinLeft = PROFILE.dailyProtein - macros.protein;
    insights.push({
      type: 'suggestion',
      icon: Utensils,
      title: 'Dinner planning',
      message: `You have ~${calsLeft} calories and ${proteinLeft}g protein left for dinner${!mealsLogged.Evening ? ' + evening snack' : ''}. ${calsLeft > 500 ? 'You have room for a full dinner like Baked Salmon or Chicken Stir-Fry.' : calsLeft > 300 ? 'Go lighter -- try Shrimp Lettuce Wraps (350 cal, 40g protein).' : 'Keep it light -- a big salad with grilled chicken would be perfect.'}`,
    });
  }

  // Protein tracking
  if (macros.calories > 0) {
    const proteinPct = macros.protein / macros.calories * 400;
    if (macros.protein > 0 && proteinPct < 30 && hour > 10) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Protein is running low',
        message: `Only ${macros.protein}g protein so far (${Math.round(macros.protein / PROFILE.dailyProtein * 100)}% of your 170g target). Prioritize protein in your next meal -- chicken, fish, Greek yogurt, or a protein shake can close the gap.`,
      });
    }
    if (macros.protein >= PROFILE.dailyProtein * 0.8) {
      insights.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Protein game is strong',
        message: `${macros.protein}g protein logged -- you're at ${Math.round(macros.protein / PROFILE.dailyProtein * 100)}% of target. Great job prioritizing protein. This protects your muscle while losing fat.`,
      });
    }
  }

  // Calorie analysis
  if (macros.calories > PROFILE.dailyCal) {
    const over = macros.calories - PROFILE.dailyCal;
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: `Over calorie target by ${over}`,
      message: `You're at ${macros.calories} / ${PROFILE.dailyCal} calories. One day over won't derail you -- it's the weekly average that matters. ${totalCalsBurned > 0 ? `You burned ${totalCalsBurned} cal through activity, so your net is closer to ${macros.calories - totalCalsBurned}.` : 'Adding a walk or active play with the kids can help offset the surplus.'}`,
    });
  } else if (macros.calories > 0 && macros.calories < PROFILE.dailyCal * 0.5 && hour > 16) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Under-eating today',
      message: `Only ${macros.calories} calories by the afternoon. Eating too little can slow your metabolism and lead to binge eating later. Make sure you get a solid dinner with protein.`,
    });
  } else if (macros.calories > PROFILE.dailyCal * 0.7 && macros.calories <= PROFILE.dailyCal) {
    insights.push({
      type: 'success',
      icon: CheckCircle2,
      title: 'Calories on track',
      message: `${macros.calories} / ${PROFILE.dailyCal} calories -- you're right in the zone. ${PROFILE.dailyCal - macros.calories} left for the rest of the day.`,
    });
  }

  // Meal quality feedback
  const mealNames = todayFood.map(f => f.description.toLowerCase());
  const hasVeggies = mealNames.some(n =>
    ['broccoli', 'spinach', 'asparagus', 'salad', 'vegg', 'pepper', 'green', 'cucumber', 'tomato', 'lettuce', 'zucchini'].some(v => n.includes(v))
  );
  const hasFruit = mealNames.some(n =>
    ['berry', 'berries', 'banana', 'apple', 'mango', 'strawberr', 'blueberr', 'pineapple', 'fruit'].some(v => n.includes(v))
  );

  if (todayFood.length >= 2 && !hasVeggies) {
    insights.push({
      type: 'suggestion',
      icon: Lightbulb,
      title: 'Add some veggies',
      message: `No vegetables logged yet today. Try to include veggies at lunch and dinner -- they fill you up for minimal calories. Even adding a side salad or steamed broccoli helps.`,
    });
  }
  if (todayFood.length >= 2 && hasVeggies && hasFruit) {
    insights.push({
      type: 'success',
      icon: CheckCircle2,
      title: 'Good variety today',
      message: `Nice job including both fruits and vegetables. Diverse whole foods give you the micronutrients you need while keeping calories in check.`,
    });
  }

  // Activity feedback
  if (hour > 12 && todayWorkouts.length === 0 && checkedCount === 0) {
    insights.push({
      type: 'suggestion',
      icon: Dumbbell,
      title: 'Get moving today',
      message: `No activity logged yet. Even a 15-minute walk counts. Take the stairs, park further away, or play with the kids for 20 minutes -- small movements add up to 200-500 extra calories burned.`,
    });
  }
  if (todayWorkouts.length > 0) {
    insights.push({
      type: 'success',
      icon: Dumbbell,
      title: 'Workout logged',
      message: `${todayWorkouts.length} workout${todayWorkouts.length > 1 ? 's' : ''} done, ~${totalCalsBurned} calories burned. ${kidsPlayMin > 0 ? `Plus ${kidsPlayMin} min of active play with the kids -- that's exercise AND quality time.` : 'Great consistency. Keep showing up.'}`,
    });
  }
  if (checkedCount >= 6) {
    insights.push({
      type: 'success',
      icon: CheckCircle2,
      title: 'Activity checklist crushing it',
      message: `${checkedCount}/8 daily activities completed. These small habits (stairs, parking far, hourly walks) are what separate people who keep weight off long-term from those who don't.`,
    });
  } else if (checkedCount >= 3) {
    const unchecked = ACTIVITY_CHECKLIST_ITEMS.filter(i => !todayChecklist[i.key]);
    insights.push({
      type: 'suggestion',
      icon: Lightbulb,
      title: `${8 - checkedCount} activities remaining`,
      message: `Good progress on the daily checklist. Still to do: ${unchecked.slice(0, 3).map(i => i.label).join(', ')}${unchecked.length > 3 ? '...' : ''}.`,
    });
  }

  // Hydration (real data)
  const todayWater = hydration[today] || 0;
  if (todayWater > 0 && todayWater >= PROFILE.dailyWater) {
    insights.push({
      type: 'success',
      icon: Droplets,
      title: 'Hydration goal hit',
      message: `${todayWater} oz of water today -- you've hit your ${PROFILE.dailyWater} oz goal. Staying hydrated supports fat loss, energy, and recovery.`,
    });
  } else if (todayWater > 0 && todayWater < PROFILE.dailyWater * 0.5 && hour > 14) {
    insights.push({
      type: 'warning',
      icon: Droplets,
      title: 'Hydration behind',
      message: `Only ${todayWater} oz so far -- you need ${PROFILE.dailyWater - todayWater} more oz today. Drink a glass before your next meal. Dehydration can feel like hunger.`,
    });
  } else if (todayWater === 0 && hour >= 10) {
    insights.push({
      type: 'suggestion',
      icon: Droplets,
      title: 'Track your water',
      message: `No water logged yet. Head to the Hydration tab to start tracking -- the quick-add buttons make it easy. Goal: ${PROFILE.dailyWater} oz/day.`,
    });
  }

  // Sleep feedback
  const sortedSleep = [...sleepLog].sort((a, b) => b.date.localeCompare(a.date));
  const lastSleep = sortedSleep[0];
  if (lastSleep) {
    if (lastSleep.hours < 6) {
      insights.push({
        type: 'warning',
        icon: Moon,
        title: 'Sleep deficit',
        message: `Only ${lastSleep.hours} hours last night. Poor sleep increases hunger hormones (ghrelin), makes you crave carbs, and reduces willpower. Aim for 7-8 hours tonight. Consider cutting caffeine after 2 PM.`,
      });
    } else if (lastSleep.hours >= 7 && lastSleep.quality >= 4) {
      insights.push({
        type: 'success',
        icon: Moon,
        title: 'Great sleep',
        message: `${lastSleep.hours} hours with ${lastSleep.quality}/5 quality. Good sleep is one of the most underrated tools for fat loss and recovery. Keep this up.`,
      });
    } else if (lastSleep.quality <= 2) {
      insights.push({
        type: 'suggestion',
        icon: Moon,
        title: 'Sleep quality was low',
        message: `${lastSleep.hours} hours but only ${lastSleep.quality}/5 quality. Try: no screens 30 min before bed, keep the room cool and dark, consider magnesium before bed.`,
      });
    }
  }

  // Mood feedback
  const todayMood = moodLog.find(m => m.date === today);
  if (todayMood) {
    if (todayMood.mood <= 2 && todayMood.stress >= 7) {
      insights.push({
        type: 'suggestion',
        icon: Heart,
        title: 'Tough day -- be kind to yourself',
        message: `Low mood and high stress today. Stress raises cortisol, which promotes fat storage. Try a 10-min walk, deep breathing, or playing with the kids. Don't stress-eat -- that compounds the problem.`,
      });
    } else if (todayMood.mood >= 4) {
      insights.push({
        type: 'success',
        icon: Heart,
        title: 'Mood is strong today',
        message: `Feeling ${todayMood.mood === 5 ? 'great' : 'good'} with ${todayMood.stress}/10 stress. Positive mindset makes healthy choices easier. Use this energy to crush your workout and nutrition.`,
      });
    }
    if (todayMood.mindfulness > 0) {
      insights.push({
        type: 'success',
        icon: Heart,
        title: `${todayMood.mindfulness} min of mindfulness`,
        message: `Meditation and mindfulness reduce stress, improve sleep, and help you make better food decisions. Consistency matters more than duration.`,
      });
    }
  }

  // Energy feedback
  const todayEnergy = energyLog.find(e => e.date === today);
  if (todayEnergy) {
    const energyVals = Object.values(todayEnergy.energy || {});
    const avgE = energyVals.length > 0 ? energyVals.reduce((a, v) => a + v, 0) / energyVals.length : 0;
    if (avgE < 2.5 && avgE > 0) {
      insights.push({
        type: 'warning',
        icon: Zap,
        title: 'Low energy today',
        message: `Average energy ${avgE.toFixed(1)}/5. Low energy often ties to: poor sleep, low calorie intake, dehydration, or stress. Check those areas. A short walk or protein-rich snack can give a quick boost.`,
      });
    } else if (avgE >= 4) {
      insights.push({
        type: 'success',
        icon: Zap,
        title: 'High energy day',
        message: `Energy averaging ${avgE.toFixed(1)}/5 -- great output. Note what you did differently today (sleep, meals, exercise) and try to replicate it.`,
      });
    }
    if (todayEnergy.focusMin >= 60) {
      insights.push({
        type: 'success',
        icon: Zap,
        title: `${todayEnergy.focusMin} min of deep focus`,
        message: `Solid focus time today. Productivity: ${todayEnergy.productivity}/10. Regular exercise and good nutrition directly fuel cognitive performance.`,
      });
    }
  }

  // Habits feedback
  const habits = habitsConfig.length > 0 ? habitsConfig : DEFAULT_HABITS;
  const todayHabits = habitsLog[today] || {};
  const habitsCompleted = habits.filter(h => todayHabits[h.key]).length;
  if (habitsCompleted > 0 && habitsCompleted === habits.length) {
    insights.push({
      type: 'success',
      icon: ListChecks,
      title: 'All habits completed',
      message: `${habitsCompleted}/${habits.length} daily habits done. Perfect day. Building these small routines compounds over time into massive life improvements.`,
    });
  } else if (habitsCompleted >= habits.length * 0.5) {
    insights.push({
      type: 'suggestion',
      icon: ListChecks,
      title: `${habits.length - habitsCompleted} habits remaining`,
      message: `${habitsCompleted}/${habits.length} habits done. You're over halfway -- finish strong. ${habits.filter(h => !todayHabits[h.key]).slice(0, 2).map(h => h.label).join(' and ')} still unchecked.`,
    });
  }

  // Supplements feedback
  const supps = supplementsConfig.length > 0 ? supplementsConfig : DEFAULT_SUPPLEMENTS;
  const todaySupps = supplementsLog[today] || {};
  const suppsTaken = supps.filter(s => todaySupps[s.key]).length;
  if (suppsTaken === supps.length && supps.length > 0) {
    insights.push({
      type: 'success',
      icon: Pill,
      title: 'All supplements taken',
      message: `${suppsTaken}/${supps.length} supplements done for today. Consistency with supplements matters more than timing -- just don't skip days.`,
    });
  } else if (hour >= 18 && suppsTaken < supps.length && supps.length > 0) {
    const missed = supps.filter(s => !todaySupps[s.key]);
    insights.push({
      type: 'suggestion',
      icon: Pill,
      title: `${missed.length} supplement${missed.length > 1 ? 's' : ''} not taken`,
      message: `Don't forget: ${missed.slice(0, 3).map(s => s.label).join(', ')}${missed.length > 3 ? '...' : ''}. Head to the Supplements tab to check them off.`,
    });
  }

  // Weight trend feedback
  if (sorted.length >= 3) {
    const last3 = sorted.slice(-3);
    const trend = last3[2].weight - last3[0].weight;
    if (trend < -1) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Weight trending down',
        message: `Down ${Math.abs(trend).toFixed(1)} lbs over your last 3 weigh-ins. The plan is working. Stay consistent with your nutrition and activity.`,
      });
    } else if (trend > 1) {
      insights.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Weight trending up',
        message: `Up ${trend.toFixed(1)} lbs over your last 3 weigh-ins. This could be water retention, muscle gain, or a sign to tighten up nutrition. Focus on hitting your protein target and calorie limit this week.`,
      });
    }
  }

  // End of day summary
  if (hour >= 20 && macros.calories > 0) {
    const calDiff = macros.calories - PROFILE.dailyCal;
    const proteinHit = macros.protein >= PROFILE.dailyProtein * 0.85;
    const exercised = todayWorkouts.length > 0 || checkedCount >= 4;
    const grade = (calDiff <= 100 && proteinHit && exercised) ? 'A'
      : (calDiff <= 200 && macros.protein >= PROFILE.dailyProtein * 0.7) ? 'B'
      : (calDiff <= 400) ? 'C' : 'D';

    insights.unshift({
      type: grade === 'A' || grade === 'B' ? 'success' : 'warning',
      icon: MessageCircle,
      title: `End of day grade: ${grade}`,
      message: `Calories: ${macros.calories}/${PROFILE.dailyCal} ${calDiff <= 0 ? '(under)' : `(+${calDiff} over)`} | Protein: ${macros.protein}/${PROFILE.dailyProtein}g ${proteinHit ? '(hit)' : '(missed)'} | Activity: ${exercised ? 'Yes' : 'None logged'}. ${grade === 'A' ? 'Outstanding day. This is how you get to 170.' : grade === 'B' ? 'Solid day. Small improvements add up over weeks.' : 'Room for improvement. Tomorrow is a new day -- plan your meals ahead.'}`,
    });
  }

  // Empty state
  if (todayFood.length === 0 && todayWorkouts.length === 0 && checkedCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Daily Coach</h3>
            <p className="text-xs text-gray-500">Personalized feedback on your day</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-800">
          <p className="font-medium">Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}! No data logged yet today.</p>
          <p className="mt-2 text-indigo-600">Start by logging your {hour < 10 ? 'breakfast' : hour < 14 ? 'lunch' : 'next meal'} in the Food Log tab, or check off some daily activities in the Workouts tab. I'll give you personalized feedback as your day unfolds.</p>
        </div>
      </div>
    );
  }

  const typeStyles = {
    success: 'bg-green-50 border-green-100 text-green-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
    suggestion: 'bg-blue-50 border-blue-100 text-blue-800',
  };
  const iconStyles = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    suggestion: 'text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Daily Coach</h3>
          <p className="text-xs text-gray-500">Personalized feedback based on today's data</p>
        </div>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className={`border rounded-lg p-4 ${typeStyles[insight.type]}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyles[insight.type]}`} />
                <div>
                  <div className="font-semibold text-sm">{insight.title}</div>
                  <p className="text-sm mt-1 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
