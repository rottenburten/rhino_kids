// ŞEKİL modülü için şekil çizimleri.
// Şekil "kind" = 0..4 sıralı index (Question.ans bu index'i tutar).
// Şekil adları i18n'de (shapes.name / shapes.acc) — burada sadece çizim var.

const COLORS = ['#ef6f6c', '#4d9de0', '#7cab63', '#f4c842', '#e86a92']

/** Bir şekli SVG olarak çizer (kind = 0..4). */
export default function ShapeGlyph({ kind, size = 48 }: { kind: number; size?: number }) {
  const c = COLORS[kind % COLORS.length]
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
      {kind === 0 && <circle cx="24" cy="24" r="18" fill={c} />}
      {kind === 1 && <rect x="7" y="7" width="34" height="34" rx="4" fill={c} />}
      {kind === 2 && <path d="M24 6 L42 40 L6 40 Z" fill={c} strokeLinejoin="round" />}
      {kind === 3 && (
        <path
          d="M24 4 L29.5 18 L44 18 L32 27 L37 41 L24 32 L11 41 L16 27 L4 18 L18.5 18 Z"
          fill={c}
        />
      )}
      {kind === 4 && (
        <path
          d="M24 42 C8 30 6 18 14 13 C19 10 24 14 24 18 C24 14 29 10 34 13 C42 18 40 30 24 42 Z"
          fill={c}
        />
      )}
    </svg>
  )
}
