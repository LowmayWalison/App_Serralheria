import { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  CloudUpload, 
  RefreshCw, 
  LogOut, 
  FileSpreadsheet, 
  FileText, 
  Mail, 
  Calendar as CalendarIcon, 
  Download, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Trash2,
  BookmarkCheck,
  User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  logout, 
  saveQuoteToCloud, 
  fetchUserQuotesFromCloud,
  deleteQuoteFromCloud
} from '../services/firebase';
import { QuoteData, CalculatedTotals, WorkshopProfile } from '../types';
import { formatBRL, generateWhatsAppMessage } from '../utils/formatters';
import { hapticAudio } from '../utils/audioFeedback';

interface WorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
  totals: CalculatedTotals;
  profile: WorkshopProfile;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onApplyContact?: (name: string, phone: string) => void;
  onLoadCloudQuotes?: (quotes: QuoteData[]) => void;
}

export function WorkspaceHubModal({
  isOpen,
  onClose,
  quote,
  totals,
  profile,
  currentUser,
  onUserChange,
  onApplyContact,
  onLoadCloudQuotes,
}: WorkspaceHubModalProps) {
  const [activeTab, setActiveTab] = useState<'cloud' | 'export' | 'tools'>('cloud');
  const [isLoading, setIsLoading] = useState(false);
  const [cloudQuotes, setCloudQuotes] = useState<QuoteData[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCloudQuotesList();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const loadCloudQuotesList = async () => {
    if (!currentUser) return;
    setLoadingQuotes(true);
    try {
      const quotes = await fetchUserQuotesFromCloud(currentUser.uid);
      setCloudQuotes(quotes);
      if (onLoadCloudQuotes && quotes.length > 0) {
        onLoadCloudQuotes(quotes);
      }
    } catch (e: any) {
      console.error('Failed to load cloud quotes', e);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleSignIn = async () => {
    hapticAudio.playTap();
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user);
        setFeedback({ type: 'success', message: `Conectado como ${res.user.displayName || res.user.email}!` });
        await loadCloudQuotesList();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao conectar com o Google.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    hapticAudio.playTap();
    try {
      await logout();
      onUserChange(null);
      setCloudQuotes([]);
      setFeedback({ type: 'success', message: 'Sessão encerrada com sucesso.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Falha ao sair da conta.' });
    }
  };

  const handleSaveToCloud = async () => {
    if (!currentUser) {
      setFeedback({ type: 'error', message: 'Faça login com sua conta Google primeiro.' });
      return;
    }
    hapticAudio.playSuccess();
    setIsLoading(true);
    setFeedback(null);
    try {
      await saveQuoteToCloud(quote, currentUser.uid);
      setFeedback({ type: 'success', message: `Orçamento "${quote.projectClient || 'Projeto'}" salvo na Nuvem!` });
      await loadCloudQuotesList();
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'Erro ao salvar na nuvem: ' + (e.message || String(e)) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCloudQuote = async (id: string) => {
    hapticAudio.playTap();
    try {
      await deleteQuoteFromCloud(id);
      setCloudQuotes(prev => prev.filter(q => q.id !== id));
      setFeedback({ type: 'success', message: 'Orçamento removido da nuvem.' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'Erro ao remover da nuvem.' });
    }
  };

  // CSV export for Google Sheets / Excel
  const handleExportCSV = () => {
    hapticAudio.playTap();
    const rows = [
      ['Categoria', 'Item', 'Quantidade', 'Unidade', 'Custo Unitário (R$)', 'Subtotal (R$)'],
      ...(quote.metalItems || []).map(i => ['Metal e Tubos', i.description, i.quantity, i.unitLabel || 'm', i.unitCost, (i.quantity * i.unitCost).toFixed(2)]),
      ...(quote.materialItems || []).map(i => ['Acessórios', i.description, i.quantity, i.unitLabel || 'un', i.unitCost, (i.quantity * i.unitCost).toFixed(2)]),
      ...(quote.consumableItems || []).map(i => ['Consumíveis', i.description, i.quantity, i.unitLabel || 'un', i.unitCost, (i.quantity * i.unitCost).toFixed(2)]),
      ...(quote.discItems || []).map(i => ['Discos & Abrasivos', i.description, i.quantity, i.unitLabel || 'un', i.unitCost, (i.quantity * i.unitCost).toFixed(2)]),
      ...(quote.laborItems || []).map(i => ['Mão de Obra', i.description, i.quantity, i.unitLabel || 'h', i.unitCost, (i.quantity * i.unitCost).toFixed(2)]),
      ...(quote.extraCosts || []).map(i => ['Extras/Frete', i.description, 1, 'un', i.cost, i.cost.toFixed(2)]),
      ['', '', '', '', 'TOTAL GERAL', totals.finalPrice.toFixed(2)]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orcamento_${quote.projectClient || 'projeto'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyProposalText = () => {
    hapticAudio.playSuccess();
    const text = generateWhatsAppMessage(quote, totals, profile);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Hub de Nuvem & Google</h2>
              <p className="text-xs text-zinc-400">Sincronização em nuvem e exportação de orçamentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 px-4 bg-zinc-950/60 shrink-0">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'cloud' ? 'border-red-500 text-red-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Sincronização Nuvem</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'export' ? 'border-red-500 text-red-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Planilha (CSV)</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-3 mx-4 mt-4 rounded-xl text-xs flex items-center gap-2.5 font-medium ${
            feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300' : 'bg-red-950/60 border border-red-800/80 text-red-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Account Status Card */}
              <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white shrink-0">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-full" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-zinc-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {currentUser ? (currentUser.displayName || currentUser.email) : 'Não conectado'}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {currentUser ? 'Conta Google conectada via Firebase' : 'Faça login para salvar orçamentos na nuvem'}
                    </p>
                  </div>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 active:scale-95 rounded-xl text-xs font-bold shadow transition cursor-pointer"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    <span>{isLoading ? 'Conectando...' : 'Entrar com Google'}</span>
                  </button>
                )}
              </div>

              {/* Cloud Sync Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSaveToCloud}
                  disabled={isLoading || !currentUser}
                  className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/40 transition cursor-pointer"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>Salvar Orçamento Atual na Nuvem</span>
                </button>

                <button
                  onClick={loadCloudQuotesList}
                  disabled={loadingQuotes || !currentUser}
                  className="p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-bold text-xs sm:text-sm border border-zinc-700 flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingQuotes ? 'animate-spin text-red-400' : ''}`} />
                  <span>Atualizar Lista da Nuvem</span>
                </button>
              </div>

              {/* Saved Quotes List in Cloud */}
              <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Orçamentos Salvos na Nuvem ({cloudQuotes.length})
                  </h4>
                </div>

                {!currentUser ? (
                  <p className="text-xs text-zinc-500 text-center py-4">
                    Entre com sua conta Google para visualizar seus orçamentos salvos online.
                  </p>
                ) : cloudQuotes.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">
                    Nenhum orçamento salvo na nuvem ainda. Clique no botão acima para salvar o atual!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {cloudQuotes.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 bg-zinc-800/80 border border-zinc-700/60 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-white block truncate">{q.projectClient || 'Orçamento sem título'}</strong>
                          <span className="text-[11px] text-zinc-400">{q.date || 'Sem data'} • {q.metalItems?.length || 0} metais</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDeleteCloudQuote(q.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer"
                            title="Excluir da nuvem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Exportação para Planilhas (CSV)</h4>
                    <p className="text-zinc-400">Compatível diretamente com Google Planilhas (Sheets) e Microsoft Excel</p>
                  </div>
                </div>

                <p className="text-zinc-300 leading-relaxed">
                  Baixe o arquivo CSV formatado com todos os itens, quantidades, custos unitários e totais do orçamento atual para abrir no seu Google Drive ou planilha de controle.
                </p>

                <button
                  onClick={handleExportCSV}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha CSV do Orçamento Atual</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Copiar Texto Formatado</h4>
                    <p className="text-zinc-400">Cole no Google Docs, Gmail ou envie diretamente</p>
                  </div>
                </div>

                <button
                  onClick={handleCopyProposalText}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-100 border border-zinc-700 font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                  <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar Texto da Proposta'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
