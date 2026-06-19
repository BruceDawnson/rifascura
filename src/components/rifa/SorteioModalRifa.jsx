const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { X, Trophy } from 'lucide-react';

export default function SorteioModalRifa({ rifa, numeros, onClose, onSaved }) {
  const [metodo, setMetodo] = useState('automatico');
  const [observacao, setObservacao] = useState('');
  const [numeroManual, setNumeroManual] = useState('');
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);

  const pagos = numeros.filter(n => n.pago);
  const vendidos = numeros.filter(n => n.vendido);

  const sortear = async () => {
    setSaving(true);
    let vencedor;
    if (metodo === 'automatico') {
      const pool = pagos.length > 0 ? pagos : vendidos;
      if (pool.length === 0) { alert('Nenhum número para sortear!'); setSaving(false); return; }
      vencedor = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const n = parseInt(numeroManual);
      vencedor = numeros.find(x => x.numero === n);
      if (!vencedor) { alert('Número não encontrado!'); setSaving(false); return; }
    }
    const updates = {
      numero_vencedor: vencedor.numero,
      nome_vencedor: vencedor.nome_comprador || '',
      telefone_vencedor: vencedor.telefone || '',
      metodo_sorteio: metodo,
      data_sorteio: new Date().toISOString(),
      observacao_sorteio: observacao,
      status: 'finalizada',
    };
    await db.entities.Rifa.update(rifa.id, updates);
    const rifaAtualizada = { ...rifa, ...updates };
    setResultado(vencedor);
    setSaving(false);
    onSaved(rifaAtualizada);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Trophy size={20} className="text-amber-500" /> Realizar Sorteio</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {resultado ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
              <Trophy size={28} className="text-teal-600" />
            </div>
            <p className="text-teal-600 font-bold text-4xl mb-2">{resultado.numero}</p>
            {resultado.nome_comprador && <p className="text-gray-800 font-semibold">{resultado.nome_comprador}</p>}
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">Fechar</button>
          </div>
        ) : (
          <>
            <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-lg px-4 py-2 mb-4">
              {pagos.length} números pagos participarão do sorteio
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                <select value={metodo} onChange={e => setMetodo(e.target.value)} className={inputClass}>
                  <option value="automatico">Sorteio Automático</option>
                  <option value="manual">Manual (Loteria Federal)</option>
                </select>
              </div>
              {metodo === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número Vencedor</label>
                  <input type="number" value={numeroManual} onChange={e => setNumeroManual(e.target.value)} placeholder="Digite o número" className={inputClass} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <textarea value={observacao} onChange={e => setObservacao(e.target.value)}
                  rows={2} placeholder="Ex: Sorteio realizado via Loteria Federal"
                  className={`${inputClass} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">Cancelar</button>
              <button onClick={sortear} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
                {saving ? 'Sorteando...' : 'Sortear'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}