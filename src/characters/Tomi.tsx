import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Tomi — Kaplumbağa, ŞEKİL öğretmeni.
export default function Tomi({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="180" rx="44" ry="5" fill="rgba(0,0,0,0.12)" />
        <ellipse cx="64" cy="158" rx="12" ry="9" fill="#6fa84a" />
        <ellipse cx="136" cy="158" rx="12" ry="9" fill="#6fa84a" />
        <ellipse cx="100" cy="138" rx="52" ry="38" fill="#8b5a2b" />
        <ellipse cx="100" cy="128" rx="48" ry="36" fill="#c8862e" />
        <path d="M 100 100 L 100 128" stroke="#9a6420" strokeWidth="2.5" />
        <path d="M 72 118 L 100 128 L 72 145" stroke="#9a6420" strokeWidth="2.5" fill="none" />
        <path d="M 128 118 L 100 128 L 128 145" stroke="#9a6420" strokeWidth="2.5" fill="none" />
        <ellipse cx="100" cy="115" rx="14" ry="11" fill="#dba046" />
        <ellipse cx="74" cy="128" rx="10" ry="9" fill="#dba046" />
        <ellipse cx="126" cy="128" rx="10" ry="9" fill="#dba046" />
        <circle cx="100" cy="78" r="28" fill="#7fb858" />
        <circle cx="89" cy="74" r="7" fill="#fff" />
        <circle cx="111" cy="74" r="7" fill="#fff" />
        <circle cx="90" cy="75" r="4" fill="#2d2d2d" />
        <circle cx="112" cy="75" r="4" fill="#2d2d2d" />
        <circle cx="91" cy="73" r="1.3" fill="#fff" />
        <circle cx="113" cy="73" r="1.3" fill="#fff" />
        <path d="M 90 88 Q 100 95 110 88" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="80" cy="84" rx="6" ry="4" fill="#fbb6ce" opacity="0.55" />
        <ellipse cx="120" cy="84" rx="6" ry="4" fill="#fbb6ce" opacity="0.55" />
      </svg>
    </CharacterShell>
  )
}
