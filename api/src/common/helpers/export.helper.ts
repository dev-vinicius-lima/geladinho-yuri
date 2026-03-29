import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export type PdfSummaryItem = { label: string; value: string };
export type PdfTable = { headers: string[]; rows: (string | number)[][] };
export type PdfSection = { title?: string; summary?: PdfSummaryItem[]; table?: PdfTable };

export class ExportHelper {
  // ─── XLSX ──────────────────────────────────────────────────────────────────
  static toXlsx(sheetName: string, headers: string[], rows: (string | number | null)[][]): Buffer {
    const wsData = [headers, ...rows.map((r) => r.map((v) => v ?? ''))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf as Buffer;
  }

  // ─── CSV ───────────────────────────────────────────────────────────────────
  static toCsv(headers: string[], rows: (string | number | null)[][]): Buffer {
    const escape = (v: string | number | null) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const lines = [headers, ...rows].map((row) => row.map(escape).join(','));
    return Buffer.from('\uFEFF' + lines.join('\r\n'), 'utf-8'); // BOM for Excel
  }

  // ─── PDF ───────────────────────────────────────────────────────────────────
  static toPdf(title: string, sections: PdfSection[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.fillColor('#000000').moveDown(1);

      for (const section of sections) {
        if (section.title) {
          doc.fontSize(12).font('Helvetica-Bold').text(section.title);
          doc.moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .stroke('#cccccc');
          doc.moveDown(0.5);
        }

        if (section.summary?.length) {
          doc.fontSize(9).font('Helvetica');
          for (const item of section.summary) {
            doc.text(`${item.label}: `, { continued: true }).font('Helvetica-Bold').text(item.value);
            doc.font('Helvetica');
          }
          doc.moveDown(0.5);
        }

        if (section.table) {
          ExportHelper.drawTable(doc, section.table);
          doc.moveDown(1);
        }
      }

      doc.end();
    });
  }

  private static drawTable(doc: PDFKit.PDFDocument, table: PdfTable) {
    const { headers, rows } = table;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = pageWidth / headers.length;
    const rowHeight = 16;
    const fontSize = 8;

    const drawRow = (cells: (string | number)[], isHeader: boolean) => {
      if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }
      const startY = doc.y;

      if (isHeader) {
        doc.rect(doc.page.margins.left, startY, pageWidth, rowHeight).fill('#2563EB');
        doc.fillColor('#ffffff');
      } else {
        doc.fillColor('#000000');
      }

      cells.forEach((cell, i) => {
        const x = doc.page.margins.left + i * colWidth;
        doc.fontSize(fontSize)
          .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .text(String(cell ?? ''), x + 3, startY + 4, {
            width: colWidth - 6,
            lineBreak: false,
          });
      });

      doc.fillColor('#000000');
      doc.moveTo(doc.page.margins.left, startY + rowHeight)
        .lineTo(doc.page.margins.left + pageWidth, startY + rowHeight)
        .stroke('#e5e7eb');

      doc.y = startY + rowHeight;
    };

    drawRow(headers, true);
    rows.forEach((row, i) => {
      if (i % 2 === 0) {
        doc.rect(doc.page.margins.left, doc.y, pageWidth, rowHeight).fill('#f9fafb');
        doc.fillColor('#000000');
      }
      drawRow(row, false);
    });
  }
}

export function formatBRL(value: number | null): string {
  if (value == null) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPercent(value: number | null): string {
  if (value == null) return '-';
  return `${value.toFixed(2)}%`;
}
