const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Phone, User, CheckCircle, AlertCircle, Copy, Check, Ticket } from 'lucide-react';

const getColor = (num, selectedId) => {
  const base = num.pago
    ? 'bg-green-500 text-white border-green-500 cursor-not-allowed'
    : num.vendido
    ? 'bg-amber-400 text-white border-amber-400 cursor-not-allowed'
    : 'bg-white text-gray-800 border-gray-300 hover:border-teal-500 hover:bg-teal-50 cursor-pointer';
  const ring = selectedId === num.id ? ' ring-2 ring-teal-500 ring-offset-1' : '';
  return base + ring;
};

export default function PublicRifa() {
  const { slug } = useParams();
  const [rifa, setRifa] = useState(null);
  const [numeros, setNumeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [step, setStep] = useState('grid');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  const copiarPix = () => {
    navigator.clipboard.writeText('curaterreiro@gmail.com');
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2500);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lista todas as rifas e filtra pelo slug localmente (evita problema de auth em página pública)
        const allRifas = await db.entities.Rifa.list();
        if (cancelled) return;
        const rifaData = allRifas.find(r => r.slug === slug);
        if (!rifaData) { setRifa(null); setLoading(false); return; }
        setRifa(rifaData);

        let allNums = [];
        let page = 0;
        const pageSize = 500;
        while (true) {
          const batch = await db.entities.NumeroRifa.filter({ rifa_id: rifaData.id }, 'numero', pageSize, page * pageSize);
          if (cancelled) return;
          allNums = allNums.concat(batch);
          if (batch.length < pageSize) break;
          page++;
        }
        setNumeros(allNums.sort((a, b) => a.numero - b.numero));
      } catch (err) {
        if (!cancelled) setError('Erro ao carregar. Tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const reservar = async () => {
    if (!nome.trim() || !telefone.trim()) { setMsg('Preencha nome e telefone!'); return; }
    setSaving(true);
    try {
      await db.entities.NumeroRifa.update(selected.id, {
        nome_comprador: nome.trim(), telefone: telefone.trim(),
        data_compra: new Date().toISOString().split('T')[0],
        vendido: true, pago: false, valor_pago: rifa.valor_numero || 0,
      });
      setNumeros(prev => prev.map(n =>
        n.id === selected.id ? { ...n, vendido: true, pago: false, nome_comprador: nome.trim(), telefone: telefone.trim() } : n
      ));
      setStep('success');
    } catch (err) {
      setMsg('Erro ao reservar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Carregando sorteio...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <AlertCircle size={36} className="text-red-400" />
      <p className="text-gray-600">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">Tentar novamente</button>
    </div>
  );

  if (!rifa) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <Ticket size={40} className="text-gray-300" />
      <p className="text-gray-500 font-medium">Sorteio não encontrado</p>
    </div>
  );

  const disponiveis = numeros.filter(n => !n.vendido).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 text-white px-4 py-3 text-center text-sm font-medium">
        CURA — Centro de Umbanda Reino das Almas
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5 shadow-sm">
          {rifa.imagem_url && <img src={rifa.imagem_url} alt={rifa.nome} className="w-full h-48 object-cover" />}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{rifa.nome}</h1>
                {rifa.descricao && <p className="text-gray-500 text-sm mt-1">{rifa.descricao}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-teal-600 font-bold text-xl">R$ {rifa.valor_numero?.toFixed(2)}</p>
                <p className="text-gray-400 text-xs">por bilhete</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">{disponiveis} disponíveis</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{numeros.length} total</span>
              {rifa.data_fim && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">até {new Date(rifa.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Chave Pix para pagamento</p>
            <p className="text-gray-800 font-semibold text-sm">curaterreiro@gmail.com</p>
          </div>
          <button onClick={copiarPix}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${pixCopiado ? 'bg-green-50 border-green-300 text-green-700' : 'bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100'}`}
          >
            {pixCopiado ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
          </button>
        </div>

        {rifa.numero_vencedor && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-5 text-center">
            <p className="text-teal-600 text-xs font-medium uppercase mb-1">🎉 Número Vencedor</p>
            <p className="text-teal-700 font-bold text-4xl">{rifa.numero_vencedor}</p>
            {rifa.nome_vencedor && <p className="text-teal-700 font-semibold mt-1">{rifa.nome_vencedor}</p>}
          </div>
        )}

        <div className="flex gap-4 mb-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-gray-300 bg-white" />Disponível</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-400" />Reservado</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-green-500" />Pago</div>
        </div>

        {rifa.status === 'finalizada' ? (
          <div className="bg-gray-100 rounded-2xl p-6 text-center text-gray-500">
            <Ticket size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Este sorteio foi encerrado</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-3">Toque em um número branco para reservar</p>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                {numeros.map(num => (
                  <button key={num.id}
                    onClick={() => { if (!num.vendido && !num.pago) { setSelected(num); setStep('form'); setMsg(''); setNome(''); setTelefone(''); } }}
                    disabled={num.vendido || num.pago}
                    title={num.nome_comprador ? `${num.numero} - ${num.nome_comprador}` : `Nº ${num.numero}`}
                    className={`aspect-square rounded border text-xs font-semibold transition-all ${getColor(num, selected?.id)}`}
                  >
                    {num.numero}
                  </button>
                ))}
              </div>
            </div>

            {step === 'form' && selected && (
              <div className="bg-white rounded-2xl border border-teal-300 p-5 mb-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-1">Reservar Número {selected.numero}</h3>
                <p className="text-gray-500 text-sm mb-4">Preencha seus dados para confirmar</p>
                <div className="space-y-3">
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input value={nome} onChange={e => { setNome(e.target.value); setMsg(''); }} placeholder="Seu nome completo"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input value={telefone} onChange={e => { setTelefone(e.target.value); setMsg(''); }} placeholder="WhatsApp / Telefone" type="tel"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  {msg && <p className="text-red-500 text-xs">{msg}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setStep('grid'); setSelected(null); }} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">Cancelar</button>
                    <button onClick={reservar} disabled={saving}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white transition-colors">
                      {saving ? 'Confirmando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4 text-center">
                <CheckCircle size={36} className="text-green-500 mx-auto mb-2" />
                <p className="text-gray-800 font-semibold text-lg">Reserva confirmada! 🎉</p>
                <p className="text-green-700 text-sm mt-1">Número <strong>{selected?.numero}</strong> reservado para <strong>{nome}</strong></p>
                <p className="text-gray-500 text-xs mt-2">Efetue o pagamento via Pix para <strong>curaterreiro@gmail.com</strong> e envie o comprovante pelo WhatsApp.</p>
                <a
                  href={`https://wa.me/5518988273046?text=${encodeURIComponent(`Olá! Efetuei o pagamento do sorteio *${rifa?.nome}* - Número *${selected?.numero}* no nome de *${nome}*. Segue o comprovante do Pix.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold w-full justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L.057 23.215a.75.75 0 0 0 .921.902l5.44-1.453A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.694 9.694 0 0 1-4.964-1.365l-.355-.212-3.676.982.993-3.594-.232-.371A9.699 9.699 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                  </svg>
                  Enviar comprovante pelo WhatsApp
                </a>
                <button onClick={() => { setStep('grid'); setSelected(null); setNome(''); setTelefone(''); }}
                  className="mt-3 px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 w-full">
                  Escolher outro número
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4 text-center">
                <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
                <p className="text-gray-800 font-semibold">Número indisponível</p>
                <p className="text-red-600 text-sm mt-1">{msg}</p>
                <button onClick={() => { setStep('grid'); setSelected(null); }} className="mt-3 px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">Escolher outro</button>
              </div>
            )}
          </>
        )}

        <p className="text-center text-gray-400 text-xs mt-6 pb-4">Sistema de Sorteios CURA · Centro de Umbanda Reino das Almas</p>
      </div>
    </div>
  );
}