import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Kira — Kartal, SIRA (eksik sayı) öğretmeni.
export default function Kira({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="182" rx="38" ry="5" fill="rgba(0,0,0,0.12)" />
        <path d="M 85 150 Q 75 175 88 178 L 100 160 L 112 178 Q 125 175 115 150 Z" fill="#8b5a2b" />
        <ellipse cx="100" cy="135" rx="40" ry="42" fill="#7a4f2a" />
        <ellipse cx="100" cy="142" rx="26" ry="32" fill="#c89456" />
        <ellipse cx="62" cy="130" rx="14" ry="32" fill="#6b4423" transform="rotate(-15 62 130)" />
        <ellipse cx="138" cy="130" rx="14" ry="32" fill="#6b4423" transform="rotate(15 138 130)" />
        <rect x="86" y="172" width="8" height="10" fill="#f59e0b" rx="2" />
        <rect x="106" y="172" width="8" height="10" fill="#f59e0b" rx="2" />
        <circle cx="100" cy="80" r="36" fill="#f5f0e8" />
        <path d="M 100 88 L 88 96 Q 100 102 112 96 Z" fill="#f59e0b" />
        <path d="M 100 88 L 90 94 Q 100 98 110 94 Z" fill="#d97706" />
        <circle cx="86" cy="74" r="8" fill="#fff" />
        <circle cx="114" cy="74" r="8" fill="#fff" />
        <circle cx="87" cy="75" r="4.5" fill="#2d2d2d" />
        <circle cx="113" cy="75" r="4.5" fill="#2d2d2d" />
        <circle cx="88.5" cy="73" r="1.5" fill="#fff" />
        <circle cx="114.5" cy="73" r="1.5" fill="#fff" />
        <path d="M 78 66 Q 86 62 94 66" stroke="#c89456" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 106 66 Q 114 62 122 66" stroke="#c89456" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="74" cy="86" rx="6" ry="4" fill="#fbb6ce" opacity="0.5" />
        <ellipse cx="126" cy="86" rx="6" ry="4" fill="#fbb6ce" opacity="0.5" />
      </svg>
    </CharacterShell>
  )
}
