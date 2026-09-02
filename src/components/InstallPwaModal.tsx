import { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  WifiOff, 
  Zap, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { hapticAudio } from '../utils/audioFeedback';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalledSuccess: () => void;
  logoUrl?: string;
  workshopName?: string;
}

export function InstallPwaModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalledSuccess,
  logoUrl,
  workshopName,
}: InstallPwaModalProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setActiveStepTab('ios');
    }

    // Check if already installed
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    hapticAudio.playSuccess();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstalledSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-800 flex flex-col my-auto">
        {/* Header with App Icon */}
        <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 p-5 border-b border-zinc-800 relative">
          <button
            onClick={() => {
              hapticAudio.playTap();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-full border border-zinc-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-black p-1 border border-red-900/50 shadow-xl shadow-red-950/40 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl || '/icon.svg'}
                alt={workshopName || 'App Icon'}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  Aplicativo Móvel
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> PWA Oficial
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {workshopName || 'LW Serralheria App'}
              </h3>
              <p className="text-xs text-zinc-400">
                Instale no seu aparelho para usar como App nativo
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
              <WifiOff className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-zinc-200 block leading-tight">100% Offline</span>
              <span className="text-[9px] text-zinc-400">Sem internet</span>
            </div>

            <div className="p-2.5 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
              <Smartphone className="w-5 h-5 text-zinc-300 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-zinc-200 block leading-tight">Tela Cheia</span>
              <span className="text-[9px] text-zinc-400">Sem barra do navegador</span>
            </div>

            <div className="p-2.5 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-zinc-200 block leading-tight">Acesso Rápido</span>
              <span className="text-[9px] text-zinc-400">Ícone na Tela Inicial</span>
            </div>
          </div>

          {/* Primary Action Button (If Browser Supports 1-Click Prompt) */}
          {deferredPrompt && !isStandalone && (
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Instalar Aplicativo Agora (1 Toque)</span>
            </button>
          )}

          {/* Platform Tab Switcher for Manual Instructions */}
          <div>
            <div className="flex items-center gap-1.5 p-1 bg-zinc-800 rounded-xl mb-3">
              <button
                onClick={() => setActiveStepTab('android')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeStepTab === 'android'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Android / Google Chrome
              </button>
              <button
                onClick={() => setActiveStepTab('ios')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeStepTab === 'ios'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                iPhone / Safari (iOS)
              </button>
            </div>

            {/* Android Instructions */}
            {activeStepTab === 'android' && (
              <div className="bg-zinc-800/80 rounded-2xl p-3.5 border border-zinc-700/80 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-red-500/30">
                    1
                  </span>
                  <div>
                    <strong className="text-white">Toque nos 3 pontinhos (⋮)</strong> no canto superior direito do seu navegador Chrome/Samsung Internet.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-red-500/30">
                    2
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <strong className="text-white">Selecione</strong>
                    <span className="px-2 py-0.5 bg-zinc-700 text-red-300 rounded font-semibold text-[11px] inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> "Instalar aplicativo"
                    </span>
                    <span>ou</span>
                    <span className="px-2 py-0.5 bg-zinc-700 text-red-300 rounded font-semibold text-[11px] inline-flex items-center gap-1">
                      <PlusSquare className="w-3 h-3" /> "Adicionar à tela inicial"
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-red-500/30">
                    3
                  </span>
                  <div>
                    Confirme em <strong className="text-emerald-400">"Instalar"</strong>. O ícone oficial será adicionado à tela inicial do seu celular!
                  </div>
                </div>
              </div>
            )}

            {/* iOS Instructions */}
            {activeStepTab === 'ios' && (
              <div className="bg-zinc-800/80 rounded-2xl p-3.5 border border-zinc-700/80 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-red-500/30">
                    1
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>No Safari, toque no botão</span>
                    <span className="px-2 py-0.5 bg-zinc-700 text-red-300 rounded font-bold text-[11px] inline-flex items-center gap-1">
                      <Share className="w-3.5 h-3.5" /> Compartilhar
                    </span>
                    <span>(na barra inferior do iPhone).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-red-500/30">
                    2
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Role a lista de opções e toque em</span>
                    <span className="px-2 py-0.5 bg-zinc-700 text-red-300 rounded font-bold text-[11px] inline-flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5" /> "Adicionar à Tela de Início"
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-red-500/30">
                    3
                  </span>
                  <div>
                    Toque em <strong className="text-emerald-400">"Adicionar"</strong> no topo direito. O app abrirá direto sem barras de navegação!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
          <button
            onClick={() => {
              hapticAudio.playTap();
              onClose();
            }}
            className="w-full py-2.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition cursor-pointer"
          >
            Entendi / Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
