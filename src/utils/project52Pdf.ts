import { readingDays, splitReading } from './project52Schedule';
import { readings } from '../data/project52Readings';

const escapePdfText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const addPdfText = (commands: string[], text: string, x: number, y: number, size = 10, font = 'F1') => {
  commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
};

const wrapPdfText = (text: string, maxChars: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

type PdfLogo = {
  hex: string;
  width: number;
  height: number;
};

const getProject52Logo = async (): Promise<PdfLogo | null> => {
  try {
    const src = '/full%20logo.jpeg';
    const [response, image] = await Promise.all([
      fetch(src),
      new Promise<HTMLImageElement>((resolve, reject) => {
        const logo = new Image();
        logo.onload = () => resolve(logo);
        logo.onerror = reject;
        logo.src = src;
      }),
    ]);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    return {
      hex,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } catch {
    return null;
  }
};

export const createProject52Pdf = async () => {
  const logo = await getProject52Logo();
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 42;
  const footerY = 28;
  const pages: string[] = [];
  let commands: string[] = [];
  let y = pageHeight - margin;
  let pageNumber = 1;

  const addFooter = () => {
    commands.push('0.62 0.11 0.11 rg');
    commands.push(`${margin} 22 528 1.2 re f`);
    commands.push('0.25 0.25 0.25 rg');
    addPdfText(commands, `AIC Njoro Town | Project 52 | Page ${pageNumber}`, margin, footerY, 8);
  };

  const newPage = () => {
    if (commands.length) {
      addFooter();
      pages.push(commands.join('\n'));
      pageNumber += 1;
    }

    commands = [];
    y = pageHeight - margin;
  };

  const ensureSpace = (height: number) => {
    if (y - height < 56) {
      newPage();
    }
  };

  newPage();
  commands.push('0.05 0.05 0.05 rg');
  commands.push('0 704 612 88 re f');
  commands.push('1 1 1 rg');
  commands.push('42 720 58 50 re f');
  if (logo) {
    const logoHeight = 42;
    const logoWidth = Math.min(50, (logo.width / logo.height) * logoHeight);
    commands.push(`q ${logoWidth} 0 0 ${logoHeight} 46 724 cm /Logo Do Q`);
  } else {
    commands.push('0.62 0.11 0.11 rg');
    commands.push('42 720 50 50 re f');
    commands.push('1 1 1 rg');
    addPdfText(commands, 'AIC', 56, 742, 16);
  }
  addPdfText(commands, 'AIC Njoro Town', 110, 753, 14);
  addPdfText(commands, 'Project 52 Bible Reading Plan', 110, 731, 24);
  y = 674;
  commands.push('0.1 0.1 0.1 rg');
  addPdfText(commands, 'Read through the Bible week by week with our church community across 52 intentional weeks.', margin, y, 11);
  y -= 34;

  for (let week = 1; week <= 52; week += 1) {
    ensureSpace(112);
    commands.push('0.62 0.11 0.11 rg');
    commands.push(`${margin} ${y - 5} 528 20 re f`);
    commands.push('1 1 1 rg');
    addPdfText(commands, `Week ${week}`, margin + 10, y, 12);
    y -= 22;
    commands.push('0.05 0.05 0.05 rg');
    commands.push(`${margin} ${y - 13} 528 18 re f`);
    commands.push('1 1 1 rg');
    addPdfText(commands, 'Day', margin + 10, y - 7, 8);
    addPdfText(commands, 'Old Testament', margin + 92, y - 7, 8);
    addPdfText(commands, 'New Testament', margin + 336, y - 7, 8);
    y -= 21;

    readings[week].forEach((reading, index) => {
      const { oldTestament, newTestament } = splitReading(reading);
      const day = readingDays[index];
      const rowLines = Math.max(
        1,
        wrapPdfText(oldTestament, 34).length,
        wrapPdfText(newTestament, 27).length,
      );
      const rowHeight = Math.max(18, rowLines * 11 + 7);
      ensureSpace(rowHeight + 4);

      commands.push(index % 2 === 0 ? '0.98 0.96 0.92 rg' : '1 1 1 rg');
      commands.push(`${margin} ${y - rowHeight + 6} 528 ${rowHeight} re f`);
      commands.push('0.86 0.83 0.78 RG');
      commands.push(`${margin} ${y - rowHeight + 6} 528 ${rowHeight} re S`);
      commands.push('0.08 0.08 0.08 rg');
      addPdfText(commands, day, margin + 10, y - 8, 9);
      commands.push('0.08 0.08 0.08 rg');
      wrapPdfText(oldTestament, 34).forEach((line, lineIndex) => {
        addPdfText(commands, line, margin + 92, y - 8 - lineIndex * 11, 9);
      });
      commands.push('0.08 0.08 0.08 rg');
      wrapPdfText(newTestament, 27).forEach((line, lineIndex) => {
        addPdfText(commands, line, margin + 336, y - 8 - lineIndex * 11, 9);
      });
      y -= rowHeight + 3;
    });

    y -= 12;
  }

  addFooter();
  pages.push(commands.join('\n'));

  const objects: string[] = [];
  const pageRefs: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  if (logo) {
    objects.push(`<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logo.hex.length + 1} >>\nstream\n${logo.hex}>\nendstream`);
  }

  pages.forEach((content, index) => {
    const pageObjectNumber = (logo ? 5 : 4) + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageRefs.push(`${pageObjectNumber} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >>${logo ? ' /XObject << /Logo 4 0 R >>' : ''} >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pageRefs.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};
