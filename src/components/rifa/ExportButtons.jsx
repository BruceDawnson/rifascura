import { Download } from 'lucide-react';

export default function ExportButtons({ numeros, rifaNome }) {
  const headers = ['Número', 'Nome', 'Telefone', 'Data Compra', 'Vendido', 'Pago', 'Valor Pago', 'Observação'];

  const rows = numeros.map(n => [
    n.numero,
    n.nome_comprador || '',
    n.telefone || '',
    n.data_compra ? new Date(n.data_compra).toLocaleDateString('pt-BR') : '',
    n.vendido ? 'Sim' : 'Não',
    n.pago ? 'Sim' : 'Não',
    n.valor_pago ? `R$ ${n.valor_pago.toFixed(2)}` : '',
    n.observacao || '',
  ]);

  const exportCSV = () => {
    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${rifaNome}-numeros.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    // Export as TSV with .xlsx compatible format (tab-separated, UTF-8 BOM)
    const bom = '\uFEFF';
    const tsv = bom + [headers, ...rows].map(r => r.join('\t')).join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${rifaNome}-numeros.xlsx`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={exportCSV}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-green-900/40 text-green-400 hover:bg-green-700 hover:text-white transition-all border border-green-700/50"
      >
        <Download size={13} /> CSV / Google Sheets
      </button>
      <button
        onClick={exportXLSX}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-900/40 text-blue-400 hover:bg-blue-700 hover:text-white transition-all border border-blue-700/50"
      >
        <Download size={13} /> Excel (.xlsx)
      </button>
    </div>
  );
}