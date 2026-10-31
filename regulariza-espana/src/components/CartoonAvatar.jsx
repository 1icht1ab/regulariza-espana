const SIZES = { xs: 'w-7 h-7', sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-16 h-16' }
const BG = {"robot": "bg-sky-100", "ninja": "bg-indigo-100", "fox": "bg-orange-100", "astronaut": "bg-blue-100", "wizard": "bg-purple-100"}

const SVGS = {
  robot: (
<svg viewBox="0 0 100 100" className="w-full h-full">
    <line x1="50" y1="8" x2="50" y2="22" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
  <circle cx="50" cy="8" r="6" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" />
    <rect x="10" y="42" width="8" height="20" rx="4" fill="#0284c7" />
  <rect x="82" y="42" width="8" height="20" rx="4" fill="#0284c7" />
    <rect x="18" y="22" width="64" height="58" rx="16" fill="#38bdf8" stroke="#0369a1" strokeWidth="4" />
    <rect x="26" y="32" width="48" height="32" rx="10" fill="#0f172a" />
    <circle cx="39" cy="46" r="6" fill="#22d3ee" />
  <circle cx="61" cy="46" r="6" fill="#22d3ee" />
  <circle cx="41" cy="44" r="2" fill="#ffffff" />
  <circle cx="63" cy="44" r="2" fill="#ffffff" />
    <path d="M 40 56 Q 50 63 60 56" stroke="#22d3ee" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <circle cx="31" cy="53" r="3" fill="#f472b6" opacity="0.8" />
  <circle cx="69" cy="53" r="3" fill="#f472b6" opacity="0.8" />
    <path d="M 32 80 L 68 80 L 74 94 L 26 94 Z" fill="#0284c7" />
</svg>
  ),
  ninja: (
<svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M 78 30 L 95 22 L 90 36 Z" fill="#ef4444" />
  <path d="M 80 34 L 96 38 L 88 47 Z" fill="#dc2626" />
    <circle cx="50" cy="52" r="34" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
    <path d="M 17 40 Q 50 32 83 40 L 84 30 Q 50 22 16 30 Z" fill="#ef4444" />
  <circle cx="50" cy="34" r="4" fill="#fbbf24" />
    <rect x="24" y="42" width="52" height="20" rx="10" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
    <circle cx="38" cy="52" r="4.5" fill="#0f172a" />
  <circle cx="62" cy="52" r="4.5" fill="#0f172a" />
  <circle cx="39.5" cy="50.5" r="1.5" fill="#ffffff" />
  <circle cx="63.5" cy="50.5" r="1.5" fill="#ffffff" />
    <path d="M 31 46 L 43 48" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
  <path d="M 69 46 L 57 48" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="30" cy="56" rx="3.5" ry="2" fill="#f87171" opacity="0.7" />
  <ellipse cx="70" cy="56" rx="3.5" ry="2" fill="#f87171" opacity="0.7" />
</svg>
  ),
  fox: (
<svg viewBox="0 0 100 100" className="w-full h-full">
    <polygon points="18,45 22,12 45,32" fill="#f97316" stroke="#c2410c" strokeWidth="3.5" strokeLinejoin="round" />
  <polygon points="23,40 25,20 39,32" fill="#fef3c7" />
  <polygon points="82,45 78,12 55,32" fill="#f97316" stroke="#c2410c" strokeWidth="3.5" strokeLinejoin="round" />
  <polygon points="77,40 75,20 61,32" fill="#fef3c7" />
    <ellipse cx="50" cy="58" rx="34" ry="28" fill="#f97316" stroke="#c2410c" strokeWidth="3.5" />
    <path d="M 17 58 Q 32 52 50 74 L 50 86 Q 22 84 17 58 Z" fill="#fffbeb" />
  <path d="M 83 58 Q 68 52 50 74 L 50 86 Q 78 84 83 58 Z" fill="#fffbeb" />
    <circle cx="36" cy="52" r="4.5" fill="#1e293b" />
  <circle cx="64" cy="52" r="4.5" fill="#1e293b" />
  <circle cx="37.5" cy="50.5" r="1.5" fill="#ffffff" />
  <circle cx="65.5" cy="50.5" r="1.5" fill="#ffffff" />
    <ellipse cx="50" cy="68" rx="5.5" ry="4" fill="#1e293b" />
  <path d="M 44 75 Q 50 80 56 75" stroke="#1e293b" strokeWidth="2.8" fill="none" strokeLinecap="round" />
</svg>
  ),
  astronaut: (
<svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="16" cy="20" r="2" fill="#6366f1" />
  <circle cx="85" cy="18" r="2.5" fill="#3b82f6" />
    <circle cx="50" cy="50" r="35" fill="#f8fafc" stroke="#475569" strokeWidth="4" />
    <rect x="10" y="42" width="7" height="16" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
  <rect x="83" y="42" width="7" height="16" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <rect x="23" y="30" width="54" height="38" rx="18" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="3" />
    <path d="M 30 37 Q 42 33 52 37" stroke="#93c5fd" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <circle cx="39" cy="49" r="4" fill="#38bdf8" />
  <circle cx="61" cy="49" r="4" fill="#38bdf8" />
  <path d="M 43 57 Q 50 62 57 57" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M 26 79 Q 50 74 74 79 L 80 94 L 20 94 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
  <rect x="42" y="82" width="16" height="8" rx="2" fill="#ef4444" />
</svg>
  ),
  wizard: (
<svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="60" r="24" fill="#fde68a" stroke="#7e22ce" strokeWidth="3" />
    <path d="M 28 65 Q 50 98 72 65 Q 60 72 50 70 Q 40 72 28 65 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
    <circle cx="40" cy="56" r="7" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
  <circle cx="60" cy="56" r="7" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
  <line x1="47" y1="56" x2="53" y2="56" stroke="#d97706" strokeWidth="2.5" />
    <circle cx="40" cy="56" r="3" fill="#1e1b4b" />
  <circle cx="60" cy="56" r="3" fill="#1e1b4b" />
    <path d="M 45 66 Q 50 70 55 66" stroke="#7e22ce" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M 14 44 Q 50 52 86 44 L 72 36 L 52 6 L 30 36 Z" fill="#6d28d9" stroke="#4c1d95" strokeWidth="3" strokeLinejoin="round" />
    <path d="M 28 37 Q 50 43 72 37" stroke="#fbbf24" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="51" cy="24" r="4" fill="#fde047" />
</svg>
  ),
}

export default function CartoonAvatar({ type = 'robot', size = 'md', className = '' }) {
  const t = SVGS[type] ? type : 'robot'
  return (
    <div className={`${SIZES[size] || SIZES.md} ${BG[t]} rounded-xl p-1 shrink-0 flex items-center justify-center ${className}`} aria-hidden="true">
      {SVGS[t]}
    </div>
  )
}
