import Reveal from './Reveal'

interface Props {
  label: string
  title: string
  lead?: string
  center?: boolean
}

export default function SectionHeading({ label, title, lead, center }: Props) {
  return (
    <Reveal className={center ? 'text-center' : ''}>
      <div className="font-display text-amber uppercase tracking-[2.5px] text-xs font-bold">
        {label}
      </div>
      <h2 className="text-navy font-bold text-[clamp(26px,3.4vw,38px)] tracking-tight mt-2.5 mb-3.5">
        {title}
      </h2>
      {lead && (
        <p className={`text-muted leading-relaxed max-w-2xl ${center ? 'mx-auto' : ''}`}>{lead}</p>
      )}
    </Reveal>
  )
}
