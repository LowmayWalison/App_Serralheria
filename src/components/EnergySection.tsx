import { useState } from 'react';
import { EnergyItem } from '../types';
import { formatBRL, parseNumber } from '../utils/formatters';
import { Zap, Plus, Trash2, Info, Sparkles } from 'lucide-react';

interface EnergySectionProps {
  tariff: number;
  items: EnergyItem[];
  onTariffChange: (tariff: number) => void;
  onChange: (items: EnergyItem[]) => void;
}

const COMMON_MACHINES = [
  { description: 'Esmerilhadeira Angular (1500W)', powerKw: 1.5, defaultHours: 2 },
  { description: 'Máquina de Solda Inversora (4000W)', powerKw: 4.0, defaultHours: 3 },
  { description: 'Policorte de Bancada (2200W)', powerKw: 2.2, defaultHours: 1 },
  { description: 'Compressor de Ar (2000W)', powerKw: 2.0, defaultHours: 2 },
  { description: 'Furadeira de Bancada (750W)', powerKw: 0.75, defaultHours: 1 },
  { description: 'Lixadeira de Cinta (1200W)', powerKw: 1.2, defaultHours: 1.5 },
];

export function EnergySection({
  tariff,
  items,
  onTariffChange,
  onChange,
}: EnergySectionProps) {
  const [showPresets, setShowPresets] = useState(false);

  const handleUpdate = (id: string, field: keyof EnergyItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleAddMachine = (desc = 'Novo Equipamento', power = 1.0, hours = 1.0) => {
    const newItem: EnergyItem = {
      id: 'energy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      description: desc,
      powerKw: power,
      hours: hours,
    };
    onChange([...items, newItem]);
    setShowPresets(false);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.powerKw * item.hours * (tariff || 0.85)), 0);
  const totalKwh = items.reduce((acc, item) => acc + (item.powerKw * item.hours), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 md:p-5 shadow-sm mb-5 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-red-500/40 text-red-400 font-black text-xs flex items-center justify-center shadow-sm font-mono">
            5
          </span>
          <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Energia Elétrica (Maquinário)</span>
          </h2>
        </div>

        {/* Subtotal Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Subtotal:</span>
          <span className="text-sm md:text-base font-black font-mono text-zinc-900 dark:text-zinc-100 bg-red-50/80 dark:bg-red-950/50 border border-red-200/80 dark:border-red-900/50 px-3 py-1 rounded-lg">
            {formatBRL(subtotal)}
          </span>
        </div>
      </div>

      {/* Tariff Input bar */}
      <div className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/10 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tarifa de Energia da Concessionária</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Média Brasil ~ R$ 0,85 por kWh consumido</div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Tarifa (R$ / kWh):</label>
          <div className="relative w-28">
            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tariff === 0 ? '' : tariff}
              onChange={(e) => onTariffChange(parseNumber(e.target.value))}
              placeholder="0.85"
              className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-mono font-bold text-right text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left hidden md:table border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50">
              <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 rounded-l-lg">
                Equipamento / Máquina
              </th>
              <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-36">
                Potência (kW)
              </th>
              <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-32">
                Tempo de Uso (h)
              </th>
              <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right w-36">
                Custo Calc. (R$)
              </th>
              <th className="py-2.5 px-2 w-12 text-center rounded-r-lg"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {items.map((item) => {
              const itemCost = item.powerKw * item.hours * (tariff || 0.85);
              return (
                <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                      placeholder="Nome do equipamento"
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700/80 focus:bg-white dark:focus:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.powerKw === 0 ? '' : item.powerKw}
                        onChange={(e) => handleUpdate(item.id, 'powerKw', parseNumber(e.target.value))}
                        placeholder="1.5"
                        className="w-full px-2 py-1.5 text-right font-mono bg-zinc-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700/80 focus:bg-white dark:focus:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold w-6">kW</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.hours === 0 ? '' : item.hours}
                        onChange={(e) => handleUpdate(item.id, 'hours', parseNumber(e.target.value))}
                        placeholder="2"
                        className="w-full px-2 py-1.5 text-center font-mono bg-zinc-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700/80 focus:bg-white dark:focus:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold w-4">h</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {formatBRL(itemCost)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Remover máquina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {items.map((item) => {
            const itemCost = item.powerKw * item.hours * (tariff || 0.85);
            return (
              <div
                key={item.id}
                className="p-3.5 bg-zinc-50/90 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                    placeholder="Equipamento"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Potência (kW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={item.powerKw === 0 ? '' : item.powerKw}
                      onChange={(e) => handleUpdate(item.id, 'powerKw', parseNumber(e.target.value))}
                      placeholder="1.5"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 font-mono border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-right text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Tempo de Uso (h)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={item.hours === 0 ? '' : item.hours}
                      onChange={(e) => handleUpdate(item.id, 'hours', parseNumber(e.target.value))}
                      placeholder="2"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 font-mono border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400">Consumo Estimado:</span>
                  <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {(item.powerKw * item.hours).toFixed(1)} kWh = {formatBRL(itemCost)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consumption Summary line */}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80">
        <span>⚡ Consumo Elétrico Total: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{totalKwh.toFixed(1)} kWh</strong></span>
        <span>Fórmula: <code className="text-red-700 dark:text-red-400 font-mono font-semibold">kW × Horas × Tarifa (R$)</code></span>
      </div>

      {/* Add Button & Presets */}
      <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleAddMachine()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 border border-red-500/30 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Adicionar Máquina</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Máquinas Comuns</span>
          </button>

          {showPresets && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1.5 z-30 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Adicionar equipamento padrão:
              </div>
              {COMMON_MACHINES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddMachine(preset.description, preset.powerKw, preset.defaultHours)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-700 dark:text-zinc-300 hover:text-red-900 dark:hover:text-red-200 flex items-center justify-between transition-colors"
                >
                  <span className="truncate pr-2 font-medium">{preset.description}</span>
                  <span className="text-[11px] font-mono text-red-600 dark:text-red-400 font-bold shrink-0">
                    {preset.powerKw} kW
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
