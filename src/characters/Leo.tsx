import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Leo — Aslan, ÇARPMA öğretmeni.
export default function Leo({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="180" rx="42" ry="5" fill="rgba(0,0,0,0.12)" />
        {/* gövde */}
        <ellipse cx="100" cy="145" rx="42" ry="35" fill="#e8a85c" />
        {/* bacaklar */}
        <rect x="78" y="168" width="14" height="14" fill="#d89548" rx="5" />
        <rect x="108" y="168" width="14" height="14" fill="#d89548" rx="5" />
        {/* yele */}
        <circle cx="100" cy="92" r="48" fill="#c87f3c" />
        {/* yüz */}
        <circle cx="100" cy="92" r="34" fill="#e8a85c" />
        {/* kulaklar */}
        <ellipse cx="68" cy="76" rx="9" ry="11" fill="#e8a85c" />
        <ellipse cx="132" cy="76" rx="9" ry="11" fill="#e8a85c" />
        {/* burun bölgesi */}
        <ellipse cx="100" cy="104" rx="20" ry="16" fill="#f5d6a8" />
        {/* gözler */}
        <circle cx="86" cy="86" r="6.5" fill="#fff" />
        <circle cx="114" cy="86" r="6.5" fill="#fff" />
        <circle cx="87" cy="87" r="3.5" fill="#2d2d2d" />
        <circle cx="115" cy="87" r="3.5" fill="#2d2d2d" />
        <circle cx="88" cy="85" r="1.2" fill="#fff" />
        <circle cx="116" cy="85" r="1.2" fill="#fff" />
        {/* burun */}
        <path d="M 94 100 L 106 100 L 100 107 Z" fill="#8b5a2b" />
        {/* ağız */}
        <path d="M 100 107 Q 100 113 94 114" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 100 107 Q 100 113 106 114" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </CharacterShell>
  )
}
