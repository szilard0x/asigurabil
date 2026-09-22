interface LogoProps {
  /** 'light' pentru fundal închis (text alb), 'dark' pentru fundal deschis (text navy). */
  variant?: 'light' | 'dark'
  /** Înălțimea în px; lățimea se scalează proporțional. */
  height?: number
  withText?: boolean
}

/**
 * Marca asigurabil.ro: scut cu gradient amber și un „a" geometric (de la
 * „asigurabil") în negativ — desenat din forme pure, fără dependență de font.
 */
export function LogoMark({
  size = 34,
  shield = '#F59E0B',
  letter = '#0F2A43',
}: {
  size?: number
  /** Culoare pentru scut; implicit amber-ul brandului (identic cu butoanele). */
  shield?: string
  letter?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M17 2 L29 7 V16 C29 24 24 29.5 17 32 C10 29.5 5 24 5 16 V7 Z" fill={shield} />
      {/* „a" geometric: bol + tijă rotunjită */}
      <circle cx="15.6" cy="18.2" r="4.6" stroke={letter} strokeWidth="3" fill="none" />
      <path
        d="M20.8 12.6 V23.4"
        stroke={letter}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function Logo({ variant = 'dark', height = 34, withText = true }: LogoProps) {
  const textColor = variant === 'light' ? '#FFFFFF' : '#0F2A43'
  if (!withText) return <LogoMark size={height} />
  return (
    <span className="inline-flex items-center gap-2 select-none" aria-label="asigurabil.ro">
      <LogoMark size={height} />
      <span
        className="font-display font-bold"
        style={{ color: textColor, fontSize: height * 0.53 }}
      >
        asigurabil<span style={{ color: '#F59E0B' }}>.ro</span>
      </span>
    </span>
  )
}
