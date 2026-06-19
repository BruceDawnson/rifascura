const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { Trophy, Shuffle, Hash } from 'lucide-react';

export default function SorteioPanel({ rifa, numeros, onSaved }) {
  const [metodo, setMetodo] = useState('aleatorio');
  const [numeroManual, setNumeroManual] = useState('');
  const [saving, setSaving] = useState(false);

  const realizarSorteio = async () => {
    setSaving(true);
    let numeroVencedor;
    let nomeVencedor = '';
    let telefoneVencedor = '';

    if (metodo === 'aleatorio') {
      const pagos = numeros.filter(n => n.pago);
      const vendidos = numeros.filter(n => n.vendido);
      const pool = pagos.length > 0 ? pagos : vendidos;
      if (pool.length === 0) {
        alert('Nenhum número vendido para sortear!');
        setSaving(false);
        return;
      }
      const sorteado = pool[Math.floor(Math.random() * pool.length)];
      numeroVencedor = sorteado.numero;
      nomeVencedor = sorteado.nome_comprador || '';
      telefoneVencedor = sorteado.telefone || '';
    } else {
      if (!numeroManual) {
        alert('Informe o número vencedor!');
        setSaving(false);
        return;
      }
      numeroVencedor = parseInt(numeroManual);
      const found = numeros.find(n => n.numero === numeroVencedor);
      nomeVencedor = found?.nome_comprador || '';
      telefoneVencedor = found?.telefone || '';
    }

    await db.entities.Rifa.update(rifa.id, {
      numero_vencedor: numeroVencedor,
      nome_vencedor: nomeVencedor,
      telefone_vencedor: telefoneVencedor,
      metodo_sorteio: metodo,
      data_sorteio: new Date().toISOString(),
      status: 'finalizada',
    });

    setSaving(false);
    onSaved();
  };

  const limparSorteio = async () => {
    if (!confirm('Limpar resultado do sorteio?')) return;
    await db.entities.Rifa.update(rifa.id, {
      numero_vencedor: null, nome_vencedor: null,
      telefone_vencedor: null, metodo_sorteio: null,
      data_sorteio: null,
    });
    onSaved();
  };

  return (
    <div className="bg-[#1a1030] border border-purple-900/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={20} className="text-yellow-400" />
        <h3 className="text-white font-semibold">Módulo de Sorteio</h3>
      </div>

      {rifa.numero_vencedor ? (
        <div className="bg-gradient-to-br from-yellow-900/30 to-green-900/30 border border-yellow-600/40 rounded-xl p-5 text-center mb-4">
          <Trophy size={36} className="text-yellow-400 mx-auto mb-2" />
          <p className="text-yellow-400 text-xs font-medium uppercase tracking-wider mb-1">🎉 Número Vencedor</p>
          <p className="text-white text-4xl font-bold">{rifa.numero_vencedor}</p>
          {rifa.nome_vencedor && <p className="text-green-400 font-semibold mt-2">{rifa.nome_vencedor}</p>}
          {rifa.telefone_vencedor && <p className="text-purple-300 text-sm">{rifa.telefone_vencedor}</p>}
          <p className="text-purple-400 text-xs mt-2">
            {rifa.metodo_sorteio === 'aleatorio' ? 'Sorteio Aleatório' : 'Registro Manual'} •{' '}
            {rifa.data_sorteio ? new Date(rifa.data_sorteio).toLocaleDateString('pt-BR') : ''}
          </p>
          <button onClick={limparSorteio} className="mt-3 text-xs text-red-400 hover:text-red-300 underline">
            Limpar resultado
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setMetodo('aleatorio')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                metodo === 'aleatorio' ? 'bg-purple-600 text-white border-purple-500' : 'text-purple-300 border-purple-800/50 hover:border-purple-600'
              }`}
            >
              <Shuffle size={14} /> Aleatório
            </button>
            <button
              onClick={() => setMetodo('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                metodo === 'manual' ? 'bg-purple-600 text-white border-purple-500' : 'text-purple-300 border-purple-800/50 hover:border-purple-600'
              }`}
            >
              <Hash size={14} /> Manual / Loteria Federal
            </button>
          </div>

          {metodo === 'manual' && (
            <input
              type="number"
              value={numeroManual}
              onChange={e => setNumeroManual(e.target.value)}
              placeholder="Digite o número vencedor"
              className="w-full bg-[#0f0a1e] border border-purple-900/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
          )}

          <button
            onClick={realizarSorteio}
            disabled={saving}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Realizando sorteio...' : '🎰 Realizar Sorteio'}
          </button>
        </div>
      )}
    </div>
  );
}