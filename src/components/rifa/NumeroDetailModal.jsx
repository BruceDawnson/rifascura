const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { X } from 'lucide-react';

export default function NumeroDetailModal({ numero, rifa, onClose, onSaved }) {
  const [form, setForm] = useState({
    nome_comprador: numero.nome_comprador || '',
    telefone: numero.telefone || '',
    nome_vendedor: numero.nome_vendedor || '',
    data_compra: numero.data_compra || '',
    valor_pago: numero.valor_pago ?? rifa?.valor_numero ?? '',
    observacao: numero.observacao || '',
    vendido: numero.vendido || false,
    pago: numero.pago || false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!numero?.id) {
      alert('Erro: ID do número não encontrado. Recarregue a página e tente novamente.');
      return;
    }
    setSaving(true);
    await db.entities.NumeroRifa.update(numero.id, form);
    setSaving(false);
    onSaved();
    onClose();
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">Número {numero.numero}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Comprador</label>
            <input value={form.nome_comprador} onChange={e => set('nome_comprador', e.target.value)} placeholder="Nome do comprador" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(XX) 99999-9999" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Vendedor</label>
            <input value={form.nome_vendedor} onChange={e => set('nome_vendedor', e.target.value)} placeholder="Nome do vendedor" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Compra</label>
            <input type="date" value={form.data_compra} onChange={e => set('data_compra', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago (R$)</label>
            <input type="number" step="0.01" value={form.valor_pago} onChange={e => set('valor_pago', parseFloat(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
            <input value={form.observacao} onChange={e => set('observacao', e.target.value)} placeholder="Opcional" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendido</label>
              <select value={form.vendido ? 'sim' : 'nao'} onChange={e => {
                const v = e.target.value === 'sim';
                set('vendido', v);
                if (!v) set('pago', false);
              }} className={inputClass}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pago</label>
              <select value={form.pago ? 'sim' : 'nao'} onChange={e => set('pago', e.target.value === 'sim')} className={inputClass}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">Cancelar</button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}