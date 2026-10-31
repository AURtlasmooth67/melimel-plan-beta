/**
 * Ticket Sharing and Chat Formatting Utilities
 */
import { Ticket } from '../../core/store';

export const PRIORITY_LABELS = ['ปกติ', 'ด่วน', 'ด่วนมาก'] as const;
export const STATUS_LABELS = ['รอรับงาน', 'กำลังทำ', 'รอตรวจ', 'เสร็จแล้ว'] as const;

export function encodeTicketData(data: Ticket): string {
  const jsonStr = JSON.stringify(data);
  const utf8Bytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
  return btoa(utf8Bytes);
}

export function decodeTicketData(base64Str: string): Ticket {
  const rawBytes = atob(base64Str.trim());
  const jsonStr = decodeURIComponent(rawBytes.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  return JSON.parse(jsonStr);
}

export function formatTicketShareText(ticket: Ticket): string {
  const names = ticket.assignees && ticket.assignees.length ? ticket.assignees.join(', ') : 'ไม่ได้ระบุ';
  const code = 'CCP-T:' + encodeTicketData(ticket);

  return `🎟️ ตั๋วงาน: ${ticket.title}
👤 มอบหมาย: ${names} | ความสำคัญ: ${PRIORITY_LABELS[ticket.priority] || 'ปกติ'}
📅 กำหนดส่ง: ${ticket.dueDate || 'ไม่ระบุ'} | สถานะ: ${STATUS_LABELS[ticket.status] || 'รอรับงาน'}
📝 รายละเอียด: ${ticket.desc || '—'}
------------------------------------
${code}`;
}
