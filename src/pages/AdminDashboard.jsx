const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { Ticket, ShoppingCart, CheckCircle, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { useAdminRole } from '@/components/Layout';

export default function AdminDashboard() {
  const { role } = useAdminRole();
  const isAdmin = role === 'admin';
  const [rifas, setRifas] = useState([]);
  const [numeros, setNumeros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Paginar rifas
      let allRifas = [];
      let pg = 0;
      const ps = 200;
      while (true) {
        const batch = await db.entities.Rifa.list('-created_date', ps, pg * ps);
        allRifas = allRifas.concat(batch);
        if (batch.length < ps) break;
        pg++;
      }
      // Paginar números
      let allNums = [];
      pg = 0;
      while (true) {
        const batch = await db.entities.NumeroRifa.list('numero', 500, pg * 500);
        allNums = allNums.concat(batch);
        if (batch.length < 500) break;
        pg++;
      }
      setRifas(allRifas);
      setNumeros(allNums);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const vendidos = numeros.filter((n) => n.vendido).length;
  const pagos = numeros.filter((n) => n.pago).length;
  const valorArrecadado = numeros.filter((n) => n.pago).reduce((s, n) => s + (n.valor_pago || 0), 0);
  const valorPendente = numeros
    .filter((n) => n.vendido && !n.pago)
    .reduce((s, n) => s + (n.valor_pago || 0), 0);

  const rifasAtivas = rifas.filter((r) => r.status === 'ativa');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do sistema de sorteios</p>
        </div>
        {isAdmin && (
          <Link to="/admin/sorteios/novo"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Novo Sorteio
          </Link>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 mb-3 text-sm font-bold">Total de Sorteios</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-800">{rifas.length}</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Ticket size={20} className="text-teal-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 mb-3 text-sm font-bold">Números Vendidos</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-amber-500">{vendidos}</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <ShoppingCart size={20} className="text-amber-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 mb-3 text-sm font-bold">Números Pagos</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-600">{pagos}</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 mb-3 text-sm font-bold">Valor Arrecadado</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-teal-600">R$ {valorArrecadado.toFixed(2)}</p>
              <p className="text-xs text-amber-500 mt-0.5">Pendente: R$ {valorPendente.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <DollarSign size={20} className="text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rifas Ativas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Sorteios Ativos</h2>
          <Link to="/admin/sorteios" className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        {rifasAtivas.length === 0 ?
        <div className="text-center py-12">
            <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum sorteio ativo</p>
            <p className="text-gray-400 text-sm mb-4">Crie seu primeiro sorteio para começar</p>
            {isAdmin && (
              <Link to="/admin/sorteios/novo" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Criar Sorteio
              </Link>
            )}
          </div> :

        <div className="space-y-3">
            {rifasAtivas.map((r) => {
            const ns = numeros.filter((n) => n.rifa_id === r.id);
            const vend = ns.filter((n) => n.vendido).length;
            const pct = ns.length > 0 ? vend / ns.length * 100 : 0;
            return (
              <Link key={r.id} to={`/admin/sorteios/${r.id}`} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <div>
                    <p className="font-medium text-gray-800">{r.nome}</p>
                    <p className="text-sm text-gray-500">{vend}/{ns.length} vendidos</p>
                    <div className="mt-1.5 w-32 h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>);

          })}
          </div>
        }
      </div>
    </div>);

}