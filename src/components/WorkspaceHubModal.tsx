import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  HardDrive, 
  Mail, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Users, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  LogOut,
  Send,
  CloudUpload,
  RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  logout, 
  getAccessToken, 
  saveQuoteToCloud, 
  fetchUserQuotesFromCloud 
} from '../services/firebase';
import { 
  createGoogleSheetForQuote, 
  createGoogleDocProposal, 
  saveQuoteToGoogleDrive, 
  sendQuoteByGmail, 
  scheduleCalendarEvent, 
  createGoogleTask, 
  fetchGoogleContacts,
  GoogleContact
} from '../services/googleWorkspace';
import { QuoteData, CalculatedTotals, WorkshopProfile } from '../types';

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
  const [activeTab, setActiveTab] = useState<'hub' | 'sheets' | 'docs' | 'drive' | 'gmail' | 'calendar' | 'tasks' | 'contacts' | 'firestore'>('hub');
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  // Gmail form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [asDraft, setAsDraft] = useState(false);

  // Calendar form state
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [eventType, setEventType] = useState<'medicao' | 'instalacao' | 'entrega'>('medicao');

  // Tasks form state
  const [taskTitle, setTaskTitle] = useState(`Fabricar projeto: ${quote.observations || 'Estrutura metálica'} - ${quote.projectClient}`);
  const [taskDueDate, setTaskDueDate] = useState('');

  // Contacts state
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Cloud quotes state
  const [cloudQuotes, setCloudQuotes] = useState<QuoteData[]>([]);
  const [loadingCloudQuotes, setLoadingCloudQuotes] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResultMessage(null);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setResultMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user);
        setResultMessage({ type: 'success', text: `Conectado com sucesso como ${res.user.displayName || res.user.email}!` });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Erro ao conectar conta Google' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onUserChange(null);
    setContacts([]);
    setResultMessage({ type: 'success', text: 'Desconectado da conta Google.' });
  };

  const executeActionWithAuth = async (action: (token: string) => Promise<void>) => {
    setResultMessage(null);
    if (!currentUser) {
      setResultMessage({ type: 'error', text: 'Conecte sua conta Google primeiro para continuar.' });
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      // Re-prompt sign in to refresh token
      try {
        const res = await googleSignIn();
        if (res?.accessToken) {
          await action(res.accessToken);
        } else {
          setResultMessage({ type: 'error', text: 'Faça login novamente com o Google para renovar o acesso.' });
        }
      } catch (err: any) {
        setResultMessage({ type: 'error', text: err.message || 'Erro de autenticação Google' });
      }
      return;
    }
    await action(token);
  };

  // 1. Export to Sheets
  const handleExportSheets = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Criar Planilha no Google Sheets?',
      description: `Será criada uma nova planilha no seu Google Sheets com todos os itens, cálculos e totais do orçamento para "${quote.projectClient || 'Cliente'}".`,
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeActionWithAuth(async (token) => {
          setIsLoading(true);
          const res = await createGoogleSheetForQuote(token, quote, totals, profile);
          setIsLoading(false);
          if (res.success && res.data) {
            setResultMessage({
              type: 'success',
              text: 'Planilha criada com sucesso no seu Google Sheets!',
              link: res.data.spreadsheetUrl,
            });
          } else {
            setResultMessage({ type: 'error', text: res.error || 'Erro ao criar planilha' });
          }
        });
      },
    });
  };

  // 2. Export to Docs
  const handleExportDocs = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Gerar Documento no Google Docs?',
      description: `Será gerada uma proposta comercial formal formatada no seu Google Docs pronta para revisão, assinatura e impressão.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeActionWithAuth(async (token) => {
          setIsLoading(true);
          const res = await createGoogleDocProposal(token, quote, totals, profile);
          setIsLoading(false);
          if (res.success && res.data) {
            setResultMessage({
              type: 'success',
              text: 'Proposta formal gerada com sucesso no Google Docs!',
              link: res.data.documentUrl,
            });
          } else {
            setResultMessage({ type: 'error', text: res.error || 'Erro ao gerar documento' });
          }
        });
      },
    });
  };

  // 3. Backup to Drive
  const handleExportDrive = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Salvar Arquivo no Google Drive?',
      description: `Será salvo um arquivo de backup com os dados estruturados do orçamento no seu Google Drive.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeActionWithAuth(async (token) => {
          setIsLoading(true);
          const res = await saveQuoteToGoogleDrive(token, quote);
          setIsLoading(false);
          if (res.success && res.data) {
            setResultMessage({
              type: 'success',
              text: 'Orçamento salvo com sucesso no seu Google Drive!',
              link: res.data.webViewLink,
            });
          } else {
            setResultMessage({ type: 'error', text: res.error || 'Erro ao salvar no Drive' });
          }
        });
      },
    });
  };

  // 4. Send Gmail
  const handleSendGmail = () => {
    if (!recipientEmail) {
      setResultMessage({ type: 'error', text: 'Informe o e-mail de destino.' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: asDraft ? 'Criar Rascunho no Gmail?' : 'Enviar Orçamento por Gmail?',
      description: asDraft
        ? `Um rascunho de e-mail com a proposta completa será criado na sua caixa postal do Gmail para ${recipientEmail}.`
        : `A proposta de orçamento será enviada diretamente do seu e-mail Gmail para ${recipientEmail}.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeActionWithAuth(async (token) => {
          setIsLoading(true);
          const res = await sendQuoteByGmail(token, recipientEmail, quote, totals, profile, asDraft);
          setIsLoading(false);
          if (res.success) {
            setResultMessage({
              type: 'success',
              text: asDraft ? 'Rascunho criado com sucesso no Gmail!' : 'E-mail enviado com sucesso via Gmail!',
            });
          } else {
            setResultMessage({ type: 'error', text: res.error || 'Erro ao enviar e-mail' });
          }
        });
      },
    });
  };

  // 5. Schedule Calendar
  const handleScheduleCalendar = () => {
    const titles = {
      medicao: `📐 Medição Técnica: ${quote.projectClient}`,
      instalacao: `🔩 Instalação / Montagem: ${quote.projectClient}`,
      entrega: `🚚 Entrega do Projeto: ${quote.projectClient}`,
    };
    
    setConfirmDialog({
      isOpen: true,
      title: 'Adicionar Evento no Google Agenda?',
      description: `Será agendado o compromisso "${titles[eventType]}" para o dia ${eventDate} às ${eventTime} no seu Google Agenda.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeActionWithAuth(async (token) => {
          setIsLoading(true);
          const startIso = `${eventDate}T${eventTime}:00`;
          // default 2h event
          const endHour = (parseInt(eventTime.split(':')[0], 10) + 2).toString().padStart(2, '0');
          const endIso = `${eventDate}T${endHour}:${eventTime.split(':')[1]}:00`;

          const res = await scheduleCalendarEvent(token, {
            summary: titles[eventType],
            description: `Cliente: ${quote.projectClient}\nTelefone: ${quote.clientPhone}\nLocal: ${quote.location}\nProjeto: ${quote.observations}`,
            location: quote.location || 'Oficina / Local da Obra',
            startDateTime: startIso,
            endDateTime: endIso,
          });
          setIsLoading(false);
          if (res.success && res.data) {
            setResultMessage({
              type: 'success',
              text: 'Compromisso agendado no seu Google Agenda com sucesso!',
              link: res.data.htmlLink,
            });
          } else {
            setResultMessage({ type: 'error', text: res.error || 'Erro ao agendar' });
          }
        });
      },
    });
  };

  // 6. Create Google Task
  const handleCreateTask = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Criar Tarefa no Google Tasks?',
      description: `Será adicionada uma nova tarefa na sua lista do Google Tasks com os detalhes do projeto.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeActionWithAuth(async (token) => {
          setIsLoading(true);
          const res = await createGoogleTask(token, {
            title: taskTitle,
            notes: `Cliente: ${quote.projectClient} | Tel: ${quote.clientPhone}\nValor: ${totals.finalPrice}\nPrazo: ${quote.deliveryDays}`,
            due: taskDueDate ? `${taskDueDate}T23:59:59.000Z` : undefined,
          });
          setIsLoading(false);
          if (res.success) {
            setResultMessage({
              type: 'success',
              text: 'Tarefa criada com sucesso no Google Tasks!',
            });
          } else {
            setResultMessage({ type: 'error', text: res.error || 'Erro ao criar tarefa' });
          }
        });
      },
    });
  };

  // 7. Load Google Contacts
  const handleLoadContacts = async () => {
    await executeActionWithAuth(async (token) => {
      setLoadingContacts(true);
      const res = await fetchGoogleContacts(token);
      setLoadingContacts(false);
      if (res.success && res.data) {
        setContacts(res.data);
      } else {
        setResultMessage({ type: 'error', text: res.error || 'Erro ao carregar contatos' });
      }
    });
  };

  // 8. Firebase Firestore Cloud Sync
  const handleSaveToFirestore = async () => {
    if (!currentUser) {
      setResultMessage({ type: 'error', text: 'Conecte sua conta Google para sincronizar com a nuvem.' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Salvar Orçamento no Firebase Firestore?',
      description: `O orçamento atual será salvo na sua conta em nuvem Firebase Firestore para acesso em qualquer dispositivo.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsLoading(true);
        try {
          await saveQuoteToCloud(quote, currentUser.uid);
          setResultMessage({ type: 'success', text: 'Orçamento sincronizado na nuvem com Firebase Firestore!' });
          // refresh list
          handleLoadCloudQuotes();
        } catch (err: any) {
          setResultMessage({ type: 'error', text: err.message || 'Erro ao salvar no Firestore' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleLoadCloudQuotes = async () => {
    if (!currentUser) return;
    setLoadingCloudQuotes(true);
    try {
      const list = await fetchUserQuotesFromCloud(currentUser.uid);
      setCloudQuotes(list);
      if (onLoadCloudQuotes) {
        onLoadCloudQuotes(list);
      }
    } catch (err: any) {
      console.error('Firestore list error', err);
    } finally {
      setLoadingCloudQuotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Google Workspace & Firebase Hub
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Integração completa com Google Sheets, Docs, Drive, Gmail, Agenda e Nuvem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Bar */}
        <div className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-red-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-red-500 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Conectado com Google
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Conecte sua conta para habilitar exportações e sincronização na nuvem.</span>
            </div>
          )}

          <div>
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-red-500 hover:text-white text-zinc-700 dark:text-zinc-200 rounded-lg font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Desconectar
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-xl font-bold shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Entrar com Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto bg-zinc-50/50 dark:bg-zinc-900/30 px-6 pt-2">
          {[
            { id: 'hub', label: 'Visão Geral', icon: Cloud },
            { id: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet },
            { id: 'docs', label: 'Google Docs', icon: FileText },
            { id: 'drive', label: 'Google Drive', icon: HardDrive },
            { id: 'gmail', label: 'Gmail', icon: Mail },
            { id: 'calendar', label: 'Google Agenda', icon: CalendarIcon },
            { id: 'tasks', label: 'Google Tasks', icon: CheckSquare },
            { id: 'contacts', label: 'Contatos', icon: Users },
            { id: 'firestore', label: 'Nuvem (Firestore)', icon: CloudUpload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-zinc-900 rounded-t-xl shadow-xs'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {resultMessage && (
          <div className="px-6 pt-4">
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {resultMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span>{resultMessage.text}</span>
              </div>
              {resultMessage.link && (
                <a
                  href={resultMessage.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB: HUB */}
          {activeTab === 'hub' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  Ações Rápidas de Integração
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Exporte o orçamento atual diretamente para os serviços oficiais do Google.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Sheets card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Google Sheets</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Cria uma planilha com tabela de perfis, chapas, tintas e totais.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportSheets}
                    disabled={isLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>Exportar Planilha</span>
                  </button>
                </div>

                {/* Docs card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Google Docs</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Gera proposta comercial escrita pronta com termos e assinatura.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportDocs}
                    disabled={isLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Gerar Proposta Doc</span>
                  </button>
                </div>

                {/* Drive card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Google Drive</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Salva arquivo de backup estruturado no seu Drive.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportDrive}
                    disabled={isLoading}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                    <span>Salvar no Drive</span>
                  </button>
                </div>

                {/* Gmail card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Gmail</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Dispara a proposta por e-mail ou cria um rascunho.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('gmail')}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Configurar Envio</span>
                  </button>
                </div>

                {/* Calendar card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Google Agenda</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Agenda medição no local ou montagem com alerta.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>Agendar Visita</span>
                  </button>
                </div>

                {/* Firestore Cloud card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Firebase Firestore</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Banco em nuvem para salvar e carregar orçamentos.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveToFirestore}
                    disabled={isLoading}
                    className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    <span>Sincronizar na Nuvem</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GMAIL */}
          {activeTab === 'gmail' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-500" />
                  Enviar Proposta por E-mail (Gmail)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Envia a proposta de orçamento com todos os detalhes de pagamento diretamente da sua conta Google.
                </p>
              </div>

              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    E-mail do Cliente:
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="cliente@exemplo.com.br"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="asDraft"
                    checked={asDraft}
                    onChange={(e) => setAsDraft(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="asDraft" className="text-xs text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer">
                    Salvar apenas como Rascunho no Gmail (não enviar agora)
                  </label>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={handleSendGmail}
                    disabled={isLoading || !recipientEmail}
                    className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{asDraft ? 'Criar Rascunho no Gmail' : 'Enviar E-mail Agora'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-500" />
                  Agendar no Google Agenda
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Crie um compromisso no Google Calendar para medição técnica no cliente ou montagem.
                </p>
              </div>

              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Tipo de Compromisso:
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="medicao">📐 Visita / Medição Técnica</option>
                    <option value="instalacao">🔩 Instalação / Montagem da Estrutura</option>
                    <option value="entrega">🚚 Entrega das Peças no Local</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Data:
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Horário:
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={handleScheduleCalendar}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarIcon className="w-4 h-4" />}
                    <span>Agendar no Google Agenda</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Criar Tarefa no Google Tasks
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Adicione um item na sua lista de afazeres para acompanhar a fabricação ou compras de material.
                </p>
              </div>

              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Título da Tarefa:
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Comprar perfis e iniciar corte"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Prazo / Vencimento (Opcional):
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={handleCreateTask}
                    disabled={isLoading || !taskTitle}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                    <span>Adicionar ao Google Tasks</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Contatos do Google (People API)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Importe o nome e telefone do cliente diretamente da sua agenda de contatos Google.
                  </p>
                </div>

                <button
                  onClick={handleLoadContacts}
                  disabled={loadingContacts}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {loadingContacts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Carregar Contatos</span>
                </button>
              </div>

              {contacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{c.name}</div>
                        {c.phone && <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{c.phone}</div>}
                        {c.email && <div className="text-[10px] text-zinc-400 truncate">{c.email}</div>}
                      </div>

                      <button
                        onClick={() => {
                          if (onApplyContact) {
                            onApplyContact(c.name, c.phone || '');
                            setResultMessage({ type: 'success', text: `Cliente "${c.name}" aplicado ao orçamento!` });
                          }
                        }}
                        className="px-2.5 py-1 bg-red-50 dark:bg-red-950/50 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-300 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Nenhum contato carregado ainda.
                  </p>
                  <button
                    onClick={handleLoadContacts}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Buscar contatos da sua conta Google
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: FIRESTORE CLOUD */}
          {activeTab === 'firestore' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 text-orange-500" />
                    Sincronização em Nuvem (Firebase Firestore)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Seus orçamentos salvos e sincronizados com segurança no banco de dados Firestore.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToFirestore}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                    <span>Salvar Orçamento Atual</span>
                  </button>

                  <button
                    onClick={handleLoadCloudQuotes}
                    disabled={loadingCloudQuotes}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCloudQuotes ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>

              {cloudQuotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {cloudQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                          {q.projectClient || 'Cliente sem nome'}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {q.observations ? q.observations.slice(0, 35) + '...' : 'Sem descrição'}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1">
                          Data: {q.date || 'Recente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Clique em "Salvar Orçamento Atual" para enviar seus dados para a nuvem.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {confirmDialog.description}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  Confirmar e Prosseguir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <span>Sincronização segura via Google APIs & Firebase</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
