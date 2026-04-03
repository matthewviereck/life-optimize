export const PROFILE = {
  startWeight: 195,
  goalWeight: 170,
  heightInches: 69,
  startDate: '2026-04-01',
  dailyCal: 1800,
  dailyProtein: 170,
  dailyCarbs: 150,
  dailyFat: 58,
  dailyWater: 80,
  stepsGoal: 10000,
};

export const MILESTONES = [
  { label: 'First 5 lbs', weight: 190 },
  { label: '10 lbs down', weight: 185 },
  { label: 'Halfway', weight: 182.5 },
  { label: '15 lbs down', weight: 180 },
  { label: '20 lbs down', weight: 175 },
  { label: 'Goal Weight', weight: 170 },
];

export const ACTIVITY_CHECKLIST_ITEMS = [
  { key: 'morningStretch', label: 'Morning stretch or walk (5 min)' },
  { key: 'stairs', label: 'Take the stairs at least once' },
  { key: 'parkFar', label: 'Park further from entrance' },
  { key: 'hourlyWalk', label: 'Stand & walk 2 min every hour' },
  { key: 'dailyWalk', label: '15-20 minute walk' },
  { key: 'kidsPlay', label: 'Active play with kids (20+ min)' },
  { key: 'eveningStretch', label: 'Evening stretch before bed' },
  { key: 'stepsGoal', label: 'Hit step goal' },
];

export const DEFAULT_SUPPLEMENTS = [
  { key: 'creatine', label: 'Creatine (5g)', time: 'anytime' },
  { key: 'multivitamin', label: 'Multivitamin', time: 'morning' },
  { key: 'vitaminD', label: 'Vitamin D (2000-4000 IU)', time: 'morning' },
  { key: 'fishOil', label: 'Fish Oil (1-2g EPA/DHA)', time: 'with meal' },
  { key: 'magnesium', label: 'Magnesium (200-400mg)', time: 'before bed' },
  { key: 'wheyProtein', label: 'Whey Protein', time: 'post-workout' },
];

export const DEFAULT_HABITS = [
  { key: 'reading', label: 'Read for 20+ minutes', icon: 'book' },
  { key: 'meditation', label: 'Meditate / mindfulness', icon: 'brain' },
  { key: 'noAlcohol', label: 'No alcohol today', icon: 'wine-off' },
  { key: 'screenLimit', label: 'Limit screen time before bed', icon: 'monitor-off' },
  { key: 'makeBed', label: 'Make the bed', icon: 'bed' },
  { key: 'healthyMeal', label: 'Eat a home-cooked meal', icon: 'utensils' },
  { key: 'connect', label: 'Connect with family/friends', icon: 'heart' },
  { key: 'learn', label: 'Learn something new', icon: 'lightbulb' },
  { key: 'tidy', label: 'Tidy up for 10 minutes', icon: 'sparkles' },
  { key: 'journal', label: 'Write in journal', icon: 'pen' },
];

export const MOOD_LEVELS = [
  { value: 1, label: 'Awful', color: 'red' },
  { value: 2, label: 'Bad', color: 'orange' },
  { value: 3, label: 'Okay', color: 'yellow' },
  { value: 4, label: 'Good', color: 'lime' },
  { value: 5, label: 'Great', color: 'green' },
];

export const ENERGY_PERIODS = [
  { key: 'morning', label: 'Morning', time: '6-10 AM' },
  { key: 'midday', label: 'Midday', time: '10 AM-1 PM' },
  { key: 'afternoon', label: 'Afternoon', time: '1-5 PM' },
  { key: 'evening', label: 'Evening', time: '5-9 PM' },
];

export function calcBMI(weightLbs, heightInches) {
  return (weightLbs / (heightInches * heightInches)) * 703;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
