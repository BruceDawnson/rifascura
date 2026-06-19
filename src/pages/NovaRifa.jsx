const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function NovaRifa() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', descricao: '', quantidade_numeros: 100, valor_numero: 10,
    vendedor_responsavel: '', data_inicio: '', data_fim: '', status: 'ativa', imagem_url: ''
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const slug = slugify(form.nome) + '-' + Date.now();
    const rifa = await db.entities.Rifa.create({ ...form, slug });
    const total = Number(form.quantidade_numeros);
    const batch = Array.from({ length: total }, (_, i) => ({
      rifa_id: rifa.id, numero: i + 1, vendido: false, pago: false,
    }));
    // Criar em lotes de 50 sequencialmente para evitar rate limit
    const BATCH_SIZE = 50;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      await db.entities.NumeroRifa.bulkCreate(batch.slice(i, i + BATCH_SIZE));
      if (i + BATCH_SIZE < batch.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    setSaving(false);
    navigate(`/admin/sorteios/${rifa.id}`);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400";

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Link to="/admin/sorteios" className="flex items-center gap-1 text-sm text-teal-600 hover:underline">
          <ArrowLeft size={15} /> Voltar
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1 mt-3">Novo Sorteio</h1>
      <p className="text-gray-500 text-sm mb-6">Crie uma nova campanha de sorteio</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Sorteio *</label>
          <input required value={form.nome} onChange={e => set('nome', e.target.value)}
            placeholder="Ex: Sorteio Festa de Iemanjá" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição *</label>
          <textarea required value={form.descricao} onChange={e => set('descricao', e.target.value)}
            rows={4} placeholder="Descreva o objetivo do sorteio e o prêmio..."
            className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantidade de Números *</label>
            <input required type="number" min={1} value={form.quantidade_numeros}
              onChange={e => set('quantidade_numeros', parseInt(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor por Número (R$) *</label>
            <input required type="number" min={0.01} step={0.01} value={form.valor_numero}
              onChange={e => set('valor_numero', parseFloat(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendedor Responsável</label>
          <input value={form.vendedor_responsavel} onChange={e => set('vendedor_responsavel', e.target.value)}
            placeholder="Nome do vendedor responsável pelo sorteio" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Início *</label>
            <input required type="date" value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Final *</label>
            <input required type="date" value={form.data_fim} onChange={e => set('data_fim', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Inicial *</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
            <option value="ativa">Ativa</option>
            <option value="encerrada">Encerrada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL da Imagem de Capa</label>
          <input value={form.imagem_url} onChange={e => set('imagem_url', e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg" className={inputClass} />
          {form.imagem_url && <img src={form.imagem_url} alt="" className="mt-2 h-28 rounded-lg object-cover w-full" onError={e => e.target.style.display='none'} />}
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/admin/sorteios" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? `Criando ${form.quantidade_numeros} números...` : 'Criar Sorteio'}
          </button>
        </div>
      </form>
    </div>
  );
}