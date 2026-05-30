import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Eko — Fil, TOPLAMA öğretmeni.
export default function Eko({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="180" rx="48" ry="5" fill="rgba(0,0,0,0.12)" />
        {/* gövde */}
        <ellipse cx="100" cy="140" rx="52" ry="42" fill="#9eb0c4" />
        {/* bacaklar */}
        <rect x="74" y="165" width="16" height="18" fill="#8a9cb0" rx="5" />
        <rect x="110" y="165" width="16" height="18" fill="#8a9cb0" rx="5" />
        {/* kafa */}
        <ellipse cx="100" cy="95" rx="46" ry="40" fill="#9eb0c4" />
        {/* kulaklar */}
        <ellipse cx="58" cy="92" rx="22" ry="28" fill="#8a9cb0" />
        <ellipse cx="142" cy="92" rx="22" ry="28" fill="#8a9cb0" />
        <ellipse cx="58" cy="92" rx="14" ry="20" fill="#b0c0d0" />
        <ellipse cx="142" cy="92" rx="14" ry="20" fill="#b0c0d0" />
        {/* hortum */}
        <path d="M 100 105 Q 96 140 88 158 Q 92 162 100 158 Q 104 140 100 105" fill="#9eb0c4" />
        {/* gözler */}
        <circle cx="82" cy="88" r="6.5" fill="#fff" />
        <circle cx="118" cy="88" r="6.5" fill="#fff" />
        <circle cx="83" cy="89" r="3.5" fill="#2d2d2d" />
        <circle cx="119" cy="89" r="3.5" fill="#2d2d2d" />
        <circle cx="84" cy="87" r="1.2" fill="#fff" />
        <circle cx="120" cy="87" r="1.2" fill="#fff" />
        {/* yanak */}
        <ellipse cx="78" cy="100" rx="6" ry="4" fill="#fbb6ce" opacity="0.5" />
        <ellipse cx="122" cy="100" rx="6" ry="4" fill="#fbb6ce" opacity="0.5" />
        {/* fildişleri */}
        <path d="M 84 84 Q 90 70 75 64" fill="#fef3e2" stroke="#5d2906" strokeWidth="1.5" />
        <path d="M 116 84 Q 110 70 125 64" fill="#fef3e2" stroke="#5d2906" strokeWidth="1.5" />
      </svg>
    </CharacterShell>
  )
}
