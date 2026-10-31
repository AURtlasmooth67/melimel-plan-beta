/**
 * Utilities for Dates supporting both Gregorian (A.D. / ค.ศ.) and Buddhist Era (B.E. / พ.ศ.)
 */

export function toISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(isoString: string): Date {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatThaiDate(isoString: string, useBE: boolean = true): string {
  if (!isoString) return '';
  const [y, m, d] = isoString.split('-').map(Number);
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const year = useBE ? y + 543 : y;
  return `${d} ${thaiMonthsShort[m - 1]} ${year}`;
}

export function formatThaiDateLong(isoString: string, useBE: boolean = true): string {
  if (!isoString) return '';
  const [y, m, d] = isoString.split('-').map(Number);
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const year = useBE ? y + 543 : y;
  return `${d} ${thaiMonthsFull[m - 1]} พ.ศ. ${year}`;
}

export function addDays(isoString: string, days: number): string {
  const date = parseISODate(isoString);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function isWeekend(isoString: string): boolean {
  const date = parseISODate(isoString);
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  return day === 0 || day === 6;
}

export function getDaysInRange(startIso: string, count: number, skipWeekends: boolean = false): string[] {
  const days: string[] = [];
  let current = startIso;
  while (days.length < count) {
    if (!skipWeekends || !isWeekend(current)) {
      days.push(current);
    }
    current = addDays(current, 1);
  }
  return days;
}
