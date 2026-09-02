import { PRESET_TEMPLATES, TemplateDefinition } from '../data/defaultTemplates';
import { QuoteData } from '../types';
import { Layers, X, ArrowRight, Sparkles, Check } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4.5 flex items-center justify-between shrink-0 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 text-red-500 rounded-xl font-black border border-red-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Modelos de Projetos Prontos</h3>
              <p className="text-xs text-zinc-400">Inicie seu orçamento com materiais e medidas pré-configuradas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Templates */}
        <div className="p-5 overflow-y-auto space-y-3">
          {PRESET_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              className="p-4 rounded-xl border border-zinc-200 hover:border-red-500/70 bg-zinc-50/60 hover:bg-red-50/40 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-zinc-900 text-red-400 rounded-md">
                    {tmpl.category}
                  </span>
                  <h4 className="font-bold text-zinc-900 text-sm md:text-base group-hover:text-red-700 transition-colors">
                    {tmpl.name}
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white group-hover:bg-red-600 group-hover:text-white text-zinc-700 border border-zinc-200 group-hover:border-red-600 rounded-xl text-xs font-bold transition shrink-0 shadow-sm cursor-pointer">
                <span>Carregar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 p-4 border-t border-zinc-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-zinc-500">
            Você poderá editar qualquer valor após carregar.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
