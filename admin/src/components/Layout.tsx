import { NavLink, Outlet } from 'react-router-dom'
import Logo from '@shared/Logo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm transition-colors ${
    isActive ? 'bg-white/15 text-white font-semibold' : 'text-[#C7D3E0] hover:text-white'
  }`

export default function Layout() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-off">
      <header className="bg-navy sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo variant="light" height={28} />
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={linkCls}>
                Cereri
              </NavLink>
              <NavLink to="/carduri" className={linkCls}>
                Carduri
              </NavLink>
              {profile?.role === 'admin' && (
                <NavLink to="/utilizatori" className={linkCls}>
                  Utilizatori
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8FA5BB] hidden sm:inline">
              {profile?.full_name || profile?.email}
              {profile?.role === 'admin' && (
                <span className="ml-1.5 bg-amber text-navy text-[10.5px] font-bold px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              )}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-[#C7D3E0] hover:text-white cursor-pointer transition-colors"
            >
              Ieși
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
