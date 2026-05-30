import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Momo — Maymun, BÖLME öğretmeni.
export default function Momo({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="180" rx="38" ry="5" fill="rgba(0,0,0,0.12)" />
        {/* gövde */}
        <ellipse cx="100" cy="148" rx="40" ry="32" fill="#a87850" />
        {/* bacaklar */}
        <rect x="80" y="170" width="13" height="12" fill="#966840" rx="5" />
        <rect x="107" y="170" width="13" height="12" fill="#966840" rx="5" />
        {/* kulaklar */}
        <circle cx="62" cy="100" r="14" fill="#a87850" />
        <circle cx="138" cy="100" r="14" fill="#a87850" />
        <circle cx="62" cy="100" r="8" fill="#d4a878" />
        <circle cx="138" cy="100" r="8" fill="#d4a878" />
        {/* kafa */}
        <circle cx="100" cy="95" r="38" fill="#a87850" />
        {/* yüz */}
        <ellipse cx="100" cy="105" rx="28" ry="24" fill="#e8d0b0" />
        {/* gözler */}
        <circle cx="86" cy="86" r="7" fill="#fff" />
        <circle cx="114" cy="86" r="7" fill="#fff" />
        <circle cx="87" cy="87" r="4" fill="#2d2d2d" />
        <circle cx="115" cy="87" r="4" fill="#2d2d2d" />
        <circle cx="88" cy="85" r="1.3" fill="#fff" />
        <circle cx="116" cy="85" r="1.3" fill="#fff" />
        {/* burun delikleri */}
        <ellipse cx="94" cy="104" rx="1.5" ry="2" fill="#2d2d2d" />
        <ellipse cx="106" cy="104" rx="1.5" ry="2" fill="#2d2d2d" />
        {/* gülümseme */}
        <path d="M 88 112 Q 100 120 112 112" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </CharacterShell>
  )
}
