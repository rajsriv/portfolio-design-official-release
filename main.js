import './style.css';

const windows = [...document.querySelectorAll('[data-window]')];
const taskbarApps = document.querySelector('.taskbar-apps');
const startButton = document.querySelector('#start-button');
const startMenu = document.querySelector('#start-menu');
const shutdownDialog = document.querySelector('#shutdown-dialog');

function setWindowState(panel, state) {
  panel.classList.remove('is-minimized');
  if (state === 'minimize') panel.classList.add('is-minimized');
  if (state === 'close') {
    panel.classList.add('is-minimized');
    panel.classList.remove('is-maximized');
    panel.dataset.closed = 'true';
  } else {
    delete panel.dataset.closed;
  }

  const appButton = taskbarApps.querySelector(`[data-restore="${panel.id}"]`);
  if (appButton) {
    appButton.classList.toggle('is-active', state === 'open');
    appButton.setAttribute('aria-pressed', String(state === 'open'));
  }
}

function openWindow(panel) {
  if (!panel) return;
  setWindowState(panel, 'open');
  windows.forEach((item) => item.classList.toggle('is-focused', item === panel));
}

windows.forEach((panel) => {
  const title = panel.querySelector('.titlebar h1, .titlebar h2')?.textContent.trim() ?? 'Window';
  const button = document.createElement('button');
  const initiallyOpen = panel.id === 'about';
  button.className = `taskbar-app${initiallyOpen ? ' is-active' : ''}`;
  button.type = 'button';
  button.textContent = title;
  button.title = title;
  button.dataset.restore = panel.id;
  button.setAttribute('aria-label', `Restore ${title}`);
  button.setAttribute('aria-pressed', String(initiallyOpen));
  button.addEventListener('click', () => {
    if (!panel.classList.contains('is-minimized') && !panel.dataset.closed) {
      setWindowState(panel, 'minimize');
    } else {
      openWindow(panel);
    }
  });
  taskbarApps.append(button);
  if (!initiallyOpen) setWindowState(panel, 'close');

  panel.querySelector('.minimize')?.addEventListener('click', () => setWindowState(panel, 'minimize'));
  panel.querySelector('.close')?.addEventListener('click', () => setWindowState(panel, 'close'));
  panel.querySelector('.maximize')?.addEventListener('click', () => {
    const maximize = !panel.classList.contains('is-maximized');
    openWindow(panel);
    panel.classList.toggle('is-maximized', maximize);
  });
  panel.addEventListener('pointerdown', () => {
    windows.forEach((item) => item.classList.toggle('is-focused', item === panel));
  });

  const titlebar = panel.querySelector('.titlebar');
  titlebar.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button') || panel.classList.contains('is-maximized')) return;
    event.preventDefault();
    openWindow(panel);
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = panel.getBoundingClientRect();
    const baseX = Number.parseFloat(panel.dataset.dragX ?? '0');
    const baseY = Number.parseFloat(panel.dataset.dragY ?? '0');
    titlebar.setPointerCapture(event.pointerId);

    const moveWindow = (moveEvent) => {
      const dx = Math.min(Math.max(moveEvent.clientX - startX, 8 - rect.left), window.innerWidth - rect.right - 80);
      const dy = Math.min(Math.max(moveEvent.clientY - startY, -rect.top), window.innerHeight - rect.top - 52);
      panel.dataset.dragX = String(baseX + dx);
      panel.dataset.dragY = String(baseY + dy);
      panel.style.setProperty('--drag-x', `${baseX + dx}px`);
      panel.style.setProperty('--drag-y', `${baseY + dy}px`);
    };
    const stopDragging = () => {
      titlebar.removeEventListener('pointermove', moveWindow);
      titlebar.removeEventListener('pointerup', stopDragging);
      titlebar.removeEventListener('pointercancel', stopDragging);
    };
    titlebar.addEventListener('pointermove', moveWindow);
    titlebar.addEventListener('pointerup', stopDragging, { once: true });
    titlebar.addEventListener('pointercancel', stopDragging, { once: true });
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const panel = document.querySelector(link.getAttribute('href'));
    if (panel?.matches('[data-window]')) openWindow(panel);
    startMenu.hidden = true;
    startButton.setAttribute('aria-expanded', 'false');
  });
});

startButton.addEventListener('click', () => {
  startMenu.hidden = !startMenu.hidden;
  startButton.setAttribute('aria-expanded', String(!startMenu.hidden));
});

document.addEventListener('pointerdown', (event) => {
  if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
    startMenu.hidden = true;
    startButton.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    startMenu.hidden = true;
    shutdownDialog.hidden = true;
    startButton.setAttribute('aria-expanded', 'false');
  }
});

document.querySelector('#shutdown').addEventListener('click', () => {
  startMenu.hidden = true;
  startButton.setAttribute('aria-expanded', 'false');
  shutdownDialog.hidden = false;
  shutdownDialog.querySelector('.dialog-ok').focus();
});

shutdownDialog.querySelector('.close').addEventListener('click', () => { shutdownDialog.hidden = true; });
shutdownDialog.querySelector('.dialog-ok').addEventListener('click', () => { shutdownDialog.hidden = true; });

function updateClock() {
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date());
}

updateClock();
window.setInterval(updateClock, 30_000);
