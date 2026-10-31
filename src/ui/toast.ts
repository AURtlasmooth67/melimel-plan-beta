/**
 * Accessible Toast Notifications & UI Utilities
 */
export function showToast(message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info'): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';

  let icon = '✨';
  if (type === 'success') icon = '✅';
  if (type === 'warn') icon = '⚠️';
  if (type === 'error') icon = '❌';

  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  iconSpan.setAttribute('aria-hidden', 'true');

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }, 3200);
}
