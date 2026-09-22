import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (widgetId: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('turnstile script failed'))
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

interface Props {
  /** Cheia publică a site-ului (implicit: cheia de test Cloudflare, doar pentru dev). */
  sitekey?: string
  /** Primește tokenul (sau null la expirare/eroare). */
  onToken: (token: string | null) => void
}

/** Widget Cloudflare Turnstile (anti-spam), partajat între site și panoul de admin. */
export default function TurnstileWidget({
  sitekey = '1x00000000000000000000AA',
  onToken,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    let widgetId: string | null = null
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey,
          language: 'ro',
          appearance: 'always',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        })
      })
      .catch(() => onTokenRef.current(null))
    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [])

  return <div ref={containerRef} className="min-h-[65px]" />
}
