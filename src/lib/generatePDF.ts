import { jsPDF } from 'jspdf';
import { ROBOTO_REGULAR, ROBOTO_BOLD } from './fonts';

type Report = {
  score: number;
  level: string;
  scores: { innovation: number; marketDemand: number; feasibility: number; monetization: number };
  market: string;
  audience: string;
  competitors: string;
  risks: string;
  businessModel: string;
  recommendations: string[];
};

// Colors
const BRAND = [0, 153, 255] as const;
const DARK = [15, 15, 15] as const;
const SURFACE = [26, 26, 26] as const;
const GRAY = [136, 136, 136] as const;
const WHITE = [255, 255, 255] as const;
const LIGHT_GRAY = [200, 200, 200] as const;

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: readonly [number, number, number]) {
  doc.setFillColor(fill[0], fill[1], fill[2]);
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function drawProgressBar(doc: jsPDF, x: number, y: number, w: number, label: string, value: number, color: readonly [number, number, number]) {
  doc.setFontSize(9);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text(label, x, y);
  doc.setTextColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.text(`${value}/100`, x + w, y, { align: 'right' });

  const barY = y + 3;
  const barH = 5;
  drawRoundedRect(doc, x, barY, w, barH, 2.5, [40, 40, 40]);

  const fillW = (value / 100) * w;
  if (fillW > 0) {
    drawRoundedRect(doc, x, barY, Math.max(fillW, 5), barH, 2.5, color);
  }
}

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');
}

export function generatePDFReport(idea: string, report: Report) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  registerFonts(doc);

  const pageW = 210;
  const pageH = 297;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  const fillBackground = () => {
    doc.setFillColor(0, 0, 0); // Pure black
    doc.rect(0, 0, pageW, pageH, 'F');
  };

  const addPage = () => {
    doc.addPage();
    fillBackground();
  };

  // Initial background
  fillBackground();

  // === HEADER BACKGROUND ===
  drawRoundedRect(doc, 0, 0, pageW, 52, 0, DARK);

  // Brand accent line
  doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
  doc.rect(0, 0, pageW, 1.5, 'F');

  // Logo text
  doc.setFontSize(22);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text('CheckIt', margin, 16);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(BRAND[0], BRAND[1], BRAND[2]);
  doc.text('Звіт аналізу бізнес-ідеї', margin, 23);

  // Date
  const date = new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text(date, pageW - margin, 16, { align: 'right' });

  // Idea text in header
  doc.setFontSize(11);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  const ideaLines = doc.splitTextToSize(`"${idea}"`, contentW);
  doc.text(ideaLines, margin, 34);

  y = 60;

  // === SCORE SECTION ===
  const scoreBoxW = 55;
  const scoreBoxH = 60;
  drawRoundedRect(doc, margin, y, scoreBoxW, scoreBoxH, 4, SURFACE);

  const cx = margin + scoreBoxW / 2;
  const cy = y + 22;
  doc.setFillColor(30, 30, 30);
  doc.circle(cx, cy, 14, 'F');

  doc.setDrawColor(BRAND[0], BRAND[1], BRAND[2]);
  doc.setLineWidth(1.5);
  doc.circle(cx, cy, 14, 'S');

  // Score number
  doc.setFontSize(26);
  doc.setFont('Roboto', 'bold');
  const scoreColor = report.score > 70 ? BRAND : report.score > 40 ? [255, 149, 0] as const : [255, 59, 48] as const;
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(String(report.score), cx, cy + 4, { align: 'center' });

  // Score label
  doc.setFontSize(7);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text('ЗАГАЛЬНА ОЦІНКА', cx, cy + 12, { align: 'center' });

  // Level badge
  doc.setFontSize(9);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  const levelW = doc.getTextWidth(report.level) + 8;
  drawRoundedRect(doc, cx - levelW / 2, y + scoreBoxH - 14, levelW, 7, 3, [40, 40, 40]);
  doc.text(report.level, cx, y + scoreBoxH - 9, { align: 'center' });

  // === PROGRESS BARS ===
  const barsX = margin + scoreBoxW + 8;
  const barsW = contentW - scoreBoxW - 8;
  drawRoundedRect(doc, barsX, y, barsW, scoreBoxH, 4, SURFACE);

  const barStartX = barsX + 6;
  const barContentW = barsW - 12;
  drawProgressBar(doc, barStartX, y + 10, barContentW, 'Інноваційність', report.scores.innovation, [59, 130, 246]);
  drawProgressBar(doc, barStartX, y + 24, barContentW, 'Попит на ринку', report.scores.marketDemand, [34, 197, 94]);
  drawProgressBar(doc, barStartX, y + 38, barContentW, 'Реалістичність', report.scores.feasibility, [234, 179, 8]);
  drawProgressBar(doc, barStartX, y + 52, barContentW, 'Монетизація', report.scores.monetization, BRAND);

  y += scoreBoxH + 10;

  // === ANALYSIS SECTIONS ===
  const sections = [
    { title: 'Потенціал ринку', text: report.market, accent: [59, 130, 246] as const },
    { title: 'Цільова аудиторія', text: report.audience, accent: [168, 85, 247] as const },
    { title: 'Конкурентне середовище', text: report.competitors, accent: [249, 115, 22] as const },
    { title: 'Основні ризики', text: report.risks, accent: [239, 68, 68] as const },
    { title: 'Бізнес-модель', text: report.businessModel, accent: [34, 197, 94] as const },
  ];

  const colW = (contentW - 6) / 2;

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const col = i % 2;
    const colX = margin + col * (colW + 6);

    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    const lines = doc.splitTextToSize(s.text, colW - 12);
    const cardH = 12 + lines.length * 4.5 + 6;

    if (y + cardH > 280) {
      addPage();
      y = 16;
    }

    drawRoundedRect(doc, colX, y, colW, cardH, 4, SURFACE);

    // Accent left border
    doc.setFillColor(s.accent[0], s.accent[1], s.accent[2]);
    doc.roundedRect(colX, y, 1.5, cardH, 0.75, 0.75, 'F');

    // Title
    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(s.accent[0], s.accent[1], s.accent[2]);
    doc.text(s.title, colX + 6, y + 8);

    // Body
    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.text(lines, colX + 6, y + 14);

    if (col === 1 || i === sections.length - 1) {
      y += cardH + 6;
    }
  }

  // === RECOMMENDATIONS ===
  if (y + 50 > 280) {
    addPage();
    y = 16;
  }

  // Measure recs
  doc.setFontSize(9);
  doc.setFont('Roboto', 'normal');
  let totalRecsH = 18;
  const recLines: string[][] = [];
  for (const rec of report.recommendations) {
    const lines = doc.splitTextToSize(rec, contentW - 24);
    recLines.push(lines);
    totalRecsH += lines.length * 4.5 + 4;
  }

  drawRoundedRect(doc, margin, y, contentW, totalRecsH, 4, SURFACE);

  // Accent top border
  doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
  doc.rect(margin + 4, y, contentW - 8, 1.2, 'F');

  // Title
  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text('Рекомендації', margin + 8, y + 10);

  // Items
  let recY = y + 18;
  recLines.forEach((lines, i) => {
    doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
    doc.circle(margin + 12, recY - 1.5, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.text(String(i + 1), margin + 12, recY, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.text(lines, margin + 18, recY);
    recY += lines.length * 4.5 + 4;
  });

  y += totalRecsH + 10;

  // === FOOTER ===
  if (y + 16 > 280) {
    addPage();
    y = 275;
  }
  doc.setFontSize(7);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text('Звіт згенеровано CheckIt AI  |  Powered by Mistral AI', pageW / 2, 290, { align: 'center' });

  doc.save('CheckIt-Report.pdf');
}
