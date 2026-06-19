const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { Plus, Ticket, ArrowRight, Trash2 } from 'lucide-react';
import { useAdminRole } from '@/components/Layout';

const STATUS_LABEL = { ativa: 'Ativa', encerrada: 'Encerrada', finalizada: 'Finalizada' };
const STATUS_COLOR = {
  ativa: 'bg-green-100 text-green-700',
  encerrada: 'bg-amber-100 text-amber-700',
  finalizada: 'bg-gray-100 text-gray-600',
};

export default function AdminRifas() {
  const { role } = useAdminRole();
  const isAdmin = role === 'admin';
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  const load = async () => {
    let all = [];
    let pg = 0;
    const ps = 200;
    while (true) {
      const batch = await db.entities.Rifa.list('-created_date', ps, pg * ps);
      all = all.concat(batch);
      if (batch.length < ps) break;
      pg++;
    }
    setRifas(all);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const deleteRifa = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Excluir este sorteio e todos os seus números?')) return;
    // Buscar TODOS os números de uma só vez (sem paginação incremental que causa duplicatas)
    const allNums = await db.entities.NumeroRifa.filter({ rifa_id: id }, 'numero', 1000, 0);
    // Deletar em paralelo (mais rápido e sem problemas de offset)
    await Promise.allSettled(allNums.map(n => db.entities.NumeroRifa.delete(n.id)));
    await db.entities.Rifa.delete(id);
    load();
  };

  const filtered = rifas.filter(r => filter === 'todas' || r.status === filter);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Sorteios</h1>
          <p className="text-gray-500 text-sm">Visualize e gerencie todos os sorteios</p>
        </div>
        {isAdmin && (
          <Link to="/admin/sorteios/novo" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Novo Sorteio
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['todas', 'ativa', 'encerrada'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize ${
              filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
            }`}
          >
            {f === 'todas' ? 'Todas' : f === 'ativa' ? 'Ativas' : 'Encerradas'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum sorteio encontrado</p>
            <p className="text-gray-400 text-sm mb-4">Crie seu primeiro sorteio para começar</p>
            {isAdmin && (
              <Link to="/admin/sorteios/novo" className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">
                Criar Sorteio
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(r => (
              <Link key={r.id} to={`/admin/sorteios/${r.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {r.imagem_url
                    ? <img src={r.imagem_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    : <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center"><Ticket size={18} className="text-teal-500" /></div>
                  }
                  <div>
                    <p className="font-semibold text-gray-800">{r.nome}</p>
                    <p className="text-sm text-gray-400">{r.quantidade_numeros} números · R$ {r.valor_numero?.toFixed(2)}/nº</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                  {isAdmin && (
                    <button onClick={(e) => deleteRifa(r.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <ArrowRight size={16} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}