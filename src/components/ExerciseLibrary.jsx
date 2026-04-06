import { useState } from 'react';
import { Library, Search, X, PlayCircle, ArrowLeft, ExternalLink, Target, Zap, Award } from 'lucide-react';
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES, DIFFICULTY_LEVELS, getEmbedUrl } from '../data/exerciseLibrary';
import MuscleDiagram, { MuscleDiagramLegend } from './MuscleDiagram';

const DIFFICULTY_COLORS = {
  'Beginner': 'bg-green-100 text-green-700 border-green-200',
  'Intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Advanced': 'bg-red-100 text-red-700 border-red-200',
};

const MUSCLE_COLORS = {
  'Chest': 'bg-blue-500',
  'Back': 'bg-indigo-500',
  'Shoulders': 'bg-purple-500',
  'Arms': 'bg-pink-500',
  'Legs': 'bg-orange-500',
  'Core': 'bg-yellow-500',
  'Glutes': 'bg-red-500',
  'Full Body': 'bg-emerald-500',
  'Cardio': 'bg-cyan-500',
};

export default function ExerciseLibrary() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [equipFilter, setEquipFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  const filtered = EXERCISES.filter(ex => {
    if (muscleFilter !== 'All' && ex.muscleGroup !== muscleFilter && !ex.secondary?.includes(muscleFilter)) return false;
    if (equipFilter !== 'All' && ex.equipment !== equipFilter) return false;
    if (diffFilter !== 'All' && ex.difficulty !== diffFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!ex.name.toLowerCase().includes(q) && !ex.muscleGroup.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Detail view
  if (selected) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Exercise Library
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${MUSCLE_COLORS[selected.muscleGroup]}`}>
                  {selected.muscleGroup}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[selected.difficulty]}`}>
                  {selected.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {selected.equipment}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{selected.name}</h2>
              {selected.secondary?.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">Also works: {selected.secondary.join(', ')}</p>
              )}
            </div>
            <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer"
              className="bg-red-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-red-700 flex items-center gap-2 shrink-0">
              <PlayCircle className="w-5 h-5" /> Open on YouTube
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Embedded Video */}
          {(() => {
            const embed = getEmbedUrl(selected.id);
            return embed ? (
              <div className="mt-4 mb-6 rounded-xl overflow-hidden border border-gray-200 bg-black">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={embed}
                    title={`${selected.name} demo`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null;
          })()}

          {/* Muscle Diagram */}
          <div className="mt-6 mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Muscles Worked</h3>
            <MuscleDiagram primary={selected.muscleGroup} secondary={selected.secondary || []} size="md" />
            <MuscleDiagramLegend />
          </div>

          {/* Suggested sets/reps */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700">{selected.sets}</div>
              <div className="text-xs text-blue-600">Sets</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-700">{selected.reps}</div>
              <div className="text-xs text-green-600">Reps</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-700">{selected.equipment}</div>
              <div className="text-xs text-gray-500">Equipment</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" /> How to Perform
            </h3>
            <ol className="space-y-2">
              {selected.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Form Cues */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Form Tips
            </h3>
            <ul className="space-y-1.5">
              {selected.formCues.map((cue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              Watch video demonstrations on YouTube
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Library className="w-7 h-7 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Exercise Library</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Muscle Group</div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setMuscleFilter('All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${muscleFilter === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {MUSCLE_GROUPS.map(m => (
              <button key={m} onClick={() => setMuscleFilter(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${muscleFilter === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{m}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Equipment</div>
            <div className="flex gap-1.5 flex-wrap">
              {['All', ...EQUIPMENT_TYPES].map(e => (
                <button key={e} onClick={() => setEquipFilter(e)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${equipFilter === e ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Difficulty</div>
            <div className="flex gap-1.5 flex-wrap">
              {['All', ...DIFFICULTY_LEVELS].map(d => (
                <button key={d} onClick={() => setDiffFilter(d)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${diffFilter === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''} found</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => (
          <button key={ex.id} onClick={() => setSelected(ex)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition text-left group">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${MUSCLE_COLORS[ex.muscleGroup]}`}>
                {ex.muscleGroup}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                {ex.difficulty}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 group-hover:text-indigo-700">{ex.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{ex.equipment} · {ex.sets} sets × {ex.reps}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-red-600 font-medium">
              <PlayCircle className="w-3.5 h-3.5" /> Watch demo
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Library className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No exercises match your filters</p>
        </div>
      )}
    </div>
  );
}
