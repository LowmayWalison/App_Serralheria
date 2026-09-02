import { QuoteData, CalculatedTotals, WorkshopProfile } from '../types';
import { formatBRL } from '../utils/formatters';
import { Printer, X, Download, ShieldCheck, CheckCircle, User, Phone, MapPin, MessageCircle } from 'lucide-react';

interface PrintProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
  totals: CalculatedTotals;
  profile: WorkshopProfile;
  onShareWhatsApp?: () => void;
}

export function PrintProposalModal({
  isOpen,
  onClose,
  quote,
  totals,
  profile,
  onShareWhatsApp,
}: PrintProposalModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-zinc-200 flex flex-col my-auto max-h-[96vh]">
        {/* Modal Action Bar (Hidden during actual print via print:hidden) */}
        <div className="bg-zinc-950 text-white p-3.5 px-5 flex items-center justify-between shrink-0 print:hidden border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-500" />
            <span className="font-bold text-sm">Visualização da Proposta Comercial</span>
          </div>
          <div className="flex items-center gap-2">
            {onShareWhatsApp && (
              <button
                onClick={onShareWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                title="Enviar Proposta no WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white/20 stroke-white" />
                <span>WhatsApp</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition shadow-sm border border-zinc-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-red-400" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Document Container */}
        <div className="p-6 md:p-10 overflow-y-auto bg-white text-zinc-900 text-sm leading-relaxed print:p-0 print:m-0 space-y-6">
          {/* Document Header */}
          <div className="border-b-2 border-zinc-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 bg-black rounded-xl p-0.5 border border-zinc-300 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={profile.logoUrl || '/icon.svg'}
                  alt={profile.name || 'Logo da Serralheria'}
                  className="w-full h-full object-cover rounded-[10px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
                  {profile.name || 'LW SERRALHERIA'}
                </h1>
                <p className="text-xs text-zinc-500 font-medium">
                  {profile.description || 'Estruturas Metálicas • Esquadrias de Ferro • Serralheria em Geral'}
                </p>
                {profile.city && <p className="text-xs text-zinc-500">{profile.city}</p>}
                {profile.phone && <p className="text-xs font-semibold text-zinc-700">Tel/WhatsApp: {profile.phone}</p>}
              </div>
            </div>

            <div className="text-left sm:text-right bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider block">
                PROPOSTA COMERCIAL
              </span>
              <span className="text-xs font-bold font-mono text-zinc-800 block">
                Nº {quote.id.replace('quote_', '').slice(-6)}
              </span>
              <span className="text-xs text-zinc-600 font-medium block">
                Validade: {quote.validityDays || 15} dias
              </span>
            </div>
          </div>

          {/* Client & Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
            <div>
              <span className="text-zinc-500 font-medium block">Cliente / Projeto:</span>
              <strong className="text-sm font-bold text-zinc-900">{quote.projectClient || 'Não especificado'}</strong>
            </div>
            <div>
              <span className="text-zinc-500 font-medium block">Telefone / Contato:</span>
              <strong className="text-sm font-bold text-zinc-900">{quote.clientPhone || '-'}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-zinc-500 font-medium block">Local de Instalação:</span>
              <strong className="font-bold text-zinc-800">{quote.location || 'Oficina / Conforme acordado'}</strong>
            </div>
          </div>

          {/* Scope & Materials Specification Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 border-b border-zinc-200 pb-1">
              1. Relação de Materiais, Esquadrias e Serviços
            </h3>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300">
                  <th className="py-2 px-3">Item / Especificação Técnica</th>
                  <th className="py-2 px-3 text-center w-24">Qtd / Medida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {quote.metalItems.filter(i => i.quantity > 0).map((m, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-medium text-zinc-800">
                      Perfis: {m.description}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-zinc-600">
                      {m.quantity} {m.unitLabel || 'm'}
                    </td>
                  </tr>
                ))}

                {quote.materialItems.filter(i => i.quantity > 0).map((mat, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-medium text-zinc-800">
                      Acessórios: {mat.description}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-zinc-600">
                      {mat.quantity} {mat.unitLabel || 'un'}
                    </td>
                  </tr>
                ))}

                {quote.laborItems.filter(i => i.quantity > 0).map((l, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-medium text-zinc-800">
                      Mão de Obra Especializada: {l.description}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-zinc-600">
                      Incluso
                    </td>
                  </tr>
                ))}

                {quote.extraCosts.filter(e => e.cost > 0).map((e, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-medium text-zinc-800">
                      Serviço: {e.description}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-zinc-600">
                      Incluso
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observations */}
          {quote.observations && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
              <span className="font-bold text-zinc-700 block mb-1">Observações e Acabamentos:</span>
              <p className="text-zinc-600 whitespace-pre-line">{quote.observations}</p>
            </div>
          )}

          {/* Pricing & Investment Summary */}
          <div className="border-t-2 border-zinc-900 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Valor Total do Investimento
              </span>
              <div className="text-2xl font-black font-mono text-zinc-900">
                {formatBRL(totals.finalPrice)}
              </div>
            </div>

            <div className="space-y-1 text-xs text-zinc-700 sm:text-right">
              {quote.cashDiscountPercent > 0 && (
                <div>
                  🟢 À Vista (PIX/Dinheiro com {quote.cashDiscountPercent}% desc.): <strong>{formatBRL(totals.cashPrice)}</strong>
                </div>
              )}
              <div>
                🟡 Condição Padrão: 50% Entrada (<strong>{formatBRL(totals.entryPrice)}</strong>) + 50% na Entrega (<strong>{formatBRL(totals.remainingPrice)}</strong>)
              </div>
              {profile.pixKey && (
                <div className="font-mono text-zinc-600 text-[11px]">
                  Chave PIX: {profile.pixKey}
                </div>
              )}
            </div>
          </div>

          {/* Warranty and Signature Footer */}
          <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-zinc-600">
            <div>
              <span className="font-bold text-zinc-800 block mb-1">Garantia & Termos:</span>
              <p>{profile.warranty || '90 dias contra defeitos de solda e fabricação.'}</p>
            </div>

            <div className="text-center sm:text-right pt-6 sm:pt-0">
              <div className="border-b border-zinc-400 w-48 sm:ml-auto mb-1"></div>
              <span className="font-bold text-zinc-800 block">De Acordo / Assinatura do Cliente</span>
              <span className="text-[10px] text-zinc-400">Data: ___/___/______</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
