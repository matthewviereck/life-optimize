import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Trash2, CheckCircle2, AlertTriangle, Info, FileJson } from 'lucide-react';
import { generateId } from '../data/constants';

const HEALTH_EXPORT_FIELDS = {
  'step count': { target: 'workouts', field: 'steps', label: 'Steps' },
  'steps': { target: 'workouts', field: 'steps', label: 'Steps' },
  'body mass': { target: 'weighIns', field: 'weight', label: 'Weight (lbs)' },
  'weight': { target: 'weighIns', field: 'weight', label: 'Weight (lbs)' },
  'weight (lbs)': { target: 'weighIns', field: 'weight', label: 'Weight (lbs)' },
  'sleep analysis': { target: 'sleep', field: 'hours', label: 'Sleep (hours)' },
  'sleep_hours': { target: 'sleep', field: 'hours', label: 'Sleep (hours)' },
  'sleep hours': { target: 'sleep', field: 'hours', label: 'Sleep (hours)' },
  'active energy burned': { target: 'workouts', field: 'caloriesBurned', label: 'Active Calories' },
  'active energy': { target: 'workouts', field: 'caloriesBurned', label: 'Active Calories' },
  'heart rate': { target: 'metadata', field: 'heartRate', label: 'Heart Rate' },
  'resting heart rate': { target: 'metadata', field: 'restingHR', label: 'Resting HR' },
  'walking + running distance': { target: 'workouts', field: 'distance', label: 'Distance (mi)' },
  'distance': { target: 'workouts', field: 'distance', label: 'Distance (mi)' },
  'water_oz': { target: 'hydration', field: 'oz', label: 'Water (oz)' },
  'water': { target: 'hydration', field: 'oz', label: 'Water (oz)' },
  'sleep_quality': { target: 'sleep', field: 'quality', label: 'Sleep Quality' },
  'calories_eaten': { target: 'food', field: 'calories', label: 'Calories Eaten' },
  'protein': { target: 'food', field: 'protein', label: 'Protein (g)' },
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
  return { headers, rows };
}

function detectDateColumn(headers) {
  const dateCols = ['date', 'Date', 'DATE', 'timestamp', 'Timestamp', 'day', 'Day'];
  return headers.find(h => dateCols.includes(h)) || headers.find(h => h.toLowerCase().includes('date')) || headers[0];
}

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapColumns(headers) {
  const mappings = [];
  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    if (lower === 'date' || lower === 'timestamp' || lower === 'day') continue;
    const match = HEALTH_EXPORT_FIELDS[lower];
    if (match) {
      mappings.push({ csvColumn: header, ...match });
    }
  }
  return mappings;
}

export default function DataImport({ weighIns, setWeighIns, sleepLog, setSleepLog, workouts, setWorkouts, hydration, setHydration, foodLog, setFoodLog }) {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [dateCol, setDateCol] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [tab, setTab] = useState('import');
  const fileRef = useRef(null);
  const jsonRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (file.name.endsWith('.json')) {
        handleJsonImport(text);
        return;
      }
      const { headers, rows } = parseCSV(text);
      const dc = detectDateColumn(headers);
      const maps = mapColumns(headers);
      setParsed({ headers, rows, fileName: file.name });
      setDateCol(dc);
      setMappings(maps);
      setImportResult(null);
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleJsonImport(text) {
    try {
      const data = JSON.parse(text);
      let count = 0;
      if (data.weighIns?.length) { setWeighIns(data.weighIns); count += data.weighIns.length; }
      if (data.sleepLog?.length) { setSleepLog(data.sleepLog); count += data.sleepLog.length; }
      if (data.workouts?.length) { setWorkouts(data.workouts); count += data.workouts.length; }
      if (data.foodLog?.length) { setFoodLog(data.foodLog); count += data.foodLog.length; }
      if (data.hydration && typeof data.hydration === 'object') { setHydration(data.hydration); count += Object.keys(data.hydration).length; }
      setImportResult({ type: 'success', message: `JSON backup restored: ${count} records loaded.` });
      setParsed(null);
    } catch {
      setImportResult({ type: 'error', message: 'Invalid JSON file. Make sure this is a Life Optimize backup.' });
    }
  }

  function doImport() {
    if (!parsed || mappings.length === 0) return;
    const existingWeighDates = new Set(weighIns.map(w => w.date));
    const existingSleepDates = new Set(sleepLog.map(s => s.date));
    const existingWorkoutDates = new Set(workouts.map(w => w.date));

    let added = 0, skipped = 0;
    const newWeighIns = [];
    const newSleep = [];
    const workoutsByDate = {};
    const newHydration = { ...hydration };
    const newFood = [];

    for (const row of parsed.rows) {
      const date = parseDate(row[dateCol]);
      if (!date) { skipped++; continue; }

      for (const map of mappings) {
        const rawVal = row[map.csvColumn];
        const val = parseFloat(rawVal);
        if (isNaN(val) || val === 0) continue;

        if (map.target === 'weighIns' && !existingWeighDates.has(date)) {
          if (!newWeighIns.find(w => w.date === date)) {
            newWeighIns.push({ id: generateId(), date, weight: Math.round(val * 10) / 10, notes: 'Imported from CSV' });
            added++;
          }
        } else if (map.target === 'sleep' && !existingSleepDates.has(date)) {
          const existing = newSleep.find(s => s.date === date);
          if (!existing) {
            newSleep.push({ id: generateId(), date, bedtime: '22:00', wakeTime: '06:00', hours: Math.round(val * 10) / 10, quality: 3, notes: 'Imported from CSV' });
            added++;
          } else if (map.field === 'quality') {
            existing.quality = Math.min(5, Math.max(1, Math.round(val)));
          }
        } else if (map.target === 'workouts') {
          if (!workoutsByDate[date] && !existingWorkoutDates.has(date)) {
            workoutsByDate[date] = { id: generateId(), date, type: 'Imported', duration: 0, steps: 0, kidsPlay: 0, stairs: 0, extraWalking: 0, caloriesBurned: 0, notes: 'Imported from CSV' };
          }
          if (workoutsByDate[date]) {
            if (map.field === 'steps') workoutsByDate[date].steps = Math.round(val);
            if (map.field === 'caloriesBurned') workoutsByDate[date].caloriesBurned = Math.round(val);
            if (map.field === 'distance') workoutsByDate[date].notes = `Distance: ${val.toFixed(1)} mi`;
          }
        } else if (map.target === 'hydration') {
          if (!newHydration[date]) {
            newHydration[date] = Math.round(val);
            added++;
          }
        } else if (map.target === 'food') {
          const existingFood = newFood.find(f => f.date === date);
          if (!existingFood) {
            newFood.push({ id: generateId(), date, meal: 'Imported', description: 'Imported daily total', calories: 0, protein: 0, carbs: 0, fat: 0 });
          }
          const food = newFood.find(f => f.date === date);
          if (food && map.field === 'calories') food.calories = Math.round(val);
          if (food && map.field === 'protein') food.protein = Math.round(val);
        }
      }
    }

    // Count workout entries
    const workoutEntries = Object.values(workoutsByDate);
    added += workoutEntries.length;
    added += newFood.length;

    if (newWeighIns.length) setWeighIns(prev => [...prev, ...newWeighIns]);
    if (newSleep.length) setSleepLog(prev => [...prev, ...newSleep]);
    if (workoutEntries.length) setWorkouts(prev => [...prev, ...workoutEntries]);
    if (newFood.length) setFoodLog(prev => [...prev, ...newFood]);
    if (Object.keys(newHydration).length > Object.keys(hydration).length) setHydration(newHydration);

    skipped += parsed.rows.length - added - skipped;
    setImportResult({
      type: 'success',
      message: `Import complete: ${added} records added${skipped > 0 ? `, ${skipped} skipped (duplicates or empty)` : ''}.`,
      details: {
        weighIns: newWeighIns.length,
        sleep: newSleep.length,
        workouts: workoutEntries.length,
        food: newFood.length,
      },
    });
    setParsed(null);
  }

  function exportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      app: 'Life Optimize',
      weighIns, sleepLog, workouts, foodLog, hydration,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-optimize-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadTemplate() {
    const template = 'date,weight,steps,sleep_hours,sleep_quality,water_oz,calories_eaten,protein\n2026-04-01,195,7500,7.5,4,64,1800,170\n2026-04-02,194.5,8200,8.0,5,80,1750,165\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'life-optimize-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="w-7 h-7 text-violet-600" />
        <h2 className="text-2xl font-bold text-gray-800">Import / Export</h2>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {[
          { id: 'import', label: 'Import Data', icon: Upload },
          { id: 'export', label: 'Export / Backup', icon: Download },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Result Message */}
      {importResult && (
        <div className={`rounded-lg p-4 border flex items-start gap-3 ${
          importResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {importResult.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
          <div>
            <div className="font-medium text-sm">{importResult.message}</div>
            {importResult.details && (
              <div className="text-xs mt-1 space-x-3">
                {importResult.details.weighIns > 0 && <span>Weigh-ins: {importResult.details.weighIns}</span>}
                {importResult.details.sleep > 0 && <span>Sleep: {importResult.details.sleep}</span>}
                {importResult.details.workouts > 0 && <span>Workouts: {importResult.details.workouts}</span>}
                {importResult.details.food > 0 && <span>Food: {importResult.details.food}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'import' && (
        <>
          {/* Info Box */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
            <div className="text-sm text-violet-800">
              <p className="font-medium">How to import Apple Watch data:</p>
              <ol className="mt-2 space-y-1 text-violet-700 list-decimal ml-4">
                <li>Install <strong>Health Auto Export</strong> (free) from the App Store</li>
                <li>Open the app, select metrics (Steps, Sleep, Weight, Active Energy)</li>
                <li>Export as CSV with <strong>daily aggregation</strong></li>
                <li>Send the file to your computer (AirDrop, email, or cloud)</li>
                <li>Drag and drop the CSV file below</li>
              </ol>
              <p className="mt-2 text-violet-600">Or <button onClick={downloadTemplate} className="underline font-medium hover:text-violet-800">download a blank CSV template</button> to fill in manually.</p>
            </div>
          </div>

          {/* Drop Zone */}
          {!parsed && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                dragOver ? 'border-violet-500 bg-violet-50' : 'border-gray-300 bg-white hover:border-violet-400 hover:bg-gray-50'
              }`}>
              <Upload className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-violet-500' : 'text-gray-300'}`} />
              <p className="font-medium text-gray-700">Drop your CSV or JSON file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-3">Supports: Health Auto Export CSV, custom CSV, Life Optimize JSON backup</p>
              <input ref={fileRef} type="file" accept=".csv,.json" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}

          {/* Preview & Mapping */}
          {parsed && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Preview: {parsed.fileName}</h3>
                    <p className="text-sm text-gray-500">{parsed.rows.length} rows found, {parsed.headers.length} columns</p>
                  </div>
                  <button onClick={() => { setParsed(null); setMappings([]); }}
                    className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Column Mappings */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Detected Mappings</h4>
                  {mappings.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      No recognized columns found. Make sure your CSV has columns like: date, weight, steps, sleep_hours, water_oz, etc.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {mappings.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
                          <div className="text-xs">
                            <span className="font-medium text-green-800">{m.csvColumn}</span>
                            <span className="text-green-600"> → {m.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Date column: <strong>{dateCol}</strong>
                  </div>
                </div>

                {/* Data Preview Table */}
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        {parsed.headers.map(h => (
                          <th key={h} className={`text-left py-2 px-2 font-semibold ${
                            mappings.find(m => m.csvColumn === h) ? 'text-green-700 bg-green-50' :
                            h === dateCol ? 'text-blue-700 bg-blue-50' : 'text-gray-500'
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          {parsed.headers.map(h => (
                            <td key={h} className="py-1.5 px-2 text-gray-700">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsed.rows.length > 10 && (
                    <div className="text-xs text-gray-400 text-center py-2">
                      ...and {parsed.rows.length - 10} more rows
                    </div>
                  )}
                </div>
              </div>

              {/* Import Button */}
              {mappings.length > 0 && (
                <button onClick={doImport}
                  className="w-full bg-violet-600 text-white rounded-xl px-6 py-3 font-medium hover:bg-violet-700 flex items-center justify-center gap-2 text-lg">
                  <Upload className="w-5 h-5" />
                  Import {parsed.rows.length} Records
                </button>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'export' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-2">Backup Your Data</h3>
            <p className="text-sm text-gray-500 mb-4">
              Export all your Life Optimize data as a JSON file. You can import this backup on any device to restore your data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-sm">Full Backup (JSON)</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">All weigh-ins, food logs, workouts, sleep, and hydration data.</p>
                <button onClick={exportJSON}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download Backup
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-sm">CSV Template</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Download a blank template to manually enter data and import it.</p>
                <button onClick={downloadTemplate}
                  className="w-full bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-2">Restore from Backup</h3>
            <p className="text-sm text-gray-500 mb-4">
              Import a previously exported Life Optimize JSON backup file. This will replace your current data.
            </p>
            <button onClick={() => jsonRef.current?.click()}
              className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Select JSON Backup File
            </button>
            <input ref={jsonRef} type="file" accept=".json" className="hidden"
              onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); }} />
          </div>

          {/* Migrate localStorage to Cloud */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-2">Migrate Local Data to Cloud</h3>
            <p className="text-sm text-gray-500 mb-4">
              If you have data saved locally from before cloud sync was enabled, click below to push it to Supabase.
              This reads all localStorage data and imports it into the cloud database.
            </p>
            <button onClick={() => {
              const keys = {
                'wm-weighins': { setter: setWeighIns, label: 'Weigh-ins' },
                'wm-foodlog': { setter: setFoodLog, label: 'Food' },
                'wm-workouts': { setter: setWorkouts, label: 'Workouts' },
                'wm-sleep': { setter: setSleepLog, label: 'Sleep' },
              };
              let total = 0;
              for (const [key, { setter }] of Object.entries(keys)) {
                try {
                  const stored = localStorage.getItem(key);
                  if (stored) {
                    const data = JSON.parse(stored);
                    if (Array.isArray(data) && data.length > 0) {
                      setter(prev => {
                        const existingIds = new Set(prev.map(r => r.id));
                        const newItems = data.filter(r => !existingIds.has(r.id));
                        total += newItems.length;
                        return [...prev, ...newItems];
                      });
                    }
                  }
                } catch {}
              }
              // Hydration (date-keyed)
              try {
                const hydStored = localStorage.getItem('wm-hydration');
                if (hydStored) {
                  const hydData = JSON.parse(hydStored);
                  setHydration(prev => ({ ...prev, ...hydData }));
                  total += Object.keys(hydData).length;
                }
              } catch {}
              setImportResult({ type: 'success', message: `Migration complete. Local data pushed to cloud.` });
            }}
              className="bg-violet-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-violet-700 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Migrate localStorage to Cloud
            </button>
          </div>

          {/* Data Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-3">Current Data Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Weigh-Ins', count: weighIns.length, color: 'blue' },
                { label: 'Food Entries', count: foodLog.length, color: 'green' },
                { label: 'Workouts', count: workouts.length, color: 'orange' },
                { label: 'Sleep Logs', count: sleepLog.length, color: 'indigo' },
                { label: 'Hydration Days', count: Object.keys(hydration).length, color: 'cyan' },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-xl font-bold text-${item.color}-600`}>{item.count}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
