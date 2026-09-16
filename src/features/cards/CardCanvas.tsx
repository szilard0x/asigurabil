import { forwardRef } from 'react'
import { FORMATS, type CardContent, type CardStyle, type FormatId } from './config'
import { LogoMark } from '../../components/Logo'
import { BRAND } from '../../lib/constants'

interface Props {
  content: CardContent
  style: CardStyle
  format: FormatId
}

const palettes: Record<
  CardStyle,
  { bg: string; fg: string; sub: string; accent: string; chipBg: string; chipBorder: string; ctaBg: string; ctaFg: string; glow: string }
> = {
  navy: {
    bg: 'linear-gradient(155deg,#0F2A43 0%,#16395A 60%,#0C3155 100%)',
    fg: '#FFFFFF',
    sub: '#C7D3E0',
    accent: '#F59E0B',
    chipBg: 'rgba(255,255,255,.10)',
    chipBorder: 'rgba(255,255,255,.22)',
    ctaBg: '#F59E0B',
    ctaFg: '#0F2A43',
    glow: 'rgba(245,158,11,.22)',
  },
  amber: {
    bg: 'linear-gradient(155deg,#F59E0B 0%,#FBBF24 100%)',
    fg: '#0F2A43',
    sub: '#33475C',
    accent: '#FFFFFF',
    chipBg: 'rgba(15,42,67,.10)',
    chipBorder: 'rgba(15,42,67,.25)',
    ctaBg: '#0F2A43',
    ctaFg: '#FFFFFF',
    glow: 'rgba(255,255,255,.30)',
  },
  light: {
    bg: '#F6F8FB',
    fg: '#0F2A43',
    sub: '#5B6B7C',
    accent: '#F59E0B',
    chipBg: '#FFFFFF',
    chipBorder: '#E4EAF1',
    ctaBg: '#0F2A43',
    ctaFg: '#FFFFFF',
    glow: 'rgba(245,158,11,.18)',
  },
}

/**
 * Cardul la rezoluție reală (1080×1080 etc.) — dimensiunile interne scalează cu
 * `u` (unitatea = width/1080) ca să arate identic pe toate formatele.
 */
const CardCanvas = forwardRef<HTMLDivElement, Props>(function CardCanvas(
  { content, style, format },
  ref,
) {
  const { width, height } = FORMATS[format]
  const p = palettes[style]
  const u = width / 1080
  const tall = height / width > 1.2 // story

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        background: p.bg,
        color: p.fg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: `${(tall ? 130 : 84) * u}px ${88 * u}px ${(tall ? 130 : 84) * u}px`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* aură decorativă */}
      <div
        style={{
          position: 'absolute',
          width: 900 * u,
          height: 900 * u,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${p.glow}, transparent 65%)`,
          top: -320 * u,
          right: -260 * u,
        }}
      />
      {/* logo — pe fundal amber, scutul devine navy ca să rămână vizibil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 * u, position: 'relative' }}>
        <LogoMark
          size={92 * u}
          shield={style === 'amber' ? '#0F2A43' : undefined}
          letter={style === 'amber' ? '#F59E0B' : '#0F2A43'}
        />
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 52 * u }}>
          asigurabil<span style={{ color: style === 'amber' ? '#FFFFFF' : '#F59E0B' }}>.ro</span>
        </span>
      </div>

      {/* titlu */}
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: (tall ? 118 : 96) * u,
            lineHeight: 1.08,
            letterSpacing: -2 * u,
            margin: 0,
          }}
        >
          {content.headline}
          <br />
          <span style={{ color: p.accent }}>{content.accent}</span>
        </h1>
        {content.sub && (
          <p
            style={{
              color: p.sub,
              fontSize: 40 * u,
              lineHeight: 1.45,
              margin: `${36 * u}px 0 0`,
              maxWidth: 880 * u,
            }}
          >
            {content.sub}
          </p>
        )}
        {content.chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 * u, marginTop: 44 * u }}>
            {content.chips.map((c) => (
              <span
                key={c}
                style={{
                  background: p.chipBg,
                  border: `${2 * u}px solid ${p.chipBorder}`,
                  borderRadius: 999,
                  padding: `${14 * u}px ${30 * u}px`,
                  fontSize: 32 * u,
                  fontWeight: 500,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* bandă CTA — la story, „auto" distribuie spațiul și centrează titlul */}
      <div
        style={{
          position: 'relative',
          marginTop: tall ? 'auto' : 56 * u,
          background: p.ctaBg,
          color: p.ctaFg,
          borderRadius: 28 * u,
          padding: `${34 * u}px ${44 * u}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize: 38 * u,
        }}
      >
        <span>{content.cta}</span>
        <span>
          {BRAND.phoneDisplay} <span aria-hidden>→</span>
        </span>
      </div>
    </div>
  )
})

export default CardCanvas
