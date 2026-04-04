import { useState } from 'react';
import { LayoutDashboard, Scale, UtensilsCrossed, Dumbbell, Ruler, ChefHat, Moon, Droplets, Heart, Zap, ListChecks, Pill, Upload, Timer, Menu, X, LogOut, Loader2, Library, ClipboardList } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useSupabaseArray } from './hooks/useSupabaseArray';
import { useSupabaseDateMap } from './hooks/useSupabaseDateMap';
import { useSupabaseConfig } from './hooks/useSupabaseConfig';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import WeighIn from './components/WeighIn';
import FoodLog from './components/FoodLog';
import WorkoutLog from './components/WorkoutLog';
import Measurements from './components/Measurements';
import MealIdeas from './components/MealIdeas';
import SleepLog from './components/SleepLog';
import HydrationLog from './components/HydrationLog';
import MoodLog from './components/MoodLog';
import EnergyLog from './components/EnergyLog';
import HabitsTracker from './components/HabitsTracker';
import SupplementLog from './components/SupplementLog';
import DataImport from './components/DataImport';
import FastingTracker from './components/FastingTracker';
import ExerciseLibrary from './components/ExerciseLibrary';
import WorkoutPrograms from './components/WorkoutPrograms';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'BODY',
    items: [
      { id: 'weighin', label: 'Weigh-In', icon: Scale },
      { id: 'food', label: 'Food Log', icon: UtensilsCrossed },
      { id: 'meals', label: 'Meal Ideas', icon: ChefHat },
      { id: 'fasting', label: 'Fasting', icon: Timer },
      { id: 'workout', label: 'Workouts', icon: Dumbbell },
      { id: 'programs', label: 'Programs', icon: ClipboardList },
      { id: 'exercises', label: 'Exercises', icon: Library },
      { id: 'measurements', label: 'Measurements', icon: Ruler },
    ],
  },
  {
    label: 'WELLNESS',
    items: [
      { id: 'sleep', label: 'Sleep', icon: Moon },
      { id: 'hydration', label: 'Hydration', icon: Droplets },
      { id: 'mood', label: 'Mood & Mind', icon: Heart },
      { id: 'energy', label: 'Energy', icon: Zap },
    ],
  },
  {
    label: 'HABITS',
    items: [
      { id: 'habits', label: 'Daily Habits', icon: ListChecks },
      { id: 'supplements', label: 'Supplements', icon: Pill },
      { id: 'import', label: 'Import / Export', icon: Upload },
    ],
  },
];

function AppContent({ userId }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Body
  const [weighIns, setWeighIns] = useSupabaseArray('weigh_ins', 'wm-weighins', userId);
  const [foodLog, setFoodLog] = useSupabaseArray('food_log', 'wm-foodlog', userId);
  const [workouts, setWorkouts] = useSupabaseArray('workouts', 'wm-workouts', userId);
  const [checklist, setChecklist] = useSupabaseDateMap('daily_checklist', 'wm-checklist', userId);
  const [measurements, setMeasurements] = useSupabaseArray('measurements', 'wm-measurements', userId);
  const [fastingLog, setFastingLog] = useSupabaseArray('fasting_log', 'wm-fasting', userId);

  // Wellness
  const [sleepLog, setSleepLog] = useSupabaseArray('sleep_log', 'wm-sleep', userId);
  const [hydration, setHydration] = useSupabaseDateMap('daily_hydration', 'wm-hydration', userId, 'oz');
  const [moodLog, setMoodLog] = useSupabaseArray('mood_log', 'wm-mood', userId);
  const [energyLog, setEnergyLog] = useSupabaseArray('energy_log', 'wm-energy', userId);

  // Habits
  const [habitsConfig, setHabitsConfig] = useSupabaseConfig('habits_config', 'wm-habits-config', userId);
  const [habitsLog, setHabitsLog] = useSupabaseDateMap('daily_habits_log', 'wm-habits-log', userId);
  const [supplementsConfig, setSupplementsConfig] = useSupabaseConfig('supplements_config', 'wm-supplements-config', userId);
  const [supplementsLog, setSupplementsLog] = useSupabaseDateMap('daily_supplements_log', 'wm-supplements-log', userId);

  const { signOut } = useAuth();

  function navTo(tabId) {
    setActiveTab(tabId);
    setMobileNavOpen(false);
  }

  const sidebar = (
    <>
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold">L</span>
          Life Optimize
        </h1>
        <p className="text-[10px] text-gray-500 mt-1">Health & Wellness Tracker</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => navTo(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition
                      ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-700 space-y-2">
        <div className="text-[10px] text-gray-500">Goal: 195 → 170 lbs</div>
        <button onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 bg-gray-900 text-white flex-col shrink-0">
        {sidebar}
      </aside>

      {/* Mobile Header + Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold">L</span>
          <span className="font-bold">Life Optimize</span>
        </div>
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-900 text-white flex flex-col pt-16 overflow-y-auto">
          {sidebar}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard weighIns={weighIns} foodLog={foodLog} workouts={workouts} checklist={checklist}
              sleepLog={sleepLog} hydration={hydration} moodLog={moodLog} energyLog={energyLog}
              habitsConfig={habitsConfig} habitsLog={habitsLog}
              supplementsConfig={supplementsConfig} supplementsLog={supplementsLog} />
          )}
          {activeTab === 'weighin' && <WeighIn weighIns={weighIns} setWeighIns={setWeighIns} />}
          {activeTab === 'food' && <FoodLog foodLog={foodLog} setFoodLog={setFoodLog} />}
          {activeTab === 'meals' && <MealIdeas setFoodLog={setFoodLog} />}
          {activeTab === 'fasting' && <FastingTracker fastingLog={fastingLog} setFastingLog={setFastingLog} />}
          {activeTab === 'workout' && <WorkoutLog workouts={workouts} setWorkouts={setWorkouts} checklist={checklist} setChecklist={setChecklist} />}
          {activeTab === 'programs' && <WorkoutPrograms setWorkouts={setWorkouts} />}
          {activeTab === 'exercises' && <ExerciseLibrary />}
          {activeTab === 'measurements' && <Measurements measurements={measurements} setMeasurements={setMeasurements} />}
          {activeTab === 'sleep' && <SleepLog sleepLog={sleepLog} setSleepLog={setSleepLog} />}
          {activeTab === 'hydration' && <HydrationLog hydration={hydration} setHydration={setHydration} />}
          {activeTab === 'mood' && <MoodLog moodLog={moodLog} setMoodLog={setMoodLog} />}
          {activeTab === 'energy' && <EnergyLog energyLog={energyLog} setEnergyLog={setEnergyLog} />}
          {activeTab === 'habits' && <HabitsTracker habitsConfig={habitsConfig} setHabitsConfig={setHabitsConfig} habitsLog={habitsLog} setHabitsLog={setHabitsLog} />}
          {activeTab === 'supplements' && <SupplementLog supplementsConfig={supplementsConfig} setSupplementsConfig={setSupplementsConfig} supplementsLog={supplementsLog} setSupplementsLog={setSupplementsLog} />}
          {activeTab === 'import' && <DataImport weighIns={weighIns} setWeighIns={setWeighIns} sleepLog={sleepLog} setSleepLog={setSleepLog} workouts={workouts} setWorkouts={setWorkouts} hydration={hydration} setHydration={setHydration} foodLog={foodLog} setFoodLog={setFoodLog} />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is configured and user is not logged in, show login
  if (isConfigured && !user) {
    return <LoginScreen />;
  }

  // Either logged in or running locally without Supabase
  return <AppContent userId={user?.id || null} />;
}
