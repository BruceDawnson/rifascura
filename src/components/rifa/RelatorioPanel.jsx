import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart2 } from 'lucide-react';

export default function RelatorioPanel({ rifa, numeros }) {
  const total = numeros.length;
  const vendidos = numeros.filter(n => n.vendido).length;
  const pagos = numeros.filter(n => n.pago).length;
  const pendentes = numeros.filter(n => n.vendido && !n.pago).length;
  const disponiveis = numeros.filter(n => !n.vendido).length;
  const valorArrecadado = numeros.filter(n => n.pago).reduce((s, n) => s + (n.valor_pago || 0), 0);
  const valorPendente = pendentes * (rifa.valor_numero || 0);
  const ocupacao = total > 0 ? ((vendidos / total) * 100).toFixed(1) : 0;

  const pieData = [
    { name: 'Disponíveis', value: disponiveis, color: '#6b7280' },
    { name: 'Vendidos/Pendente', value: pendentes, color: '#fbbf24' },
    { name: 'Pagos', value: pagos, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Total', value: total, fill: '#7c3aed' },
    { name: 'Vendidos', value: vendidos, fill: '#fbbf24' },
    { name: 'Pagos', value: pagos, fill: '#22c55e' },
    { name: 'Pendentes', value: pendentes, fill: '#f97316' },
    { name: 'Disponíveis', value: disponiveis, fill: '#6b7280' },
  ];

  const stats = [
    { label: 'Total', value: total, color: 'text-purple-400' },
    { label: 'Vendidos', value: vendidos, color: 'text-yellow-400' },
    { label: 'Pagos', value: pagos, color: 'text-green-400' },
    { label: 'Pendentes', value: pendentes, color: 'text-orange-400' },
    { label: 'Disponíveis', value: disponiveis, color: 'text-gray-400' },
    { label: 'Ocupação', value: `${ocupacao}%`, color: 'text-blue-400' },
    { label: 'Arrecadado', value: `R$ ${valorArrecadado.toFixed(2)}`, color: 'text-green-400' },
    { label: 'Pendente', value: `R$ ${valorPendente.toFixed(2)}`, color: 'text-red-400' },
  ];

  return (
    <div className="bg-[#1a1030] border border-purple-900/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 size={20} className="text-purple-400" />
        <h3 className="text-white font-semibold">Relatório</h3>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-[#0f0a1e] rounded-xl p-3 text-center">
            <p className="text-purple-400 text-xs mb-1">{s.label}</p>
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pieData.length > 0 && (
          <div>
            <p className="text-purple-300 text-xs font-medium mb-2 text-center">Distribuição</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1030', border: '1px solid #6b21a8', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div>
          <p className="text-purple-300 text-xs font-medium mb-2 text-center">Números</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1b69" />
              <XAxis type="number" tick={{ fill: '#a78bfa', fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#a78bfa', fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1030', border: '1px solid #6b21a8', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}