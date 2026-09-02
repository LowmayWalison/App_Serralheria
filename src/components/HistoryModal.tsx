import { useState, ChangeEvent } from 'react';
import { QuoteData, QuoteStatus } from '../types';
import { formatBRL, calculateQuoteTotals } from '../utils/formatters';
import { 
  FolderOpen, 
  X, 
  Search, 
  Trash2, 
  Copy, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Download,
  Upload
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: QuoteData[];
  onLoadQuote: (quote: QuoteData) => void;
  onDuplicateQuote: (quote: QuoteData) => void;
  onDeleteQuote: (id: string) => void;
  onImportQuotes: (quotes: QuoteData[]) => void;
}

const STATUS_BADGES: Record<QuoteStatus, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Enviado', class: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Aprovado', class: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Concluído', class: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', class: 'bg-rose-100 text-rose-800' },
};

export function HistoryModal({
  isOpen,
  onClose,
  savedQuotes,
  onLoadQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onImportQuotes,
}: HistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteToDelete, setQuoteToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!isOpen) return null;

  const filteredQuotes = savedQuotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.projectClient || '').toLowerCase().includes(term) ||
      (q.observations || '').toLowerCase().includes(term) ||
      (q.location || '').toLowerCase().includes(term) ||
      (q.date || '').includes(term)
    );
  });

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedQuotes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_orcamentos_serralheria_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportQuotes(parsed);
          }
        } catch (err) {
          console.error('Erro ao importar arquivo JSON', err);
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 flex items-center justify-between shrink-0 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 text-red-500 rounded-xl font-black border border-red-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Histórico de Orçamentos Salvos</h3>
              <p className="text-xs text-zinc-400">
                {savedQuotes.length} {savedQuotes.length === 1 ? 'orçamento salvo' : 'orçamentos salvos'} neste dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, projeto ou data..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-zinc-900"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportBackup}
              title="Exportar backup dos orçamentos"
              className="p-2 text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <label
              title="Importar backup JSON"
              className="p-2 text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* List of Quotes */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-zinc-300 stroke-1" />
              <p className="text-sm font-medium">Nenhum orçamento encontrado.</p>
              <p className="text-xs text-zinc-400">Clique em "Salvar" no topo para arquivar seus orçamentos.</p>
            </div>
          ) : (
            filteredQuotes.map((q) => {
              const totals = calculateQuoteTotals(q);
              const badge = STATUS_BADGES[q.status || 'draft'];

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-zinc-200 hover:border-red-500/50 bg-zinc-50/70 hover:bg-red-50/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.class}`}>
                        {badge.label}
                      </span>
                      <h4 className="font-bold text-zinc-900 text-sm truncate">
                        {q.projectClient || 'Orçamento sem título'}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {q.date || 'Sem data'}
                      </span>
                      {q.location && <span className="truncate max-w-[200px]">📍 {q.location}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block font-medium">Valor Total:</span>
                      <span className="text-base font-black font-mono text-zinc-900">
                        {formatBRL(totals.finalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 border-l border-zinc-200 pl-2">
                      <button
                        onClick={() => {
                          onLoadQuote(q);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Abrir este orçamento"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDuplicateQuote(q)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
                        title="Duplicar como novo orçamento"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setQuoteToDelete({ id: q.id, name: q.projectClient || 'Orçamento sem título' })}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Excluir orçamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 p-3.5 border-t border-zinc-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Quote Deletion */}
      <ConfirmModal
        isOpen={quoteToDelete !== null}
        onClose={() => setQuoteToDelete(null)}
        onConfirm={() => {
          if (quoteToDelete) {
            onDeleteQuote(quoteToDelete.id);
            setQuoteToDelete(null);
          }
        }}
        title="Excluir Orçamento"
        message={`Tem certeza que deseja excluir permanentemente o orçamento "${quoteToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}
