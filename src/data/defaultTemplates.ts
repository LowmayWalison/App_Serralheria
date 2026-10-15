import { QuoteData } from '../types';

export const createEmptyQuote = (): QuoteData => ({
  id: 'quote_' + Date.now(),
  projectClient: '',
  clientPhone: '',
  date: new Date().toISOString().split('T')[0],
  validityDays: 15,
  deliveryDays: '7 a 10 dias úteis',
  location: '',
  observations: 'Pintura primer anticorrosivo e acabamento esmalte sintético preto fosco.',
  
  metalItems: [
    { id: 'm1', description: 'Metalon 50x30 chapa 18 (1.2mm)', unitCost: 35.00, quantity: 12, unitLabel: 'm' },
    { id: 'm2', description: 'Tubo 20x20 chapa 18', unitCost: 18.50, quantity: 18, unitLabel: 'm' }
  ],
  materialItems: [
    { id: 'mat1', description: 'Fechadura Bico de Papagaio / Stam', unitCost: 45.00, quantity: 1, unitLabel: 'un' },
    { id: 'mat2', description: 'Dobradiça Gonzo 3/4 com abas', unitCost: 8.50, quantity: 3, unitLabel: 'un' },
    { id: 'mat3', description: 'Parafusos sextavados e buchas 10', unitCost: 1.50, quantity: 8, unitLabel: 'un' }
  ],
  consumableItems: [
    { id: 'c1', description: 'Eletrodo 6013 2.5mm (kg)', unitCost: 32.00, quantity: 1, unitLabel: 'kg' },
    { id: 'c2', description: 'Tinta Esmalte Sintético / Zarcão', unitCost: 48.00, quantity: 1, unitLabel: 'lata' },
    { id: 'c3', description: 'Thinner para diluição / limpeza', unitCost: 22.00, quantity: 1, unitLabel: 'litro' }
  ],
  discItems: [
    { id: 'd1', description: 'Disco de Corte Fino 4.1/2 inox', unitCost: 6.50, quantity: 4, unitLabel: 'un' },
    { id: 'd2', description: 'Disco Flap Desbaste Grão 60', unitCost: 12.00, quantity: 2, unitLabel: 'un' }
  ],
  
  energyTariff: 0.85,
  energyItems: [
    { id: 'e1', description: 'Esmerilhadeira Angular (1500W)', powerKw: 1.5, hours: 2.5 },
    { id: 'e2', description: 'Máquina Inversora de Solda (4000W)', powerKw: 4.0, hours: 3.0 },
    { id: 'e3', description: 'Policorte de Bancada (2200W)', powerKw: 2.2, hours: 1.0 }
  ],
  
  toolItems: [
    { id: 't1', description: 'Compressor de Ar e Pistola (Pintura)', unitCost: 8.00, quantity: 2, unitLabel: 'h' }
  ],
  laborItems: [
    { id: 'l1', description: 'Serralheiro Soldador Especialista', unitCost: 40.00, quantity: 8, unitLabel: 'h' },
    { id: 'l2', description: 'Ajudante / Auxiliar de Montagem', unitCost: 20.00, quantity: 6, unitLabel: 'h' }
  ],
  extraCosts: [
    { id: 'ex1', description: 'Combustível / Frete de Entrega e Instalação', cost: 60.00 }
  ],
  
  profitMargin: 40,
  cardFeePercent: 4.99,
  cashDiscountPercent: 5,
  
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
