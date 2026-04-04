// SVG body diagram with highlightable muscle groups
// Front and back views

const PRIMARY_COLOR = '#ef4444';   // red-500 - primary muscle
const SECONDARY_COLOR = '#f59e0b'; // amber-500 - secondary muscles
const INACTIVE = '#e5e7eb';        // gray-200 - inactive muscles
const OUTLINE = '#9ca3af';         // gray-400

function getColor(muscle, primary, secondary = []) {
  if (muscle === primary) return PRIMARY_COLOR;
  if (secondary.includes(muscle)) return SECONDARY_COLOR;
  return INACTIVE;
}

export default function MuscleDiagram({ primary, secondary = [], size = 'md' }) {
  const dimensions = { sm: 120, md: 180, lg: 220 };
  const width = dimensions[size] || 180;

  // Helper to check if a muscle is worked
  const color = (muscle) => getColor(muscle, primary, secondary);

  return (
    <div className="flex gap-4 items-center justify-center">
      {/* FRONT VIEW */}
      <div className="flex flex-col items-center">
        <svg width={width} height={width * 1.8} viewBox="0 0 200 360" className="drop-shadow-sm">
          {/* Head */}
          <ellipse cx="100" cy="30" rx="22" ry="28" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1.5"/>
          {/* Neck */}
          <rect x="90" y="55" width="20" height="12" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>

          {/* Shoulders (deltoids) */}
          <ellipse cx="65" cy="80" rx="18" ry="15" fill={color('Shoulders')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="135" cy="80" rx="18" ry="15" fill={color('Shoulders')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Chest (pectorals) */}
          <path d="M 75 75 Q 100 70 125 75 L 130 115 Q 100 120 70 115 Z"
            fill={color('Chest')} stroke={OUTLINE} strokeWidth="1.5"/>
          <line x1="100" y1="75" x2="100" y2="115" stroke={OUTLINE} strokeWidth="1"/>

          {/* Biceps (arms - upper) */}
          <ellipse cx="55" cy="115" rx="12" ry="22" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="145" cy="115" rx="12" ry="22" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Forearms */}
          <ellipse cx="48" cy="155" rx="10" ry="20" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1"/>
          <ellipse cx="152" cy="155" rx="10" ry="20" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1"/>

          {/* Core / Abs */}
          <rect x="80" y="115" width="40" height="55" rx="5" fill={color('Core')} stroke={OUTLINE} strokeWidth="1.5"/>
          {/* Ab lines */}
          <line x1="100" y1="118" x2="100" y2="167" stroke={OUTLINE} strokeWidth="0.8" opacity="0.5"/>
          <line x1="82" y1="130" x2="118" y2="130" stroke={OUTLINE} strokeWidth="0.8" opacity="0.5"/>
          <line x1="82" y1="145" x2="118" y2="145" stroke={OUTLINE} strokeWidth="0.8" opacity="0.5"/>
          <line x1="82" y1="158" x2="118" y2="158" stroke={OUTLINE} strokeWidth="0.8" opacity="0.5"/>

          {/* Obliques (part of core) */}
          <path d="M 70 120 Q 65 145 75 168 L 80 168 L 80 115 Z" fill={color('Core')} stroke={OUTLINE} strokeWidth="1"/>
          <path d="M 130 120 Q 135 145 125 168 L 120 168 L 120 115 Z" fill={color('Core')} stroke={OUTLINE} strokeWidth="1"/>

          {/* Hip/pelvis */}
          <path d="M 72 168 Q 100 175 128 168 L 130 185 Q 100 195 70 185 Z"
            fill={INACTIVE} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Quads (front of legs) */}
          <ellipse cx="82" cy="225" rx="15" ry="35" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="118" cy="225" rx="15" ry="35" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Knees */}
          <circle cx="82" cy="265" r="8" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>
          <circle cx="118" cy="265" r="8" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>

          {/* Shins/calves (front view shows shins) */}
          <ellipse cx="82" cy="305" rx="11" ry="28" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1"/>
          <ellipse cx="118" cy="305" rx="11" ry="28" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1"/>

          {/* Feet */}
          <ellipse cx="80" cy="340" rx="10" ry="7" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>
          <ellipse cx="120" cy="340" rx="10" ry="7" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>
        </svg>
        <div className="text-[10px] text-gray-500 font-medium mt-1">FRONT</div>
      </div>

      {/* BACK VIEW */}
      <div className="flex flex-col items-center">
        <svg width={width} height={width * 1.8} viewBox="0 0 200 360" className="drop-shadow-sm">
          {/* Head */}
          <ellipse cx="100" cy="30" rx="22" ry="28" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1.5"/>
          {/* Neck */}
          <rect x="90" y="55" width="20" height="12" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>

          {/* Traps (upper back) */}
          <path d="M 75 65 Q 100 58 125 65 L 130 85 Q 100 80 70 85 Z"
            fill={color('Back')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Rear Shoulders */}
          <ellipse cx="65" cy="85" rx="18" ry="15" fill={color('Shoulders')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="135" cy="85" rx="18" ry="15" fill={color('Shoulders')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Lats / Back */}
          <path d="M 72 90 Q 70 140 78 170 L 122 170 Q 130 140 128 90 L 115 88 L 85 88 Z"
            fill={color('Back')} stroke={OUTLINE} strokeWidth="1.5"/>
          <line x1="100" y1="90" x2="100" y2="168" stroke={OUTLINE} strokeWidth="0.8" opacity="0.5"/>

          {/* Triceps (back of arms) */}
          <ellipse cx="55" cy="115" rx="12" ry="22" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="145" cy="115" rx="12" ry="22" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Forearms */}
          <ellipse cx="48" cy="155" rx="10" ry="20" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1"/>
          <ellipse cx="152" cy="155" rx="10" ry="20" fill={color('Arms')} stroke={OUTLINE} strokeWidth="1"/>

          {/* Lower back */}
          <rect x="80" y="150" width="40" height="25" fill={color('Back')} stroke={OUTLINE} strokeWidth="1" opacity="0.85"/>

          {/* Glutes */}
          <path d="M 72 175 Q 100 170 128 175 L 130 210 Q 100 220 70 210 Z"
            fill={color('Glutes')} stroke={OUTLINE} strokeWidth="1.5"/>
          <line x1="100" y1="178" x2="100" y2="215" stroke={OUTLINE} strokeWidth="1"/>

          {/* Hamstrings (back of legs upper) */}
          <ellipse cx="82" cy="240" rx="15" ry="30" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="118" cy="240" rx="15" ry="30" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Knees (back) */}
          <circle cx="82" cy="272" r="7" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>
          <circle cx="118" cy="272" r="7" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>

          {/* Calves */}
          <ellipse cx="82" cy="305" rx="12" ry="28" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1.5"/>
          <ellipse cx="118" cy="305" rx="12" ry="28" fill={color('Legs')} stroke={OUTLINE} strokeWidth="1.5"/>

          {/* Feet */}
          <ellipse cx="80" cy="340" rx="10" ry="7" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>
          <ellipse cx="120" cy="340" rx="10" ry="7" fill={INACTIVE} stroke={OUTLINE} strokeWidth="1"/>
        </svg>
        <div className="text-[10px] text-gray-500 font-medium mt-1">BACK</div>
      </div>
    </div>
  );
}

// Legend component
export function MuscleDiagramLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600 justify-center mt-2">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PRIMARY_COLOR }} />
        <span>Primary</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SECONDARY_COLOR }} />
        <span>Secondary</span>
      </div>
    </div>
  );
}
