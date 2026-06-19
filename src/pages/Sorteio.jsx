const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from 'react';

import { Trophy, ArrowLeft, Shuffle, AlignJustify, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sorteio() {
  const [rifas, setRifas] = useState([]);
  const [numeros, setNumeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [metodo, setMetodo] = useState('automatico');
  const [observacao, setObservacao] = useState('');
  const [numeroManual, setNumeroManual] = useState('');
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [, setMostrarTelefone] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      let rifas = [];
      let pg = 0;
      while (true) {
        const batch = await db.entities.Rifa.list('-created_date', 200, pg * 200);
        rifas = rifas.concat(batch);
        if (batch.length < 200) break;
        pg++;
      }
      // Paginate numbers to avoid limit
      let allNums = [];
      let page = 0;
      const pageSize = 500;
      while (true) {
        const batch = await db.entities.NumeroRifa.list('numero', pageSize, page * pageSize);
        allNums = allNums.concat(batch);
        if (batch.length < pageSize) break;
        page++;
      }
      setRifas(rifas);
      setNumeros(allNums);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getNumerosRifa = (rifaId) => numeros.filter(n => n.rifa_id === rifaId);

  const sortear = async () => {
    const ns = getNumerosRifa(selected.id);
    const pagos = ns.filter(n => n.pago);
    const vendidos = ns.filter(n => n.vendido);
    setSaving(true);
    let vencedor;
    if (metodo === 'automatico') {
      const pool = pagos.length > 0 ? pagos : vendidos;
      if (pool.length === 0) { alert('Nenhum número para sortear!'); setSaving(false); return; }
      vencedor = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const n = parseInt(numeroManual);
      vencedor = ns.find(x => x.numero === n);
      if (!vencedor) { alert('Número não encontrado!'); setSaving(false); return; }
    }
    await db.entities.Rifa.update(selected.id, {
      numero_vencedor: vencedor.numero,
      nome_vencedor: vencedor.nome_comprador || '',
      telefone_vencedor: vencedor.telefone || '',
      metodo_sorteio: metodo,
      data_sorteio: new Date().toISOString(),
      observacao_sorteio: observacao,
      status: 'finalizada',
    });
    setResultado(vencedor);
    setMostrarTelefone(false);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => { setSelected(null); setResultado(null); }} className="flex items-center gap-1 text-sm text-teal-600 hover:underline mb-4">
        <ArrowLeft size={14} /> Voltar
      </button>
      <div className="flex items-center gap-3 mb-1">
        <Trophy size={24} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-800">Sistema de Sorteio</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">Apenas números marcados como <strong>pagos</strong> participam do sorteio</p>

      {!selected ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <p className="font-medium text-gray-700">Selecione o sorteio para realizar</p>
          </div>
          <div className="divide-y divide-gray-100">
            {rifas.length === 0 && (
              <div className="text-center py-12 text-gray-400">Nenhum sorteio cadastrado</div>
            )}
            {rifas.map(r => {
              const ns = getNumerosRifa(r.id);
              const pagos = ns.filter(n => n.pago).length;
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Ticket size={16} className="text-teal-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{r.nome}</p>
                      <p className="text-sm text-gray-400">{pagos} número{pagos !== 1 ? 's' : ''} pago{pagos !== 1 ? 's' : ''} de {ns.length} total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${r.status === 'ativa' ? 'bg-green-100 text-green-700' : r.status === 'encerrada' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${r.status === 'ativa' ? 'bg-green-500' : r.status === 'encerrada' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                      {r.status === 'ativa' ? 'Ativa' : r.status === 'encerrada' ? 'Encerrada' : 'Finalizada'}
                    </span>
                    <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : resultado ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">{selected.nome}</h2>
          <p className="text-gray-400 text-sm mb-6">{selected.descricao}</p>
          <p className="text-teal-600 font-bold text-5xl mb-2">{resultado.numero}</p>
          {resultado.nome_comprador && <p className="text-gray-800 font-semibold text-lg">{resultado.nome_comprador}</p>}
          <p className="text-gray-400 text-sm mt-2">{metodo === 'automatico' ? 'Sorteio Automático' : 'Manual'} · {new Date().toLocaleDateString('pt-BR')}</p>
          <div className="flex gap-3 mt-6 justify-center">
            <button onClick={() => { setSelected(null); setResultado(null); setObservacao(''); setNumeroManual(''); }}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">
              Novo Sorteio
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-teal-500 p-8 text-center text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Trophy size={22} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">{selected.nome}</h2>
            <p className="text-teal-100 text-sm">{selected.descricao}</p>
          </div>
          <div className="p-6">
            {(() => {
              const ns = getNumerosRifa(selected.id);
              const pagos = ns.filter(n => n.pago).length;
              const pend = ns.filter(n => n.vendido && !n.pago).length;
              const arr = ns.filter(n => n.pago).reduce((s, n) => s + (n.valor_pago || 0), 0);
              return (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-teal-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-teal-600">{pagos}</p>
                    <p className="text-xs text-gray-500 mt-1">Números Pagos</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">{pend}</p>
                    <p className="text-xs text-gray-500 mt-1">Pendentes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-700">R$ {arr.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Arrecadado</p>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Método de Sorteio</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setMetodo('automatico')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${metodo === 'automatico' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 text-gray-600'}`}>
                    <Shuffle size={14} /> Automático
                  </button>
                  <button onClick={() => setMetodo('manual')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${metodo === 'manual' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 text-gray-600'}`}>
                    <AlignJustify size={14} /> Manual
                  </button>
                </div>
              </div>
              {metodo === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número Vencedor</label>
                  <input type="number" value={numeroManual} onChange={e => setNumeroManual(e.target.value)} placeholder="Digite o número" className={inputClass} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2}
                  placeholder="Ex: Sorteio realizado ao vivo na festa" className={`${inputClass} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">Voltar</button>
              <button onClick={sortear} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                <Trophy size={15} /> {saving ? 'Sorteando...' : 'Iniciar Sorteio!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}