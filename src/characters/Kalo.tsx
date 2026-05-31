import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Kalo — Kanguru, SAAT öğretmeni.
export default function Kalo({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="105" cy="182" rx="42" ry="5" fill="rgba(0,0,0,0.12)" />
        <path d="M 130 160 Q 165 165 168 180 Q 150 178 128 168 Z" fill="#c8763c" />
        <ellipse cx="92" cy="172" rx="20" ry="9" fill="#b5662f" />
        <ellipse cx="120" cy="174" rx="20" ry="9" fill="#b5662f" />
        <ellipse cx="105" cy="135" rx="36" ry="40" fill="#d4844a" />
        <ellipse cx="105" cy="148" rx="22" ry="24" fill="#e8b07a" />
        <circle cx="105" cy="150" r="9" fill="#d4844a" />
        <circle cx="101" cy="149" r="1.5" fill="#2d2d2d" />
        <circle cx="109" cy="149" r="1.5" fill="#2d2d2d" />
        <ellipse cx="74" cy="128" rx="8" ry="16" fill="#d4844a" transform="rotate(20 74 128)" />
        <ellipse cx="105" cy="80" rx="30" ry="32" fill="#d4844a" />
        <ellipse cx="90" cy="44" rx="7" ry="18" fill="#d4844a" transform="rotate(-12 90 44)" />
        <ellipse cx="120" cy="44" rx="7" ry="18" fill="#d4844a" transform="rotate(12 120 44)" />
        <ellipse cx="90" cy="46" rx="3" ry="11" fill="#e8b07a" transform="rotate(-12 90 46)" />
        <ellipse cx="120" cy="46" rx="3" ry="11" fill="#e8b07a" transform="rotate(12 120 46)" />
        <ellipse cx="105" cy="90" rx="16" ry="14" fill="#e8b07a" />
        <circle cx="95" cy="76" r="7" fill="#fff" />
        <circle cx="115" cy="76" r="7" fill="#fff" />
        <circle cx="96" cy="77" r="4" fill="#2d2d2d" />
        <circle cx="116" cy="77" r="4" fill="#2d2d2d" />
        <circle cx="97" cy="75" r="1.3" fill="#fff" />
        <circle cx="117" cy="75" r="1.3" fill="#fff" />
        <ellipse cx="105" cy="88" rx="3" ry="2.5" fill="#2d2d2d" />
        <path d="M 98 95 Q 105 100 112 95" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="88" cy="86" rx="5.5" ry="4" fill="#fbb6ce" opacity="0.55" />
        <ellipse cx="122" cy="86" rx="5.5" ry="4" fill="#fbb6ce" opacity="0.55" />
      </svg>
    </CharacterShell>
  )
}
