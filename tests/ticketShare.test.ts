import { describe, it, expect } from 'vitest';
import { formatTicketShareText, encodeTicketData, decodeTicketData } from '../src/features/tickets/ticketShare';
import { Ticket } from '../src/core/store';

describe('Ticket Share and Chat Formatting', () => {
  it('formats ticket text with human-readable summary and CCP-T code', () => {
    const mockTicket: Ticket = {
      id: 't-test-1',
      title: 'มิกซ์เสียงเพลง Vampire',
      desc: 'ขอด่วนภายในศุกร์นี้',
      assignees: ['โบ'],
      priority: 1, // ด่วน
      dueDate: '2026-10-16',
      status: 1, // กำลังทำ
      updatedAt: '2026-10-12T00:00:00.000Z'
    };

    const text = formatTicketShareText(mockTicket);
    expect(text).toContain('🎟️ ตั๋วงาน: มิกซ์เสียงเพลง Vampire');
    expect(text).toContain('👤 มอบหมาย: โบ');
    expect(text).toContain('ความสำคัญ: ด่วน');
    expect(text).toContain('CCP-T:');

    // Test encode / decode roundtrip
    const encoded = encodeTicketData(mockTicket);
    const decoded = decodeTicketData(encoded);
    expect(decoded.title).toBe(mockTicket.title);
    expect(decoded.priority).toBe(mockTicket.priority);
  });
});
