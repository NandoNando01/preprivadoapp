'use client'

import { useState } from 'react'

type Producto = {
  id: number
  nombre: string
  categoria: string
  precio: number
  stock: number
  estado: 'Activo' | 'Inactivo'
}

const initialProductos: Producto[] = [
  { id: 1, nombre: 'Laptop Pro 16"', categoria: 'Computadoras', precio: 2399, stock: 45, estado: 'Activo' },
  { id: 2, nombre: 'Monitor 27" 4K', categoria: 'Monitores', precio: 849, stock: 120, estado: 'Activo' },
  { id: 3, nombre: 'Teclado Mecánico RGB', categoria: 'Periféricos', precio: 159, stock: 200, estado: 'Activo' },
  { id: 4, nombre: 'Mouse Inalámbrico', categoria: 'Periféricos', precio: 89, stock: 350, estado: 'Activo' },
  { id: 5, nombre: 'Silla Ergonómica', categoria: 'Muebles', precio: 1299, stock: 18, estado: 'Activo' },
  { id: 6, nombre: 'Webcam HD 1080p', categoria: 'Accesorios', precio: 129, stock: 0, estado: 'Inactivo' },
  { id: 7, nombre: 'Hub USB-C 7 puertos', categoria: 'Accesorios', precio: 59, stock: 85, estado: 'Activo' },
  { id: 8, nombre: 'Audífonos Bluetooth', categoria: 'Audio', precio: 199, stock: 64, estado: 'Activo' },
]

export default function ProductosPage() {
  const [productos, setProductos] = useState(initialProductos)
  const [busqueda, setBusqueda] = useState('')

  function toggleEstado(id: number) {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: p.estado === 'Activo' ? 'Inactivo' : 'Activo' } : p,
      ),
    )
  }

  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const badgeEstado = {
    Activo: 'bg-emerald-100 text-emerald-700',
    Inactivo: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">{productos.length} productos registrados</p>
        </div>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium text-slate-500">Producto</th>
              <th className="px-5 py-3 font-medium text-slate-500">Categoría</th>
              <th className="px-5 py-3 font-medium text-slate-500">Precio</th>
              <th className="px-5 py-3 font-medium text-slate-500">Stock</th>
              <th className="px-5 py-3 font-medium text-slate-500">Estado</th>
              <th className="px-5 py-3 font-medium text-slate-500">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-medium text-slate-900">{p.nombre}</td>
                <td className="px-5 py-3.5 text-slate-500">{p.categoria}</td>
                <td className="px-5 py-3.5 text-slate-900">${p.precio.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={p.stock <= 20 ? 'font-medium text-amber-600' : 'text-slate-600'}>
                    {p.stock} {p.stock === 0 && '(sin stock)'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeEstado[p.estado]}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => toggleEstado(p.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      p.estado === 'Activo'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {p.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}