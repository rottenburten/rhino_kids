import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Zara — Zürafa, SAYMA öğretmeni.
export default function Zara({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="180" rx="40" ry="5" fill="rgba(0,0,0,0.12)" />
        {/* gövde */}
        <ellipse cx="100" cy="150" rx="38" ry="28" fill="#f4c842" />
        {/* uzun boyun */}
        <rect x="80" y="60" width="22" height="95" fill="#f4c842" rx="11" />
        {/* boyun lekeleri */}
        <circle cx="78" cy="70" r="7" fill="#e8a83c" />
        <circle cx="96" cy="85" r="6" fill="#e8a83c" />
        <circle cx="84" cy="105" r="7" fill="#e8a83c" />
        <circle cx="95" cy="125" r="6" fill="#e8a83c" />
        {/* kafa */}
        <ellipse cx="91" cy="48" rx="26" ry="24" fill="#f4c842" />
        {/* ossicone (boynuzlar) */}
        <ellipse cx="78" cy="28" rx="4" ry="9" fill="#f4c842" />
        <ellipse cx="104" cy="28" rx="4" ry="9" fill="#f4c842" />
        <circle cx="78" cy="22" r="4.5" fill="#8b5a2b" />
        <circle cx="104" cy="22" r="4.5" fill="#8b5a2b" />
        {/* burun bölgesi */}
        <ellipse cx="88" cy="58" rx="16" ry="13" fill="#fde8b8" />
        {/* gözler */}
        <circle cx="82" cy="44" r="6" fill="#fff" />
        <circle cx="100" cy="44" r="6" fill="#fff" />
        <circle cx="83" cy="45" r="3.5" fill="#2d2d2d" />
        <circle cx="101" cy="45" r="3.5" fill="#2d2d2d" />
        <circle cx="84" cy="43.5" r="1.2" fill="#fff" />
        <circle cx="102" cy="43.5" r="1.2" fill="#fff" />
        {/* burun delikleri */}
        <ellipse cx="84" cy="58" rx="1.5" ry="2" fill="#2d2d2d" />
        <ellipse cx="93" cy="58" rx="1.5" ry="2" fill="#2d2d2d" />
        {/* gülümseme */}
        <path d="M 82 64 Q 89 68 96 64" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </CharacterShell>
  )
}
