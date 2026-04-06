import { useState } from 'react';
import { ClipboardList, ArrowLeft, Clock, Calendar, Dumbbell, PlayCircle, ExternalLink, CheckCircle2, Award, Plus } from 'lucide-react';
import { WORKOUT_PROGRAMS, PROGRAM_CATEGORIES } from '../data/workoutPrograms';
import { getExerciseById, getEmbedUrl } from '../data/exerciseLibrary';
import { todayStr, generateId } from '../data/constants';
import MuscleDiagram, { MuscleDiagramLegend } from './MuscleDiagram';

const LEVEL_COLORS = {
  'Beginner': 'bg-green-100 text-green-700 border-green-200',
  'Intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Advanced': 'bg-red-100 text-red-700 border-red-200',
};

const CATEGORY_COLORS = {
  'Full Body': 'bg-blue-500',
  'Upper/Lower Split': 'bg-purple-500',
  'Push/Pull/Legs': 'bg-indigo-500',
  'Home Workout': 'bg-green-500',
  'HIIT / Cardio': 'bg-red-500',
  'Core': 'bg-yellow-500',
  'Glutes': 'bg-pink-500',
  'Quick': 'bg-cyan-500',
};

export default function WorkoutPrograms({ setWorkouts }) {
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('All');
  const [logged, setLogged] = useState('');
  const [showVideoFor, setShowVideoFor] = useState({});

  const filtered = category === 'All'
    ? WORKOUT_PROGRAMS
    : WORKOUT_PROGRAMS.filter(p => p.category === category);

  function logWorkout(program) {
    setWorkouts(prev => [...prev, {
      id: generateId(),
      date: todayStr(),
      type: program.name,
      duration: program.duration,
      steps: 0,
      kidsPlay: 0,
      stairs: 0,
      extraWalking: 0,
      caloriesBurned: Math.round(program.duration * (program.category.includes('HIIT') ? 10 : 6)),
      notes: `Completed ${program.name} program`,
    }]);
    setLogged(`${program.name} logged to today's workouts!`);
    setTimeout(() => setLogged(''), 3000);
  }

  // Program detail view
  if (selected) {
    const exercises = selected.exercises.map(e => ({ ...e, exercise: getExerciseById(e.id) })).filter(e => e.exercise);

    // Compute all muscles worked across the program
    const primaryMuscles = [...new Set(exercises.map(e => e.exercise.muscleGroup))];
    const secondaryMuscles = [...new Set(exercises.flatMap(e => e.exercise.secondary || []))];

    return (
      <div className="space-y-6">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Programs
        </button>

        {logged && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {logged}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${CATEGORY_COLORS[selected.category]}`}>
                  {selected.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LEVEL_COLORS[selected.level]}`}>
                  {selected.level}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{selected.name}</h2>
              <p className="text-gray-500 mt-1">{selected.description}</p>
            </div>
            <button onClick={() => logWorkout(selected)}
              className="bg-orange-500 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-orange-600 flex items-center gap-2 shrink-0">
              <Plus className="w-5 h-5" /> Log Workout
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700">{selected.duration} min</div>
              <div className="text-xs text-blue-600">Duration</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-purple-700">{selected.daysPerWeek}</div>
              <div className="text-xs text-purple-600">Frequency</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Dumbbell className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-700">{selected.equipment}</div>
              <div className="text-xs text-gray-500">Equipment</div>
            </div>
          </div>

          {/* Muscles Worked Summary */}
          <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Muscles Worked in This Program</h3>
            <MuscleDiagram
              primary={primaryMuscles[0]}
              secondary={[...primaryMuscles.slice(1), ...secondaryMuscles]}
              size="md"
            />
            <MuscleDiagramLegend />
            <div className="text-center text-xs text-gray-500 mt-3">
              Targets: <strong>{primaryMuscles.join(', ')}</strong>
              {secondaryMuscles.length > 0 && <span> · Assists: {secondaryMuscles.join(', ')}</span>}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" /> Exercises ({exercises.length})
          </h3>

          <div className="space-y-3">
            {exercises.map((ex, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{ex.exercise.name}</h4>
                      <p className="text-xs text-gray-500">{ex.exercise.muscleGroup} · {ex.exercise.equipment}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowVideoFor(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                    className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${showVideoFor[ex.id] ? 'bg-red-100 text-red-700' : 'text-red-600 hover:bg-red-50'}`}>
                    <PlayCircle className="w-5 h-5" />
                    {showVideoFor[ex.id] ? 'Hide' : 'Video'}
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="bg-blue-50 px-3 py-1 rounded">
                    <span className="text-xs text-blue-600">Sets: </span>
                    <span className="font-bold text-blue-700">{ex.sets}</span>
                  </div>
                  <div className="bg-green-50 px-3 py-1 rounded">
                    <span className="text-xs text-green-600">Reps: </span>
                    <span className="font-bold text-green-700">{ex.reps}</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-1 rounded">
                    <span className="text-xs text-gray-500">Rest: </span>
                    <span className="font-bold text-gray-700">{ex.rest}</span>
                  </div>
                </div>
                {ex.exercise.formCues && (
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Tip:</strong> {ex.exercise.formCues[0]}
                  </div>
                )}
                {showVideoFor[ex.id] && (() => {
                  const embed = getEmbedUrl(ex.id);
                  return embed ? (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-black">
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={embed}
                          title={`${ex.exercise.name} demo`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-center text-xs text-gray-400 bg-gray-50 rounded-lg p-4">
                      <a href={ex.exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 underline">
                        Watch on YouTube
                      </a>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">Click the play icon on any exercise to watch a demo video</p>
            <button onClick={() => logWorkout(selected)}
              className="bg-orange-500 text-white rounded-lg px-5 py-2 font-medium hover:bg-orange-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Complete Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-7 h-7 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-800">Workout Programs</h2>
      </div>

      {logged && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {logged}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Category</div>
        <div className="flex gap-1.5 flex-wrap">
          {PROGRAM_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(program => (
          <button key={program.id} onClick={() => setSelected(program)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-orange-300 transition text-left group">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${CATEGORY_COLORS[program.category]}`}>
                {program.category}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${LEVEL_COLORS[program.level]}`}>
                {program.level}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 group-hover:text-orange-700">{program.name}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{program.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}m</span>
              <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {program.exercises.length} exercises</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">{program.daysPerWeek}</div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Tip:</strong> Click any program to see all exercises with sets, reps, rest times, and video demos. Click "Log Workout" to add it to your daily workout log.
      </div>
    </div>
  );
}
