import { useState, useEffect } from 'react';
import { QuoteData, WorkshopProfile, ItemRow } from './types';
import { calculateQuoteTotals, generateWhatsAppMessage, formatBRL } from './utils/formatters';
import { createEmptyQuote, TemplateDefinition, PRESET_TEMPLATES } from './data/defaultTemplates';
import { Header } from './components/Header';
import { ProjectInfoCard } from './components/ProjectInfoCard';
import { ItemsSection } from './components/ItemsSection';
import { EnergySection } from './components/EnergySection';
import { ExtraCostsSection } from './components/ExtraCostsSection';
import { SummarySection } from './components/SummarySection';
import { BarCalculatorModal } from './components/BarCalculatorModal';
import { TemplatesModal } from './components/TemplatesModal';
import { HistoryModal } from './components/HistoryModal';
import { WorkshopProfileModal } from './components/WorkshopProfileModal';
import { PrintProposalModal } from './components/PrintProposalModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { ConfirmModal } from './components/ConfirmModal';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { hapticAudio } from './utils/audioFeedback';
import { 
  BookmarkCheck, 
  Layers, 
  CheckCircle2,
  FileSpreadsheet,
  BadgeDollarSign,
  Plus,
  ArrowRight,
  Trash2,
  Copy,
  Download,
  Smartphone,
  X
} from 'lucide-react';

const STORAGE_KEY_CURRENT = 'serralheria_current_quote_v1';
const STORAGE_KEY_HISTORY = 'serralheria_quotes_history_v1';
const STORAGE_KEY_PROFILE = 'serralheria_profile_v1';

const DEFAULT_PROFILE: WorkshopProfile = {
  name: 'LW Serralheria & Estruturas Metálicas',
  description: 'Estruturas Metálicas • Esquadrias de Ferro • Serralheria em Geral',
  phone: '(11) 98765-4321',
  pixKey: 'serralheria@exemplo.com.br',
  city: 'São Paulo - SP',
  warranty: '90 dias contra defeitos de fabricação e soldagem.',
};

// Preset catalog for fast adding
const METAL_PRESETS = [
  { description: 'Metalon 50x30 chapa 18 (1.2mm)', defaultCost: 35.00, defaultQty: 12, unitLabel: 'm' },
  { description: 'Metalon 50x50 chapa 16 (1.5mm)', defaultCost: 48.00, defaultQty: 18, unitLabel: 'm' },
  { description: 'Tubo 20x20 chapa 18 (1.2mm)', defaultCost: 18.50, defaultQty: 18, unitLabel: 'm' },
  { description: 'Tubo Redondo 1.1/2" (38mm) chapa 16', defaultCost: 32.00, defaultQty: 6, unitLabel: 'm' },
  { description: 'Cantoneira 1" x 1/8"', defaultCost: 22.00, defaultQty: 6, unitLabel: 'm' },
  { description: 'Cantoneira 3/4" x 1/8"', defaultCost: 16.00, defaultQty: 6, unitLabel: 'm' },
  { description: 'Barra Chata 1" x 1/8"', defaultCost: 14.50, defaultQty: 6, unitLabel: 'm' },
  { description: 'Barra Quadrada Maciça 1/2"', defaultCost: 24.00, defaultQty: 12, unitLabel: 'm' },
  { description: 'Perfil U Enrijecido 100x40 #14', defaultCost: 55.00, defaultQty: 12, unitLabel: 'm' },
  { description: 'Chapa Lambril Búzios #20', defaultCost: 85.00, defaultQty: 6, unitLabel: 'm' },
];

const MATERIAL_PRESETS = [
  { description: 'Fechadura Bico de Papagaio / Stam', defaultCost: 45.00, defaultQty: 1, unitLabel: 'un' },
  { description: 'Dobradiça Gonzo 3/4 com abas', defaultCost: 8.50, defaultQty: 3, unitLabel: 'un' },
  { description: 'Roldana 4" com rolamento blindado', defaultCost: 38.00, defaultQty: 2, unitLabel: 'un' },
  { description: 'Trilho U ou V para portão de correr', defaultCost: 35.00, defaultQty: 6, unitLabel: 'm' },
  { description: 'Kit Basculante (Braço + Cabo + Roldana)', defaultCost: 280.00, defaultQty: 1, unitLabel: 'kit' },
  { description: 'Puxador Tubular em Alumínio 40cm', defaultCost: 45.00, defaultQty: 1, unitLabel: 'un' },
  { description: 'Parafusos sextavados e buchas 10', defaultCost: 1.50, defaultQty: 10, unitLabel: 'un' },
  { description: 'Parabolt 3/8 x 3"', defaultCost: 7.50, defaultQty: 6, unitLabel: 'un' },
];

const CONSUMABLE_PRESETS = [
  { description: 'Eletrodo 6013 2.5mm (kg)', defaultCost: 32.00, defaultQty: 1, unitLabel: 'kg' },
  { description: 'Eletrodo 7018 3.25mm reforçado (kg)', defaultCost: 45.00, defaultQty: 2, unitLabel: 'kg' },
  { description: 'Rolo de Arame MIG 0.8mm (15kg)', defaultCost: 220.00, defaultQty: 1, unitLabel: 'un' },
  { description: 'Tinta Esmalte Sintético Preto/Branco (Galão)', defaultCost: 55.00, defaultQty: 1, unitLabel: 'gl' },
  { description: 'Fundo Primer Zarcão / Anticorrosivo', defaultCost: 48.00, defaultQty: 1, unitLabel: 'gl' },
  { description: 'Thinner 5000 para limpeza/diluição', defaultCost: 24.00, defaultQty: 1, unitLabel: 'lt' },
  { description: 'Fita Crepe e Estopa de Limpeza', defaultCost: 15.00, defaultQty: 1, unitLabel: 'kit' },
];

const DISC_PRESETS = [
  { description: 'Disco de Corte Fino 4.1/2 inox (1.0mm)', defaultCost: 6.50, defaultQty: 4, unitLabel: 'un' },
  { description: 'Disco Flap Desbaste 4.1/2 Grão 60', defaultCost: 12.00, defaultQty: 2, unitLabel: 'un' },
  { description: 'Disco Flap Acabamento Grão 120', defaultCost: 12.00, defaultQty: 2, unitLabel: 'un' },
  { description: 'Disco de Desbaste 4.1/2 (6.0mm)', defaultCost: 10.00, defaultQty: 1, unitLabel: 'un' },
  { description: 'Disco de Corte para Policorte 12"', defaultCost: 28.00, defaultQty: 1, unitLabel: 'un' },
];

const TOOL_PRESETS = [
  { description: 'Compressor de Ar e Pistola (Pintura)', defaultCost: 8.00, defaultQty: 2, unitLabel: 'h' },
  { description: 'Locação de Andaime Tubular (Diária)', defaultCost: 45.00, defaultQty: 2, unitLabel: 'dia' },
  { description: 'Gerador a Gasolina (Horas de Uso)', defaultCost: 25.00, defaultQty: 4, unitLabel: 'h' },
  { description: 'Policorte de Bancada (Desgaste/Lâmina)', defaultCost: 10.00, defaultQty: 2, unitLabel: 'h' },
];

const LABOR_PRESETS = [
  { description: 'Serralheiro Soldador Especialista', defaultCost: 40.00, defaultQty: 8, unitLabel: 'h' },
  { description: 'Ajudante Geral / Auxiliar de Oficina', defaultCost: 20.00, defaultQty: 8, unitLabel: 'h' },
  { description: 'Instalação / Chumbamento Externo na Obra', defaultCost: 45.00, defaultQty: 4, unitLabel: 'h' },
  { description: 'Pintor Especialista em Acabamento Metálico', defaultCost: 35.00, defaultQty: 4, unitLabel: 'h' },
];

export default function App() {
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('quote');

  const [quote, setQuote] = useState<QuoteData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return createEmptyQuote();
  });

  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>(() => {
    const history = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (history) {
      try {
        return JSON.parse(history);
      } catch (e) {}
    }
    return [];
  });

  const [profile, setProfile] = useState<WorkshopProfile>(() => {
    const prof = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (prof) {
      try {
        return JSON.parse(prof);
      } catch (e) {}
    }
    return DEFAULT_PROFILE;
  });

  const [isModified, setIsModified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBarCalcOpen, setIsBarCalcOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isConfirmNewQuoteOpen, setIsConfirmNewQuoteOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  // Dark / Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lw_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('lw_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    hapticAudio.playTap();
    showToast(`Tema ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado`);
  };

  // PWA Install Event Listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandaloneApp(true);
      showToast('Aplicativo instalado com sucesso no seu aparelho!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandaloneApp(isStandaloneMode);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Save draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(quote));
    setIsModified(true);
  }, [quote]);

  // Save profile
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Save history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateQuote = (updatedFields: Partial<QuoteData>) => {
    setQuote((prev) => ({
      ...prev,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveToHistory = () => {
    hapticAudio.playSuccess();
    const index = savedQuotes.findIndex((q) => q.id === quote.id);
    let updatedHistory: QuoteData[];
    if (index >= 0) {
      updatedHistory = [...savedQuotes];
      updatedHistory[index] = { ...quote, updatedAt: new Date().toISOString() };
    } else {
      updatedHistory = [quote, ...savedQuotes];
    }
    setSavedQuotes(updatedHistory);
    setIsModified(false);
    showToast('Orçamento salvo com sucesso!');
  };

  const handleNewQuote = () => {
    if (isModified || quote.projectClient || quote.metalItems.length > 0) {
      setIsConfirmNewQuoteOpen(true);
    } else {
      const fresh = createEmptyQuote();
      setQuote(fresh);
      setIsModified(false);
      showToast('Novo orçamento pronto.');
    }
  };

  const confirmCreateNewQuote = () => {
    hapticAudio.playTap();
    const fresh = createEmptyQuote();
    setQuote(fresh);
    setIsModified(false);
    showToast('Novo orçamento criado.');
  };

  const handleSelectTemplate = (template: TemplateDefinition) => {
    hapticAudio.playSuccess();
    const fresh = createEmptyQuote();
    const merged: QuoteData = {
      ...fresh,
      ...template.quote,
      id: 'quote_' + Date.now(),
      projectClient: template.quote.projectClient || template.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuote(merged);
    setActiveMobileTab('quote');
    showToast(`Modelo "${template.name}" carregado!`);
  };

  const handleLoadQuote = (loaded: QuoteData) => {
    hapticAudio.playSuccess();
    setQuote(loaded);
    setIsModified(false);
    setActiveMobileTab('quote');
    showToast(`Orçamento "${loaded.projectClient || 'sem título'}" aberto.`);
  };

  const handleDuplicateQuote = (source: QuoteData) => {
    hapticAudio.playTap();
    const clone: QuoteData = {
      ...source,
      id: 'quote_' + Date.now(),
      projectClient: `${source.projectClient || 'Projeto'} (Cópia)`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setSavedQuotes([clone, ...savedQuotes]);
    setQuote(clone);
    showToast('Orçamento duplicado com sucesso!');
  };

  const handleDeleteQuote = (id: string) => {
    hapticAudio.playTap();
    setSavedQuotes(savedQuotes.filter((q) => q.id !== id));
    showToast('Orçamento excluído do histórico.');
  };

  const handleShareWhatsApp = () => {
    hapticAudio.playSuccess();
    const totals = calculateQuoteTotals(quote);
    const text = generateWhatsAppMessage(quote, totals, profile);
    const encoded = encodeURIComponent(text);
    const cleanPhone = (quote.clientPhone || '').replace(/\D/g, '');
    
    if (cleanPhone.length >= 10) {
      const waNumber = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
      window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encoded}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  // Totals
  const totals = calculateQuoteTotals(quote);
  const totalMetalMeters = (quote.metalItems || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-32 md:pb-16 font-sans antialiased transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-2.5 text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-3 sm:p-5 md:p-8">
        {/* PWA Mobile Installation Prompt Banner */}
        {!isStandaloneApp && !isBannerDismissed && (
          <div className="mb-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 text-zinc-900 dark:text-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Instalar Aplicativo no Celular
                  </h4>
                  <span className="inline-block px-2 py-0.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-full">
                    100% Offline
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                  Baixe para ter acesso direto na tela inicial sem precisar abrir o navegador.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end">
              <button
                id="btn-banner-install-app"
                onClick={() => {
                  hapticAudio.playSuccess();
                  setIsInstallOpen(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-950/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-white shrink-0" />
                <span>Baixar App</span>
              </button>

              <button
                onClick={() => {
                  setIsBannerDismissed(true);
                  sessionStorage.setItem('pwa_banner_dismissed', 'true');
                }}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                title="Dispensar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <Header
          workshopProfile={profile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onNewQuote={handleNewQuote}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onSaveQuote={handleSaveToHistory}
          onOpenBarCalc={() => setIsBarCalcOpen(true)}
          onOpenPrint={() => setIsPrintOpen(true)}
          onShareWhatsApp={handleShareWhatsApp}
          onOpenInstall={() => setIsInstallOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          savedCount={savedQuotes.length}
          isModified={isModified}
        />

        {/* Desktop & Mobile Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl mb-5 shadow-inner">
          <button
            onClick={() => {
              hapticAudio.playTap();
              setActiveMobileTab('quote');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-1 justify-center cursor-pointer ${
              activeMobileTab === 'quote'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-md border border-transparent dark:border-zinc-700'
                : 'text-zinc-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className={`w-4 h-4 ${activeMobileTab === 'quote' ? 'text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <span>1. Orçamento</span>
          </button>

          <button
            onClick={() => {
              hapticAudio.playTap();
              setActiveMobileTab('pricing');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-1 justify-center cursor-pointer ${
              activeMobileTab === 'pricing'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-md border border-transparent dark:border-zinc-700'
                : 'text-zinc-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <BadgeDollarSign className={`w-4 h-4 ${activeMobileTab === 'pricing' ? 'text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <span>2. Preço & Lucro ({formatBRL(totals.finalPrice)})</span>
          </button>

          <button
            onClick={() => {
              hapticAudio.playTap();
              setActiveMobileTab('history');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-1 justify-center cursor-pointer ${
              activeMobileTab === 'history'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-md border border-transparent dark:border-zinc-700'
                : 'text-zinc-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeMobileTab === 'history' ? 'text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <span>3. Modelos & Salvos</span>
          </button>
        </div>

        {/* TAB 1: ORÇAMENTO COMPLETO */}
        {activeMobileTab === 'quote' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 1. Project Info Card */}
            <ProjectInfoCard
              quote={quote}
              onChange={handleUpdateQuote}
            />

            {/* 2. Metal & Profiles */}
            <ItemsSection
              badgeNumber={1}
              title="Metal, Tubos & Perfis"
              icon="⛓️"
              items={quote.metalItems}
              costLabel="Custo / Metro"
              qtyLabel="Metros (m)"
              defaultItemName="Metalon 50x30 chapa 18"
              defaultUnitCost={35.00}
              defaultQty={6}
              defaultUnitLabel="m"
              presets={METAL_PRESETS}
              onChange={(metalItems) => handleUpdateQuote({ metalItems })}
            />

            {/* 3. Materiais Diversos */}
            <ItemsSection
              badgeNumber={2}
              title="Materiais & Acessórios Diversos"
              icon="🔩"
              items={quote.materialItems}
              costLabel="Custo Unitário"
              qtyLabel="Quantidade"
              defaultItemName="Fechadura / Dobradiça"
              defaultUnitCost={25.00}
              defaultQty={1}
              defaultUnitLabel="un"
              presets={MATERIAL_PRESETS}
              onChange={(materialItems) => handleUpdateQuote({ materialItems })}
            />

            {/* 4. Consumíveis */}
            <ItemsSection
              badgeNumber={3}
              title="Consumíveis (Solda, Tintas & Químicos)"
              icon="🧪"
              items={quote.consumableItems}
              costLabel="Custo Unitário"
              qtyLabel="Quantidade"
              defaultItemName="Eletrodo / Esmalte Sintético"
              defaultUnitCost={45.00}
              defaultQty={1}
              defaultUnitLabel="un"
              presets={CONSUMABLE_PRESETS}
              onChange={(consumableItems) => handleUpdateQuote({ consumableItems })}
            />

            {/* 5. Discos e Abrasivos */}
            <ItemsSection
              badgeNumber={4}
              title="Discos de Corte & Abrasivos"
              icon="💿"
              items={quote.discItems}
              costLabel="Custo Unitário"
              qtyLabel="Quantidade"
              defaultItemName="Disco de Corte 4.1/2"
              defaultUnitCost={6.50}
              defaultQty={4}
              defaultUnitLabel="un"
              presets={DISC_PRESETS}
              onChange={(discItems) => handleUpdateQuote({ discItems })}
            />

            {/* 6. Energia Elétrica */}
            <EnergySection
              tariff={quote.energyTariff}
              items={quote.energyItems}
              onTariffChange={(energyTariff) => handleUpdateQuote({ energyTariff })}
              onChange={(energyItems) => handleUpdateQuote({ energyItems })}
            />

            {/* 7. Ferramentas Adicionais */}
            <ItemsSection
              badgeNumber={6}
              title="Ferramentas Adicionais & Maquinário"
              icon="🧰"
              items={quote.toolItems}
              costLabel="Custo / Hora"
              qtyLabel="Horas (h)"
              defaultItemName="Compressor de Ar"
              defaultUnitCost={8.00}
              defaultQty={2}
              defaultUnitLabel="h"
              presets={TOOL_PRESETS}
              onChange={(toolItems) => handleUpdateQuote({ toolItems })}
            />

            {/* 8. Mão de Obra */}
            <ItemsSection
              badgeNumber={7}
              title="Mão de Obra & Serviços"
              icon="👷"
              items={quote.laborItems}
              costLabel="Valor / Hora"
              qtyLabel="Horas (h)"
              defaultItemName="Serralheiro Soldador"
              defaultUnitCost={40.00}
              defaultQty={8}
              defaultUnitLabel="h"
              presets={LABOR_PRESETS}
              onChange={(laborItems) => handleUpdateQuote({ laborItems })}
            />

            {/* 9. Custos Extras / Frete */}
            <ExtraCostsSection
              items={quote.extraCosts}
              onChange={(extraCosts) => handleUpdateQuote({ extraCosts })}
            />

            {/* Quick Button to Proceed to Pricing */}
            <div className="pt-2">
              <button
                onClick={() => {
                  hapticAudio.playTap();
                  setActiveMobileTab('pricing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Avançar para Preço de Venda & WhatsApp ({formatBRL(totals.finalPrice)})</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RESUMO GERAL & SIMULADOR DE PREÇO */}
        {activeMobileTab === 'pricing' && (
          <div className="animate-in fade-in duration-200">
            <SummarySection
              quote={quote}
              totals={totals}
              profile={profile}
              onProfitMarginChange={(profitMargin) => handleUpdateQuote({ profitMargin })}
              onDiscountChange={(cashDiscountPercent) => handleUpdateQuote({ cashDiscountPercent })}
              onCardFeeChange={(cardFeePercent) => handleUpdateQuote({ cardFeePercent })}
              onOpenPrint={() => setIsPrintOpen(true)}
              onShareWhatsApp={handleShareWhatsApp}
            />
          </div>
        )}

        {/* TAB 3: MODELOS PRONTOS & HISTÓRICO LOCAL */}
        {activeMobileTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Quick Preset Templates */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 md:p-6 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <Layers className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Modelos de Projetos Prontos</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Inicie um orçamento com 1 toque com materiais pré-carregados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 bg-zinc-50/70 dark:bg-zinc-800/60 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all cursor-pointer group flex flex-col justify-between gap-2.5 shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-md inline-block mb-1.5">
                        {tmpl.category}
                      </span>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>

                    <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-white dark:bg-zinc-900 group-hover:bg-red-600 dark:group-hover:bg-red-600 group-hover:text-white text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 group-hover:border-red-600 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                      <span>Carregar Este Modelo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Saved Quotes History */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 md:p-6 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <BookmarkCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Orçamentos Salvos ({savedQuotes.length})</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Histórico de orçamentos gravados na memória do seu aparelho</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveToHistory}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Salvar Atual</span>
                </button>
              </div>

              {savedQuotes.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 space-y-2">
                  <p className="text-sm font-medium">Nenhum orçamento salvo ainda.</p>
                  <p className="text-xs">Clique no botão "Salvar" no topo para arquivar propostas aqui.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedQuotes.map((q) => {
                    const qTotals = calculateQuoteTotals(q);
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 bg-zinc-50/80 dark:bg-zinc-800/80 flex items-center justify-between gap-2 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                            {q.projectClient || 'Orçamento sem título'}
                          </h4>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            {q.date || 'Sem data'} • Total: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBRL(qTotals.finalPrice)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleLoadQuote(q)}
                            className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Abrir
                          </button>
                          <button
                            onClick={() => handleDuplicateQuote(q)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setQuoteToDelete({ id: q.id, name: q.projectClient || 'Orçamento sem título' })}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom App Navigation (Mobile Only) */}
      <div className="md:hidden">
        <MobileBottomNav
          activeTab={activeMobileTab}
          onSelectTab={setActiveMobileTab}
          totalPrice={totals.finalPrice}
          onOpenPrint={() => setIsPrintOpen(true)}
          onShareWhatsApp={handleShareWhatsApp}
          onSaveQuote={handleSaveToHistory}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* Modals */}
      <BarCalculatorModal
        isOpen={isBarCalcOpen}
        onClose={() => setIsBarCalcOpen(false)}
        metalTotalMeters={totalMetalMeters}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedQuotes={savedQuotes}
        onLoadQuote={handleLoadQuote}
        onDuplicateQuote={handleDuplicateQuote}
        onDeleteQuote={handleDeleteQuote}
        onImportQuotes={(imported) => {
          setSavedQuotes(imported);
          showToast(`${imported.length} orçamentos importados com sucesso!`);
        }}
      />

      <WorkshopProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(updated);
          showToast('Dados da oficina atualizados!');
        }}
      />

      <PrintProposalModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        quote={quote}
        totals={totals}
        profile={profile}
        onShareWhatsApp={handleShareWhatsApp}
      />

      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        deferredPrompt={deferredPrompt}
        logoUrl={profile.logoUrl}
        workshopName={profile.name}
        onInstalledSuccess={() => {
          setIsStandaloneApp(true);
          showToast('App instalado com sucesso!');
        }}
      />

      {/* In-App Delete Quote Confirmation */}
      <ConfirmModal
        isOpen={quoteToDelete !== null}
        onClose={() => setQuoteToDelete(null)}
        onConfirm={() => {
          if (quoteToDelete) {
            handleDeleteQuote(quoteToDelete.id);
            setQuoteToDelete(null);
          }
        }}
        title="Excluir Orçamento"
        message={`Tem certeza que deseja excluir permanentemente o orçamento "${quoteToDelete?.name}"? Esta ação removerá o registro do histórico do dispositivo.`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        isDestructive={true}
      />

      {/* In-App New Quote Confirmation */}
      <ConfirmModal
        isOpen={isConfirmNewQuoteOpen}
        onClose={() => setIsConfirmNewQuoteOpen(false)}
        onConfirm={confirmCreateNewQuote}
        title="Novo Orçamento"
        message="Deseja iniciar um novo orçamento em branco? Certifique-se de ter salvo o orçamento atual antes de prosseguir."
        confirmLabel="Iniciar Novo"
        cancelLabel="Voltar"
        isDestructive={false}
      />
    </div>
  );
}
