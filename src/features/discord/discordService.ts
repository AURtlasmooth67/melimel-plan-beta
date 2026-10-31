/**
 * Discord Webhook Notification Service
 */
import { getState, logActivity } from '../../core/store';
import { toISODate, formatThaiDate } from '../../core/dates';
import { showToast } from '../../ui/toast';

export async function sendDiscordNotification(embeds: any[], tag: string): Promise<boolean> {
  const state = getState();
  if (!state.discordWebhook) {
    showToast('กรุณาระบุ Discord Webhook URL ในแผงแอดมินก่อน', 'warn');
    return false;
  }

  try {
    const res = await fetch(state.discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'MELiMEL FRUITY♡ Planner',
        embeds
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    logActivity('INFO', `ส่งแจ้งเตือน Discord: ${tag} สำเร็จ`);
    showToast(`ส่งแจ้งเตือนเข้า Discord (${tag}) สำเร็จ!`, 'success');
    return true;
  } catch (err: any) {
    logActivity('ERROR', `Discord Error: ${err.message}`);
    showToast(`ส่ง Discord ไม่สำเร็จ: ${err.message}`, 'error');
    return false;
  }
}

export async function sendDiscordTodaySchedule(): Promise<boolean> {
  const state = getState();
  const today = toISODate();
  const todaySongIds = state.calendar[today] || [];
  const songs = state.songs.filter(s => todaySongIds.includes(s.id));

  const embed = {
    title: '✅ เช็คงานวันนี้ของทีม MELiMEL FRUITY♡',
    description: `📆 วันที่: ${formatThaiDate(today, true)}`,
    color: 0xff5c8a,
    fields: state.members.map(m => {
      const memberSongs = songs.filter(s => s.singers.includes(m.name));
      return {
        name: `👤 ${m.name}`,
        value: memberSongs.length > 0 ? memberSongs.map(s => `• **${s.title}** (${s.kind})`).join('\n') : '_วันนี้ไม่มีคิวงาน_'
      };
    }),
    footer: { text: 'MELiMEL FRUITY♡ Content Planner BETA' },
    timestamp: new Date().toISOString()
  };

  return sendDiscordNotification([embed], 'เช็คงานวันนี้');
}
