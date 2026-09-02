import { useState } from 'react';
import { ItemRow } from '../types';
import { formatBRL, parseNumber } from '../utils/formatters';
import { hapticAudio } from '../utils/audioFeedback';
import { 
  Calculator, 
  Scale, 
  Scissors, 
  Maximize2, 
  Flame, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface QuickCalculatorsProps {
  onAddMetalItem?: (item: Omit<ItemRow, 'id'>) => void;
}

type TabType = 'weight' | 'bars' | 'area' | 'welding';

// Standard steel density: 7.85 g/cm³ = 7850 kg/m³
const STEEL_DENSITY = 7850;

export function QuickCalculators({ onAddMetalItem }: QuickCalculatorsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('weight');

  // --- 1. Weight Calculator State ---
  const [profileType, setProfileType] = useState<'metalon_rect' | 'metalon_sq' | 'round_tube' | 'flat_bar' | 'angle_iron' | 'round_bar' | 'square_bar'>('metalon_rect');
  const [dimWidth, setDimWidth] = useState<number>(50); // mm
  const [dimHeight, setDimHeight] = useState<number>(30); // mm
  const [wallThickness, setWallThickness] = useState<number>(1.2); // mm (chapa 18 aprox)
  const [totalLength, setTotalLength] = useState<number>(12); // meters
  const [steelPricePerKg, setSteelPricePerKg] = useState<number>(13.50); // R$/kg

  // Calculations for weight
  const calculateWeightPerMeter = (): number => {
    const t = wallThickness / 1000; // in meters
    const w = dimWidth / 1000; // in meters
    const h = dimHeight / 1000; // in meters

    switch (profileType) {
      case 'metalon_rect': {
        // Perimeter * thickness * density
        const area = (2 * (w + h) - 4 * t) * t;
        return Math.max(0, area * STEEL_DENSITY);
      }
      case 'metalon_sq': {
        const area = (4 * w - 4 * t) * t;
        return Math.max(0, area * STEEL_DENSITY);
      }
      case 'round_tube': {
        // Outside diameter w
        const rOut = w / 2;
        const rIn = Math.max(0, rOut - t);
        const area = Math.PI * (rOut * rOut - rIn * rIn);
        return Math.max(0, area * STEEL_DENSITY);
      }
      case 'flat_bar': {
        // Solid flat bar: width * thickness
        const area = w * t;
        return Math.max(0, area * STEEL_DENSITY);
      }
      case 'angle_iron': {
        // L shape: (w + h - t) * t
        const area = (w + h - t) * t;
        return Math.max(0, area * STEEL_DENSITY);
      }
      case 'round_bar': {
        // Solid round bar: diameter w
        const r = w / 2;
        const area = Math.PI * r * r;
        return Math.max(0, area * STEEL_DENSITY);
      }
      case 'square_bar': {
        // Solid square bar: w * w
        const area = w * w;
        return Math.max(0, area * STEEL_DENSITY);
      }
      default:
        return 1.0;
    }
  };

  const weightPerMeter = calculateWeightPerMeter();
  const totalWeight = weightPerMeter * totalLength;
  const totalMaterialCost = totalWeight * steelPricePerKg;
  const costPerMeter = totalLength > 0 ? totalMaterialCost / totalLength : 0;

  const handleAddWeightToQuote = () => {
    if (!onAddMetalItem) return;
    hapticAudio.playSuccess();
    let desc = '';
    if (profileType === 'metalon_rect') desc = `Metalon ${dimWidth}x${dimHeight}mm #${wallThickness}mm (${weightPerMeter.toFixed(2)}kg/m)`;
    else if (profileType === 'metalon_sq') desc = `Metalon ${dimWidth}x${dimWidth}mm #${wallThickness}mm (${weightPerMeter.toFixed(2)}kg/m)`;
    else if (profileType === 'round_tube') desc = `Tubo Redondo Ø${dimWidth}mm #${wallThickness}mm (${weightPerMeter.toFixed(2)}kg/m)`;
    else if (profileType === 'flat_bar') desc = `Barra Chata ${dimWidth}mm x ${wallThickness}mm (${weightPerMeter.toFixed(2)}kg/m)`;
    else if (profileType === 'angle_iron') desc = `Cantoneira ${dimWidth}x${dimHeight}mm #${wallThickness}mm (${weightPerMeter.toFixed(2)}kg/m)`;
    else if (profileType === 'round_bar') desc = `Barra Redonda Maciça Ø${dimWidth}mm (${weightPerMeter.toFixed(2)}kg/m)`;
    else if (profileType === 'square_bar') desc = `Barra Quadrada Maciça ${dimWidth}mm (${weightPerMeter.toFixed(2)}kg/m)`;

    onAddMetalItem({
      description: desc,
      unitCost: parseFloat(costPerMeter.toFixed(2)),
      quantity: totalLength,
      unitLabel: 'm',
    });
    alert(`Item "${desc}" adicionado ao seu orçamento com sucesso!`);
  };

  // --- 2. 6-Meter Bar Optimizer State ---
  const [cuts, setCuts] = useState<{ id: string; length: number; qty: number }[]>([
    { id: '1', length: 2.10, qty: 4 },
    { id: '2', length: 0.85, qty: 8 },
    { id: '3', length: 1.20, qty: 2 },
  ]);
  const [kerfMm, setKerfMm] = useState<number>(3); // 3mm blade cut loss

  const handleAddCut = () => {
    hapticAudio.playTap();
    setCuts([...cuts, { id: String(Date.now()), length: 1.00, qty: 1 }]);
  };

  const handleRemoveCut = (id: string) => {
    hapticAudio.playTap();
    setCuts(cuts.filter((c) => c.id !== id));
  };

  const handleUpdateCut = (id: string, field: 'length' | 'qty', val: number) => {
    setCuts(cuts.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  // Simple First-Fit Decreasing bin packing for 6.0m bars
  const calculateBarNesting = () => {
    const BAR_LEN = 6.0;
    const kerfM = kerfMm / 1000;
    // Flatten all pieces
    const pieces: number[] = [];
    cuts.forEach((c) => {
      for (let i = 0; i < c.qty; i++) {
        if (c.length > 0 && c.length <= BAR_LEN) {
          pieces.push(c.length);
        }
      }
    });

    // Sort descending
    pieces.sort((a, b) => b - a);

    const bars: { remaining: number; pieces: number[] }[] = [];

    pieces.forEach((piece) => {
      let placed = false;
      for (const bar of bars) {
        // check if fits with kerf
        const needed = bar.pieces.length === 0 ? piece : piece + kerfM;
        if (bar.remaining >= needed) {
          bar.pieces.push(piece);
          bar.remaining -= needed;
          placed = true;
          break;
        }
      }
      if (!placed) {
        bars.push({
          remaining: BAR_LEN - piece,
          pieces: [piece],
        });
      }
    });

    const totalMetrosCortados = pieces.reduce((a, b) => a + b, 0);
    const totalMetrosComprados = bars.length * BAR_LEN;
    const aproveitamento = totalMetrosComprados > 0 ? (totalMetrosCortados / totalMetrosComprados) * 100 : 0;
    const totalSobras = Math.max(0, totalMetrosComprados - totalMetrosCortados);

    return {
      bars,
      totalBars: bars.length,
      totalMetrosCortados,
      totalMetrosComprados,
      aproveitamento,
      totalSobras,
    };
  };

  const nestingResult = calculateBarNesting();

  // --- 3. Area (m²) Calculator State ---
  const [areaWidth, setAreaWidth] = useState<number>(3.00); // meters
  const [areaHeight, setAreaHeight] = useState<number>(2.20); // meters
  const [structureType, setStructureType] = useState<string>('portao_basculante');
  const [m2Rate, setM2Rate] = useState<number>(380.00); // R$/m²

  const areaTotalM2 = areaWidth * areaHeight;
  const areaTotalPrice = areaTotalM2 * m2Rate;

  // --- 4. Welding Calculator State ---
  const [weldLengthMeters, setWeldLengthMeters] = useState<number>(15); // meters of weld bead
  const [weldType, setWeldType] = useState<'6013' | '7018' | 'mig'>('6013');

  // Approx: 1m of 3mm fillet weld takes ~0.12 kg of electrode/wire
  const electrodeKgNeeded = weldLengthMeters * (weldType === 'mig' ? 0.09 : 0.13);
  const estimatedHoursWelding = weldLengthMeters / 3.5; // ~3.5 meters of weld per hour including cleaning

  return (
    <div className="space-y-4 pb-8">
      {/* Tab Selector - Touch Optimized Horizontal Scroll */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
        <button
          onClick={() => {
            hapticAudio.playTap();
            setActiveTab('weight');
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
            activeTab === 'weight'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          <span>Peso do Aço (kg)</span>
        </button>

        <button
          onClick={() => {
            hapticAudio.playTap();
            setActiveTab('bars');
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
            activeTab === 'bars'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <Scissors className="w-4 h-4 text-sky-400" />
          <span>Corte de Barras 6m</span>
        </button>

        <button
          onClick={() => {
            hapticAudio.playTap();
            setActiveTab('area');
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
            activeTab === 'area'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span>Área m² Portão</span>
        </button>

        <button
          onClick={() => {
            hapticAudio.playTap();
            setActiveTab('welding');
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
            activeTab === 'welding'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Solda & Eletrodo</span>
        </button>
      </div>

      {/* 1. WEIGHT & STEEL KG CALCULATOR */}
      {activeTab === 'weight' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Calculadora de Peso e Custo do Aço / Ferro</span>
              </h3>
              <p className="text-xs text-slate-500">
                Calcule o peso em kg por metro e o valor total exato para comprar perfis
              </p>
            </div>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
              Densidade 7,85 kg/dm³
            </span>
          </div>

          {/* Profile Selector Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Selecione o Tipo de Perfil / Barra:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              {[
                { id: 'metalon_rect', label: 'Metalon Retangular', icon: '▭' },
                { id: 'metalon_sq', label: 'Metalon Quadrado', icon: '□' },
                { id: 'round_tube', label: 'Tubo Redondo', icon: '○' },
                { id: 'angle_iron', label: 'Cantoneira L', icon: '∟' },
                { id: 'flat_bar', label: 'Barra Chata', icon: '▬' },
                { id: 'round_bar', label: 'Barra Redonda Maciça', icon: '●' },
                { id: 'square_bar', label: 'Barra Quadrada Maciça', icon: '■' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    hapticAudio.playTap();
                    setProfileType(item.id as any);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    profileType === item.id
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base font-mono">{item.icon}</span>
                  <span className="text-[11px] leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            {profileType === 'metalon_rect' && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Largura A (mm)</label>
                  <input
                    type="number"
                    value={dimWidth}
                    onChange={(e) => setDimWidth(parseNumber(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Altura B (mm)</label>
                  <input
                    type="number"
                    value={dimHeight}
                    onChange={(e) => setDimHeight(parseNumber(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                  />
                </div>
              </>
            )}

            {profileType === 'metalon_sq' && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Lado (mm)</label>
                <input
                  type="number"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(parseNumber(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                />
              </div>
            )}

            {profileType === 'round_tube' && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Diâmetro Externo (mm)</label>
                <input
                  type="number"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(parseNumber(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                />
              </div>
            )}

            {profileType === 'angle_iron' && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Aba A (mm)</label>
                  <input
                    type="number"
                    value={dimWidth}
                    onChange={(e) => setDimWidth(parseNumber(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Aba B (mm)</label>
                  <input
                    type="number"
                    value={dimHeight}
                    onChange={(e) => setDimHeight(parseNumber(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                  />
                </div>
              </>
            )}

            {profileType === 'flat_bar' && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Largura da Barra (mm)</label>
                <input
                  type="number"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(parseNumber(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                />
              </div>
            )}

            {(profileType === 'round_bar' || profileType === 'square_bar') && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Diâmetro / Lado Maciço (mm)</label>
                <input
                  type="number"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(parseNumber(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                />
              </div>
            )}

            {/* Thickness input (not for solid bars) */}
            {profileType !== 'round_bar' && profileType !== 'square_bar' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">Espessura (mm / chapa)</label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={wallThickness}
                    onChange={(e) => setWallThickness(parseNumber(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                  />
                </div>
              </div>
            )}

            {/* Total Length */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Comprimento Total (m)</label>
              <input
                type="number"
                step="0.5"
                value={totalLength}
                onChange={(e) => setTotalLength(parseNumber(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
              />
            </div>

            {/* Steel Price per kg */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Preço do Aço (R$/kg)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.50"
                  value={steelPricePerKg}
                  onChange={(e) => setSteelPricePerKg(parseNumber(e.target.value))}
                  className="w-full pl-8 p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono text-right"
                />
              </div>
            </div>
          </div>

          {/* Quick Thickness Presets (Chapas Comuns de Serralheria) */}
          {profileType !== 'round_bar' && profileType !== 'square_bar' && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold shrink-0">Chapas padrão:</span>
              {[
                { label: '#20 (0.90mm)', val: 0.90 },
                { label: '#18 (1.20mm)', val: 1.20 },
                { label: '#16 (1.50mm)', val: 1.50 },
                { label: '#14 (1.90mm)', val: 1.90 },
                { label: '#1/8" (3.18mm)', val: 3.18 },
                { label: '#3/16" (4.75mm)', val: 4.75 },
              ].map((chapa) => (
                <button
                  key={chapa.label}
                  onClick={() => {
                    hapticAudio.playTap();
                    setWallThickness(chapa.val);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-mono whitespace-nowrap transition-colors ${
                    wallThickness === chapa.val
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {chapa.label}
                </button>
              ))}
            </div>
          )}

          {/* Results Summary Box */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Peso por Metro</span>
              <span className="text-lg font-black font-mono text-amber-400">
                {weightPerMeter.toFixed(2)} <span className="text-xs font-normal text-slate-300">kg/m</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Peso Total ({totalLength}m)</span>
              <span className="text-lg font-black font-mono text-white">
                {totalWeight.toFixed(1)} <span className="text-xs font-normal text-slate-300">kg</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Custo por Metro</span>
              <span className="text-lg font-black font-mono text-sky-300">
                {formatBRL(costPerMeter)}<span className="text-xs font-normal text-slate-300">/m</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Valor Total do Aço</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {formatBRL(totalMaterialCost)}
              </span>
            </div>
          </div>

          {/* Add to current quote button */}
          {onAddMetalItem && (
            <button
              onClick={handleAddWeightToQuote}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Este Perfil ({totalLength}m / {formatBRL(totalMaterialCost)}) ao Orçamento</span>
            </button>
          )}
        </div>
      )}

      {/* 2. 6-METER BAR CUT OPTIMIZER */}
      {activeTab === 'bars' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scissors className="w-5 h-5 text-sky-600" />
                <span>Otimizador de Corte de Barras de 6 Metros</span>
              </h3>
              <p className="text-xs text-slate-500">
                Insira as medidas dos pedaços para saber quantas barras de 6 metros comprar e onde cortar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Espessura disco:</span>
              <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {kerfMm}mm
              </span>
            </div>
          </div>

          {/* Cut List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Pedaços Necessários para o Projeto:</span>
              <button
                onClick={handleAddCut}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Medida</span>
              </button>
            </div>

            <div className="space-y-2">
              {cuts.map((cut, idx) => (
                <div
                  key={cut.id}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                  
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 font-medium block">Tamanho (metros)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.05"
                      max="6.0"
                      value={cut.length}
                      onChange={(e) => handleUpdateCut(cut.id, 'length', parseNumber(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-[10px] text-slate-500 font-medium block">Qtd (peças)</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={cut.qty}
                      onChange={(e) => handleUpdateCut(cut.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono text-center"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveCut(cut.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Stats Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Barras de 6m a Comprar</span>
              <span className="text-2xl font-black font-mono text-sky-400">
                {nestingResult.totalBars} <span className="text-xs font-normal text-slate-300">barras</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Aproveitamento</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {nestingResult.aproveitamento.toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Metros Cortados</span>
              <span className="text-xl font-bold font-mono text-white">
                {nestingResult.totalMetrosCortados.toFixed(2)}m
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Sobras / Retalhos</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {nestingResult.totalSobras.toFixed(2)}m
              </span>
            </div>
          </div>

          {/* Visual Cut Map */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-700 block">Mapa Visual de Corte das Barras:</span>
            <div className="space-y-2.5">
              {nestingResult.bars.map((bar, bIdx) => {
                return (
                  <div key={bIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Barra #{bIdx + 1} (6,00 metros)</span>
                      <span className="text-slate-500 font-mono">
                        Sobra: {bar.remaining.toFixed(2)}m
                      </span>
                    </div>

                    {/* Visual Bar */}
                    <div className="h-6 w-full bg-slate-200 rounded-lg overflow-hidden flex border border-slate-300">
                      {bar.pieces.map((p, pIdx) => {
                        const pct = (p / 6.0) * 100;
                        const colors = ['bg-sky-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-indigo-500'];
                        const col = colors[pIdx % colors.length];
                        return (
                          <div
                            key={pIdx}
                            style={{ width: `${pct}%` }}
                            title={`Pedaço de ${p.toFixed(2)}m`}
                            className={`${col} h-full border-r border-slate-900/30 flex items-center justify-center text-[10px] font-bold text-white font-mono overflow-hidden whitespace-nowrap px-1`}
                          >
                            {p.toFixed(2)}m
                          </div>
                        );
                      })}
                      {bar.remaining > 0 && (
                        <div
                          style={{ width: `${(bar.remaining / 6.0) * 100}%` }}
                          title={`Sobra: ${bar.remaining.toFixed(2)}m`}
                          className="bg-slate-300 h-full flex items-center justify-center text-[9px] text-slate-600 font-mono font-semibold"
                        >
                          {bar.remaining >= 0.3 ? `${bar.remaining.toFixed(2)}m sobra` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. AREA (m²) & QUICK GATE ESTIMATOR */}
      {activeTab === 'area' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-emerald-600" />
                <span>Calculadora de Portões, Grades e Coberturas por M²</span>
              </h3>
              <p className="text-xs text-slate-500">
                Estime rapidamente o valor total por metro quadrado instalado
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Largura do Vão (m)</label>
              <input
                type="number"
                step="0.05"
                value={areaWidth}
                onChange={(e) => setAreaWidth(parseNumber(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Altura do Vão (m)</label>
              <input
                type="number"
                step="0.05"
                value={areaHeight}
                onChange={(e) => setAreaHeight(parseNumber(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preço Médio por M² (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">R$</span>
                <input
                  type="number"
                  step="10"
                  value={m2Rate}
                  onChange={(e) => setM2Rate(parseNumber(e.target.value))}
                  className="w-full pl-9 pr-3 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold font-mono text-right"
                />
              </div>
            </div>
          </div>

          {/* Quick Structure Rate Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Médias de Mercado por Categoria:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Grade de Janela Tubular', rate: 220.00 },
                { label: 'Portão de Correr Tubular', rate: 320.00 },
                { label: 'Portão Basculante com Lambril', rate: 420.00 },
                { label: 'Corrimão / Guarda-Corpo', rate: 280.00 },
                { label: 'Cobertura com Telha Termoacústica', rate: 350.00 },
                { label: 'Portão Pivotante Social', rate: 360.00 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    hapticAudio.playTap();
                    setM2Rate(preset.rate);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    m2Rate === preset.rate
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">{preset.label}</span>
                  <span className="text-[11px] font-mono text-emerald-700">{formatBRL(preset.rate)}/m²</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 font-medium">Área Total do Vão</span>
              <div className="text-2xl font-black font-mono text-white">
                {areaTotalM2.toFixed(2)} <span className="text-sm font-normal text-slate-300">m²</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {areaWidth.toFixed(2)}m largura × {areaHeight.toFixed(2)}m altura
              </p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <span className="text-xs text-slate-400 font-medium">Estimativa do Projeto</span>
              <div className="text-3xl font-black font-mono text-emerald-400">
                {formatBRL(areaTotalPrice)}
              </div>
              <span className="text-[11px] text-slate-300 block">
                Valor médio com material e fabricação inclusos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. WELDING & CONSUMABLES CALCULATOR */}
      {activeTab === 'welding' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <span>Calculadora de Consumo de Solda & Eletrodos</span>
              </h3>
              <p className="text-xs text-slate-500">
                Estime o peso de eletrodo ou arame MIG necessário pelo comprimento das juntas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Comprimento Total das Juntas / Cordões (m)
              </label>
              <input
                type="number"
                step="1"
                value={weldLengthMeters}
                onChange={(e) => setWeldLengthMeters(parseNumber(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Dica: Some o perímetro de todas as quinas e tubos soldados.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Processo de Soldagem
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '6013', label: 'Eletrodo 6013' },
                  { id: '7018', label: 'Eletrodo 7018' },
                  { id: 'mig', label: 'Arame MIG 0.8' },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      hapticAudio.playTap();
                      setWeldType(w.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      weldType === w.id
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Solda Estimada Necessária</span>
              <span className="text-2xl font-black font-mono text-rose-400">
                {electrodeKgNeeded.toFixed(2)} <span className="text-xs font-normal text-slate-300">kg</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Varetas (aprox. 6013 2.5mm)</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {Math.ceil(electrodeKgNeeded * 55)} <span className="text-xs font-normal text-slate-300">varetas</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Tempo de Arco / Solda</span>
              <span className="text-2xl font-black font-mono text-sky-400">
                {estimatedHoursWelding.toFixed(1)} <span className="text-xs font-normal text-slate-300">horas</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
