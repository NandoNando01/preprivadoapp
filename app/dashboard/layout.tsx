'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/dashboard/productos', label: 'Productos' },
  { href: '/dashboard/ventas', label: 'Ventas' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/login')
    }
  }, [router])

  function handleLogout() {
    localStorage.removeItem('access_token')
    router.replace('/login')
  }

  return (
    <div className="flex h-full flex-1">
      <aside className="flex w-56 flex-col border-r bg-neutral-50 p-4">
        <h2 className="mb-6 text-lg font-semibold">Panel</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-2 text-sm transition-colors hover:bg-neutral-200 ${
                pathname === item.href ? 'bg-neutral-200 font-medium' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b px-6">
          <button
            onClick={handleLogout}
            className="rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}