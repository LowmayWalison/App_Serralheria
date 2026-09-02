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
  Layers,
  Code,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  FileCode,
  HelpCircle,
  Copy
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
  const [activeStepTab, setActiveStepTab] = useState<'apk' | 'generate' | 'playstore' | 'privacy'>('apk');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already installed
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Set QR Code URL for Current App URL
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=svg&data=${encodeURIComponent(currentUrl)}`;
      setQrCodeDataUrl(qrApi);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

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

  const handleCopyAppUrl = () => {
    hapticAudio.playSuccess();
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const bubblewrapCommand = `npx @bubblewrap/cli init --manifest=${currentOrigin}/manifest.json\nnpx @bubblewrap/cli build`;

  const handleCopyCommand = () => {
    hapticAudio.playSuccess();
    navigator.clipboard.writeText(bubblewrapCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handleDownloadConfigBundle = () => {
    hapticAudio.playSuccess();
    const bundleContent = JSON.stringify({
      appName: "LW Serralheria Pro",
      packageId: "com.lwserralheria.app",
      versionName: "1.0.0",
      versionCode: 1,
      startUrl: currentOrigin + "/",
      manifestUrl: currentOrigin + "/manifest.json",
      assetLinksUrl: currentOrigin + "/.well-known/assetlinks.json",
      privacyPolicyUrl: currentOrigin + "/privacy-policy.html",
      pwaBuilderUrl: `https://www.pwabuilder.com/?url=${encodeURIComponent(currentOrigin)}`,
      buildInstructions: "Acesse pwabuilder.com ou use o Google Bubblewrap CLI para gerar o APK/AAB."
    }, null, 2);

    const blob = new Blob([bundleContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lw-serralheria-android-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-zinc-800 flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
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
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  APK & Google Play Suite
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> PWA Level-A
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {workshopName || 'LW Serralheria Pro'}
              </h3>
              <p className="text-xs text-zinc-400">
                Instalação direta no celular ou geração de pacote APK / AAB oficial
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Key Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-zinc-800/70 rounded-xl border border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-200 block leading-tight">WebAPK Nativo</span>
              <span className="text-[9px] text-emerald-400">Pronto no Android</span>
            </div>
            <div className="p-2 bg-zinc-800/70 rounded-xl border border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-200 block leading-tight">Play Store AAB</span>
              <span className="text-[9px] text-amber-400">TWA & AssetLinks</span>
            </div>
            <div className="p-2 bg-zinc-800/70 rounded-xl border border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-200 block leading-tight">100% Offline</span>
              <span className="text-[9px] text-zinc-400">Service Worker</span>
            </div>
          </div>

          {/* Quick Install Banner (When Browser Prompts) */}
          {deferredPrompt && (
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Instalar WebAPK no Celular Agora (1 Toque)</span>
            </button>
          )}

          {/* Navigation Tabs */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-xl mb-3 overflow-x-auto">
              <button
                onClick={() => setActiveStepTab('apk')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeStepTab === 'apk'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                1. Instalar no Celular
              </button>
              <button
                onClick={() => setActiveStepTab('generate')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeStepTab === 'generate'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2. Gerar .APK / .AAB
              </button>
              <button
                onClick={() => setActiveStepTab('playstore')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeStepTab === 'playstore'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3. Guia Play Store
              </button>
              <button
                onClick={() => setActiveStepTab('privacy')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeStepTab === 'privacy'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                4. Política & Termos
              </button>
            </div>

            {/* TAB 1: Instalação Direta no Celular */}
            {activeStepTab === 'apk' && (
              <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700/80 space-y-3.5 text-xs text-zinc-300">
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200">
                  <div className="font-bold flex items-center gap-1.5 text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    WebAPK Android (Sem precisar da Play Store)
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Ao abrir o app no <strong>Google Chrome no seu smartphone</strong>, o próprio Android compila um arquivo APK nativo em segundo plano e instala com ícone oficial na gaveta de aplicativos.
                  </p>
                </div>

                {/* QR Code Quick Scan for Mobile Phone */}
                <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-700 flex flex-col sm:flex-row items-center gap-3.5">
                  {qrCodeDataUrl ? (
                    <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                      <img src={qrCodeDataUrl} alt="QR Code do App" className="w-24 h-24" />
                    </div>
                  ) : null}
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="font-bold text-white text-xs block">
                      Aponte a câmera do seu celular
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      Escaneie o QR Code ao lado para abrir direto no navegador do celular e instalar o APK com 1 toque.
                    </p>
                    <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                      <button
                        onClick={handleCopyAppUrl}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-[11px] border border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrl ? 'Link Copiado' : 'Copiar URL'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Android vs iOS Guide */}
                <div className="space-y-2 pt-1">
                  <span className="font-bold text-white text-xs block">Como instalar no navegador:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-700/60">
                      <strong className="text-white text-[11px] block mb-1">Android (Chrome)</strong>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Toque nos <strong>3 pontinhos (⋮)</strong> no topo do Chrome e selecione <strong>"Instalar aplicativo"</strong>.
                      </p>
                    </div>
                    <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-700/60">
                      <strong className="text-white text-[11px] block mb-1">iPhone (Safari)</strong>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Toque no botão <strong>Compartilhar</strong> e escolha <strong>"Adicionar à Tela de Início"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Gerar .APK / .AAB */}
            {activeStepTab === 'generate' && (
              <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700/80 space-y-3.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <Code className="w-4 h-4 text-amber-400" />
                    <span>Ferramentas de Empacotamento .APK / .AAB</span>
                  </div>
                  <button
                    onClick={handleDownloadConfigBundle}
                    className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Baixar Config JSON</span>
                  </button>
                </div>

                {/* Method 1: PWABuilder */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-xs">1. PWABuilder (Recomendado — Sem Código)</strong>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">Oficial Microsoft/Google</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Gera instantaneamente os arquivos <code>.apk</code> (para teste e envio direto via WhatsApp/Drive) e <code>.aab</code> (para o Google Play Console) com assinatura digital pronta.
                  </p>
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentOrigin)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Abrir PWABuilder com este App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Method 2: Google Bubblewrap CLI */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-xs">2. Google Bubblewrap CLI (Terminal / Dev)</strong>
                    <button
                      onClick={handleCopyCommand}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCommand ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCommand ? 'Copiado' : 'Copiar Comandos'}</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[10px] bg-black p-2.5 rounded-lg text-emerald-400 overflow-x-auto select-all leading-relaxed">
                    {bubblewrapCommand}
                  </pre>
                  <p className="text-[10px] text-zinc-400">
                    Package ID configurado: <code>com.lwserralheria.app</code>
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Checklist Google Play Console */}
            {activeStepTab === 'playstore' && (
              <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700/80 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Passo a Passo para Publicar na Google Play Store</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-700/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px] border border-red-500/30">
                      1
                    </span>
                    <div>
                      <strong className="text-white block text-[11px]">Conta Google Play Console</strong>
                      <p className="text-[10px] text-zinc-400">
                        Acesse <code>play.google.com/console</code> e crie sua conta de desenvolvedor (taxa única de $25 USD da Google).
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-700/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px] border border-red-500/30">
                      2
                    </span>
                    <div>
                      <strong className="text-white block text-[11px]">Upload do Arquivo .AAB</strong>
                      <p className="text-[10px] text-zinc-400">
                        Gere o arquivo <code>app-release-bundle.aab</code> na aba "Gerar .APK / .AAB" e faça o upload na faixa de produção.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-700/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px] border border-red-500/30">
                      3
                    </span>
                    <div>
                      <strong className="text-white block text-[11px]">URL da Política de Privacidade</strong>
                      <p className="text-[10px] text-zinc-400">
                        O Google exige uma URL pública. Já deixamos pronta no seu app: <br />
                        <code className="text-red-300 text-[10px]">{currentOrigin}/privacy-policy.html</code>
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-700/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px] border border-red-500/30">
                      4
                    </span>
                    <div>
                      <strong className="text-white block text-[11px]">Digital Asset Links (TWA)</strong>
                      <p className="text-[10px] text-zinc-400">
                        O arquivo <code>.well-known/assetlinks.json</code> já está configurado no servidor para remover a barra de endereço no app nativo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Política de Privacidade & Termos */}
            {activeStepTab === 'privacy' && (
              <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700/80 space-y-3 text-xs text-zinc-300 max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-xs">Política de Privacidade Oficial (Play Store)</strong>
                  <a
                    href="/privacy-policy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-red-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Abrir Página Web</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-700/80 text-[11px] space-y-2 text-zinc-300 leading-relaxed">
                  <p>
                    <strong>Aplicativo:</strong> LW Serralheria Pro (<code>com.lwserralheria.app</code>)
                  </p>
                  <p>
                    <strong>Tratamento de Dados:</strong> O aplicativo armazena os orçamentos e listas de materiais localmente no dispositivo (Offline-First) e opcionalmente sincroniza com Firestore e Google Workspace mediante consentimento do usuário.
                  </p>
                  <p>
                    <strong>Google Workspace & Auth:</strong> As permissões para Google Sheets, Drive, Docs e Gmail são utilizadas estritamente para exportação e backup de orçamentos solicitados pelo usuário, sem comercialização de dados.
                  </p>
                  <p>
                    <strong>Compatibilidade:</strong> 100% conforme as diretrizes do Google Play Developer Distribution Agreement.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyAppUrl}
            className="px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Link Copiado!' : 'Compartilhar Link'}</span>
          </button>

          <button
            onClick={() => {
              hapticAudio.playTap();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition cursor-pointer shadow-sm"
          >
            Concluído / Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
