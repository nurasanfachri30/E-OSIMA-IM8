import * as XLSX from 'xlsx';

const INDONESIAN_MONTHS: Record<string, string> = {
  januari: '01', jan: '01', january: '01',
  februari: '02', feb: '02', february: '02',
  maret: '03', mar: '03', march: '03',
  april: '04', apr: '04',
  mei: '05', may: '05',
  juni: '06', jun: '06', june: '06',
  juli: '07', jul: '07', july: '07',
  agustus: '08', agu: '08', agt: '08', august: '08',
  september: '09', sep: '09',
  oktober: '10', okt: '10', oct: '10', october: '10',
  november: '11', nov: '11',
  desember: '12', des: '12', dec: '12', december: '12'
};

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Normalizes any birth date input (Excel serial, Date, DD/MM/YYYY, Indonesian text, YYYY-MM-DD)
 * to standard ISO YYYY-MM-DD format without timezone drift.
 */
export function normalizeDateToYMD(raw: unknown): string {
  if (raw === undefined || raw === null || raw === '') return '';

  // 1. If Excel serial number (e.g. 39947 -> 2009-05-14)
  if (typeof raw === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(raw);
      if (parsed && parsed.y && parsed.m && parsed.d) {
        const year = String(parsed.y);
        const month = String(parsed.m).padStart(2, '0');
        const day = String(parsed.d).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {
      // ignore and continue
    }
  }

  // 2. If Date object
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const year = raw.getFullYear();
    const month = String(raw.getMonth() + 1).padStart(2, '0');
    const day = String(raw.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  let str = String(raw).trim();
  if (!str) return '';

  // Remove ISO time part if present (e.g. 2009-05-14T00:00:00.000Z)
  if (str.includes('T')) {
    str = str.split('T')[0].trim();
  } else if (str.includes(' ')) {
    // If it has space followed by time like 2009-05-14 00:00:00
    const timeMatch = str.match(/^(.+?)\s+\d{1,2}:\d{2}(?::\d{2})?$/);
    if (timeMatch) {
      str = timeMatch[1].trim();
    }
  }

  // 3. Check Indonesian words, e.g. '14 Mei 2009' or '14-Mei-2009' or '14 Mei 09'
  const matchWords = str.match(/^(\d{1,2})[\s\-\./]+([a-zA-Z]+)[\s\-\./]+(\d{2,4})$/);
  if (matchWords) {
    const d = matchWords[1].padStart(2, '0');
    const mStr = matchWords[2].toLowerCase();
    const yStr = matchWords[3];
    const y = yStr.length === 2 ? (parseInt(yStr, 10) > 40 ? '19' + yStr : '20' + yStr) : yStr;
    const m = INDONESIAN_MONTHS[mStr];
    if (m) return `${y}-${m}-${d}`;
  }

  // 4. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (e.g. 14/05/2009 or 14-5-2009)
  const matchDmy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, '0');
    const month = matchDmy[2].padStart(2, '0');
    const year = matchDmy[3];
    return `${year}-${month}-${day}`;
  }

  // 5. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const matchYmd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (matchYmd) {
    const year = matchYmd[1];
    const month = matchYmd[2].padStart(2, '0');
    const day = matchYmd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 6. Compact 8-digit numbers without separator: 14052009 (DDMMYYYY) or 20090514 (YYYYMMDD)
  if (/^\d{8}$/.test(str)) {
    const partA = str.substring(0, 4);
    if (partA.startsWith('19') || partA.startsWith('20')) {
      // YYYYMMDD
      const year = partA;
      const month = str.substring(4, 6);
      const day = str.substring(6, 8);
      return `${year}-${month}-${day}`;
    } else {
      // DDMMYYYY
      const day = str.substring(0, 2);
      const month = str.substring(2, 4);
      const year = str.substring(4, 8);
      return `${year}-${month}-${day}`;
    }
  }

  return str;
}

/**
 * Formats YYYY-MM-DD or other date string to readable Indonesian text, e.g. "14 Mei 2009"
 */
export function formatDateIndonesian(raw: unknown): string {
  const ymd = normalizeDateToYMD(raw);
  if (!ymd) return '-';

  const parts = ymd.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
      return `${day} ${MONTH_NAMES_ID[monthIndex]} ${year}`;
    }
  }

  return ymd;
}

/**
 * Compares two dates safely by normalizing both to YYYY-MM-DD.
 */
export function isDateMatching(dateA: unknown, dateB: unknown): boolean {
  const normA = normalizeDateToYMD(dateA);
  const normB = normalizeDateToYMD(dateB);
  return Boolean(normA && normB && normA === normB);
}
