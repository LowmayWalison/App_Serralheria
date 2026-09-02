import { WorkshopProfile } from '../types';
import { hapticAudio } from '../utils/audioFeedback';
import { 
  Plus, 
  FolderOpen, 
  BookmarkCheck, 
  Settings, 
  Layers, 
  Calculator,
  Download,
  Sun,
  Moon,
  Cloud
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  workshopProfile: WorkshopProfile;
  onOpenProfile: () => void;
  onNewQuote: () => void;
  onOpenTemplates: () => void;
  onOpenHistory: () => void;
  onSaveQuote: () => void;
  onOpenBarCalc: () => void;
  onOpenPrint: () => void;
  onShareWhatsApp: () => void;
  onOpenInstall?: () => void;
  onOpenWorkspace?: () => void;
  currentUser?: User | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  savedCount: number;
  isModified: boolean;
}

export function Header({
  workshopProfile,
  onOpenProfile,
  onNewQuote,
  onOpenTemplates,
  onOpenHistory,
  onSaveQuote,
  onOpenBarCalc,
  onOpenInstall,
  onOpenWorkspace,
  currentUser,
  theme = 'light',
  onToggleTheme,
  savedCount,
  isModified
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-zinc-800 mb-4 sm:mb-6 transition-all">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Brand & Workshop Info */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* LW Serralheria Logo Badge */}
          <button
            type="button"
            onClick={() => {
              hapticAudio.playTap();
              onOpenProfile();
            }}
            title="Clique para alterar logo e dados da serralheria"
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black p-0.5 shadow-lg shadow-red-950/50 border border-red-900/40 flex items-center justify-center shrink-0 overflow-hidden group self-start sm:self-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <img
              src={workshopProfile.logoUrl || '/icon.svg'}
              alt={workshopProfile.name || 'Logo da Serralheria'}
              className="w-full h-full object-cover rounded-[10px] transform group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[10px]">
              <Settings className="w-4 h-4 text-white drop-shadow" />
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white break-words leading-tight">
                {workshopProfile.name || 'LW Serralheria'}
              </h1>
              <button
                id="btn-header-profile-config"
                onClick={() => {
                  hapticAudio.playTap();
                  onOpenProfile();
                }}
                title="Configurar Dados da Serralheria"
                className="text-xs bg-zinc-800/90 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 px-2 py-1 rounded-lg border border-zinc-700 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Settings className="w-3.5 h-3.5 text-red-400" />
                <span className="font-medium">Oficina</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium break-words mt-0.5 leading-snug">
              {workshopProfile.description || 'Estruturas Metálicas • Esquadrias de Ferro • Serralheria em Geral'}
            </p>
          </div>
        </div>

        {/* Top Actions Desktop & Tablet & Mobile */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="btn-header-new-quote"
            onClick={() => {
              hapticAudio.playTap();
              onNewQuote();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 transition cursor-pointer"
            title="Iniciar novo orçamento em branco"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" />
            <span>Novo</span>
          </button>

          <button
            id="btn-header-templates"
            onClick={() => {
              hapticAudio.playTap();
              onOpenTemplates();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 hover:border-red-500/40 transition cursor-pointer"
            title="Carregar modelos prontos (Portão, Grade, Corrimão, etc.)"
          >
            <Layers className="w-3.5 h-3.5 text-red-400" />
            <span>Modelos</span>
          </button>

          <button
            id="btn-header-bar-calc"
            onClick={() => {
              hapticAudio.playTap();
              onOpenBarCalc();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 hover:border-red-500/40 transition cursor-pointer"
            title="Calculadora de barras de 6 metros"
          >
            <Calculator className="w-3.5 h-3.5 text-zinc-400" />
            <span>Barras 6m</span>
          </button>

          <button
            id="btn-header-save"
            onClick={() => {
              hapticAudio.playSuccess();
              onSaveQuote();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-xl border border-zinc-700 transition cursor-pointer"
            title="Salvar no histórico do aplicativo"
          >
            <BookmarkCheck className="w-4 h-4 text-red-400" />
            <span>Salvar</span>
            {isModified && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
          </button>

          <button
            id="btn-header-history"
            onClick={() => {
              hapticAudio.playTap();
              onOpenHistory();
            }}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 transition cursor-pointer"
            title="Ver orçamentos salvos"
          >
            <FolderOpen className="w-3.5 h-3.5 text-red-400" />
            <span>Histórico</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-red-600/30 text-red-300 border border-red-500/40 rounded-full text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          {onToggleTheme && (
            <button
              id="btn-header-theme-toggle"
              type="button"
              onClick={() => {
                hapticAudio.playTap();
                onToggleTheme();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 hover:border-red-500/40 transition cursor-pointer"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-red-400" />
                  <span>Escuro</span>
                </>
              )}
            </button>
          )}

          {/* Google Workspace & Cloud Hub Button */}
          {onOpenWorkspace && (
            <button
              id="btn-header-workspace"
              onClick={() => {
                hapticAudio.playTap();
                onOpenWorkspace();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 hover:border-red-500/40 transition cursor-pointer"
              title="Google Workspace (Sheets, Docs, Drive, Gmail, Agenda) & Nuvem"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Google & Nuvem</span>
              {currentUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          )}

          {/* Download App Button (Prominent & neatly aligned) */}
          {onOpenInstall && (
            <button
              id="btn-header-install-app"
              onClick={() => {
                hapticAudio.playTap();
                onOpenInstall();
              }}
              title="Baixar aplicativo no celular (PWA)"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white rounded-xl shadow-md shadow-red-950/40 border border-red-500/40 transition-all cursor-pointer whitespace-nowrap ml-auto sm:ml-0"
            >
              <Download className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Baixar App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
