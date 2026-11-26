'use client'

import { useState, useEffect } from 'react'

type Producto = {
  id: number
  nombre: string
  categoria: string
  precio: number
  stock: number
  estado: 'Activo' | 'Inactivo'
}

type ProductoForm = Omit<Producto, 'id' | 'estado'>

const API = 'http://localhost:3001'

const categorias = ['Computadoras', 'Monitores', 'Periféricos', 'Muebles', 'Accesorios', 'Audio']

const formVacio: ProductoForm = { nombre: '', categoria: '', precio: 0, stock: 0 }

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState<{ abierto: boolean; editando: Producto | null }>({ abierto: false, editando: null })
  const [form, setForm] = useState<ProductoForm>(formVacio)

  useEffect(() => {
    fetch(`${API}/productos`)
      .then((r) => r.json())
      .then(setProductos)
  }, [])

  async function abrirNuevo() {
    setForm(formVacio)
    setModal({ abierto: true, editando: null })
  }

  function abrirEditar(p: Producto) {
    setForm({ nombre: p.nombre, categoria: p.categoria, precio: p.precio, stock: p.stock })
    setModal({ abierto: true, editando: p })
  }

  function cerrarModal() {
    setModal({ abierto: false, editando: null })
  }

  async function guardar() {
    if (!form.nombre || !form.categoria || form.precio <= 0 || form.stock < 0) return

    if (modal.editando) {
      const res = await fetch(`${API}/productos/${modal.editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const actualizado = await res.json()
        setProductos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)))
      }
    } else {
      const res = await fetch(`${API}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estado: 'Activo' }),
      })
      if (res.ok) {
        const creado = await res.json()
        setProductos((prev) => [...prev, creado])
      }
    }
    cerrarModal()
  }

  async function toggleEstado(id: number) {
    const p = productos.find((x) => x.id === id)
    if (!p) return
    const nuevoEstado = p.estado === 'Activo' ? 'Inactivo' : 'Activo'
    const res = await fetch(`${API}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    if (res.ok) {
      const actualizado = await res.json()
      setProductos((prev) => prev.map((x) => (x.id === id ? actualizado : x)))
    }
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
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text" placeholder="Buscar productos…" value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo producto
          </button>
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
              <th className="px-5 py-3 font-medium text-slate-500">Acciones</th>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      Editar
                    </button>
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
                  </div>
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

      {modal.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {modal.editando ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
                <input
                  type="text" value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Seleccionar…</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Precio ($)</label>
                  <input
                    type="number" min={0} value={form.precio || ''}
                    onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Stock</label>
                  <input
                    type="number" min={0} value={form.stock || ''}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
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
                onClick={guardar}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:scale-[0.98]"
              >
                {modal.editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}