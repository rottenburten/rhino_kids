import type { CharacterProps } from './types'
import CharacterShell from './CharacterShell'

// Tomi — Kaplumbağa, ŞEKİL öğretmeni.
// NOT: Bu SVG taslak — kullanıcının mesajındaki 3 SVG'den kaplumbağa olanı
// (kopyala-yapıştır hatasıyla) eksikti. Diğer karakterlerle aynı kalıpta,
// savana paletinde çizildi; kullanıcı kendi SVG'siyle bu bloğu değiştirebilir.
export default function Tomi({ mood, size = 160 }: CharacterProps) {
  return (
    <CharacterShell mood={mood} size={size}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        <ellipse cx="100" cy="182" rx="46" ry="5" fill="rgba(0,0,0,0.12)" />
        {/* arka bacaklar */}
        <ellipse cx="58" cy="158" rx="13" ry="9" fill="#6f9e57" />
        <ellipse cx="142" cy="158" rx="13" ry="9" fill="#6f9e57" />
        {/* kuyruk */}
        <path d="M 150 138 Q 166 140 162 150 Q 152 148 146 142 Z" fill="#6f9e57" />
        {/* kabuk (kubbe) */}
        <ellipse cx="100" cy="128" rx="58" ry="44" fill="#7cab63" />
        <ellipse cx="100" cy="126" rx="48" ry="36" fill="#6f9e57" />
        {/* kabuk deseni — altıgen parçalar */}
        <path d="M 100 96 L 118 108 L 112 130 L 88 130 L 82 108 Z" fill="#8fbf74" stroke="#5c8a48" strokeWidth="2" />
        <path d="M 82 108 L 88 130 L 70 138 L 58 122 Z" fill="#86b86a" stroke="#5c8a48" strokeWidth="2" />
        <path d="M 118 108 L 112 130 L 130 138 L 142 122 Z" fill="#86b86a" stroke="#5c8a48" strokeWidth="2" />
        {/* kafa */}
        <ellipse cx="100" cy="74" rx="28" ry="26" fill="#8bc34a" />
        {/* gözler */}
        <circle cx="89" cy="70" r="8" fill="#fff" />
        <circle cx="111" cy="70" r="8" fill="#fff" />
        <circle cx="90" cy="71" r="4.5" fill="#2d2d2d" />
        <circle cx="112" cy="71" r="4.5" fill="#2d2d2d" />
        <circle cx="91.5" cy="69" r="1.5" fill="#fff" />
        <circle cx="113.5" cy="69" r="1.5" fill="#fff" />
        {/* burun delikleri */}
        <ellipse cx="96" cy="82" rx="1.5" ry="2" fill="#2d2d2d" />
        <ellipse cx="104" cy="82" rx="1.5" ry="2" fill="#2d2d2d" />
        {/* gülümseme */}
        <path d="M 90 88 Q 100 95 110 88" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* yanak */}
        <ellipse cx="80" cy="80" rx="6" ry="4" fill="#fbb6ce" opacity="0.5" />
        <ellipse cx="120" cy="80" rx="6" ry="4" fill="#fbb6ce" opacity="0.5" />
      </svg>
    </CharacterShell>
  )
}
