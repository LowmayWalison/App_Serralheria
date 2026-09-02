import { ExtraCostItem } from '../types';
import { formatBRL, parseNumber } from '../utils/formatters';
import { Truck, Plus, Trash2, Sparkles } from 'lucide-react';

interface ExtraCostsSectionProps {
  items: ExtraCostItem[];
  onChange: (items: ExtraCostItem[]) => void;
}

const COMMON_EXTRAS = [
  { description: 'Combustível / Frete de Entrega & Transporte', cost: 80.00 },
  { description: 'Pintura Eletrostática a Pó (Terceirizada)', cost: 180.00 },
  { description: 'Galvanização a Fogo / Zincagem (Terceirizada)', cost: 250.00 },
  { description: 'Locação de Andaime Tubular (Diária/Semana)', cost: 120.00 },
  { description: 'Alimentação / Diárias da Equipe Externa', cost: 70.00 },
  { description: 'Caçamba / Descarte de Entulho', cost: 150.00 },
];

export function ExtraCostsSection({ items, onChange }: ExtraCostsSectionProps) {
  const handleUpdate = (id: string, field: keyof ExtraCostItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleAdd = (desc = 'Frete / Deslocamento', cost = 50.00) => {
    const newItem: ExtraCostItem = {
      id: 'extra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      description: desc,
      cost: cost,
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + item.cost, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 md:p-5 shadow-sm mb-5 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-red-500/40 text-red-400 font-black text-xs flex items-center justify-center shadow-sm font-mono">
            8
          </span>
          <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Custos Extras, Frete & Terceirizados</span>
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

      {items.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Nenhum custo extra ou serviço terceirizado lançado.</p>
          <button
            onClick={() => handleAdd()}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            + Adicionar frete ou custo extra
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-xl transition-all"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                  placeholder="Descrição do custo (Frete, Galvanização, etc.)"
                  className="w-full px-2.5 py-1 bg-transparent border-none text-sm font-medium text-zinc-800 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-700 focus:ring-1 focus:ring-red-500 rounded"
                />
              </div>

              <div className="relative w-32 shrink-0">
                <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.cost === 0 ? '' : item.cost}
                  onChange={(e) => handleUpdate(item.id, 'cost', parseNumber(e.target.value))}
                  placeholder="0,00"
                  className="w-full pl-8 pr-2.5 py-1 text-right font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="Remover custo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add presets */}
      <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 border border-red-500/30 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Adicionar Custo Extra</span>
        </button>

        <div className="flex flex-wrap gap-1.5 ml-auto">
          {COMMON_EXTRAS.slice(0, 3).map((extra, idx) => (
            <button
              key={idx}
              onClick={() => handleAdd(extra.description, extra.cost)}
              className="text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-900 dark:hover:text-red-200 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
            >
              + {extra.description.split(' ')[0]} ({formatBRL(extra.cost)})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
