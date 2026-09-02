import { useState } from 'react';
import { formatBRL, parseNumber } from '../utils/formatters';
import { Calculator, X, Layers, AlertCircle, ArrowRight } from 'lucide-react';

interface BarCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  metalTotalMeters: number;
}

export function BarCalculatorModal({
  isOpen,
  onClose,
  metalTotalMeters,
}: BarCalculatorModalProps) {
  const [totalMeters, setTotalMeters] = useState<number>(metalTotalMeters || 24);
  const [wastePercent, setWastePercent] = useState<number>(5); // 5% default for kerf/scrap
  const [barLength, setBarLength] = useState<number>(6); // 6 meters standard
  const [barCost, setBarCost] = useState<number>(180); // R$ per 6m bar

  if (!isOpen) return null;

  const metersWithWaste = totalMeters * (1 + wastePercent / 100);
  const totalBarsNeeded = Math.ceil(metersWithWaste / barLength);
  const totalPurchasedMeters = totalBarsNeeded * barLength;
  const leftoverMeters = Math.max(0, totalPurchasedMeters - metersWithWaste);
  const totalCost = totalBarsNeeded * barCost;
  const costPerMeter = barCost / barLength;

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 text-red-500 rounded-xl font-black border border-red-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Otimizador de Barras de 6 Metros</h3>
              <p className="text-xs text-zinc-400">Calcule a quantidade exata de barras padrão a comprar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Metros Necessários */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Metros Necessários (m):
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={totalMeters}
                onChange={(e) => setTotalMeters(parseNumber(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Perda de Corte % */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Margem de Perda / Corte:
              </label>
              <select
                value={wastePercent}
                onChange={(e) => setWastePercent(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-bold bg-white text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value={0}>0% (Exato)</option>
                <option value={5}>5% (Recomendado)</option>
                <option value={10}>10% (Cortes em 45º / Esquadro)</option>
                <option value={15}>15% (Projetos complexos)</option>
              </select>
            </div>

            {/* Comprimento da Barra */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tamanho da Barra (m):
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={barLength}
                onChange={(e) => setBarLength(parseNumber(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Preço da Barra */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Custo Médio por Barra:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-400 font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={barCost}
                  onChange={(e) => setBarCost(parseNumber(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-zinc-300 rounded-xl text-sm font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-right"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-500" />
                Barras Necessárias:
              </span>
              <span className="text-2xl font-black font-mono text-red-500">
                {totalBarsNeeded} {totalBarsNeeded === 1 ? 'Barra' : 'Barras'} de {barLength}m
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-800 pt-2.5 text-zinc-300">
              <div>
                <span className="text-zinc-400 block">Total a Comprar:</span>
                <strong className="font-mono text-white">{totalPurchasedMeters.toFixed(1)} metros</strong>
              </div>
              <div>
                <span className="text-zinc-400 block">Sobra Estimada de Oficina:</span>
                <strong className="font-mono text-white">{leftoverMeters.toFixed(2)} metros</strong>
              </div>
              <div>
                <span className="text-zinc-400 block">Custo Equivalente por Metro:</span>
                <strong className="font-mono text-white">{formatBRL(costPerMeter)} / metro</strong>
              </div>
              <div>
                <span className="text-zinc-400 block">Investimento Total em Barras:</span>
                <strong className="font-mono text-emerald-400 font-bold">{formatBRL(totalCost)}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-600 bg-zinc-100 p-2.5 rounded-xl border border-zinc-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Dica do serralheiro: Sempre adicione pelo menos 5% para compensar a espessura do disco de corte e sobras de cantos.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 p-4 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fechar Calculadora
          </button>
        </div>
      </div>
    </div>
  );
}
