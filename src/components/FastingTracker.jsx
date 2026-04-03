import { useState, useEffect } from 'react';
import { Timer, Play, Square, Trash2, Plus, Flame, Zap, Droplets, Brain, Heart, Sparkles, Clock } from 'lucide-react';
import { todayStr, generateId } from '../data/constants';

const FASTING_ZONES = [
  { hours: 0, label: 'Fed State', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50',
    icon: Zap,
    title: 'Using Glucose',
    description: 'Your body is digesting food and using glucose (blood sugar) as its primary fuel. Insulin levels are elevated to shuttle nutrients into cells.' },
  { hours: 4, label: 'Post-Absorptive', color: 'bg-cyan-500', textColor: 'text-cyan-700', bgLight: 'bg-cyan-50',
    icon: Droplets,
    title: 'Glucose Declining',
    description: 'Digestion is winding down. Blood sugar levels begin to normalize. Your body starts tapping into glycogen (stored glucose in liver and muscles) for energy.' },
  { hours: 8, label: 'Glycogen Depletion', color: 'bg-teal-500', textColor: 'text-teal-700', bgLight: 'bg-teal-50',
    icon: Flame,
    title: 'Burning Glycogen',
    description: 'Glycogen stores are being actively used up. Growth hormone levels begin to rise, which preserves muscle and promotes fat mobilization. Insulin drops significantly.' },
  { hours: 12, label: 'Early Fat Burning', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50',
    icon: Flame,
    title: 'Fat Burning Begins',
    description: 'Glycogen is largely depleted. Your body shifts to burning stored fat (lipolysis) as a primary fuel source. This is where intermittent fasting benefits begin. Growth hormone surges.' },
  { hours: 14, label: 'Metabolic Switch', color: 'bg-lime-500', textColor: 'text-lime-700', bgLight: 'bg-lime-50',
    icon: Sparkles,
    title: 'Metabolic Switching',
    description: 'The "metabolic switch" flips from glucose to fat oxidation. Ketone bodies begin forming in the liver. Mental clarity often improves as the brain starts using ketones alongside glucose.' },
  { hours: 16, label: 'Autophagy Starting', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50',
    icon: Sparkles,
    title: 'Cellular Cleanup Begins',
    description: 'Autophagy ramps up -- your cells begin breaking down and recycling damaged components. This is cellular "housekeeping." Fat burning is now the dominant energy pathway. Inflammation markers begin to drop.' },
  { hours: 18, label: 'Deep Ketosis', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50',
    icon: Brain,
    title: 'Ketone Production Rising',
    description: 'Ketone levels rise significantly. The brain increasingly uses ketones for fuel (up to 75%). Growth hormone can be 5x normal levels, protecting muscle mass. Fat is being burned at an accelerated rate.' },
  { hours: 24, label: 'Peak Autophagy', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50',
    icon: Heart,
    title: 'Deep Cellular Renewal',
    description: 'Autophagy is at peak levels. Old, damaged cells and proteins are being aggressively recycled. Stem cell regeneration may begin. Insulin is at its lowest. Maximum fat oxidation.' },
  { hours: 36, label: 'Extended Fast', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50',
    icon: Sparkles,
    title: 'Immune Reset',
    description: 'Extended fasting territory. The immune system may begin regenerating. Growth hormone remains elevated. This duration should only be done occasionally and with proper preparation.' },
  { hours: 48, label: 'Deep Extended', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-700', bgLight: 'bg-fuchsia-50',
    icon: Heart,
    title: 'Stem Cell Activation',
    description: 'Research suggests stem cell-based regeneration of new immune cells begins. This is an advanced fasting duration -- consult a healthcare provider before attempting fasts this long.' },
];

function getCurrentZone(hours) {
  let zone = FASTING_ZONES[0];
  for (const z of FASTING_ZONES) {
    if (hours >= z.hours) zone = z;
    else break;
  }
  return zone;
}

function getNextZone(hours) {
  for (const z of FASTING_ZONES) {
    if (z.hours > hours) return z;
  }
  return null;
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, display: `${h}h ${m}m ${s}s` };
}

export default function FastingTracker({ fastingLog, setFastingLog }) {
  const [now, setNow] = useState(Date.now());

  const activeFast = fastingLog.find(f => f.active);
  const pastFasts = fastingLog.filter(f => !f.active).sort((a, b) => b.startTime - a.startTime);

  useEffect(() => {
    if (!activeFast) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeFast]);

  function startFast() {
    setFastingLog(prev => [...prev, {
      id: generateId(),
      startTime: Date.now(),
      endTime: null,
      active: true,
      targetHours: 16,
      notes: '',
    }]);
  }

  function endFast() {
    setFastingLog(prev => prev.map(f =>
      f.active ? { ...f, active: false, endTime: Date.now() } : f
    ));
  }

  function deleteFast(id) {
    setFastingLog(prev => prev.filter(f => f.id !== id));
  }

  function setTarget(hours) {
    setFastingLog(prev => prev.map(f =>
      f.active ? { ...f, targetHours: hours } : f
    ));
  }

  const elapsed = activeFast ? now - activeFast.startTime : 0;
  const elapsedHours = elapsed / 3600000;
  const duration = formatDuration(elapsed);
  const currentZone = getCurrentZone(elapsedHours);
  const nextZone = getNextZone(elapsedHours);
  const targetMs = activeFast ? activeFast.targetHours * 3600000 : 0;
  const progressPct = activeFast ? Math.min((elapsed / targetMs) * 100, 100) : 0;

  // Timeline progress through all zones
  const maxDisplay = Math.max(elapsedHours * 1.3, activeFast?.targetHours || 24, 24);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Timer className="w-7 h-7 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-800">Fasting Tracker</h2>
      </div>

      {/* Active Fast or Start Button */}
      {activeFast ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Fasting In Progress</h3>
              <p className="text-sm text-gray-500">
                Started: {new Date(activeFast.startTime).toLocaleString()}
              </p>
            </div>
            <button onClick={endFast}
              className="bg-red-500 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-red-600 flex items-center gap-2">
              <Square className="w-4 h-4" /> End Fast
            </button>
          </div>

          {/* Big Timer */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-gray-800 font-mono tracking-wider">
              {String(duration.h).padStart(2, '0')}:{String(duration.m).padStart(2, '0')}:{String(duration.s).padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {elapsedHours.toFixed(1)} hours fasted
            </div>
          </div>

          {/* Progress to Target */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">0h</span>
              <span className="font-medium text-gray-700">{progressPct.toFixed(0)}% of {activeFast.targetHours}h goal</span>
              <span className="text-gray-500">{activeFast.targetHours}h</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${currentZone.color}`}
                style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              {[12, 14, 16, 18, 20, 24].map(h => (
                <button key={h} onClick={() => setTarget(h)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    activeFast.targetHours === h
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{h}h</button>
              ))}
            </div>
          </div>

          {/* Current Zone */}
          <div className={`rounded-xl p-5 border ${currentZone.bgLight}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg ${currentZone.color} flex items-center justify-center`}>
                <currentZone.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`font-bold ${currentZone.textColor}`}>{currentZone.label}</div>
                <div className={`text-sm font-medium ${currentZone.textColor}`}>{currentZone.title}</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{currentZone.description}</p>
          </div>

          {/* Next Zone */}
          {nextZone && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Next: {nextZone.label}</span> -- {nextZone.title} in{' '}
                <strong>{Math.max(0, (nextZone.hours - elapsedHours) * 60).toFixed(0)} minutes</strong>
              </div>
            </div>
          )}

          {/* Fasting Timeline */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Fasting Timeline</h4>
            <div className="space-y-2">
              {FASTING_ZONES.filter(z => z.hours <= maxDisplay).map((zone, i) => {
                const reached = elapsedHours >= zone.hours;
                const isCurrent = zone === currentZone;
                const Icon = zone.icon;
                return (
                  <div key={zone.hours}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      isCurrent ? zone.bgLight + ' border border-current ' + zone.textColor
                      : reached ? 'bg-gray-50' : 'opacity-40'
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      reached ? zone.color : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${reached ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${reached ? zone.textColor : 'text-gray-400'}`}>
                          {zone.hours}h
                        </span>
                        <span className={`text-sm font-medium ${reached ? 'text-gray-800' : 'text-gray-400'}`}>
                          {zone.title}
                        </span>
                      </div>
                    </div>
                    {reached && <span className="text-xs text-green-600 font-medium">Reached</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Timer className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Start a Fast</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Track your fasting window and see what's happening in your body at each stage.
            Most benefits begin at 12-16 hours.
          </p>
          <button onClick={startFast}
            className="bg-amber-500 text-white rounded-xl px-8 py-3 font-semibold text-lg hover:bg-amber-600 flex items-center gap-2 mx-auto">
            <Play className="w-5 h-5" /> Start Fasting
          </button>
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
            <div>
              <div className="text-lg font-bold text-green-600">12h</div>
              <div className="text-xs text-gray-500">Fat burning</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">16h</div>
              <div className="text-xs text-gray-500">Autophagy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">18h+</div>
              <div className="text-xs text-gray-500">Deep ketosis</div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Reference Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">What Happens When You Fast</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FASTING_ZONES.slice(0, 8).map(zone => {
            const Icon = zone.icon;
            return (
              <div key={zone.hours} className={`p-3 rounded-lg border border-gray-200 ${zone.bgLight}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded ${zone.color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-xs font-bold ${zone.textColor}`}>{zone.hours}h+</span>
                  <span className="text-sm font-medium text-gray-800">{zone.title}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed ml-8">{zone.description.split('.')[0]}.</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Fasts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-lg mb-4">Fasting History</h3>
        {pastFasts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No completed fasts yet. Start your first one above!</p>
        ) : (
          <div className="space-y-2">
            {pastFasts.map(fast => {
              const dur = fast.endTime - fast.startTime;
              const hrs = dur / 3600000;
              const zone = getCurrentZone(hrs);
              const Icon = zone.icon;
              return (
                <div key={fast.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`w-10 h-10 rounded-lg ${zone.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {hrs.toFixed(1)} hours -- {zone.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(fast.startTime).toLocaleDateString()} {new Date(fast.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(fast.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${zone.textColor}`}>{zone.title}</span>
                  <button onClick={() => deleteFast(fast.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {pastFasts.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">{pastFasts.length}</div>
              <div className="text-xs text-gray-500">Total Fasts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">
                {(pastFasts.reduce((a, f) => a + (f.endTime - f.startTime), 0) / pastFasts.length / 3600000).toFixed(1)}h
              </div>
              <div className="text-xs text-gray-500">Avg Duration</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">
                {(Math.max(...pastFasts.map(f => f.endTime - f.startTime)) / 3600000).toFixed(1)}h
              </div>
              <div className="text-xs text-gray-500">Longest Fast</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
