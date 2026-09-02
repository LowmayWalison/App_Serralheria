import { QuoteData, QuoteStatus } from '../types';
import { User, Phone, MapPin, FileText, MessageCircle } from 'lucide-react';

interface ProjectInfoCardProps {
  quote: QuoteData;
  onChange: (updated: Partial<QuoteData>) => void;
}

const STATUS_LABELS: Record<QuoteStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  sent: { label: 'Enviado ao Cliente', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved: { label: 'Aprovado / Fechado', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  completed: { label: 'Entregue / Concluído', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  canceled: { label: 'Cancelado / Não Fechado', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function ProjectInfoCard({ quote, onChange }: ProjectInfoCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-5 shadow-sm mb-5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900/50 shadow-xs shrink-0">
            <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Dados do Projeto & Cliente
          </h2>
        </div>
        
        {/* Status selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status:</span>
          <select
            id="select-project-status"
            value={quote.status}
            onChange={(e) => onChange({ status: e.target.value as QuoteStatus })}
            className={`text-xs font-bold py-1.5 px-3 rounded-lg border appearance-auto transition-colors cursor-pointer ${STATUS_LABELS[quote.status].color}`}
          >
            <option value="draft">🟡 Rascunho</option>
            <option value="sent">🔵 Enviado</option>
            <option value="approved">🟢 Aprovado</option>
            <option value="completed">🟣 Concluído</option>
            <option value="canceled">🔴 Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cliente / Projeto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Projeto / Nome do Cliente</span>
          </label>
          <input
            id="input-projeto-cliente"
            type="text"
            value={quote.projectClient}
            onChange={(e) => onChange({ projectClient: e.target.value })}
            placeholder="Ex: Portão Basculante - Seu João"
            className="w-full px-3.5 py-2.5 bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
          />
        </div>

        {/* WhatsApp do Cliente */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp / Telefone</span>
          </label>
          <input
            id="input-cliente-telefone"
            type="tel"
            value={quote.clientPhone}
            onChange={(e) => onChange({ clientPhone: e.target.value })}
            placeholder="(11) 99999-9999"
            className="w-full px-3.5 py-2.5 bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Local de Instalação */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Local / Endereço da Obra</span>
          </label>
          <input
            id="input-local-obra"
            type="text"
            value={quote.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Ex: Rua das Flores, 123 - Centro"
            className="w-full px-3.5 py-2.5 bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
          />
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Especificações Técnicas, Acabamento e Observações</span>
          </label>
          <textarea
            id="input-observacoes"
            rows={2}
            value={quote.observations}
            onChange={(e) => onChange({ observations: e.target.value })}
            placeholder="Ex: Pintura fundo primer anticorrosivo e acabamento esmalte sintético preto fosco. Incluso instalação no local."
            className="w-full px-3.5 py-2.5 bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
