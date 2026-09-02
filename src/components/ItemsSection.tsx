import { useState } from 'react';
import { ItemRow } from '../types';
import { formatBRL, parseNumber } from '../utils/formatters';
import { hapticAudio } from '../utils/audioFeedback';
import { Trash2, Plus, Sparkles, ChevronDown, Minus, ChevronUp } from 'lucide-react';

interface PresetItem {
  description: string;
  defaultCost: number;
  defaultQty: number;
  unitLabel: string;
}

interface ItemsSectionProps {
  badgeNumber: number;
  title: string;
  icon?: string;
  items: ItemRow[];
  costLabel: string;
  qtyLabel: string;
  defaultItemName: string;
  defaultUnitCost: number;
  defaultQty: number;
  defaultUnitLabel: string;
  presets?: PresetItem[];
  onChange: (items: ItemRow[]) => void;
}

export function ItemsSection({
  badgeNumber,
  title,
  icon = '📦',
  items,
  costLabel,
  qtyLabel,
  defaultItemName,
  defaultUnitCost,
  defaultQty,
  defaultUnitLabel,
  presets = [],
  onChange,
}: ItemsSectionProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (id: string, field: keyof ItemRow, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleStepQty = (id: string, currentQty: number, delta: number) => {
    hapticAudio.playTap();
    const newQty = Math.max(0, parseFloat((currentQty + delta).toFixed(2)));
    handleUpdate(id, 'quantity', newQty);
  };

  const handleAddRow = (
    desc = defaultItemName,
    cost = defaultUnitCost,
    qty = defaultQty,
    unit = defaultUnitLabel
  ) => {
    hapticAudio.playTap();
    const newItem: ItemRow = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      description: desc,
      unitCost: cost,
      quantity: qty,
      unitLabel: unit,
    };
    onChange([...items, newItem]);
    setShowPresets(false);
    setIsCollapsed(false);
  };

  const handleRemoveRow = (id: string) => {
    hapticAudio.playTap();
    onChange(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-3.5 sm:p-5 shadow-sm mb-4 transition-colors">
      {/* Header & Subtotal */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-red-500/40 text-red-400 font-black text-xs flex items-center justify-center shadow-sm shrink-0 font-mono">
            {badgeNumber}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
              <span>{title}</span>
              {items.length > 0 && (
                <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                  ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Subtotal Pill + Collapse Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs sm:text-sm font-black font-mono text-zinc-900 dark:text-zinc-100 bg-red-50/80 dark:bg-red-950/50 border border-red-200/80 dark:border-red-900/50 px-2.5 py-1 rounded-lg">
            {formatBRL(subtotal)}
          </span>
          <button 
            type="button" 
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <>
          {/* Quick Preset Chips on Mobile */}
          {presets.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider shrink-0 flex items-center gap-1 bg-red-100/70 dark:bg-red-950/70 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/50">
                  <Sparkles className="w-3 h-3 text-red-600 dark:text-red-400" />
                  Rápido:
                </span>
                {presets.slice(0, 6).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddRow(preset.description, preset.defaultCost, preset.defaultQty, preset.unitLabel)}
                    className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-700 active:scale-95 text-zinc-700 dark:text-zinc-300 hover:text-red-900 dark:hover:text-red-200 text-[11px] font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 whitespace-nowrap transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>+ {preset.description.split('(')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="text-center py-5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Nenhum item adicionado nesta categoria.</p>
              <button
                onClick={() => handleAddRow()}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                + Clique para adicionar o primeiro item
              </button>
            </div>
          ) : (
            <div>
              {/* Desktop Table */}
              <table className="w-full text-left hidden md:table border-collapse mb-3">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50">
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 rounded-l-lg">
                      Descrição do Material / Serviço
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-36">
                      {costLabel} (R$)
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-32">
                      {qtyLabel}
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right w-36">
                      Total (R$)
                    </th>
                    <th className="py-2.5 px-2 w-12 text-center rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {items.map((item) => {
                    const rowTotal = item.unitCost * item.quantity;
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                            placeholder="Ex: Descrição do item"
                            className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700/80 focus:bg-white dark:focus:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitCost === 0 ? '' : item.unitCost}
                              onChange={(e) => handleUpdate(item.id, 'unitCost', parseNumber(e.target.value))}
                              placeholder="0,00"
                              className="w-full pl-8 pr-2 py-1.5 text-right font-mono bg-zinc-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700/80 focus:bg-white dark:focus:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => handleUpdate(item.id, 'quantity', parseNumber(e.target.value))}
                              placeholder="0"
                              className="w-full px-2 py-1.5 text-center font-mono bg-zinc-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700/80 focus:bg-white dark:focus:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                            {item.unitLabel && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold w-7 text-left">
                                {item.unitLabel}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {formatBRL(rowTotal)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleRemoveRow(item.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remover linha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Touch-Optimized Item Cards */}
              <div className="md:hidden space-y-3">
                {items.map((item) => {
                  const rowTotal = item.unitCost * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-50/90 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                          placeholder="Descrição do item"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => handleRemoveRow(item.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg shrink-0 cursor-pointer"
                          title="Excluir item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                            {costLabel}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitCost === 0 ? '' : item.unitCost}
                              onChange={(e) => handleUpdate(item.id, 'unitCost', parseNumber(e.target.value))}
                              placeholder="0,00"
                              className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-zinc-900 font-mono border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-right text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                            {qtyLabel} {item.unitLabel && `(${item.unitLabel})`}
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStepQty(item.id, item.quantity, -1)}
                              className="w-7 h-8 bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 active:bg-zinc-300 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => handleUpdate(item.id, 'quantity', parseNumber(e.target.value))}
                              placeholder="0"
                              className="w-full px-1 py-1.5 bg-white dark:bg-zinc-900 font-mono border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleStepQty(item.id, item.quantity, 1)}
                              className="w-7 h-8 bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 active:bg-zinc-300 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Qty Presets on Mobile (+5, +6m barra, +10) */}
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">Atalhos:</span>
                          <button
                            type="button"
                            onClick={() => handleStepQty(item.id, item.quantity, 6)}
                            className="px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-mono font-bold cursor-pointer"
                          >
                            +6m
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepQty(item.id, item.quantity, 10)}
                            className="px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-mono font-bold cursor-pointer"
                          >
                            +10
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold">Total:</span>
                          <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {formatBRL(rowTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Button & Presets dropdown */}
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAddRow()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 border border-red-500/30 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Adicionar Item</span>
            </button>

            {presets.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Catálogo de Itens</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                </button>

                {showPresets && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1.5 z-30 max-h-60 overflow-y-auto">
                    <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Clique para adicionar:
                    </div>
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddRow(preset.description, preset.defaultCost, preset.defaultQty, preset.unitLabel)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-700 dark:text-zinc-300 hover:text-red-900 dark:hover:text-red-200 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate pr-2 font-medium">{preset.description}</span>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-bold shrink-0">
                          {formatBRL(preset.defaultCost)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
