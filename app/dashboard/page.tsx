export default function DashboardPage() {
  const cards = [
    { titulo: 'Usuarios activos', valor: '1,284', cambio: '+12%', color: 'bg-blue-50 text-blue-700' },
    { titulo: 'Productos', valor: '342', cambio: '+5%', color: 'bg-emerald-50 text-emerald-700' },
    { titulo: 'Ventas hoy', valor: '$12,540', cambio: '+8%', color: 'bg-violet-50 text-violet-700' },
    { titulo: 'Órdenes pendientes', valor: '23', cambio: '-3%', color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.titulo}
            className={`rounded-xl border p-5 shadow-sm ${card.color}`}
          >
            <p className="text-sm font-medium opacity-70">{card.titulo}</p>
            <p className="mt-1 text-3xl font-bold">{card.valor}</p>
            <p className="mt-1 text-sm font-medium">{card.cambio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}