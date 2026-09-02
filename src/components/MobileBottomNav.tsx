import { hapticAudio } from '../utils/audioFeedback';
import { 
  FileSpreadsheet, 
  BadgeDollarSign, 
  Layers, 
  Send, 
  Printer, 
  BookmarkCheck,
  MessageCircle
} from 'lucide-react';
import { formatBRL } from '../utils/formatters';

export type MobileTab = 'quote' | 'pricing' | 'history';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  totalPrice: number;
  onOpenPrint: () => void;
  onShareWhatsApp: () => void;
  onSaveQuote: () => void;
}

export function MobileBottomNav({
  activeTab,
  onSelectTab,
  totalPrice,
  onOpenPrint,
  onShareWhatsApp,
  onSaveQuote,
}: MobileBottomNavProps) {
  const handleTabClick = (tab: MobileTab) => {
    hapticAudio.playTap();
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 text-white shadow-2xl safe-area-bottom">
      {/* Top Floating Totals Bar (when not in pricing view) */}
      <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total:</span>
          <span className="text-base font-black font-mono text-red-400">
            {formatBRL(totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              hapticAudio.playTap();
              onSaveQuote();
            }}
            title="Salvar Orçamento"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 text-zinc-300 active:text-white rounded-lg border border-zinc-700 text-xs transition-colors"
          >
            <BookmarkCheck className="w-4 h-4 text-red-400" />
          </button>

          <button
            onClick={() => {
              hapticAudio.playTap();
              onOpenPrint();
            }}
            title="Visualizar Proposta PDF"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              hapticAudio.playSuccess();
              onShareWhatsApp();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 text-white rounded-lg font-bold text-xs shadow-md shadow-emerald-950/40 border border-emerald-500/40 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20 stroke-white" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <nav className="grid grid-cols-3 items-center justify-around px-2 py-1.5 text-center">
        <button
          onClick={() => handleTabClick('quote')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'quote'
              ? 'text-red-400 font-black scale-105'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileSpreadsheet className={`w-5 h-5 mb-0.5 ${activeTab === 'quote' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[10px] tracking-tight font-bold">1. Orçamento</span>
        </button>

        <button
          onClick={() => handleTabClick('pricing')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'pricing'
              ? 'text-red-400 font-black scale-105'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BadgeDollarSign className={`w-5 h-5 mb-0.5 ${activeTab === 'pricing' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[10px] tracking-tight font-bold">2. Preço & Lucro</span>
        </button>

        <button
          onClick={() => handleTabClick('history')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'text-red-400 font-black scale-105'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className={`w-5 h-5 mb-0.5 ${activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[10px] tracking-tight font-bold">3. Modelos</span>
        </button>
      </nav>
    </div>
  );
}
