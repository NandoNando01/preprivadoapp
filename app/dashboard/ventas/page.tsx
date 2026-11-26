'use client'

import { useState } from 'react'

type Venta = {
  id: number
  fecha: string
  producto: string
  cliente: string
  monto: number
  metodo: string
  estado: 'Completado' | 'Pendiente' | 'Cancelado'
}

type NuevaVenta = {
  producto: string
  cliente: string
  monto: number
  metodo: string
}

const ventasIniciales: Venta[] = [
  { id: 1, fecha: '2026-11-25', producto: 'Laptop Pro 16"', cliente: 'Carlos Mendoza', monto: 2399, metodo: 'Tarjeta', estado: 'Completado' },
  { id: 2, fecha: '2026-11-25', producto: 'Monitor 27" 4K', cliente: 'Ana García', monto: 849, metodo: 'Transferencia', estado: 'Completado' },
  { id: 3, fecha: '2026-11-24', producto: 'Teclado Mecánico RGB', cliente: 'Luis Torres', monto: 159, metodo: 'Tarjeta', estado: 'Pendiente' },
  { id: 4, fecha: '2026-11-24', producto: 'Mouse Inalámbrico', cliente: 'Sofía Rivera', monto: 89, metodo: 'Efectivo', estado: 'Completado' },
  { id: 5, fecha: '2026-11-23', producto: 'Silla Ergonómica', cliente: 'Pedro Sánchez', monto: 1299, metodo: 'Transferencia', estado: 'Cancelado' },
  { id: 6, fecha: '2026-11-23', producto: 'Webcam HD 1080p', cliente: 'María López', monto: 129, metodo: 'Tarjeta', estado: 'Completado' },
  { id: 7, fecha: '2026-11-22', producto: 'Hub USB-C 7 puertos', cliente: 'Jorge Ruiz', monto: 59, metodo: 'Efectivo', estado: 'Completado' },
  { id: 8, fecha: '2026-11-22', producto: 'Audífonos Bluetooth', cliente: 'Diana Torres', monto: 199, metodo: 'Tarjeta', estado: 'Pendiente' },
]

const productosDisponibles = [
  'Laptop Pro 16"', 'Monitor 27" 4K', 'Teclado Mecánico RGB', 'Mouse Inalámbrico',
  'Silla Ergonómica', 'Webcam HD 1080p', 'Hub USB-C 7 puertos', 'Audífonos Bluetooth',
  'Tablet 10"', 'Impresora Láser', 'Cámara Web 4K', 'Disco SSD 1TB',
]

const metodosPago = ['Tarjeta', 'Efectivo', 'Transferencia']

const badgeEstado = {
  Completado: 'bg-emerald-100 text-emerald-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  Cancelado: 'bg-red-100 text-red-700',
}

const ventaVacia: NuevaVenta = { producto: '', cliente: '', monto: 0, metodo: '' }

export default function VentasPage() {
  const [ventas, setVentas] = useState(ventasIniciales)
  const [filtro, setFiltro] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nuevaVenta, setNuevaVenta] = useState<NuevaVenta>(ventaVacia)
  const [errorForm, setErrorForm] = useState('')

  function toggleEstado(id: number) {
    setVentas((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v
        const ciclo: Venta['estado'][] = ['Completado', 'Pendiente', 'Cancelado']
        const idx = ciclo.indexOf(v.estado)
        return { ...v, estado: ciclo[(idx + 1) % ciclo.length] }
      }),
    )
  }

  function abrirModal() {
    setNuevaVenta(ventaVacia)
    setErrorForm('')
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setErrorForm('')
  }

  function realizarVenta() {
    if (!nuevaVenta.producto || !nuevaVenta.cliente || nuevaVenta.monto <= 0 || !nuevaVenta.metodo) {
      setErrorForm('Completa todos los campos para realizar la venta.')
      return
    }
    setErrorForm('')

    const hoy = new Date()
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    const nuevoId = Math.max(...ventas.map((v) => v.id), 0) + 1

    setVentas((prev) => [
      ...prev,
      { id: nuevoId, fecha, ...nuevaVenta, estado: 'Completado' },
    ])
    cerrarModal()
  }

  const filtradas = ventas.filter((v) => {
    if (filtro !== 'Todas' && v.estado !== filtro) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return v.producto.toLowerCase().includes(q) || v.cliente.toLowerCase().includes(q)
    }
    return true
  })

  const totalMonto = filtradas.reduce((sum, v) => sum + v.monto, 0)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {ventas.length} ventas &middot; Total filtrado:{' '}
            <span className="font-semibold text-slate-900">${totalMonto.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text" placeholder="Buscar…" value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-44 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="Todas">Todas</option>
            <option value="Completado">Completado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <button
            onClick={abrirModal}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva venta
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium text-slate-500">Fecha</th>
              <th className="px-5 py-3 font-medium text-slate-500">Producto</th>
              <th className="px-5 py-3 font-medium text-slate-500">Cliente</th>
              <th className="px-5 py-3 font-medium text-slate-500">Monto</th>
              <th className="px-5 py-3 font-medium text-slate-500">Método</th>
              <th className="px-5 py-3 font-medium text-slate-500">Estado</th>
              <th className="px-5 py-3 font-medium text-slate-500">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((v) => (
              <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-3.5 text-slate-500">{v.fecha}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">{v.producto}</td>
                <td className="px-5 py-3.5 text-slate-600">{v.cliente}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">${v.monto.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-slate-500">{v.metodo}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeEstado[v.estado]}`}>
                    {v.estado}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => toggleEstado(v.id)}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    Cambiar estado
                  </button>
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                  No se encontraron ventas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {(['Completado', 'Pendiente', 'Cancelado'] as const).map((estado) => {
          const count = ventas.filter((v) => v.estado === estado).length
          const total = ventas.filter((v) => v.estado === estado).reduce((s, v) => s + v.monto, 0)
          return (
            <div key={estado} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{estado}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
              <p className="mt-0.5 text-xs text-slate-400">${total.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nueva venta</h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errorForm && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{errorForm}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Producto</label>
                <select
                  value={nuevaVenta.producto}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, producto: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Seleccionar producto…</option>
                  {productosDisponibles.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cliente</label>
                <input
                  type="text" placeholder="Nombre del cliente" value={nuevaVenta.cliente}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, cliente: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Monto ($)</label>
                <input
                  type="number" min={0.01} step={0.01} placeholder="0.00" value={nuevaVenta.monto || ''}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, monto: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {metodosPago.map((m) => (
                    <button
                      key={m}
                      onClick={() => setNuevaVenta({ ...nuevaVenta, metodo: m })}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        nuevaVenta.metodo === m
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={realizarVenta}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:scale-[0.98]"
              >
                Realizar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}