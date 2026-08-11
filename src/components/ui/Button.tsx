import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'

type Variant = 'amber' | 'ghost' | 'outline'

const base =
  'inline-flex items-center justify-center gap-2 font-display font-semibold rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  amber: 'bg-amber text-navy shadow-amber hover:shadow-[0_12px_30px_rgba(245,158,11,0.45)]',
  ghost:
    'bg-white/10 text-white border border-white/25 backdrop-blur-sm hover:bg-white/15',
  outline: 'bg-white text-navy border border-line hover:border-navy',
}

const sizes = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

interface CommonProps {
  variant?: Variant
  size?: keyof typeof sizes
  children: ReactNode
  className?: string
}

export function Button({
  variant = 'amber',
  size = 'lg',
  className = '',
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'amber',
  size = 'lg',
  className = '',
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </a>
  )
}
