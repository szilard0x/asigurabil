interface LogoProps {
  /** 'light' pentru fundal închis (text alb), 'dark' pentru fundal deschis (text navy). */
  variant?: 'light' | 'dark'
  /** Înălțimea în px; lățimea se scalează proporțional. */
  height?: number
  withText?: boolean
}

export function LogoMark({
  size = 34,
  shield = '#F59E0B',
  check = '#0F2A43',
}: {
  size?: number
  shield?: string
  check?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M17 2 L29 7 V16 C29 24 24 29.5 17 32 C10 29.5 5 24 5 16 V7 Z" fill={shield} />
      <path
        d="M11.5 16.5 L15.5 20.5 L23 12.5"
        stroke={check}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
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
