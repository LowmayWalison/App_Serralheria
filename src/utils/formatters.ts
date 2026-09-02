import { QuoteData, CalculatedTotals, WorkshopProfile } from '../types';

export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(value) ? 0 : value);
};

export const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = value.replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const calculateQuoteTotals = (quote: QuoteData, installmentCount: number = 3): CalculatedTotals => {
  const subMetal = (quote.metalItems || []).reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  const subMaterials = (quote.materialItems || []).reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  const subConsumables = (quote.consumableItems || []).reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  const subDiscs = (quote.discItems || []).reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  
  const tariff = quote.energyTariff || 0.85;
  const subEnergy = (quote.energyItems || []).reduce((acc, item) => acc + (item.powerKw * item.hours * tariff), 0);
  
  const subTools = (quote.toolItems || []).reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  const subLabor = (quote.laborItems || []).reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  const subExtras = (quote.extraCosts || []).reduce((acc, item) => acc + item.cost, 0);

  const totalMaterials = subMetal + subMaterials + subConsumables + subDiscs;
  const totalDirectCost = totalMaterials + subEnergy + subTools + subLabor + subExtras;

  // Profit Margin calculation
  // Selling Price = Direct Cost / (1 - (margin% / 100)) or Markup = Direct Cost * (1 + margin%)
  // Serralheiros usually use Markup: Cost * (1 + margin/100) or Margin on sale. Let's do Markup:
  const profitMargin = Math.max(0, quote.profitMargin || 0);
  const profitAmount = totalDirectCost * (profitMargin / 100);
  const finalPrice = totalDirectCost + profitAmount;

  // Cash discount
  const cashDiscountPercent = quote.cashDiscountPercent || 0;
  const cashDiscountAmount = finalPrice * (cashDiscountPercent / 100);
  const cashPrice = Math.max(0, finalPrice - cashDiscountAmount);

  // 50% entry / 50% delivery
  const entryPrice = finalPrice * 0.5;
  const remainingPrice = finalPrice * 0.5;

  // Installments with optional card fee
  const cardFee = quote.cardFeePercent || 0;
  const priceWithCardFee = finalPrice * (1 + cardFee / 100);
  const validInstallments = Math.max(1, installmentCount);
  const installmentAmount = priceWithCardFee / validInstallments;

  return {
    subMetal,
    subMaterials,
    subConsumables,
    subDiscs,
    subEnergy,
    subTools,
    subLabor,
    subExtras,
    totalMaterials,
    totalDirectCost,
    profitAmount,
    finalPrice,
    cashDiscountAmount,
    cashPrice,
    entryPrice,
    remainingPrice,
    installmentCount: validInstallments,
    installmentAmount,
  };
};

export const generateWhatsAppMessage = (
  quote: QuoteData,
  totals: CalculatedTotals,
  profile: WorkshopProfile
): string => {
  let text = `*📋 PROPOSTA DE ORÇAMENTO - ${profile.name.toUpperCase() || 'SERRALHERIA'}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Cliente / Projeto:* ${quote.projectClient || 'Não informado'}\n`;
  if (quote.location) {
    text += `📍 *Local de Instalação:* ${quote.location}\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `*🛠️ ESPECIFICAÇÃO DOS SERVIÇOS & MATERIAIS:*\n`;
  
  const allMainItems = [
    ...quote.metalItems.filter(i => i.quantity > 0).map(i => `• ${i.description} (${i.quantity}m)`),
    ...quote.materialItems.filter(i => i.quantity > 0).map(i => `• ${i.description} (${i.quantity} un)`),
  ];

  if (allMainItems.length > 0) {
    text += allMainItems.slice(0, 8).join('\n') + '\n';
  } else {
    text += `• Fabricação e instalação completa sob medida.\n`;
  }

  if (quote.observations) {
    text += `\n📝 *Observações:* ${quote.observations}\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `*💰 VALOR DO INVESTIMENTO:*\n`;
  text += `👉 *Valor Total: ${formatBRL(totals.finalPrice)}*\n\n`;

  text += `*💳 CONDIÇÕES DE PAGAMENTO:*\n`;
  if (quote.cashDiscountPercent > 0) {
    text += `🟢 *À Vista (PIX / Dinheiro com ${quote.cashDiscountPercent}% desc.):* ${formatBRL(totals.cashPrice)}\n`;
  }
  text += `🟡 *50% Entrada (${formatBRL(totals.entryPrice)}) + 50% na Instalação (${formatBRL(totals.remainingPrice)})*\n`;
  text += `💳 *Cartão de Crédito:* em até 12x (consulte taxas)\n`;

  if (profile.pixKey) {
    text += `\n🔑 *Chave PIX:* ${profile.pixKey}\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🛡️ *Garantia:* ${profile.warranty || '90 dias contra defeitos de fabricação'}\n`;
  text += `⏳ *Validade do Orçamento:* ${quote.validityDays || 15} dias\n\n`;
  text += `📞 *Dúvidas ou Fechamento:* ${profile.phone || 'Entre em contato conosco'}\n`;
  text += `_Obrigado pela preferência e confiança!_`;

  return text;
};

export const getCleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
