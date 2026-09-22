import { useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import CardCanvas from '@shared/cards/CardCanvas'
import {
  FORMATS,
  PRESETS,
  type CardContent,
  type CardStyle,
  type FormatId,
} from '@shared/cards/config'

const STYLE_LABELS: Record<CardStyle, string> = {
  navy: 'Navy (închis)',
  amber: 'Amber (portocaliu)',
  light: 'Deschis',
}

export default function CardsPage() {
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const [format, setFormat] = useState<FormatId>('ig-post')
  const [style, setStyle] = useState<CardStyle>(PRESETS[0].style)
  const [content, setContent] = useState<CardContent>({ ...PRESETS[0] })
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const previewColRef = useRef<HTMLDivElement>(null)
  const [availWidth, setAvailWidth] = useState(520)

  // lățimea reală disponibilă pentru previzualizare (responsive pe telefon)
  useEffect(() => {
    const el = previewColRef.current
    if (!el) return
    const measure = () => setAvailWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    setPresetId(id)
    setStyle(p.style)
    setContent({ headline: p.headline, accent: p.accent, sub: p.sub, chips: [...p.chips], cta: p.cta })
  }

  const { width, height } = FORMATS[format]
  // scara de previzualizare: încape în lățimea disponibilă și max ~640px înălțime
  const previewScale = useMemo(
    () => Math.min(Math.min(availWidth, 520) / width, 640 / height),
    [availWidth, width, height],
  )

  const download = async () => {
    if (!exportRef.current || exporting) return
    setExporting(true)
    try {
      // dublu-render: prima trecere „încălzește" fonturile embedded
      await toPng(exportRef.current, { canvasWidth: width, canvasHeight: height, pixelRatio: 1 })
      const dataUrl = await toPng(exportRef.current, {
        canvasWidth: width,
        canvasHeight: height,
        pixelRatio: 1,
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `asigurabil-${presetId}-${format}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  const field = (label: string, node: React.ReactNode) => (
    <label className="block">
      <span className="block font-display font-semibold text-navy text-[13px] mb-1.5">{label}</span>
      {node}
    </label>
  )

  const inputCls =
    'w-full bg-white border-[1.5px] border-line rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]'

  return (
    <div>
      <h1 className="font-display font-bold text-navy text-2xl mb-6">
        Generator de carduri social media
      </h1>

      <div className="grid lg:grid-cols-[380px_1fr] gap-10 items-start">
        {/* panou de control */}
        <div className="bg-white border border-line rounded-2xl p-6 flex flex-col gap-4 shadow-card">
          {field(
            'Șablon',
            <select value={presetId} onChange={(e) => applyPreset(e.target.value)} className={inputCls}>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>,
          )}
          {field(
            'Format',
            <select value={format} onChange={(e) => setFormat(e.target.value as FormatId)} className={inputCls}>
              {Object.entries(FORMATS).map(([id, f]) => (
                <option key={id} value={id}>
                  {f.label} · {f.width}×{f.height}
                </option>
              ))}
            </select>,
          )}
          {field(
            'Stil',
            <select value={style} onChange={(e) => setStyle(e.target.value as CardStyle)} className={inputCls}>
              {Object.entries(STYLE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>,
          )}
          <hr className="border-line" />
          {field(
            'Titlu',
            <input
              value={content.headline}
              onChange={(e) => setContent({ ...content, headline: e.target.value })}
              className={inputCls}
            />,
          )}
          {field(
            'Titlu evidențiat (colorat)',
            <input
              value={content.accent}
              onChange={(e) => setContent({ ...content, accent: e.target.value })}
              className={inputCls}
            />,
          )}
          {field(
            'Subtitlu',
            <textarea
              value={content.sub}
              onChange={(e) => setContent({ ...content, sub: e.target.value })}
              rows={2}
              className={`${inputCls} resize-none`}
            />,
          )}
          {field(
            'Etichete (separate prin virgulă)',
            <input
              value={content.chips.join(', ')}
              onChange={(e) =>
                setContent({
                  ...content,
                  chips: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className={inputCls}
            />,
          )}
          {field(
            'Buton (CTA)',
            <input
              value={content.cta}
              onChange={(e) => setContent({ ...content, cta: e.target.value })}
              className={inputCls}
            />,
          )}
          <button
            onClick={download}
            disabled={exporting}
            className="mt-2 w-full bg-amber text-navy font-display font-semibold rounded-xl py-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-amber disabled:opacity-50"
          >
            {exporting ? 'Se generează…' : `Descarcă PNG ${width}×${height}`}
          </button>
        </div>

        {/* previzualizare scalată */}
        <div ref={previewColRef} className="flex flex-col items-center gap-3 min-w-0">
          <div
            className="rounded-2xl overflow-hidden shadow-[0_24px_55px_rgba(15,42,67,.35)]"
            style={{ width: width * previewScale, height: height * previewScale }}
          >
            <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
              <CardCanvas content={content} style={style} format={format} />
            </div>
          </div>
          <span className="text-muted text-xs">
            Previzualizare · exportul are dimensiunea reală {width}×{height}px
          </span>
        </div>
      </div>

      {/* nodul de export, la dimensiune reală, în afara ecranului */}
      <div style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }} aria-hidden>
        <CardCanvas ref={exportRef} content={content} style={style} format={format} />
      </div>
    </div>
  )
}
