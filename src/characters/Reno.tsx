import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Reno — Rhino Kids'in ana maskotu (gergedan).
// Animasyon CharacterShell'den (mood) geliyor.
export default function Reno({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        {/* gölge */}
        <ellipse cx="100" cy="180" rx="50" ry="6" fill="rgba(0,0,0,0.15)" />
        {/* gövde */}
        <ellipse cx="100" cy="135" rx="56" ry="40" fill="#a8b5c4" />
        {/* bacaklar */}
        <rect x="68" y="158" width="15" height="22" fill="#8896a8" rx="5" />
        <rect x="118" y="158" width="15" height="22" fill="#8896a8" rx="5" />
        {/* kafa */}
        <ellipse cx="100" cy="92" rx="44" ry="38" fill="#a8b5c4" />
        {/* kulaklar */}
        <ellipse cx="70" cy="64" rx="10" ry="14" fill="#8896a8" transform="rotate(-25 70 64)" />
        <ellipse cx="130" cy="64" rx="10" ry="14" fill="#8896a8" transform="rotate(25 130 64)" />
        <ellipse cx="70" cy="65" rx="4" ry="8" fill="#fbb6ce" transform="rotate(-25 70 65)" />
        <ellipse cx="130" cy="65" rx="4" ry="8" fill="#fbb6ce" transform="rotate(25 130 65)" />
        {/* büyük boynuz */}
        <path d="M 100 66 Q 95 44 100 28 Q 105 44 100 66" fill="#fef3e2" stroke="#5d2906" strokeWidth="2.5" />
        {/* küçük boynuz */}
        <path d="M 100 88 Q 97 75 100 66 Q 103 75 100 88" fill="#fef3e2" stroke="#5d2906" strokeWidth="2" />
        {/* burun/ağız bölgesi */}
        <ellipse cx="100" cy="112" rx="24" ry="19" fill="#c4ced8" />
        {/* gözler */}
        <circle cx="84" cy="88" r="7" fill="#fff" />
        <circle cx="116" cy="88" r="7" fill="#fff" />
        <circle cx="85" cy="89" r="4" fill="#2d2d2d" />
        <circle cx="117" cy="89" r="4" fill="#2d2d2d" />
        <circle cx="86.5" cy="87" r="1.5" fill="#fff" />
        <circle cx="118.5" cy="87" r="1.5" fill="#fff" />
        {/* burun delikleri */}
        <ellipse cx="92" cy="115" rx="2" ry="3" fill="#2d2d2d" />
        <ellipse cx="108" cy="115" rx="2" ry="3" fill="#2d2d2d" />
        {/* gülümseme */}
        <path d="M 86 122 Q 100 130 114 122" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* yanak */}
        <ellipse cx="74" cy="104" rx="7" ry="5" fill="#fbb6ce" opacity="0.55" />
        <ellipse cx="126" cy="104" rx="7" ry="5" fill="#fbb6ce" opacity="0.55" />
      </svg>
    </CharacterShell>
  )
}
