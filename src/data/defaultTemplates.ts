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

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  quote: Partial<QuoteData>;
}

export const PRESET_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'portao_basculante',
    name: 'Portão Basculante Residencial (3,00m x 2,20m)',
    category: 'Portões',
    description: 'Portão completo com caixa lateral de contrapeso, braço articulado, tubos metalon e requadro reforçado.',
    quote: {
      projectClient: 'Portão Basculante 3,00 x 2,20m',
      deliveryDays: '15 dias úteis',
      observations: 'Incluso caixas de contrapeso laterais, cabo de aço 3/16, roldanas 4" e trilhos guia. Pintura automotiva primer + esmalte.',
      metalItems: [
        { id: 'pb1', description: 'Metalon 50x50 chapa 16 (1.5mm) - Colunas e Estrutura', unitCost: 48.00, quantity: 24, unitLabel: 'm' },
        { id: 'pb2', description: 'Tubo 50x20 chapa 18 - Travessas verticais', unitCost: 24.00, quantity: 36, unitLabel: 'm' },
        { id: 'pb3', description: 'Trilho U dobrado para roldanas', unitCost: 38.00, quantity: 8, unitLabel: 'm' },
        { id: 'pb4', description: 'Chapa Lambril Búzios (fechamento inferior)', unitCost: 85.00, quantity: 6, unitLabel: 'm' }
      ],
      materialItems: [
        { id: 'pb_m1', description: 'Kit Basculante (Braço, Cabo de aço e Roldana 4")', unitCost: 280.00, quantity: 1, unitLabel: 'kit' },
        { id: 'pb_m2', description: 'Fechadura Bico de Papagaio com chave tetra', unitCost: 65.00, quantity: 1, unitLabel: 'un' },
        { id: 'pb_m3', description: 'Chumbo de contrapeso balanceado (kg)', unitCost: 6.00, quantity: 30, unitLabel: 'kg' },
        { id: 'pb_m4', description: 'Puxador Tubular em Alumínio 40cm', unitCost: 45.00, quantity: 1, unitLabel: 'un' }
      ],
      consumableItems: [
        { id: 'pb_c1', description: 'Arame MIG / Eletrodo 7018 (kg)', unitCost: 38.00, quantity: 3, unitLabel: 'kg' },
        { id: 'pb_c2', description: 'Primer Epóxi / Fundo Fosfatizante', unitCost: 65.00, quantity: 2, unitLabel: 'gl' },
        { id: 'pb_c3', description: 'Tinta Esmalte Sintético Preto Acetinado', unitCost: 55.00, quantity: 2, unitLabel: 'gl' }
      ],
      discItems: [
        { id: 'pb_d1', description: 'Disco de Corte 4.1/2"', unitCost: 6.50, quantity: 8, unitLabel: 'un' },
        { id: 'pb_d2', description: 'Disco Flap 4.1/2" grão 80', unitCost: 12.00, quantity: 4, unitLabel: 'un' }
      ],
      laborItems: [
        { id: 'pb_l1', description: 'Serralheiro Soldador (Corte, Esquadro, Solda)', unitCost: 45.00, quantity: 24, unitLabel: 'h' },
        { id: 'pb_l2', description: 'Ajudante Geral (Acabamento e Montagem)', unitCost: 22.00, quantity: 16, unitLabel: 'h' },
        { id: 'pb_l3', description: 'Instalação e Chumbamento na Obra (Equipe 2p)', unitCost: 50.00, quantity: 8, unitLabel: 'h' }
      ],
      extraCosts: [
        { id: 'pb_ex1', description: 'Frete caminhonete para transporte do portão', cost: 150.00 }
      ],
      profitMargin: 45
    }
  },
  {
    id: 'grade_janela',
    name: 'Grade de Janela Reforçada (1,20m x 1,00m)',
    category: 'Grades',
    description: 'Grade de ferro quadrado 1/2" maciço com requadro em cantoneira 3/4" e chumbadores.',
    quote: {
      projectClient: 'Grade de Janela 1,20 x 1,00m',
      deliveryDays: '5 a 7 dias úteis',
      observations: 'Ferro quadrado maciço com requadro soldado em esquadro perfeito. Tratamento antiferrugem.',
      metalItems: [
        { id: 'gj1', description: 'Cantoneira 3/4 x 1/8 (Requadro)', unitCost: 16.00, quantity: 5, unitLabel: 'm' },
        { id: 'gj2', description: 'Barra Quadrada Maciça 1/2" (Barras verticais)', unitCost: 22.00, quantity: 14, unitLabel: 'm' },
        { id: 'gj3', description: 'Ferro Chato 1/2 x 1/8 (Travessas)', unitCost: 12.00, quantity: 3, unitLabel: 'm' }
      ],
      materialItems: [
        { id: 'gj_m1', description: 'Grampos Chumbadores de ferro para alvenaria', unitCost: 3.50, quantity: 6, unitLabel: 'un' }
      ],
      consumableItems: [
        { id: 'gj_c1', description: 'Eletrodo 6013 2.5mm', unitCost: 32.00, quantity: 1, unitLabel: 'kg' },
        { id: 'gj_c2', description: 'Zarcão antiferrugem e Esmalte Branco', unitCost: 45.00, quantity: 1, unitLabel: 'un' }
      ],
      discItems: [
        { id: 'gj_d1', description: 'Disco de Corte Fino', unitCost: 6.50, quantity: 2, unitLabel: 'un' }
      ],
      laborItems: [
        { id: 'gj_l1', description: 'Serralheiro (Corte, gabarito e soldagem)', unitCost: 40.00, quantity: 6, unitLabel: 'h' },
        { id: 'gj_l2', description: 'Instalação e chumbamento no local', unitCost: 40.00, quantity: 2, unitLabel: 'h' }
      ],
      extraCosts: [
        { id: 'gj_ex1', description: 'Deslocamento / Gasolina', cost: 40.00 }
      ],
      profitMargin: 50
    }
  },
  {
    id: 'corrimao_tubular',
    name: 'Corrimão de Parede em Tubo Redondo (4,00m)',
    category: 'Corrimãos',
    description: 'Corrimão ergonômico tubo 1.1/2" com curvas nas pontas e suportes de fixação em aço com bucha 10.',
    quote: {
      projectClient: 'Corrimão Tubo 1.1/2 (4 Metros)',
      deliveryDays: '5 dias úteis',
      observations: 'Conforme norma NBR 9050, curvas nas pontas de 90 graus para parede e tampas flangeadas.',
      metalItems: [
        { id: 'cr1', description: 'Tubo Redondo 1.1/2" (38mm) chapa 16', unitCost: 32.00, quantity: 5, unitLabel: 'm' },
        { id: 'cr2', description: 'Curva 90 graus 1.1/2 para solda', unitCost: 18.00, quantity: 2, unitLabel: 'un' }
      ],
      materialItems: [
        { id: 'cr_m1', description: 'Suporte flangeado para parede em aço', unitCost: 22.00, quantity: 4, unitLabel: 'un' },
        { id: 'cr_m2', description: 'Bucha nylon 10 + Parafuso Inox', unitCost: 2.50, quantity: 12, unitLabel: 'un' },
        { id: 'cr_m3', description: 'Tampas plásticas ou canoplas de acabamento', unitCost: 4.00, quantity: 4, unitLabel: 'un' }
      ],
      consumableItems: [
        { id: 'cr_c1', description: 'Eletrodo / Vareta TIG e lixas', unitCost: 35.00, quantity: 1, unitLabel: 'un' },
        { id: 'cr_c2', description: 'Pintura Eletrostática a pó Preto Fosco (Terceirizada)', unitCost: 120.00, quantity: 1, unitLabel: 'serv' }
      ],
      discItems: [
        { id: 'cr_d1', description: 'Disco de Corte e Desbaste fino', unitCost: 7.00, quantity: 2, unitLabel: 'un' }
      ],
      laborItems: [
        { id: 'cr_l1', description: 'Serralheiro Especialista em Acabamento', unitCost: 45.00, quantity: 5, unitLabel: 'h' },
        { id: 'cr_l2', description: 'Fixação e Nivelamento na Obra', unitCost: 40.00, quantity: 3, unitLabel: 'h' }
      ],
      extraCosts: [
        { id: 'cr_ex1', description: 'Transporte e Fixação', cost: 50.00 }
      ],
      profitMargin: 40
    }
  },
  {
    id: 'cobertura_metalica',
    name: 'Estrutura / Cobertura Metálica Pequena (4,00m x 3,00m = 12m²)',
    category: 'Estruturas',
    description: 'Estrutura de telhado metálico com tesouras em perfil U e terças para telha termoacústica ou galvalume.',
    quote: {
      projectClient: 'Cobertura Metálica 4x3m (Garagem/Área Gourmet)',
      deliveryDays: '10 a 12 dias úteis',
      observations: 'Não incluso telhas (apenas estrutura metálica instalada e pintada). Fixação em vigas com parabolt 3/8.',
      metalItems: [
        { id: 'cb1', description: 'Perfil U Enrijecido 100x40x15 #14 (Vigas Mestras)', unitCost: 55.00, quantity: 18, unitLabel: 'm' },
        { id: 'cb2', description: 'Perfil U Simples 75x38 #16 (Terças de apoio)', unitCost: 36.00, quantity: 24, unitLabel: 'm' },
        { id: 'cb3', description: 'Metalon 80x80 chapa 14 (Colunas de sustentação)', unitCost: 72.00, quantity: 6, unitLabel: 'm' },
        { id: 'cb4', description: 'Chapa de base 1/4" para fixação das colunas', unitCost: 40.00, quantity: 2, unitLabel: 'un' }
      ],
      materialItems: [
        { id: 'cb_m1', description: 'Parabolt 3/8 x 3" para chumbamento', unitCost: 7.50, quantity: 8, unitLabel: 'un' },
        { id: 'cb_m2', description: 'Parafusos autobrocantes para terças', unitCost: 0.80, quantity: 40, unitLabel: 'un' }
      ],
      consumableItems: [
        { id: 'cb_c1', description: 'Eletrodo 7018 3.25mm reforçado', unitCost: 45.00, quantity: 2, unitLabel: 'kg' },
        { id: 'cb_c2', description: 'Galvite Fundo Protetor para Aço Galvanizado', unitCost: 68.00, quantity: 2, unitLabel: 'gl' },
        { id: 'cb_c3', description: 'Esmalte Sintético Cinza Platina', unitCost: 58.00, quantity: 2, unitLabel: 'gl' }
      ],
      discItems: [
        { id: 'cb_d1', description: 'Disco de Corte Pesado 7"', unitCost: 14.00, quantity: 4, unitLabel: 'un' },
        { id: 'cb_d2', description: 'Disco de Desbaste 4.1/2"', unitCost: 11.00, quantity: 3, unitLabel: 'un' }
      ],
      laborItems: [
        { id: 'cb_l1', description: 'Serralheiro Montador Estrutural', unitCost: 50.00, quantity: 16, unitLabel: 'h' },
        { id: 'cb_l2', description: 'Ajudante de Obra', unitCost: 25.00, quantity: 16, unitLabel: 'h' },
        { id: 'cb_l3', description: 'Montagem e Soldagem em Altura', unitCost: 55.00, quantity: 8, unitLabel: 'h' }
      ],
      extraCosts: [
        { id: 'cb_ex1', description: 'Frete e Andaime para montagem', cost: 200.00 }
      ],
      profitMargin: 35
    }
  }
];
