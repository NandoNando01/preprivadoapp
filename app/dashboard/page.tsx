'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

const API = 'http://localhost:3001'

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] font-medium text-slate-600">{d.value}</span>
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color }} />
          <span className="text-[10px] text-slate-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let cumulative = 0
  const slices = segments.map((seg) => {
    const start = cumulative
    cumulative += (seg.value / total) * 100
    return { ...seg, start, end: cumulative }
  })

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        {slices.map((seg) => {
          const r = 40
          const cx = 50, cy = 50
          const startAngle = (seg.start / 100) * 360
          const endAngle = (seg.end / 100) * 360
          const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180)
          const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180)
          const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180)
          const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180)
          const largeArc = endAngle - startAngle > 180 ? 1 : 0
          return (
            <path
              key={seg.label}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              stroke="white"
              strokeWidth="1"
            />
          )
        })}
        <circle cx="50" cy="50" r="28" fill="white" />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="text-[20px] font-bold fill-slate-800">
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-500">{seg.label}</span>
            <span className="font-medium text-slate-700 ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type ArrowProps = { direction: 'up' | 'down' }
function Arrow({ direction }: ArrowProps) {
  return (
    <svg className={`w-3 h-3 ${direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={direction === 'up' ? 'M4.5 15.75l7.5-7.5 7.5 7.5' : 'M19.5 8.25l-7.5 7.5-7.5-7.5'} />
    </svg>
  )
}

const STOCK_COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444']

export default function DashboardPage() {
  const [productos, setProductos] = useState<{ id: number; nombre: string; categoria: string; stock: number; estado: string; precio: number }[]>([])
  const [ventas, setVentas] = useState<{ estado: string; monto: number; metodo: string; producto: { id: number; nombre: string } | null; cliente: string; createdAt: string }[]>([])

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`${API}/productos`).then((r) => r.json()),
      fetch(`${API}/ventas`).then((r) => r.json()),
    ]).then(([p, v]) => {
      setProductos(p)
      setVentas(v)
    })
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const stats = useMemo(() => {
    const activos = productos.filter((p) => p.estado === 'Activo')
    const totalProductos = productos.length
    const stockTotal = activos.reduce((s, p) => s + p.stock, 0)
    const valorInventario = activos.reduce((s, p) => s + p.precio * p.stock, 0)
    const criticos = activos.filter((p) => p.stock <= 5).length

    const completadas = ventas.filter((v) => v.estado === 'Completado')
    const totalVentas = completadas.reduce((s, v) => s + Number(v.monto), 0)
    const promedioVenta = completadas.length > 0 ? totalVentas / completadas.length : 0

    const pendientes = ventas.filter((v) => v.estado === 'Pendiente').length
    const canceladas = ventas.filter((v) => v.estado === 'Cancelado').length

    const ventasHoy = completadas.filter((v) => v.createdAt && new Date(v.createdAt).toDateString() === new Date().toDateString())
    const totalHoy = ventasHoy.reduce((s, v) => s + Number(v.monto), 0)

    return { activos: activos.length, totalProductos, stockTotal, valorInventario, criticos, totalVentas, promedioVenta, pendientes, canceladas, completadas: completadas.length, totalHoy, ventasHoy: ventasHoy.length }
  }, [productos, ventas])

  const ventasPorDia = useMemo(() => {
    const map = new Map<string, number>()
    ventas.filter((v) => v.estado === 'Completado').forEach((v) => {
      if (!v.createdAt) return
      const key = new Date(v.createdAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric' })
      map.set(key, (map.get(key) || 0) + Number(v.monto))
    })
    return Array.from(map.entries()).slice(-7).map(([label, value]) => ({ label, value }))
  }, [ventas])

  const ventasPorMetodo = useMemo(() => {
    const map = new Map<string, number>()
    ventas.filter((v) => v.estado === 'Completado').forEach((v) => map.set(v.metodo, (map.get(v.metodo) || 0) + 1))
    const colors = ['#8b5cf6', '#10b981', '#f59e0b']
    return Array.from(map.entries()).map(([label, value], i) => ({ label, value, color: colors[i] || '#94a3b8' }))
  }, [ventas])

  const stockPorCategoria = useMemo(() => {
    const map = new Map<string, number>()
    productos.filter((p) => p.estado === 'Activo').forEach((p) => map.set(p.categoria, (map.get(p.categoria) || 0) + p.stock))
    return Array.from(map.entries()).map(([label, value], i) => ({ label, value, color: STOCK_COLORS[i % STOCK_COLORS.length] }))
  }, [productos])

  const recientes = useMemo(() =>
    [...ventas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
  [ventas])

  const badgeClass: Record<string, string> = {
    Completado: 'bg-emerald-100 text-emerald-700',
    Pendiente: 'bg-amber-100 text-amber-700',
    Cancelado: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen en tiempo real de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { titulo: 'Ventas hoy', valor: `$${stats.totalHoy.toLocaleString()}`, cambio: `${stats.ventasHoy} ventas`, desc: 'completadas hoy', icon: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
          { titulo: 'Productos activos', valor: String(stats.activos), cambio: `${stats.totalProductos} totales`, desc: `${stats.stockTotal} unidades`, icon: 'm20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
          { titulo: 'Valor inventario', valor: `$${stats.valorInventario.toLocaleString()}`, cambio: `${stats.criticos} críticos`, desc: 'con stock ≤ 5', icon: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 21.75h16.5A2.25 2.25 0 0 0 22.5 19.5v-15a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
          { titulo: 'Ticket promedio', valor: `$${Math.round(stats.promedioVenta).toLocaleString()}`, cambio: `${stats.completadas} ventas`, desc: 'completadas totales', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
        ].map((card) => (
          <div key={card.titulo} className={`rounded-xl border ${card.border} ${card.bg} p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between">
              <p className={`text-xs font-medium uppercase tracking-wider ${card.text} opacity-70`}>{card.titulo}</p>
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <svg className={`w-4 h-4 ${card.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <p className={`mt-2 text-3xl font-bold ${card.text}`}>{card.valor}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${card.badge}`}>{card.cambio}</span>
              <span className="text-xs text-slate-400">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Ventas (últimos días)</h2>
            <span className="text-xs text-slate-400">Agrupado por día</span>
          </div>
          {ventasPorDia.length > 0 ? (
            <BarChart data={ventasPorDia} color="#8b5cf6" />
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-slate-400">No hay datos de ventas</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Método de pago</h2>
            <span className="text-xs text-slate-400">{ventasPorMetodo.reduce((s, v) => s + v.value, 0)} ventas</span>
          </div>
          {ventasPorMetodo.length > 0 ? (
            <DonutChart segments={ventasPorMetodo} />
          ) : (
            <div className="flex items-center justify-center h-28 text-sm text-slate-400">Sin datos</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Stock por categoría</h2>
            <span className="text-xs text-slate-400">{stockPorCategoria.reduce((s, v) => s + v.value, 0)} unidades</span>
          </div>
          {stockPorCategoria.length > 0 ? (
            <div className="space-y-3">
              {stockPorCategoria.map((cat) => {
                const max = Math.max(...stockPorCategoria.map((c) => c.value), 1)
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{cat.label}</span>
                      <span className="text-xs text-slate-400">{cat.value} uds.</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(cat.value / max) * 100}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-28 text-sm text-slate-400">Sin productos</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Estado de ventas</h2>
            <span className="text-xs text-slate-400">{ventas.length} registros</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Completadas', value: stats.completadas, color: '#10b981', arrow: 'up' as const },
              { label: 'Pendientes', value: stats.pendientes, color: '#f59e0b', arrow: 'down' as const },
              { label: 'Canceladas', value: stats.canceladas, color: '#ef4444', arrow: 'down' as const },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Arrow direction={item.arrow} />
                  <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                </div>
                <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${ventas.length ? (item.value / ventas.length) * 100 : 0}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Últimas ventas</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium text-slate-500">Producto</th>
              <th className="px-5 py-3 font-medium text-slate-500">Cliente</th>
              <th className="px-5 py-3 font-medium text-slate-500">Monto</th>
              <th className="px-5 py-3 font-medium text-slate-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recientes.map((vta, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-900">{vta.producto?.nombre ?? '—'}</td>
                <td className="px-5 py-3.5 text-slate-600">{vta.cliente}</td>
                <td className="px-5 py-3.5 text-slate-900">${Number(vta.monto).toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[vta.estado]}`}>{vta.estado}</span>
                </td>
              </tr>
            ))}
            {recientes.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">No hay ventas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}