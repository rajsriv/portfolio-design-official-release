import './style.css';

const windows = [...document.querySelectorAll('[data-window]')];
const taskbarApps = document.querySelector('.taskbar-apps');
const startButton = document.querySelector('#start-button');
const startMenu = document.querySelector('#start-menu');
const shutdownDialog = document.querySelector('#shutdown-dialog');
const desktop = document.querySelector('.desktop');
const contextMenu = document.querySelector('#desktop-context-menu');
const wallpaperName = document.querySelector('#wallpaper-name');
const wallpapers = [
  { id: 'teal', name: 'Windows 95 Teal' },
  { id: 'clouds', name: 'Windows 95 Clouds' },
  { id: 'win95-logo', name: 'Windows 95' },
  { id: 'win98', name: 'More Windows 98' },
];

let wallpaperIndex = 0;
try {
  const savedWallpaper = localStorage.getItem('portfolio-wallpaper');
  const savedIndex = wallpapers.findIndex((wallpaper) => wallpaper.id === savedWallpaper);
  if (savedIndex >= 0) wallpaperIndex = savedIndex;
} catch { /* Keep the default wallpaper when storage is unavailable. */ }

function applyWallpaper() {
  const wallpaper = wallpapers[wallpaperIndex];
  desktop.dataset.wallpaper = wallpaper.id;
  wallpaperName.textContent = wallpaper.name;
  try { localStorage.setItem('portfolio-wallpaper', wallpaper.id); } catch { /* Wallpaper still changes for this visit. */ }
}

function closeContextMenu() {
  contextMenu.hidden = true;
}

function showContextMenu(x, y) {
  startMenu.hidden = true;
  startButton.setAttribute('aria-expanded', 'false');
  contextMenu.hidden = false;
  const bounds = contextMenu.getBoundingClientRect();
  contextMenu.style.left = `${Math.max(4, Math.min(x, window.innerWidth - bounds.width - 4))}px`;
  contextMenu.style.top = `${Math.max(4, Math.min(y, window.innerHeight - bounds.height - 48))}px`;
  contextMenu.querySelector('#next-wallpaper').focus();
}

desktop.addEventListener('contextmenu', (event) => {
  if (event.target.closest('.window, .taskbar, .start-menu, .shutdown-dialog, .desktop-icon')) return;
  event.preventDefault();
  showContextMenu(event.clientX, event.clientY);
});

desktop.addEventListener('keydown', (event) => {
  if ((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu') {
    event.preventDefault();
    showContextMenu(12, Math.min(event.target.getBoundingClientRect().bottom, window.innerHeight - 140));
  }
});

contextMenu.querySelector('#next-wallpaper').addEventListener('click', () => {
  wallpaperIndex = (wallpaperIndex + 1) % wallpapers.length;
  applyWallpaper();
  closeContextMenu();
});

applyWallpaper();

function setWindowState(panel, state) {
  panel.classList.remove('is-minimized');
  if (state === 'minimize') panel.classList.add('is-minimized');
  if (state === 'close') {
    panel.classList.add('is-minimized');
    panel.classList.remove('is-maximized');
    panel.dataset.closed = 'true';
    const maximizeControl = panel.querySelector('.maximize');
    const title = panel.querySelector('.titlebar h1, .titlebar h2')?.textContent.trim() ?? 'Window';
    maximizeControl.textContent = '□';
    maximizeControl.setAttribute('aria-label', `Maximize ${title} window`);
    maximizeControl.setAttribute('aria-pressed', 'false');
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

function toggleMaximize(panel) {
  const maximize = !panel.classList.contains('is-maximized');
  openWindow(panel);
  panel.classList.toggle('is-maximized', maximize);
  const control = panel.querySelector('.maximize');
  const title = panel.querySelector('.titlebar h1, .titlebar h2')?.textContent.trim() ?? 'Window';
  control.textContent = maximize ? '❐' : '□';
  control.setAttribute('aria-label', `${maximize ? 'Restore' : 'Maximize'} ${title} window`);
  control.setAttribute('aria-pressed', String(maximize));
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
  const maximizeControl = panel.querySelector('.maximize');
  maximizeControl.setAttribute('aria-pressed', 'false');
  maximizeControl.addEventListener('click', () => toggleMaximize(panel));
  panel.addEventListener('pointerdown', () => {
    windows.forEach((item) => item.classList.toggle('is-focused', item === panel));
  });

  const titlebar = panel.querySelector('.titlebar');
  titlebar.addEventListener('dblclick', (event) => {
    if (!event.target.closest('.window-control')) toggleMaximize(panel);
  });
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
  if (!contextMenu.hidden && !contextMenu.contains(event.target)) closeContextMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    startMenu.hidden = true;
    closeContextMenu();
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
