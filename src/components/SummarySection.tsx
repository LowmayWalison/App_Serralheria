import { useState } from 'react';
import { QuoteData, CalculatedTotals, WorkshopProfile } from '../types';
import { formatBRL, parseNumber, generateWhatsAppMessage } from '../utils/formatters';
import { 
  Percent, 
  DollarSign, 
  Copy, 
  Check, 
  TrendingUp, 
  CreditCard, 
  QrCode, 
  Sliders,
  ShieldCheck,
  Award,
  FileText
} from 'lucide-react';

interface SummarySectionProps {
  quote: QuoteData;
  totals: CalculatedTotals;
  profile: WorkshopProfile;
  onProfitMarginChange: (margin: number) => void;
  onDiscountChange: (discount: number) => void;
  onCardFeeChange: (fee: number) => void;
  onOpenPrint: () => void;
  onShareWhatsApp?: () => void;
  onOpenWorkspace?: () => void;
}

const PROFIT_PRESETS = [20, 30, 40, 50, 60, 80, 100];
const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 10, 12];

export function SummarySection({
  quote,
  totals,
  profile,
  onProfitMarginChange,
  onDiscountChange,
  onCardFeeChange,
  onOpenPrint,
  onShareWhatsApp,
  onOpenWorkspace,
}: SummarySectionProps) {
  const [selectedInstallments, setSelectedInstallments] = useState(3);
  const [copied, setCopied] = useState(false);

  const handleCopyProposalText = () => {
    const text = generateWhatsAppMessage(quote, totals, profile);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Percent calculation for visual breakdown
  const costTotal = totals.totalDirectCost > 0 ? totals.totalDirectCost : 1;
  const pctMetal = ((totals.subMetal / costTotal) * 100);
  const pctMaterials = (((totals.subMaterials + totals.subConsumables + totals.subDiscs) / costTotal) * 100);
  const pctLabor = ((totals.subLabor / costTotal) * 100);
  const pctEnergyTools = (((totals.subEnergy + totals.subTools + totals.subExtras) / costTotal) * 100);

  // Custom installment calculation
  const cardFee = quote.cardFeePercent || 0;
  const priceWithCardFee = totals.finalPrice * (1 + cardFee / 100);
  const singleInstallment = priceWithCardFee / selectedInstallments;

  return (
    <div className="space-y-5">
      {/* 1. Main Summary Card with Dark Premium Style */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-5 md:p-6 shadow-2xl border border-zinc-800">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📊</span>
            <h2 className="text-lg md:text-xl font-extrabold text-red-400 tracking-tight">
              Resumo Geral do Orçamento
            </h2>
          </div>
          <span className="text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-full">
            Cálculo em Tempo Real
          </span>
        </div>

        {/* Subtotals Breakdown list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 py-4 border-b border-zinc-800/80 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">1. Metais e Perfis:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subMetal)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">2. Materiais Diversos:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subMaterials)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">3. Consumíveis (Solda/Tinta):</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subConsumables)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">4. Discos & Abrasivos:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subDiscs)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">5. Energia Elétrica:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subEnergy)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">6. Ferramentas & Maquinário:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subTools)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">7. Mão de Obra:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subLabor)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-400 font-medium">8. Custos Extras / Frete:</span>
            <span className="font-mono font-bold text-zinc-200">{formatBRL(totals.subExtras)}</span>
          </div>
        </div>

        {/* Cost distribution bar */}
        {totals.totalDirectCost > 0 && (
          <div className="py-4 border-b border-zinc-800/80">
            <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
              <span>Distribuição de Custos Diretos</span>
              <span>100% dos Custos</span>
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${pctMetal}%` }} 
                className="bg-red-500 hover:opacity-90 transition-all" 
                title={`Metais: ${pctMetal.toFixed(0)}%`}
              />
              <div 
                style={{ width: `${pctMaterials}%` }} 
                className="bg-zinc-400 hover:opacity-90 transition-all" 
                title={`Materiais/Consumíveis: ${pctMaterials.toFixed(0)}%`}
              />
              <div 
                style={{ width: `${pctLabor}%` }} 
                className="bg-red-700 hover:opacity-90 transition-all" 
                title={`Mão de Obra: ${pctLabor.toFixed(0)}%`}
              />
              <div 
                style={{ width: `${pctEnergyTools}%` }} 
                className="bg-zinc-600 hover:opacity-90 transition-all" 
                title={`Energia/Extras: ${pctEnergyTools.toFixed(0)}%`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Metal ({pctMetal.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span> Materiais ({pctMaterials.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-700"></span> Mão de Obra ({pctLabor.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Energia/Extras ({pctEnergyTools.toFixed(0)}%)</span>
            </div>
          </div>
        )}

        {/* Totals & Profit Controls */}
        <div className="pt-4 space-y-4">
          {/* Custo Total de Produção */}
          <div className="flex justify-between items-center bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60">
            <div>
              <span className="text-xs uppercase font-bold text-zinc-300 block tracking-wider">Custo Direto Total</span>
              <span className="text-[11px] text-zinc-400">Soma de todos os insumos, horas e despesas</span>
            </div>
            <span className="text-lg md:text-xl font-mono font-extrabold text-zinc-200">
              {formatBRL(totals.totalDirectCost)}
            </span>
          </div>

          {/* Margem de Lucro Interactive Slider & Quick Presets */}
          <div className="bg-zinc-800/90 p-4 rounded-xl border border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <span className="text-sm font-bold text-zinc-200">Margem de Lucro Desejada:</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-24">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    value={quote.profitMargin === 0 ? '' : quote.profitMargin}
                    onChange={(e) => onProfitMarginChange(parseNumber(e.target.value))}
                    className="w-full pl-3 pr-7 py-1 text-right font-mono font-extrabold text-base bg-zinc-900 border border-red-500/50 rounded-lg text-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-red-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={quote.profitMargin || 0}
              onChange={(e) => onProfitMarginChange(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer h-2 bg-zinc-700 rounded-lg"
            />

            {/* Quick Profit Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 mr-1 font-medium">Atalhos:</span>
              {PROFIT_PRESETS.map((margin) => (
                <button
                  key={margin}
                  onClick={() => onProfitMarginChange(margin)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    quote.profitMargin === margin
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/20'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  }`}
                >
                  {margin}%
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-700/60 text-zinc-400">
              <span>Lucro Bruto Calculado:</span>
              <span className="font-mono font-bold text-red-400 text-sm">
                + {formatBRL(totals.profitAmount)}
              </span>
            </div>
          </div>

          {/* FINAL SUGGESTED PRICE */}
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-5 rounded-2xl border-2 border-red-500/60 text-center shadow-lg shadow-red-950/20">
            <div className="text-xs uppercase font-extrabold text-red-400 tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Preço Final de Venda Sugerido</span>
            </div>
            <div className="text-3xl md:text-4xl font-black font-mono text-white tracking-tight my-1">
              {formatBRL(totals.finalPrice)}
            </div>
            <div className="text-xs text-zinc-400 font-medium">
              Custo ({formatBRL(totals.totalDirectCost)}) + Lucro {quote.profitMargin}% ({formatBRL(totals.profitAmount)})
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Terms Simulator Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Simulador de Condições de Pagamento
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Opção 1: À Vista com Desconto */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  À Vista (PIX / Dinheiro)
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Desc:</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={quote.cashDiscountPercent}
                    onChange={(e) => onDiscountChange(parseNumber(e.target.value))}
                    className="w-10 px-1 py-0.5 text-center font-mono font-bold text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">%</span>
                </div>
              </div>
              <div className="text-xl font-black font-mono text-zinc-900 dark:text-white my-1">
                {formatBRL(totals.cashPrice)}
              </div>
            </div>
            <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">
              Economia de {formatBRL(totals.cashDiscountAmount)} para o cliente
            </div>
          </div>

          {/* Opção 2: 50% Entrada + 50% Instalação */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Padrão: 50% Entrada + 50% Entrega
              </span>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>1ª Entrada (início):</span>
                  <strong className="font-mono text-zinc-900 dark:text-zinc-100">{formatBRL(totals.entryPrice)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>2ª Na Instalação:</span>
                  <strong className="font-mono text-zinc-900 dark:text-zinc-100">{formatBRL(totals.remainingPrice)}</strong>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Garante compra dos materiais à vista
            </div>
          </div>

          {/* Opção 3: Cartão de Crédito */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Cartão de Crédito
                </span>
                <select
                  value={selectedInstallments}
                  onChange={(e) => setSelectedInstallments(Number(e.target.value))}
                  className="text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 text-zinc-900 dark:text-zinc-100"
                >
                  {INSTALLMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}x
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-lg font-black font-mono text-zinc-900 dark:text-white my-1">
                {selectedInstallments}x de {formatBRL(singleInstallment)}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
              <span>Total no Cartão:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{formatBRL(priceWithCardFee)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 md:p-5 shadow-sm transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Copy formatted proposal text */}
          <button
            id="btn-copy-proposal-text"
            onClick={handleCopyProposalText}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-xl font-bold text-sm shadow-md shadow-zinc-900/20 transition cursor-pointer border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
            <span>{copied ? 'Mensagem Copiada!' : 'Copiar Texto da Proposta'}</span>
          </button>

          {/* Print / Formal PDF */}
          <button
            id="btn-print-pdf"
            onClick={onOpenPrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-950/20 transition cursor-pointer border border-red-500/30"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Gerar / Baixar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
