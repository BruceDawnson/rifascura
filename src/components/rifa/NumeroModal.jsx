const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { X } from 'lucide-react';

export default function NumeroModal({ numero, rifa, onClose, onSaved, adminMode = false }) {
  const [form, setForm] = useState({
    nome_comprador: numero.nome_comprador || '',
    telefone: numero.telefone || '',
    data_compra: numero.data_compra || new Date().toISOString().split('T')[0],
    valor_pago: numero.valor_pago || rifa?.valor_numero || '',
    observacao: numero.observacao || '',
    vendido: numero.vendido || false,
    pago: numero.pago || false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await db.entities.NumeroRifa.update(numero.id, form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-[#1a1030] border border-purple-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-lg">Número {numero.numero}</h3>
            {adminMode && <p className="text-purple-400 text-xs">{rifa?.nome}</p>}
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-purple-300 mb-1.5">Nome do Comprador</label>
            <input
              value={form.nome_comprador}
              onChange={e => set('nome_comprador', e.target.value)}
              placeholder="Nome completo"
              className="w-full bg-[#0f0a1e] border border-purple-900/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-purple-300 mb-1.5">Telefone / WhatsApp</label>
            <input
              value={form.telefone}
              onChange={e => set('telefone', e.target.value)}
              placeholder="(XX) 99999-9999"
              className="w-full bg-[#0f0a1e] border border-purple-900/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-purple-300 mb-1.5">Data da Compra</label>
              <input
                type="date"
                value={form.data_compra}
                onChange={e => set('data_compra', e.target.value)}
                className="w-full bg-[#0f0a1e] border border-purple-900/50 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-300 mb-1.5">Valor Pago (R$)</label>
              <input
                type="number" step="0.01"
                value={form.valor_pago}
                onChange={e => set('valor_pago', parseFloat(e.target.value))}
                className="w-full bg-[#0f0a1e] border border-purple-900/50 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-purple-300 mb-1.5">Observação</label>
            <input
              value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              placeholder="Opcional"
              className="w-full bg-[#0f0a1e] border border-purple-900/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('vendido', !form.vendido)}
                className={`w-10 h-5 rounded-full transition-colors ${form.vendido ? 'bg-yellow-400' : 'bg-purple-900'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.vendido ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-purple-200">Vendido</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('pago', !form.pago)}
                className={`w-10 h-5 rounded-full transition-colors ${form.pago ? 'bg-green-500' : 'bg-purple-900'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.pago ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-purple-200">Pago</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-purple-300 border border-purple-700/50 hover:bg-purple-900/30 transition-colors">
            Cancelar
          </button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}