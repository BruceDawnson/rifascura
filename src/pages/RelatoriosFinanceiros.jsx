const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState, useMemo } from 'react';

import { ArrowLeft, Download, FileText, Edit } from 'lucide-react';
import NumeroDetailModal from '@/components/rifa/NumeroDetailModal';

export default function RelatoriosFinanceiros() {
  const [rifas, setRifas] = useState([]);
  const [numeros, setNumeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rifaFiltro, setRifaFiltro] = useState('todas');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [selectedNum, setSelectedNum] = useState(null);
  const [selectedNumRifa, setSelectedNumRifa] = useState(null);

  const load = async () => {
    let r = [];
    let pg = 0;
    while (true) {
      const batch = await db.entities.Rifa.list('-created_date', 200, pg * 200);
      r = r.concat(batch);
      if (batch.length < 200) break;
      pg++;
    }
    // Paginate to load all numbers
    let allNums = [];
    let page = 0;
    const pageSize = 500;
    while (true) {
      const batch = await db.entities.NumeroRifa.list('numero', pageSize, page * pageSize);
      allNums = allNums.concat(batch);
      if (batch.length < pageSize) break;
      page++;
    }
    setRifas(r);
    setNumeros(allNums);
    setLoading(false);
  };
  useEffect(() => {load();}, []);

  const numerosVendidos = useMemo(() => {
    let ns = numeros.filter((n) => n.vendido);
    if (rifaFiltro !== 'todas') ns = ns.filter((n) => n.rifa_id === rifaFiltro);
    if (statusFiltro === 'pago') ns = ns.filter((n) => n.pago);
    if (statusFiltro === 'pendente') ns = ns.filter((n) => !n.pago);
    return ns;
  }, [numeros, rifaFiltro, statusFiltro]);

  const totalVendidos = numerosVendidos.length;
  const totalPagos = numerosVendidos.filter((n) => n.pago).length;
  const totalPendentes = numerosVendidos.filter((n) => !n.pago).length;
  const valorArrecadado = numerosVendidos.filter((n) => n.pago).reduce((s, n) => s + (n.valor_pago || 0), 0);
  const valorPendente = numerosVendidos
    .filter((n) => !n.pago)
    .reduce((s, n) => s + (n.valor_pago || 0), 0);

  // Desempenho por vendedor
  const porVendedor = useMemo(() => {
    const map = {};
    numerosVendidos.forEach((n) => {
      const v = n.nome_vendedor || '(sem vendedor)';
      if (!map[v]) map[v] = { vendidos: 0, pagos: 0, pendentes: 0, arrecadado: 0 };
      map[v].vendidos++;
      if (n.pago) {map[v].pagos++;map[v].arrecadado += n.valor_pago || 0;} else
      map[v].pendentes++;
    });
    return Object.entries(map).map(([nome, d]) => ({ nome, ...d })).sort((a, b) => b.arrecadado - a.arrecadado);
  }, [numerosVendidos]);

  const exportCSV = () => {
    const bom = '\uFEFF';
    const headers = ['Rifa', 'Nº', 'Comprador', 'Telefone', 'Vendedor', 'Data', 'Status', 'Valor'];
    const rows = numerosVendidos.map((n) => {
      const rifa = rifas.find((r) => r.id === n.rifa_id);
      return [
      rifa?.nome || '', n.numero, n.nome_comprador || '', n.telefone || '',
      n.nome_vendedor || '',
      n.data_compra ? new Date(n.data_compra).toLocaleDateString('pt-BR') : '',
      n.pago ? 'Pago' : 'Pendente',
      n.valor_pago ? `R$ ${n.valor_pago.toFixed(2)}` : 'R$ 0,00'];

    });
    const csv = bom + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'relatorio-sorteios.csv';a.click();
  };

  const exportExcel = () => {
    const bom = '\uFEFF';
    const headers = ['Rifa', 'Nº', 'Comprador', 'Telefone', 'Vendedor', 'Data', 'Status', 'Valor'];
    const rows = numerosVendidos.map((n) => {
      const rifa = rifas.find((r) => r.id === n.rifa_id);
      return [rifa?.nome || '', n.numero, n.nome_comprador || '', n.telefone || '', n.nome_vendedor || '',
      n.data_compra ? new Date(n.data_compra).toLocaleDateString('pt-BR') : '',
      n.pago ? 'Pago' : 'Pendente', n.valor_pago ? n.valor_pago.toFixed(2) : '0'];
    });
    const tsv = bom + [headers, ...rows].map((r) => r.join('\t')).join('\n');
    const a = document.createElement('a');a.href = URL.createObjectURL(new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' }));
    a.download = 'relatorio-sorteios.xlsx';a.click();
  };

  const exportPDF = () => {
    const rifaNome = rifaFiltro === 'todas' ? 'Todos os Sorteios' : rifas.find((r) => r.id === rifaFiltro)?.nome;
    const statusLabel = statusFiltro === 'todos' ? 'Todos' : statusFiltro === 'pago' ? 'Pago' : 'Pendente';
    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    const vendedorRows = porVendedor.map((v) =>
    `<tr><td>${v.nome}</td><td>${v.vendidos}</td><td>${v.pagos}</td><td>${v.pendentes}</td><td><strong>R$ ${v.arrecadado.toFixed(2)}</strong></td></tr>`
    ).join('');

    const detailRows = numerosVendidos.map((n) => {
      const rifa = rifas.find((r) => r.id === n.rifa_id);
      const status = n.pago ? 'Pago' : 'Pendente';
      return `<tr>
        <td>${rifa?.nome || ''}</td>
        <td>${n.numero}</td>
        <td>${n.nome_comprador || ''}</td>
        <td>${n.telefone || ''}</td>
        <td>${n.nome_vendedor || ''}</td>
        <td>${n.data_compra ? new Date(n.data_compra).toLocaleDateString('pt-BR') : ''}</td>
        <td><span class="${n.pago ? 'badge-pago' : 'badge-pendente'}">${status}</span></td>
        <td><strong>R$ ${n.pago ? (n.valor_pago || 0).toFixed(2) : '0,00'}</strong></td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
      h1 { color: #2d7d6e; font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 14px; color: #666; font-weight: normal; margin: 0 0 4px; }
      .meta { font-size: 13px; color: #999; margin-bottom: 20px; }
      .filter-info { font-size: 13px; color: #555; margin-bottom: 20px; }
      hr { border: none; border-top: 2px solid #2d7d6e; margin: 16px 0; }
      h3 { font-size: 16px; font-weight: bold; margin: 24px 0 10px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
      th { background: #2d7d6e; color: white; padding: 8px 10px; text-align: left; }
      td { padding: 7px 10px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) td { background: #f9f9f9; }
      .badge-pago { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
      .badge-pendente { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
      .summary-table td:last-child { text-align: right; font-weight: bold; }
      footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 30px; }
    </style></head><body>
    <h1>Sistema de Sorteios CURA</h1>
    <h2>Relatório Financeiro de Sorteios</h2>
    <p class="meta">Gerado em: ${hoje}</p>
    <hr/>
    <div class="filter-info"><p>Rifa: ${rifaNome}</p><p>Status: ${statusLabel}</p></div>
    <h3>Resumo Geral</h3>
    <table class="summary-table">
      <tr><th>Indicador</th><th>Valor</th></tr>
      <tr><td>Total Vendidos</td><td>${totalVendidos}</td></tr>
      <tr><td>Total Pagos</td><td>${totalPagos}</td></tr>
      <tr><td>Total Pendentes</td><td>${totalPendentes}</td></tr>
      <tr><td>Valor Arrecadado</td><td>R$ ${valorArrecadado.toFixed(2)}</td></tr>
      <tr><td>Valor Pendente</td><td>R$ ${valorPendente.toFixed(2)}</td></tr>
    </table>
    ${porVendedor.length > 0 ? `<h3>Desempenho por Vendedor</h3>
    <table><tr><th>Vendedor</th><th>Vendida</th><th>Paga</th><th>Pendente</th><th>Arrecadado</th></tr>${vendedorRows}</table>` : ''}
    <h3>Detalhamento de Vendas</h3>
    <table><tr><th>Rifa</th><th>Nº</th><th>Comprador</th><th>Telefone</th><th>Vendedor</th><th>Data</th><th>Status</th><th>Valor</th></tr>${detailRows}</table>
    <footer>Página 1 de 1</footer>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-teal-600 hover:underline">
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mt-2">Relatórios Financeiros</h1>
      <p className="text-gray-500 text-sm mb-6">Acompanhe o desempenho de vendas e arrecadação dos sorteios</p>

      {/* Filters + Export */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Selecionar Sorteio</label>
          <select value={rifaFiltro} onChange={(e) => setRifaFiltro(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="todas">Todos os Sorteios</option>
            {rifas.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Filtrar por Status</label>
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="todos">Todos</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download size={13} /> CSV
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <FileText size={13} /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
            <FileText size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-l-4 border-l-amber-400 border-gray-200 p-4">
          <p className="text-gray-500 mb-1 text-xs font-bold">Total Vendidos</p>
          <p className="text-2xl font-bold text-amber-500">{totalVendidos}</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-l-green-500 border-gray-200 p-4">
          <p className="text-gray-500 mb-1 text-xs font-bold">Total Pagos</p>
          <p className="text-2xl font-bold text-green-600">{totalPagos}</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-l-orange-400 border-gray-200 p-4">
          <p className="text-gray-500 mb-1 text-xs font-bold">Total Pendentes</p>
          <p className="text-2xl font-bold text-orange-500">{totalPendentes}</p>
        </div>
        <div className="bg-teal-600 rounded-xl p-4 text-white">
          <p className="text-teal-100 mb-1 text-xs font-bold">Valor Arrecadado</p>
          <p className="text-2xl font-bold">R$ {valorArrecadado.toFixed(2)}</p>
          <p className="text-teal-200 text-xs mt-1">Pendente: R$ {valorPendente.toFixed(2)}</p>
        </div>
      </div>

      {/* Desempenho por Vendedor */}
      {porVendedor.length > 0 &&
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>👥</span> Desempenho por Vendedor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Vendedor</th>
                  <th className="text-center py-2 px-3 text-gray-600 font-medium">Vendidos</th>
                  <th className="text-center py-2 px-3 text-gray-600 font-medium">Pagos</th>
                  <th className="text-center py-2 px-3 text-gray-600 font-medium">Pendentes</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">Arrecadado</th>
                </tr>
              </thead>
              <tbody>
                {porVendedor.map((v) =>
              <tr key={v.nome} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">
                          {v.nome[0]?.toUpperCase()}
                        </div>
                        {v.nome}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">{v.vendidos}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{v.pagos}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">{v.pendentes}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-teal-600">R$ {v.arrecadado.toFixed(2)}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* Detalhamento */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><span>≡</span> Detalhamento de Vendas</h3>
          <span className="text-gray-400 text-sm font-bold">{numerosVendidos.length} registros</span>
        </div>
        {numerosVendidos.length === 0 ?
        <p className="text-gray-400 text-sm text-center py-8">Nenhum registro encontrado</p> :

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-2 px-2 font-medium">RIFA</th>
                  <th className="text-center py-2 px-2 font-medium">Nº</th>
                  <th className="text-left py-2 px-2 font-medium">COMPRADOR</th>
                  <th className="text-left py-2 px-2 font-medium">TELEFONE</th>
                  <th className="text-left py-2 px-2 font-medium">VENDEDOR</th>
                  <th className="text-left py-2 px-2 font-medium">DATA</th>
                  <th className="text-center py-2 px-2 font-medium">STATUS</th>
                  <th className="text-right py-2 px-2 font-medium">VALOR</th>
                  <th className="text-center py-2 px-2 font-medium">AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {numerosVendidos.map((n) => {
                const rifa = rifas.find((r) => r.id === n.rifa_id);
                return (
                  <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-600 text-xs">{rifa?.nome}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="w-7 h-7 rounded-lg bg-gray-800 text-white text-xs font-bold inline-flex items-center justify-center">{n.numero}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-800">{n.nome_comprador || '—'}</td>
                      <td className="py-3 px-2 text-gray-500">{n.telefone || '—'}</td>
                      <td className="py-3 px-2 text-gray-600">{n.nome_vendedor || '—'}</td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{n.data_compra ? new Date(n.data_compra).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.pago ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {n.pago ? '● Pago' : '○ Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-teal-600">R$ {(n.valor_pago || 0).toFixed(2)}</td>
                      <td className="py-3 px-2 text-center">
                        <button onClick={() => {setSelectedNum(n);setSelectedNumRifa(rifa);}}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>

      {selectedNum && selectedNumRifa &&
      <NumeroDetailModal numero={selectedNum} rifa={selectedNumRifa} onClose={() => {setSelectedNum(null);setSelectedNumRifa(null);}} onSaved={load} />
      }
    </div>);

}