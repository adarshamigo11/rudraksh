const COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-stone-200 text-stone-700',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-stone-200 text-stone-700',
  active: 'bg-green-100 text-green-800',
  draft: 'bg-stone-200 text-stone-700',
};

export function Badge({ value, children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${COLORS[value] || 'bg-stone-100 text-stone-700'}`}>
      {children || value}
    </span>
  );
}

export function PageHeader({ title, children, sub }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-sans text-2xl font-bold text-stone-900">{title}</h1>
        {sub && <p className="text-sm text-stone-500">{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
