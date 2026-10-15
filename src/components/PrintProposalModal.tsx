import { useState } from 'react';
import { QuoteData, WorkshopProfile, CalculatedTotals } from '../types';
import { formatBRL } from '../utils/formatters';
import { 
  X, 
  Download, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Building2,
  Calendar,
  Layers,
  MapPin,
  Check
} from 'lucide-react';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import { hapticAudio } from '../utils/audioFeedback';

interface PrintProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
  totals: CalculatedTotals;
  profile: WorkshopProfile;
}

export function PrintProposalModal({
  isOpen,
  onClose,
  quote,
  totals,
  profile,
}: PrintProposalModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Configuração de visibilidade das informações da proposta
  const [showIndividualItems, setShowIndividualItems] = useState(false); // Opcional: mostrar ou ocultar itens individuais
  const [showItemPrices, setShowItemPrices] = useState(false); // Opcional: preços unitários de cada item
  const [showCostBreakdown, setShowCostBreakdown] = useState(false); // Opcional: divisão material vs mão de obra
  const [showPaymentTerms, setShowPaymentTerms] = useState(true);
  const [showPixKey, setShowPixKey] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  if (!isOpen) return null;

  const quoteNumber = (quote.id || '').replace('quote_', '').slice(-6) || '000001';
  const emissionDate = quote.date 
    ? new Date(quote.date + 'T12:00:00').toLocaleDateString('pt-BR') 
    : new Date().toLocaleDateString('pt-BR');

  const handleDownload = async () => {
    hapticAudio.playTap();
    try {
      setIsGenerating(true);
      // Pausa rápida para estabilizar a renderização no DOM
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const safeName = (quote.projectClient || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Proposta_Comercial_${quoteNumber}_${safeName}.pdf`;

      await generatePdfFromElement('pdf-proposal-content', {
        fileName,
        headerText: `${profile.name || 'Serralheria'} • Proposta Comercial Nº ${quoteNumber}`,
        footerText: `Proposta Comercial Formal Nº ${quoteNumber} • ${profile.name || 'Serralheria'}`,
      });

      hapticAudio.playSuccess();
    } catch (error) {
      console.error('Falha ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Predefinições rápidas de exibição
  const applyPreset = (mode: 'closed' | 'technical_list' | 'fully_detailed') => {
    hapticAudio.playTap();
    if (mode === 'closed') {
      setShowIndividualItems(false);
      setShowItemPrices(false);
      setShowCostBreakdown(false);
    } else if (mode === 'technical_list') {
      setShowIndividualItems(true);
      setShowItemPrices(false);
      setShowCostBreakdown(false);
    } else if (mode === 'fully_detailed') {
      setShowIndividualItems(true);
      setShowItemPrices(true);
      setShowCostBreakdown(true);
    }
  };

  // Compilação de todos os itens do orçamento
  const allItems = [
    ...(quote.metalItems || []).map((i) => ({ ...i, category: 'Perfis & Metais' })),
    ...(quote.materialItems || []).map((i) => ({ ...i, category: 'Acessórios & Ferragens' })),
    ...(quote.consumableItems || []).map((i) => ({ ...i, category: 'Consumíveis & Soldas' })),
    ...(quote.discItems || []).map((i) => ({ ...i, category: 'Abrasivos & Discos' })),
    ...(quote.laborItems || []).map((i) => ({ ...i, category: 'Serviços & Fabricação' })),
    ...(quote.extraCosts || []).map((i) => ({ description: i.description, unitCost: i.cost, quantity: 1, unitLabel: 'un', category: 'Extras & Logística' })),
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl border border-zinc-800 my-auto text-zinc-100">
        
        {/* Barra de Controle Superior do Modal (Oculta na Impressão) */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-zinc-800 print:hidden shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Proposta Comercial Formal</span>
                <span className="text-xs font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                  Nº {quoteNumber}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Layout A4 formal em tema claro com quebra de página inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-white active:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Processando PDF...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={() => {
                hapticAudio.playTap();
                onClose();
              }}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Ajuste de Exibição das Informações Individuais */}
        <div className="bg-zinc-950/90 border-b border-zinc-800 p-3 sm:p-4 print:hidden shrink-0 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Seletor Principal: Opcionalidade de Informações Individuais */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Informações Individuais:</span>
              </span>

              {/* Botões Rápidos */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('closed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    !showIndividualItems
                      ? 'bg-slate-200 text-slate-950 font-bold shadow-xs'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title="Oculta relação de itens individuais e custos internos, apresentando o orçamento em preço global fechado"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ocultar Itens (Preço Fechado)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('technical_list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    showIndividualItems && !showItemPrices
                      ? 'bg-slate-200 text-slate-950 font-bold shadow-xs'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title="Exibe a lista técnica de materiais e serviços sem expor os valores individuais de custo"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Relação de Itens (Sem Valores Unit.)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('fully_detailed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    showIndividualItems && showItemPrices
                      ? 'bg-slate-200 text-slate-950 font-bold shadow-xs'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title="Exibe todos os itens com quantitativos e valores unitários detalhados"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Orçamento Detalhado Aberto</span>
                </button>
              </div>
            </div>

            {/* Alternar painel de configurações granulares */}
            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer ml-auto transition"
            >
              <span>{showConfigPanel ? 'Menos opções' : 'Ajustar seções visíveis'}</span>
              {showConfigPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Opções Granulares de Exibição */}
          {showConfigPanel && (
            <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showIndividualItems}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowIndividualItems(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Relação de Itens/Materiais</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  disabled={!showIndividualItems}
                  checked={showItemPrices && showIndividualItems}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowItemPrices(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700 disabled:opacity-30"
                />
                <span className={!showIndividualItems ? 'opacity-40' : ''}>Preços Unitários dos Itens</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showCostBreakdown}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowCostBreakdown(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Divisão Materiais vs Serviços</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowLocation(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Local da Obra & Prazo</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showPaymentTerms}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowPaymentTerms(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Condições de Pagamento</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showPixKey}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowPixKey(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Dados de Chave PIX</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showWarranty}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowWarranty(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Termo de Garantia Técnica</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none text-zinc-300">
                <input
                  type="checkbox"
                  checked={showSignatures}
                  onChange={(e) => {
                    hapticAudio.playTap();
                    setShowSignatures(e.target.checked);
                  }}
                  className="rounded text-slate-600 focus:ring-0 focus:outline-none w-4 h-4 bg-zinc-800 border-zinc-700"
                />
                <span>Campos de Assinatura</span>
              </label>
            </div>
          )}
        </div>

        {/* Visualização do Documento A4 Formal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 flex flex-col items-center">
          
          {/* Elemento A4 com largura exata (794px = A4 padrão a 96 DPI) em Tema Claro Formal */}
          <div 
            id="pdf-proposal-content"
            className="bg-white text-slate-900 rounded-none shadow-xl font-sans p-8 sm:p-9 w-full max-w-[794px] box-border text-[12px] leading-relaxed border border-slate-200"
            style={{ width: '794px', backgroundColor: '#ffffff', color: '#0f172a' }}
          >
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                body {
                  background: #ffffff !important;
                  color: #0f172a !important;
                }
                .print\\:hidden {
                  display: none !important;
                }
                #pdf-proposal-content {
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
                [data-pdf-block],
                .pdf-avoid-break,
                tr,
                .pdf-section,
                .pdf-card {
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
              }
              [data-pdf-block],
              .pdf-avoid-break {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            `}</style>

            {/* CABEÇALHO FORMAL DO DOCUMENTO */}
            <div data-pdf-block className="pdf-avoid-break flex justify-between items-start gap-4 pb-5 border-b-2 border-slate-800">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-14 h-14 bg-white rounded-lg p-1 border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={profile.logoUrl || '/icon.svg'}
                    alt={profile.name || 'Logo'}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight leading-tight">
                    {profile.name || 'LW Serralheria & Estruturas Metálicas'}
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                    {profile.description || 'Serralheria Técnica • Estruturas Metálicas • Esquadrias de Ferro'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500 mt-1.5">
                    {profile.phone && <span><strong>Contato:</strong> {profile.phone}</span>}
                    {profile.city && <span><strong>Cidade:</strong> {profile.city}</span>}
                  </div>
                </div>
              </div>

              {/* Bloco de Identificação Formal da Proposta */}
              <div className="text-right bg-slate-50 border border-slate-300 p-2.5 rounded-lg shrink-0 min-w-[190px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
                  PROPOSTA TÉCNICA E COMERCIAL
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                  Nº {quoteNumber}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 space-y-0.5">
                  <div>Data de Emissão: <strong className="text-slate-800">{emissionDate}</strong></div>
                  <div>Validade da Proposta: <strong className="text-slate-800">{quote.validityDays || 15} dias</strong></div>
                </div>
              </div>
            </div>

            {/* 1. DADOS DA CONTRATANTE E DO PROJETO */}
            <div data-pdf-block className="pdf-avoid-break bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 my-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5 mb-2 border-b border-slate-200 flex items-center justify-between">
                <span>1. Dados da Contratante e Identificação do Projeto</span>
                <span className="text-[9px] font-normal text-slate-400">Ref. Obra</span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Cliente / Razão Social:</span>
                  <strong className="text-xs font-semibold text-slate-900 block mt-0.5">
                    {quote.projectClient || 'Cliente Geral'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Telefone / Contato:</span>
                  <span className="text-xs font-medium text-slate-800 block mt-0.5">
                    {quote.clientPhone || 'Não informado'}
                  </span>
                </div>

                {showLocation && quote.location && (
                  <div className="col-span-2 pt-1 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Local de Execução / Instalação:</span>
                    <span className="text-xs font-medium text-slate-800 block mt-0.5">
                      {quote.location}
                    </span>
                  </div>
                )}

                {showLocation && quote.deliveryDays && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Prazo Estimado de Execução:</span>
                    <strong className="text-xs font-semibold text-slate-900 block mt-0.5">
                      {quote.deliveryDays}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* 2. OBJETO & ESCOPO TÉCNICO */}
            <div data-pdf-block className="pdf-avoid-break bg-white border border-slate-200 rounded-lg p-3.5 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5 mb-2 border-b border-slate-200">
                2. Objeto & Especificações Técnicas dos Serviços
              </div>

              {quote.observations ? (
                <div className="text-slate-800 text-[11px] whitespace-pre-wrap leading-relaxed mb-2.5">
                  {quote.observations}
                </div>
              ) : null}

              {/* Escopo Sintético Formal quando os itens individuais estão ocultos */}
              {!showIndividualItems ? (
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-md p-2.5 text-[11px] text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 mb-1">O presente orçamento contempla de forma global:</div>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                    <li>Fornecimento integral de perfis de aço, ferragens e insumos em conformidade com as normas ABNT.</li>
                    <li>Processos técnicos de traçado, corte em esquadro, conformação e soldagem qualificada.</li>
                    <li>Desbaste, lixamento e acabamento primoroso nas junções e pontos de fixação.</li>
                    <li>Tratamento de superfície anticorrosivo com aplicação de fundo primer e pintura protetiva.</li>
                    <li>Transporte, montagem, nivelamento e testes de funcionamento no local indicado.</li>
                  </ul>
                  <div className="text-[10px] text-slate-400 italic pt-1">
                    * Proposta em regime de preço global fechado com responsabilidade técnica e garantia de execução.
                  </div>
                </div>
              ) : null}
            </div>

            {/* 3. RELAÇÃO DE ITENS E SERVIÇOS (EXIBIÇÃO OPCIONAL) */}
            {showIndividualItems && allItems.length > 0 && (
              <div className="mb-4">
                <div data-pdf-block className="pdf-avoid-break flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    3. Detalhamento Técnico de Itens & Insumos ({allItems.length} itens)
                  </span>
                  {!showItemPrices && (
                    <span className="text-[10px] text-slate-500 italic">
                      Quantitativos técnicos (valores consolidados no total global)
                    </span>
                  )}
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr data-pdf-block className="bg-slate-100 text-slate-800 font-bold uppercase text-[9.5px] tracking-wider border-b border-slate-300 pdf-avoid-break">
                        <th className="py-1.5 px-3 w-10 text-center">Item</th>
                        <th className="py-1.5 px-3">Descrição Técnica & Insumo</th>
                        <th className="py-1.5 px-3 w-32">Categoria</th>
                        <th className="py-1.5 px-3 text-center w-24">Quantidade</th>
                        {showItemPrices && (
                          <>
                            <th className="py-1.5 px-3 text-right w-24">Valor Unit.</th>
                            <th className="py-1.5 px-3 text-right w-28">Subtotal</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allItems.map((item, idx) => {
                        const lineTotal = item.unitCost * item.quantity;
                        return (
                          <tr 
                            key={idx} 
                            data-pdf-block 
                            className={`pdf-avoid-break ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                          >
                            <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-1.5 px-3 text-slate-900 font-medium">
                              {item.description}
                            </td>
                            <td className="py-1.5 px-3 text-slate-500 text-[10px]">
                              {item.category}
                            </td>
                            <td className="py-1.5 px-3 text-center text-slate-800 font-mono text-[10px]">
                              {item.quantity} {item.unitLabel || 'un'}
                            </td>
                            {showItemPrices && (
                              <>
                                <td className="py-1.5 px-3 text-right text-slate-600 font-mono text-[10px]">
                                  {formatBRL(item.unitCost)}
                                </td>
                                <td className="py-1.5 px-3 text-right text-slate-900 font-mono font-semibold text-[10px]">
                                  {formatBRL(lineTotal)}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. CONDIÇÕES COMERCIAIS & INVESTIMENTO TOTAL */}
            <div data-pdf-block className="pdf-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 mb-4">
              
              {/* Coluna Esquerda: Condições Comerciais, Pagamento e Garantia */}
              <div className="space-y-3">
                {showPaymentTerms && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                      <span>Condições de Pagamento</span>
                    </div>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <div>
                        • <strong>Entrada / Sinal (50%):</strong> {formatBRL(totals.entryPrice)} na aprovação do pedido para reserva e aquisição de materiais.
                      </div>
                      <div>
                        • <strong>Saldo Restante (50%):</strong> {formatBRL(totals.remainingPrice)} na conclusão da fabricação, entrega e vistoria da obra.
                      </div>
                      {totals.cashDiscountAmount > 0 && (
                        <div className="text-slate-800 font-medium pt-0.5">
                          • <strong>À Vista com Desconto ({quote.cashDiscountPercent || 5}% OFF):</strong> {formatBRL(totals.cashPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showPixKey && profile.pixKey && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-medium block">Chave PIX da Contratada:</span>
                      <code className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{profile.pixKey}</code>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300">
                      PIX
                    </span>
                  </div>
                )}

                {showWarranty && profile.warranty && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                      <span>Garantia de Fabricação</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-snug">
                      {profile.warranty}
                    </p>
                  </div>
                )}
              </div>

              {/* Coluna Direita: Cartão Formal de Investimento em Tema Claro */}
              <div className="bg-white border-2 border-slate-400 rounded-lg p-4 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Resumo Financeiro da Proposta
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                      Preço Final
                    </span>
                  </div>

                  {showCostBreakdown && (
                    <div className="py-2.5 space-y-1 text-[11px] border-b border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>Materiais, Perfis & Insumos:</span>
                        <span className="font-mono font-medium text-slate-800">{formatBRL(totals.totalMaterials)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Serviços, Fabricação e Montagem:</span>
                        <span className="font-mono font-medium text-slate-800">{formatBRL(totals.subLabor)}</span>
                      </div>
                      {totals.cashDiscountAmount > 0 && (
                        <div className="flex justify-between text-emerald-800 font-medium">
                          <span>Desconto Comercial:</span>
                          <span className="font-mono">-{formatBRL(totals.cashDiscountAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Valor Total do Investimento:
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight mt-0.5">
                    {formatBRL(totals.finalPrice)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                    Condições: Entrada de 50% no pedido e saldo restante de 50% na entrega e instalação da obra.
                  </div>
                </div>
              </div>

            </div>

            {/* 5. DECLARAÇÃO DE ACEITE E ASSINATURAS */}
            {showSignatures && (
              <div data-pdf-block className="pdf-avoid-break mt-6 pt-3 border-t border-slate-300 text-xs">
                <div className="text-center text-[10.5px] text-slate-600 mb-8 italic">
                  Estando as partes em pleno acordo com as especificações técnicas, prazos e valores apresentados nesta proposta comercial, firmam o presente aceite para formalização e início dos trabalhos.
                </div>

                <div className="grid grid-cols-2 gap-10 text-center">
                  <div>
                    <div className="border-t border-slate-600 w-full mb-1"></div>
                    <strong className="text-slate-900 block text-xs font-bold">{profile.name}</strong>
                    <span className="text-slate-500 text-[10px] block">Contratada / Responsável Técnico</span>
                  </div>

                  <div>
                    <div className="border-t border-slate-600 w-full mb-1"></div>
                    <strong className="text-slate-900 block text-xs font-bold">{quote.projectClient || 'Cliente'}</strong>
                    <span className="text-slate-500 text-[10px] block">Contratante / Aceite da Proposta</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 mt-4">
                  Data de Aprovação: _____ / _____ / __________
                </div>
              </div>
            )}

            {/* RODAPÉ FORMAL */}
            <div data-pdf-block className="pdf-avoid-break text-center text-[9px] text-slate-400 pt-5 mt-4 border-t border-slate-200">
              Proposta Comercial Formal emitida por <strong>{profile.name}</strong> • Documento confidencial destinado exclusivamente ao cliente especificado.
            </div>

          </div>
        </div>

        {/* Barra de Rodapé do Modal */}
        <div className="bg-zinc-950 p-3 sm:p-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-400 hidden sm:block">
            <span>Dica: Use </span>
            <strong className="text-zinc-200">"Ocultar Itens (Preço Fechado)"</strong>
            <span> para enviar ao cliente final sem expor custos unitários, ou </span>
            <strong className="text-zinc-200">"Orçamento Detalhado"</strong>
            <span> para clientes corporativos.</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? 'Processando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
