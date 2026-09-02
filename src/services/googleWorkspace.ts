import { QuoteData, CalculatedTotals, WorkshopProfile } from '../types';
import { formatBRL } from '../utils/formatters';

interface WorkspaceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 1. GOOGLE SHEETS INTEGRATION
export async function createGoogleSheetForQuote(
  accessToken: string,
  quote: QuoteData,
  totals: CalculatedTotals,
  profile: WorkshopProfile
): Promise<WorkspaceResponse<{ spreadsheetId: string; spreadsheetUrl: string }>> {
  try {
    const title = `Orçamento Serralheria - ${quote.projectClient || 'Cliente'} (${new Date().toLocaleDateString('pt-BR')})`;
    
    // Create new spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Orçamento Detalhado',
              gridProperties: {
                rowCount: 50,
                columnCount: 6,
              },
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Erro ao criar Planilha no Google Sheets');
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Populate data
    const rows: (string | number)[][] = [
      ['ORÇAMENTO DE SERRALHERIA & ESTRUTURAS METÁLICAS', '', '', '', ''],
      [`Empresa / Serralheiro: ${profile.name || 'Serralheria Pro'}`, `Telefone: ${profile.phone || ''}`, `Cidade: ${profile.city || ''}`, '', ''],
      [`Cliente: ${quote.projectClient || 'Não informado'}`, `Telefone: ${quote.clientPhone || ''}`, `Data: ${quote.date || ''}`, `Validade: ${quote.validityDays} dias`, ''],
      ['', '', '', '', ''],
      ['CATEGORIA', 'DESCRIÇÃO DO ITEM', 'QUANTIDADE', 'VALOR UNIT. (R$)', 'SUBTOTAL (R$)'],
    ];

    // Metal items
    quote.metalItems.forEach((item) => {
      if (item.quantity > 0) {
        rows.push(['1. Perfis & Metais', item.description || 'Metal', item.quantity, item.unitCost, item.quantity * item.unitCost]);
      }
    });

    // Materials / Glass / Panels
    quote.materialItems.forEach((item) => {
      if (item.quantity > 0) {
        rows.push(['2. Chapas & Vidros', item.description || 'Chapa/Vidro', item.quantity, item.unitCost, item.quantity * item.unitCost]);
      }
    });

    // Consumables & Paint
    quote.consumableItems.forEach((item) => {
      if (item.quantity > 0) {
        rows.push(['3. Consumíveis & Tintas', item.description || 'Consumível', item.quantity, item.unitCost, item.quantity * item.unitCost]);
      }
    });

    // Labor
    quote.laborItems.forEach((item) => {
      if (item.quantity > 0) {
        rows.push(['4. Mão de Obra', item.description || 'Serviço', item.quantity, item.unitCost, item.quantity * item.unitCost]);
      }
    });

    // Extras
    quote.extraCosts.forEach((item) => {
      if (item.cost > 0) {
        rows.push(['5. Custos Extras / Frete', item.description || 'Extra', 1, item.cost, item.cost]);
      }
    });

    rows.push(['', '', '', '', '']);
    rows.push(['RESUMO FINANCEIRO', '', '', '', '']);
    rows.push(['Custo Direto Total', '', '', '', totals.totalDirectCost]);
    rows.push([`Margem de Lucro (${quote.profitMargin}%)`, '', '', '', totals.profitAmount]);
    rows.push(['VALOR TOTAL DO PROJETO', '', '', '', totals.finalPrice]);
    rows.push([`À Vista com Desconto (${quote.cashDiscountPercent}%)`, '', '', '', totals.cashPrice]);
    rows.push([`Opção Parcelado (${totals.installmentCount}x)`, '', '', '', totals.installmentAmount]);

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Orçamento Detalhado!A1:E${rows.length}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    return { success: true, data: { spreadsheetId, spreadsheetUrl } };
  } catch (error) {
    console.error('Google Sheets error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha no Google Sheets' };
  }
}

// 2. GOOGLE DOCS INTEGRATION
export async function createGoogleDocProposal(
  accessToken: string,
  quote: QuoteData,
  totals: CalculatedTotals,
  profile: WorkshopProfile
): Promise<WorkspaceResponse<{ documentId: string; documentUrl: string }>> {
  try {
    const title = `Proposta Comercial - ${quote.projectClient || 'Cliente'} - ${profile.name || 'Serralheria'}`;
    
    // Create Document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Erro ao criar Documento no Google Docs');
    }

    const docData = await createRes.json();
    const documentId = docData.documentId;
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    const textContent = `PROPOSTA COMERCIAL E ORÇAMENTO DE SERRALHERIA
${profile.name || 'Serralheria Profissional'} | Contato: ${profile.phone || ''} | ${profile.city || ''}
--------------------------------------------------------------------------------

DADOS DO CLIENTE & PROJETO:
Cliente: ${quote.projectClient || 'Não informado'}
Telefone: ${quote.clientPhone || 'Não informado'}
Local da Obra/Instalação: ${quote.location || 'A combinar'}
Data da Proposta: ${quote.date || new Date().toLocaleDateString('pt-BR')}
Prazo de Validade: ${quote.validityDays} dias
Prazo Estimado de Entrega: ${quote.deliveryDays || '15 dias úteis'}

ESCOPO DO PROJETO & OBSERVAÇÕES:
${quote.observations || 'Confecção, montagem e instalação conforme alinhamento prévio.'}

COMPOSIÇÃO E VALORES:
• Total dos Materiais e Insumos: ${formatBRL(totals.totalMaterials)}
• Mão de Obra e Fabricação: ${formatBRL(totals.subLabor)}
• Custos Operacionais e Extras: ${formatBRL(totals.subExtras + totals.subEnergy + totals.subTools)}

VALOR TOTAL DA PROPOSTA: ${formatBRL(totals.finalPrice)}

CONDIÇÕES DE PAGAMENTO:
1. À Vista (PIX / Dinheiro com ${quote.cashDiscountPercent}% de desc.): ${formatBRL(totals.cashPrice)}
2. Parcelado no Cartão: ${totals.installmentCount}x de ${formatBRL(totals.installmentAmount)}
3. Sinal / Entrada: 50% (${formatBRL(totals.entryPrice)}) no aceite e 50% na conclusão da entrega.
Chave PIX: ${profile.pixKey || 'A combinar'}

GARANTIA:
${profile.warranty || 'Garantia de 1 ano para estrutura e soldas contra defeitos de fabricação.'}

___________________________________________
${profile.name || 'Serralheria Pro'} - Assinatura / Aceite do Cliente
`;

    // Insert text
    await fetch(`https://docs.google.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: textContent,
            },
          },
        ],
      }),
    });

    return { success: true, data: { documentId, documentUrl } };
  } catch (error) {
    console.error('Google Docs error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha no Google Docs' };
  }
}

// 3. GOOGLE DRIVE INTEGRATION
export async function saveQuoteToGoogleDrive(
  accessToken: string,
  quote: QuoteData,
  fileName?: string
): Promise<WorkspaceResponse<{ fileId: string; webViewLink: string }>> {
  try {
    const name = fileName || `Orcamento_${(quote.projectClient || 'Cliente').replace(/\s+/g, '_')}_${quote.id}.json`;
    const metadata = {
      name,
      mimeType: 'application/json',
      description: `Backup de Orçamento Serralheria - ${quote.projectClient}`,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(quote, null, 2)], { type: 'application/json' }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao salvar arquivo no Google Drive');
    }

    const file = await res.json();
    return {
      success: true,
      data: {
        fileId: file.id,
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      },
    };
  } catch (error) {
    console.error('Google Drive error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha no Google Drive' };
  }
}

// 4. GMAIL INTEGRATION (Send or Draft Proposal Email)
export async function sendQuoteByGmail(
  accessToken: string,
  recipientEmail: string,
  quote: QuoteData,
  totals: CalculatedTotals,
  profile: WorkshopProfile,
  asDraft = false
): Promise<WorkspaceResponse<{ id: string }>> {
  try {
    const subject = `Proposta de Orçamento: ${quote.observations ? quote.observations.slice(0, 30) : 'Serviço de Serralheria'} - ${profile.name || 'Serralheria'}`;
    
    const bodyText = `Olá ${quote.projectClient || 'Cliente'},

Segue a proposta de orçamento elaborada pela ${profile.name || 'nossa Serralheria'}:

• Projeto: ${quote.observations || 'Estruturas e Serviços em Metal'}
• Local da Instalação: ${quote.location || 'A combinar'}
• Prazo Estimado de Entrega: ${quote.deliveryDays || '15 dias úteis'}
• Validade do Orçamento: ${quote.validityDays} dias

RESUMO DE VALORES:
• Valor Total do Projeto: ${formatBRL(totals.finalPrice)}
• Pagamento à Vista (PIX com desconto): ${formatBRL(totals.cashPrice)}
• Opção Parcelada: ${totals.installmentCount}x de ${formatBRL(totals.installmentAmount)}

DADOS PARA CONTATO:
Telefone / WhatsApp: ${profile.phone || ''}
Chave PIX: ${profile.pixKey || ''}
Garantia: ${profile.warranty || '1 ano para estrutura e soldas.'}

Ficamos à disposição para quaisquer dúvidas ou agendamento de visita técnica!

Atenciosamente,
${profile.name || 'Serralheria Pro'}
`;

    // Construct RFC 2822 email
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const emailLines = [
      `To: ${recipientEmail}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      '',
      bodyText,
    ];

    const rawEmail = emailLines.join('\r\n');
    // base64url encode
    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const endpoint = asDraft
      ? 'https://gmail.googleapis.com/gmail/v1/users/me/drafts'
      : 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

    const payload = asDraft
      ? { message: { raw: encodedEmail } }
      : { raw: encodedEmail };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao processar no Gmail');
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Gmail error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha no Gmail' };
  }
}

// 5. GOOGLE CALENDAR (Schedule Site Visit or Installation)
export async function scheduleCalendarEvent(
  accessToken: string,
  eventData: {
    summary: string;
    description: string;
    location: string;
    startDateTime: string; // ISO format: 2026-09-05T09:00:00
    endDateTime: string;
  }
): Promise<WorkspaceResponse<{ eventId: string; htmlLink: string }>> {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao agendar no Google Agenda');
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        eventId: data.id,
        htmlLink: data.htmlLink || 'https://calendar.google.com',
      },
    };
  } catch (error) {
    console.error('Calendar error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha no Google Agenda' };
  }
}

// 6. GOOGLE TASKS (Create Production or Follow-Up Task)
export async function createGoogleTask(
  accessToken: string,
  taskData: {
    title: string;
    notes?: string;
    due?: string; // ISO format: 2026-09-10T00:00:00.000Z
  }
): Promise<WorkspaceResponse<{ taskId: string }>> {
  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: taskData.title,
        notes: taskData.notes || '',
        due: taskData.due,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao criar tarefa no Google Tasks');
    }

    const data = await res.json();
    return { success: true, data: { taskId: data.id } };
  } catch (error) {
    console.error('Tasks error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha no Google Tasks' };
  }
}

// 7. GOOGLE CONTACTS (People API - Fetch contacts for client autofill)
export interface GoogleContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export async function fetchGoogleContacts(accessToken: string): Promise<WorkspaceResponse<GoogleContact[]>> {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao buscar Contatos do Google');
    }

    const data = await res.json();
    const contacts: GoogleContact[] = (data.connections || []).map((person: any) => {
      const name = person.names?.[0]?.displayName || 'Contato sem nome';
      const email = person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.[0]?.value || '';
      return {
        id: person.resourceName || Math.random().toString(),
        name,
        email,
        phone,
      };
    });

    return { success: true, data: contacts };
  } catch (error) {
    console.error('Contacts error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Falha ao obter contatos' };
  }
}
