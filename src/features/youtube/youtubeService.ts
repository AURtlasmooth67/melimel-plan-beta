/**
 * YouTube API v3 Integration Service (Safe Domain / Admin Managed)
 */
import { getState, setState, logActivity } from '../../core/store';
import { showToast } from '../../ui/toast';

export function extractYouTubeId(url: string): string | null {
  const match = String(url || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export async function refreshYouTubeStats(): Promise<number> {
  const state = getState();
  if (!state.ytKey) {
    showToast('กรุณาระบุ YouTube API Key ในแผงแอดมินก่อน', 'warn');
    return 0;
  }

  const videoMap: Record<string, string[]> = {};
  state.songs.forEach(song => {
    // Songs may have youtube link in notes or tags
    const ytId = extractYouTubeId(song.notes || '') || extractYouTubeId((song.tags || []).join(' '));
    if (ytId) {
      if (!videoMap[ytId]) videoMap[ytId] = [];
      videoMap[ytId].push(song.id);
    }
  });

  const ids = Object.keys(videoMap);
  if (ids.length === 0) {
    showToast('ยังไม่มีเพลงที่ใส่ลิงก์ YouTube (ระบุลิงก์ในโน้ตเพลงได้)', 'info');
    return 0;
  }

  let updatedCount = 0;
  const currentViews = { ...state.ytViews };

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids.slice(0, 50).join(',')}&key=${encodeURIComponent(state.ytKey)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    (data.items || []).forEach((item: any) => {
      const stats = {
        views: parseInt(item.statistics.viewCount) || 0,
        likes: parseInt(item.statistics.likeCount) || 0,
        comments: parseInt(item.statistics.commentCount) || 0,
        updatedAt: Date.now()
      };

      const sids = videoMap[item.id] || [];
      sids.forEach(sid => {
        currentViews[sid] = stats;
        updatedCount++;
      });
    });

    setState({ ytViews: currentViews });
    logActivity('INFO', `อัปเดตยอดวิว YouTube สำเร็จ ${updatedCount} เพลง`);
    showToast(`อัปเดตยอดวิว YouTube สำเร็จ ${updatedCount} เพลง`, 'success');
    return updatedCount;
  } catch (err: any) {
    logActivity('ERROR', `YouTube API Error: ${err.message}`);
    showToast(`เกิดข้อผิดพลาดในการดึง YouTube: ${err.message}`, 'error');
    return 0;
  }
}
