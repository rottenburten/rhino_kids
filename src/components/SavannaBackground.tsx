export default function SavannaBackground() {
  return (
    <>
      {/* Güneş */}
      <div
        className="absolute top-8 right-10 w-20 h-20 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #fef3c7 0%, #fde047 50%, #facc15 100%)',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.5)',
        }}
      />

      {/* Bulutlar */}
      <div
        className="absolute top-16 left-12 w-20 h-6 bg-white opacity-80 rounded-full pointer-events-none animate-drift"
        style={{
          boxShadow: '12px -10px 0 4px white, -8px -8px 0 2px white',
        }}
      />
      <div
        className="absolute top-32 right-32 w-16 h-5 bg-white opacity-75 rounded-full pointer-events-none animate-drift"
        style={{
          animationDuration: '40s',
          animationDirection: 'reverse',
          boxShadow: '10px -8px 0 3px white, -6px -6px 0 1px white',
        }}
      />

      {/* Yer/çimen alanı */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #c2956a 0%, #a37448 60%, #7a5634 100%)',
        }}
      />

      {/* Dağlar - basit üçgenler */}
      <div className="absolute bottom-60 left-0 w-0 h-0 pointer-events-none" style={{
        borderLeft: '90px solid transparent',
        borderRight: '90px solid transparent',
        borderBottom: '90px solid #8b6f4a',
        opacity: 0.6,
      }} />
      <div className="absolute bottom-60 right-12 w-0 h-0 pointer-events-none" style={{
        borderLeft: '100px solid transparent',
        borderRight: '100px solid transparent',
        borderBottom: '85px solid #a78360',
        opacity: 0.55,
      }} />

      {/* Akasya ağaçları — kahverengi gövde + yeşil yassı (şemsiye) tepe */}
      <svg
        className="absolute left-6 bottom-48 w-28 h-24 pointer-events-none"
        viewBox="0 0 120 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M58 100 L58 46" stroke="#6b4a2b" strokeWidth="7" strokeLinecap="round" />
        <path d="M58 58 L42 46 M58 58 L74 46" stroke="#6b4a2b" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="58" cy="40" rx="50" ry="14" fill="#6f9e57" />
        <ellipse cx="58" cy="32" rx="38" ry="11" fill="#86b86a" />
      </svg>
      <svg
        className="absolute right-8 bottom-52 w-20 h-20 pointer-events-none opacity-90"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M50 100 L50 50" stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 62 L36 50 M50 62 L64 50" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="50" cy="44" rx="42" ry="12" fill="#6f9e57" />
        <ellipse cx="50" cy="37" rx="30" ry="9" fill="#86b86a" />
      </svg>
    </>
  )
}