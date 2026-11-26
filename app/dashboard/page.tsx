export default function DashboardPage() {
  const cards = [
    {
      titulo: 'Usuarios activos',
      valor: '1,284',
      cambio: '+12%',
      desc: 'vs. mes anterior',
      color: 'bg-blue-50 border-blue-100',
      texto: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
    },
    {
      titulo: 'Productos',
      valor: '342',
      cambio: '+5%',
      desc: 'vs. mes anterior',
      color: 'bg-emerald-50 border-emerald-100',
      texto: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    {
      titulo: 'Ventas hoy',
      valor: '$12,540',
      cambio: '+8%',
      desc: 'vs. ayer',
      color: 'bg-violet-50 border-violet-100',
      texto: 'text-violet-700',
      badge: 'bg-violet-100 text-violet-700',
    },
    {
      titulo: 'Órdenes pendientes',
      valor: '23',
      cambio: '-3%',
      desc: 'vs. ayer',
      color: 'bg-amber-50 border-amber-100',
      texto: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-700',
    },
  ]

  const ventasRecientes = [
    { producto: 'Laptop Pro 16"', cliente: 'Carlos Mendoza', monto: '$2,399', estado: 'Completado' as const },
    { producto: 'Monitor 27" 4K', cliente: 'Ana García', monto: '$849', estado: 'Completado' as const },
    { producto: 'Teclado Mecánico', cliente: 'Luis Torres', monto: '$159', estado: 'Pendiente' as const },
    { producto: 'Mouse Inalámbrico', cliente: 'Sofía Rivera', monto: '$89', estado: 'Completado' as const },
    { producto: 'Silla Ergonómica', cliente: 'Pedro Sánchez', monto: '$1,299', estado: 'Cancelado' as const },
  ]

  const badgeClass = {
    Completado: 'bg-emerald-100 text-emerald-700',
    Pendiente: 'bg-amber-100 text-amber-700',
    Cancelado: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Bienvenido de nuevo. Este es el resumen de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const esPositivo = card.cambio.startsWith('+')
          return (
            <div
              key={card.titulo}
              className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${card.color}`}
            >
              <p className={`text-xs font-medium uppercase tracking-wider ${card.texto} opacity-70`}>
                {card.titulo}
              </p>
              <p className={`mt-2 text-3xl font-bold ${card.texto}`}>{card.valor}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${card.badge}`}>
                  {esPositivo ? '↑' : '↓'} {card.cambio}
                </span>
                <span className="text-xs text-slate-400">{card.desc}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Ventas recientes</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
              {ventasRecientes.map((vta) => (
                <tr key={vta.producto} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{vta.producto}</td>
                  <td className="px-5 py-3.5 text-slate-600">{vta.cliente}</td>
                  <td className="px-5 py-3.5 text-slate-900">{vta.monto}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[vta.estado]}`}>
                      {vta.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}