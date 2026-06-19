const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { ArrowLeft, Edit, AlertTriangle, Trash2 } from 'lucide-react';

export default function Configuracoes() {
  const [nomeSistema, setNomeSistema] = useState('Sistema de Sorteios CURA');
  const [saved, setSaved] = useState(false);
  const [limpando, setLimpando] = useState(false);

  const salvarNome = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const limparTudo = async () => {
    const confirmacao = prompt('ATENÇÃO: Isto apagará TODOS os dados. Digite "CONFIRMAR" para continuar:');
    if (confirmacao !== 'CONFIRMAR') return;
    setLimpando(true);
    const [rifas, numeros] = await Promise.all([
      db.entities.Rifa.list(),
      db.entities.NumeroRifa.list(),
    ]);
    await Promise.all([
      ...rifas.map(r => db.entities.Rifa.delete(r.id)),
      ...numeros.map(n => db.entities.NumeroRifa.delete(n.id)),
    ]);
    setLimpando(false);
    alert('Todos os dados foram apagados.');
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center gap-1 mb-1">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-teal-600 hover:underline">
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mt-2">Configurações</h1>
      <p className="text-gray-500 text-sm mb-6">Gerencie as configurações do sistema</p>

      {/* Nome do sistema */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Edit size={18} className="text-teal-600" />
          <h2 className="font-semibold text-gray-800">Nome do Sistema</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">Personalize o nome exibido no sistema</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Sistema</label>
          <input
            value={nomeSistema}
            onChange={e => setNomeSistema(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button onClick={salvarNome} className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
          {saved ? '✓ Salvo!' : 'Salvar Nome'}
        </button>
      </div>

      {/* Zona de perigo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="font-semibold text-gray-800">Zona de Perigo</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">Ações irreversíveis que afetam todo o sistema</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium mb-1">Atenção: Ao limpar todos os dados, você perderá permanentemente:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-red-600">
                <li>Todos os sorteios cadastrados</li>
                <li>Todos os números vendidos e pagos</li>
                <li>Histórico de sorteios</li>
                <li>Relatórios financeiros</li>
              </ul>
              <p className="mt-2 font-semibold">Esta ação não pode ser desfeita!</p>
            </div>
          </div>
        </div>

        <button onClick={limparTudo} disabled={limpando}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Trash2 size={14} />
          {limpando ? 'Limpando...' : 'Limpar Todos os Dados'}
        </button>
      </div>
    </div>
  );
}