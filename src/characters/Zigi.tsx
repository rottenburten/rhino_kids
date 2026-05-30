import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Zigi — Zebra, ÇIKARMA öğretmeni.
export default function Zigi({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="180" rx="42" ry="5" fill="rgba(0,0,0,0.12)" />
        {/* gövde */}
        <ellipse cx="100" cy="140" rx="46" ry="38" fill="#f0f0f0" />
        {/* gövde çizgileri */}
        <path d="M 60 130 L 145 130" stroke="#2d2d2d" strokeWidth="5" opacity="0.85" />
        <path d="M 56 145 L 148 145" stroke="#2d2d2d" strokeWidth="5" opacity="0.85" />
        <path d="M 60 160 L 142 160" stroke="#2d2d2d" strokeWidth="5" opacity="0.85" />
        {/* bacaklar */}
        <rect x="76" y="165" width="15" height="16" fill="#f0f0f0" rx="5" />
        <rect x="110" y="165" width="15" height="16" fill="#f0f0f0" rx="5" />
        {/* kafa */}
        <ellipse cx="100" cy="92" rx="40" ry="36" fill="#f0f0f0" />
        {/* yüz çizgileri */}
        <path d="M 100 58 L 100 128" stroke="#2d2d2d" strokeWidth="6" opacity="0.85" />
        <path d="M 82 62 L 80 120" stroke="#2d2d2d" strokeWidth="4" opacity="0.7" />
        <path d="M 118 62 L 120 120" stroke="#2d2d2d" strokeWidth="4" opacity="0.7" />
        {/* kulaklar */}
        <ellipse cx="72" cy="62" rx="8" ry="12" fill="#f0f0f0" transform="rotate(-20 72 62)" />
        <ellipse cx="128" cy="62" rx="8" ry="12" fill="#f0f0f0" transform="rotate(20 128 62)" />
        {/* burun bölgesi */}
        <ellipse cx="100" cy="108" rx="20" ry="16" fill="#d8d8d8" />
        {/* gözler */}
        <circle cx="84" cy="88" r="6.5" fill="#fff" />
        <circle cx="116" cy="88" r="6.5" fill="#fff" />
        <circle cx="85" cy="89" r="3.5" fill="#2d2d2d" />
        <circle cx="117" cy="89" r="3.5" fill="#2d2d2d" />
        <circle cx="86" cy="87" r="1.2" fill="#fff" />
        <circle cx="118" cy="87" r="1.2" fill="#fff" />
        {/* burun delikleri */}
        <ellipse cx="92" cy="110" rx="1.5" ry="2.5" fill="#2d2d2d" />
        <ellipse cx="108" cy="110" rx="1.5" ry="2.5" fill="#2d2d2d" />
        {/* gülümseme */}
        <path d="M 88 118 Q 100 124 112 118" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </CharacterShell>
  )
}
