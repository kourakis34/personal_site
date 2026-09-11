import './styles.css';
import { initThemeToggle } from './utils';
import { renderHome } from './pages/home';
import { renderAbout } from './pages/about';
import { renderExperience } from './pages/experience';
import { renderProjects } from './pages/projects';
import { renderBooks } from './pages/books';

function navigateTo(hash: string) {
  const app = document.getElementById('app');
  if (!app) return;

  switch (hash) {
    case '#about':
      renderAbout(app);
      break;
    case '#experience':
      renderExperience(app);
      break;
    case '#projects':
      renderProjects(app);
      break;
    case '#books':
      renderBooks(app);
      break;
    default:
      renderHome(app);
  }

  initThemeToggle();
}

function initializeApp() {
  const hash = window.location.hash || '#';
  navigateTo(hash);
}

document.addEventListener('DOMContentLoaded', initializeApp);

// Handle hash-based routing
window.addEventListener('hashchange', () => {
  navigateTo(window.location.hash);
});
