import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PdfGeneratorOptions {
  fileName?: string;
  headerText?: string;
  footerText?: string;
}

export const generatePdfFromElement = async (
  elementId: string,
  optionsOrFileName: string | PdfGeneratorOptions = 'orcamento.pdf'
): Promise<void> => {
  const options: PdfGeneratorOptions =
    typeof optionsOrFileName === 'string'
      ? { fileName: optionsOrFileName }
      : optionsOrFileName;

  const fileName = options.fileName || 'orcamento.pdf';
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id "${elementId}" not found`);

  try {
    // Save original scroll position and scroll to top for exact relative coordinates
    const originalScrollTop = element.scrollTop;
    element.scrollTop = 0;

    // Render high-resolution canvas with html2canvas (scale 2.5 gives crisp 300 DPI text)
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    // Restore scroll position
    element.scrollTop = originalScrollTop;

    const scale = canvas.width / element.offsetWidth;
    const a4Ratio = 297 / 210; // 1.4142857
    const a4PageHeightPx = element.offsetWidth * a4Ratio;

    // Identify all indivisible atomic elements (rows, cards, signature sections)
    const containerRect = element.getBoundingClientRect();
    const rawAvoidElements = Array.from(
      element.querySelectorAll<HTMLElement>(
        '[data-pdf-block], .pdf-avoid-break, tr, .pdf-card, .pdf-section'
      )
    );

    // Keep only atomic elements (elements that don't contain other avoid-break elements)
    // This allows large parent tables or containers to break between rows while ensuring
    // no single row or card is cut in half.
    const avoidElements = rawAvoidElements.filter((el) => {
      if (el.tagName.toLowerCase() === 'tr') return true;
      const hasAvoidChildren = el.querySelector('[data-pdf-block], tr, .pdf-avoid-break');
      return !hasAvoidChildren;
    });

    // Map each atomic block's top, bottom, and height relative to element top
    const blocks = avoidElements
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          top: Math.round(rect.top - containerRect.top),
          bottom: Math.round(rect.bottom - containerRect.top),
          height: Math.round(rect.height),
        };
      })
      .filter((b) => b.height > 0)
      .sort((a, b) => a.top - b.top);

    const totalHeight = element.scrollHeight || element.offsetHeight;
    const pageBreaks: number[] = [0];

    // Page margin reserves in px:
    // Page 1 has internal top padding from HTML; reserve bottom buffer for footer
    const page1UsableHeight = a4PageHeightPx - 40;
    // Page 2+ needs top buffer for running header and bottom buffer for footer
    const subsequentUsableHeight = a4PageHeightPx - 75;

    let currentY = 0;
    let pageIndex = 0;

    while (currentY < totalHeight) {
      const isFirst = pageIndex === 0;
      const usableHeight = isFirst ? page1UsableHeight : subsequentUsableHeight;

      // If the remaining content fits cleanly on this page, finish here
      if (currentY + usableHeight >= totalHeight) {
        pageBreaks.push(totalHeight);
        break;
      }

      const targetBreakY = currentY + usableHeight;
      let chosenBreakY = targetBreakY;

      // Check if any atomic block intersects with targetBreakY
      const intersectingBlocks = blocks.filter(
        (b) => b.top < targetBreakY && b.bottom > targetBreakY
      );

      if (intersectingBlocks.length > 0) {
        // Find the earliest start of an intersecting block
        const earliestTop = Math.min(...intersectingBlocks.map((b) => b.top));

        // Break cleanly right before that block, provided it leaves at least 25% of the page filled
        if (earliestTop - currentY > usableHeight * 0.25) {
          chosenBreakY = earliestTop - 6; // 6px breathing room before the block
        }
      }

      // Safeguard against non-advancement
      if (chosenBreakY <= currentY + 80) {
        chosenBreakY = targetBreakY;
      }

      pageBreaks.push(chosenBreakY);
      currentY = chosenBreakY;
      pageIndex++;
    }

    // Initialize jsPDF document in standard A4 portrait (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidthMm = 210;
    const totalPages = pageBreaks.length - 1;

    for (let i = 0; i < totalPages; i++) {
      const startY = pageBreaks[i];
      const endY = pageBreaks[i + 1];
      const sliceHeightPx = endY - startY;

      if (sliceHeightPx <= 0) continue;

      if (i > 0) {
        pdf.addPage();
      }

      // Create an offscreen canvas slice for this page
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.round(sliceHeightPx * scale);

      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Pure white background for formal light theme
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        // Draw exact slice from the high-res canvas
        ctx.drawImage(
          canvas,
          0,
          Math.round(startY * scale),
          canvas.width,
          Math.round(sliceHeightPx * scale),
          0,
          0,
          sliceCanvas.width,
          sliceCanvas.height
        );

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const renderHeightMm = (sliceHeightPx / element.offsetWidth) * pdfWidthMm;

        // Top offset in mm: 0 for page 1 (has internal padding), 11mm for page 2+
        const topOffsetMm = i === 0 ? 0 : 11;

        pdf.addImage(
          sliceData,
          'JPEG',
          0,
          topOffsetMm,
          pdfWidthMm,
          renderHeightMm,
          undefined,
          'FAST'
        );

        // On Page 2+, add subtle formal running header
        if (i > 0 && options.headerText) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139); // slate-500
          pdf.text(options.headerText, 14, 7.5);

          pdf.setDrawColor(226, 232, 240); // slate-200
          pdf.setLineWidth(0.2);
          pdf.line(14, 9.5, 196, 9.5);
        }

        // On all pages, add formal running footer
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(148, 163, 184); // slate-400

        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.2);
        pdf.line(14, 287, 196, 287);

        const footerLabel = options.footerText || 'Proposta Comercial Formal • Validade expressa no corpo do documento';
        pdf.text(footerLabel, 14, 291.5);

        const pageLabel = `Página ${i + 1} de ${totalPages}`;
        pdf.text(pageLabel, 196, 291.5, { align: 'right' });
      }
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF with smart page breaks:', error);
    throw error;
  }
};
