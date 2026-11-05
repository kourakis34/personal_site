import './styles.css';
import { initThemeToggle } from './utils';
import { renderHome } from './pages/home';
import { renderAbout } from './pages/about';
import { renderExperience } from './pages/experience';
import { renderProjects } from './pages/projects';
import { renderBooks } from './pages/books';
import { renderHow } from './pages/how';

const TITLES: Record<string, string> = {
  '#about': 'About · Nick Kourakis',
  '#experience': 'Experience · Nick Kourakis',
  '#projects': 'Projects · Nick Kourakis',
  '#books': 'Books · Nick Kourakis',
  '#how-it-works': 'How the chat works · Nick Kourakis',
};

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
    case '#how-it-works':
      renderHow(app);
      break;
    default:
      renderHome(app);
  }

  document.title = TITLES[hash] ?? 'Nick Kourakis · Statistics & ML at Carnegie Mellon';
  window.scrollTo(0, 0);
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
