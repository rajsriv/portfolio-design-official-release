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
  panel.classList.remove('is-maximized');
  windows.forEach((item) => item.classList.toggle('is-focused', item === panel));
}

windows.forEach((panel) => {
  const title = panel.querySelector('.titlebar h1, .titlebar h2')?.textContent.trim() ?? 'Window';
  const button = document.createElement('button');
  button.className = 'taskbar-app is-active';
  button.type = 'button';
  button.textContent = title;
  button.title = title;
  button.dataset.restore = panel.id;
  button.setAttribute('aria-label', `Restore ${title}`);
  button.setAttribute('aria-pressed', 'true');
  button.addEventListener('click', () => {
    if (!panel.classList.contains('is-minimized') && !panel.dataset.closed) {
      setWindowState(panel, 'minimize');
    } else {
      openWindow(panel);
    }
  });
  taskbarApps.append(button);

  panel.querySelector('.minimize')?.addEventListener('click', () => setWindowState(panel, 'minimize'));
  panel.querySelector('.close')?.addEventListener('click', () => setWindowState(panel, 'close'));
  panel.querySelector('.maximize')?.addEventListener('click', () => {
    panel.classList.toggle('is-maximized');
    openWindow(panel);
  });
  panel.addEventListener('pointerdown', () => {
    windows.forEach((item) => item.classList.toggle('is-focused', item === panel));
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
