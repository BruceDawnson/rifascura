const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

import { ArrowLeft, Shuffle, Edit, Download, Trash2, ExternalLink } from 'lucide-react';
import SorteioModalRifa from '@/components/rifa/SorteioModalRifa';
import EditRifaModal from '@/components/rifa/EditRifaModal';
import NumeroDetailModal from '@/components/rifa/NumeroDetailModal';
import { useAdminRole } from '@/components/Layout';

const getNumColor = (num) => {
  if (num.pago) return 'bg-green-500 text-white border-green-500';
  if (num.vendido) return 'bg-amber-400 text-white border-amber-400';
  return 'bg-white text-gray-700 border-gray-300 hover:border-teal-400 hover:bg-teal-50';
};

export default function AdminRifaDetalhe() {
  const { id } = useParams();
  const { role } = useAdminRole();
  const isAdmin = role === 'admin';
  const [rifa, setRifa] = useState(null);
  const [numeros, setNumeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('todos');
  const [sorteioOpen, setSorteioOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedNum, setSelectedNum] = useState(null);

  const load = async () => {
    setLoading(true);
    // Busca números da rifa
    let allNums = [];
    let page = 0;
    const pageSize = 500;
    while (true) {
      const batch = await db.entities.NumeroRifa.filter({ rifa_id: id }, 'numero', pageSize, page * pageSize);
      allNums = allNums.concat(batch);
      if (batch.length < pageSize) break;
      page++;
    }
    setNumeros(allNums.sort((a, b) => a.numero - b.numero));
    setLoading(false);
  };

  const loadRifa = async () => {
    // Paginar rifas para garantir que encontra inclusive finalizadas
    let all = [];
    let pg = 0;
    const ps = 200;
    while (true) {
      const batch = await db.entities.Rifa.list('-created_date', ps, pg * ps);
      all = all.concat(batch);
      if (batch.length < ps) break;
      pg++;
    }
    const rifaFound = all.find((r) => r.id === id) || null;
    setRifa(rifaFound);
  };

  useEffect(() => {
    loadRifa();
    load();
  }, [id]);

  const stats = useMemo(() => {
    const disp = numeros.filter((n) => !n.vendido).length;
    const vend = numeros.filter((n) => n.vendido).length;
    const pagos = numeros.filter((n) => n.pago).length;
    const pend = numeros.filter((n) => n.vendido && !n.pago).length;
    const arr = numeros.filter((n) => n.pago).reduce((s, n) => s + (n.valor_pago || 0), 0);
    const pendVal = numeros.filter((n) => n.vendido && !n.pago).reduce((s, n) => s + (n.valor_pago || 0), 0);
    return { disp, vend, pagos, pend, arr, pendVal };
  }, [numeros, rifa]);

  const filtered = useMemo(() => {
    if (filterTab === 'todos') return numeros;
    if (filterTab === 'disponiveis') return numeros.filter((n) => !n.vendido);
    if (filterTab === 'vendidos') return numeros.filter((n) => n.vendido && !n.pago);
    if (filterTab === 'pagos') return numeros.filter((n) => n.pago);
    if (filterTab === 'pendentes') return numeros.filter((n) => n.vendido && !n.pago);
    return numeros;
  }, [numeros, filterTab]);

  const exportCSV = () => {
    const bom = '\uFEFF';
    const headers = ['Número', 'Nome', 'Telefone', 'Vendedor', 'Data Compra', 'Vendido', 'Pago', 'Valor Pago', 'Observação'];
    const rows = numeros.map((n) => [
    n.numero, n.nome_comprador || '', n.telefone || '', n.nome_vendedor || '',
    n.data_compra ? new Date(n.data_compra).toLocaleDateString('pt-BR') : '',
    n.vendido ? 'Sim' : 'Não', n.pago ? 'Sim' : 'Não',
    n.valor_pago ? `R$ ${n.valor_pago.toFixed(2)}` : '', n.observacao || '']
    );
    const csv = bom + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `${rifa.nome}-numeros-sorteio.csv`;a.click();
  };

  const limparDados = async () => {
    if (!confirm('Excluir permanentemente este sorteio e todos os seus números? Esta ação não pode ser desfeita.')) return;
    // Deletar em paralelo (mais rápido, usa os números já carregados na página)
    await Promise.allSettled(numeros.map(n => db.entities.NumeroRifa.delete(n.id)));
    await db.entities.Rifa.delete(id);
    window.location.href = '/admin/sorteios';
  };

  if (loading || !rifa) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;

  const tabs = [
  { key: 'todos', label: `Todos (${numeros.length})` },
  { key: 'disponiveis', label: `Disponíveis (${stats.disp})` },
  { key: 'vendidos', label: `Vendidos (${stats.vend})` },
  { key: 'pagos', label: `Pagos (${stats.pagos})` },
  { key: 'pendentes', label: `Pendentes (${stats.pend})` }];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <Link to="/admin/sorteios" className="flex items-center gap-1 text-sm text-teal-600 hover:underline mb-3">
        <ArrowLeft size={14} /> Voltar para Sorteios
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{rifa.nome}</h1>
          <p className="text-gray-500 text-sm">{rifa.descricao}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button onClick={() => setSorteioOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors">
              <Shuffle size={14} /> Sortear
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors">
              <Edit size={14} /> Editar
            </button>
          )}
          {isAdmin && (
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors">
              <Download size={14} /> CSV
            </button>
          )}
          <a href={`/sorteio/${rifa.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <ExternalLink size={14} /> Página
          </a>
          {isAdmin && (
            <button onClick={limparDados} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">
              <Trash2 size={14} /> Excluir Sorteio
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
        { label: 'Disponíveis', val: stats.disp, color: 'text-gray-700' },
        { label: 'Vendidos', val: stats.vend, color: 'text-amber-500' },
        { label: 'Pagos', val: stats.pagos, color: 'text-green-600' },
        { label: 'Pendentes', val: stats.pend, color: 'text-orange-500' },
        { label: 'Arrecadado', val: `R$ ${stats.arr.toFixed(2)}`, color: 'text-teal-600' },
        { label: 'Pendente R$', val: `R$ ${stats.pendVal.toFixed(2)}`, color: 'text-red-500' }].
        map((s) =>
        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-gray-400 mb-1 text-xs font-bold">{s.label}</p>
            <p className={`font-bold text-base ${s.color}`}>{s.val}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) =>
        <button key={t.key} onClick={() => setFilterTab(t.key)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        filterTab === t.key ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'}`
        }>

            {t.label}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-gray-300 bg-white" />Disponível</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-400" />Vendido (não pago)</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-green-500" />Pago</div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Números do Sorteio <span className="text-gray-400 font-normal text-sm">({filtered.length} exibidos)</span></h3>
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
          {filtered.map((num) =>
          <button key={num.id} onClick={() => setSelectedNum(num)}
          title={num.nome_comprador ? `${num.numero} - ${num.nome_comprador}` : `Número ${num.numero}`}
          className={`h-10 w-full rounded border text-sm font-semibold transition-all hover:scale-105 ${getNumColor(num)}`}>

              {num.numero}
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {sorteioOpen && <SorteioModalRifa rifa={rifa} numeros={numeros} onClose={() => setSorteioOpen(false)} onSaved={(updatedRifa) => {
        if (updatedRifa) setRifa(updatedRifa);
        else load();
      }} />}
      {editOpen && <EditRifaModal rifa={rifa} onClose={() => setEditOpen(false)} onSaved={load} />}
      {selectedNum && <NumeroDetailModal numero={selectedNum} rifa={rifa} onClose={() => setSelectedNum(null)} onSaved={load} />}
    </div>);

}