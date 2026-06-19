const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { X, Plus, Minus, AlertTriangle } from 'lucide-react';

export default function EditRifaModal({ rifa, onClose, onSaved }) {
  const [form, setForm] = useState({ ...rifa });
  const [novaQtd, setNovaQtd] = useState(rifa.quantidade_numeros || 0);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const qtdAtual = rifa.quantidade_numeros || 0;
  const diferenca = novaQtd - qtdAtual;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (diferenca > 0) {
      // Criar números novos em lotes
      const batch = Array.from({ length: diferenca }, (_, i) => ({
        rifa_id: rifa.id,
        numero: qtdAtual + i + 1,
        vendido: false,
        pago: false,
      }));
      const BATCH_SIZE = 50;
      for (let i = 0; i < batch.length; i += BATCH_SIZE) {
        await db.entities.NumeroRifa.bulkCreate(batch.slice(i, i + BATCH_SIZE));
        if (i + BATCH_SIZE < batch.length) await new Promise(r => setTimeout(r, 300));
      }
    } else if (diferenca < 0) {
      // Deletar números excedentes — apenas os que NÃO foram vendidos
      // Busca todos os números desta rifa ordenados decrescente
      const todasNums = await db.entities.NumeroRifa.filter({ rifa_id: rifa.id }, '-numero', 1000, 0);
      // Pega os números acima do novo limite que não estão vendidos
      const excedentes = todasNums
        .filter(n => n.numero > novaQtd && !n.vendido)
        .slice(0, Math.abs(diferenca));
      await Promise.allSettled(excedentes.map(n => db.entities.NumeroRifa.delete(n.id)));
    }

    await db.entities.Rifa.update(rifa.id, { ...form, quantidade_numeros: novaQtd });
    setSaving(false);
    onSaved();
    onClose();
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">Editar Sorteio</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input value={form.nome || ''} onChange={e => set('nome', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.descricao || ''} onChange={e => set('descricao', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Número</label>
              <input type="number" step="0.01" value={form.valor_numero || ''} onChange={e => set('valor_numero', parseFloat(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status || 'ativa'} onChange={e => set('status', e.target.value)} className={inputClass}>
                <option value="ativa">Ativa</option>
                <option value="encerrada">Encerrada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* Quantidade de números */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Números</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setNovaQtd(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0">
                <Minus size={14} />
              </button>
              <input
                type="number"
                min={1}
                value={novaQtd}
                onChange={e => setNovaQtd(Math.max(1, parseInt(e.target.value) || 1))}
                className={inputClass}
              />
              <button type="button" onClick={() => setNovaQtd(q => q + 1)}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0">
                <Plus size={14} />
              </button>
            </div>

            {diferenca > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                <Plus size={13} />
                Serão criados <strong>{diferenca}</strong> novos números ({qtdAtual + 1} a {novaQtd})
              </div>
            )}
            {diferenca < 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={13} />
                Serão removidos <strong>{Math.abs(diferenca)}</strong> números não vendidos do final da lista
              </div>
            )}
            {diferenca === 0 && (
              <p className="text-xs text-gray-400 mt-1">Atual: {qtdAtual} números</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input type="date" value={form.data_inicio || ''} onChange={e => set('data_inicio', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input type="date" value={form.data_fim || ''} onChange={e => set('data_fim', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor Responsável</label>
            <input value={form.vendedor_responsavel || ''} onChange={e => set('vendedor_responsavel', e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}