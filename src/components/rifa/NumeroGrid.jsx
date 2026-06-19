import { useState, useMemo } from 'react';

const getColor = (num) => {
  if (num.pago) return 'bg-green-500 text-white border-green-600';
  if (num.vendido) return 'bg-yellow-400 text-black border-yellow-500';
  return 'bg-white/10 text-purple-200 border-purple-800/50 hover:bg-purple-700/40 hover:text-white';
};

export default function NumeroGrid({ numeros, onSelect, selectedId, readOnly = false }) {
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return numeros.filter(n => {
      const matchFilter =
        filter === 'todos' ||
        (filter === 'disponivel' && !n.vendido) ||
        (filter === 'vendido' && n.vendido && !n.pago) ||
        (filter === 'pago' && n.pago);
      const matchSearch = !search || String(n.numero).includes(search) || (n.nome_comprador || '').toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [numeros, filter, search]);

  const disponiveis = numeros.filter(n => !n.vendido).length;
  const vendidos = numeros.filter(n => n.vendido && !n.pago).length;
  const pagos = numeros.filter(n => n.pago).length;

  return (
    <div>
      {/* Legend & Stats */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-white/20 border border-purple-700" /><span className="text-purple-300">Disponível ({disponiveis})</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-yellow-400" /><span className="text-purple-300">Vendido/Pendente ({vendidos})</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500" /><span className="text-purple-300">Pago ({pagos})</span></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['todos', 'disponivel', 'vendido', 'pago'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              filter === f
                ? 'bg-purple-600 text-white border-purple-500'
                : 'text-purple-300 border-purple-800/50 hover:border-purple-600'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'disponivel' ? 'Disponíveis' : f === 'vendido' ? 'Vendidos' : 'Pagos'}
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar número ou nome..."
          className="px-3 py-1 rounded-full text-xs bg-[#0f0a1e] border border-purple-800/50 text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 min-w-0 flex-1 max-w-[200px]"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-1.5">
        {filtered.map(num => (
          <button
            key={num.id}
            onClick={() => !readOnly && onSelect && onSelect(num)}
            disabled={readOnly && num.vendido}
            title={num.nome_comprador ? `${num.numero} - ${num.nome_comprador}` : `Número ${num.numero}`}
            className={`aspect-square rounded-lg text-xs font-semibold border transition-all ${getColor(num)} ${
              selectedId === num.id ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-[#0f0a1e]' : ''
            } ${readOnly && num.vendido ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {num.numero}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-purple-400 text-sm text-center py-8">Nenhum número encontrado</p>
      )}
    </div>
  );
}