import './styles.css';
import routes from './routes.json';
import { initThemeToggle } from './utils';
import { renderHome } from './pages/home';
import { renderAbout } from './pages/about';
import { renderExperience } from './pages/experience';
import { renderProjects } from './pages/projects';
import { renderBooks } from './pages/books';
import { renderHow } from './pages/how';
import { renderNotFound } from './pages/notfound';

const SITE = 'https://nickkourakis.com';

const RENDERERS: Record<string, (app: HTMLElement) => void> = {
  '/': renderHome,
  '/about': renderAbout,
  '/experience': renderExperience,
  '/projects': renderProjects,
  '/books': renderBooks,
  '/how-it-works': renderHow,
};

function normalize(path: string): string {
  const p = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return p.length > 1 ? p.replace(/\/+$/, '') : '/';
}

function setMeta(path: string) {
  const route = routes.find((r) => r.path === path);
  const title = route?.title ?? 'Page not found · Nick Kourakis';
  document.title = title;
  if (!route) return;
  const url = SITE + (path === '/' ? '/' : path);
  document.querySelector('meta[name="description"]')?.setAttribute('content', route.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
}

function render(path: string) {
  const app = document.getElementById('app');
  if (!app) return;
  // Let pages clean up listeners from the previous page.
  window.dispatchEvent(new Event('routechange'));
  (RENDERERS[path] ?? renderNotFound)(app);
  setMeta(path);
  window.scrollTo(0, 0);
  initThemeToggle();
}

export function navigate(to: string) {
  const path = normalize(to);
  if (path !== normalize(location.pathname)) history.pushState(null, '', path);
  render(path);
}

// Intercept clicks on internal links so pages switch without a full reload.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.('a');
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  const href = a.getAttribute('href');
  if (!href || !href.startsWith('/') || href.startsWith('//')) return;
  e.preventDefault();
  navigate(href);
});

window.addEventListener('popstate', () => render(normalize(location.pathname)));

function start() {
  // Old links used #about, #experience, ...; send them to the real URLs.
  const legacy = location.hash.replace(/^#\/?/, '');
  if (legacy && RENDERERS['/' + legacy]) {
    history.replaceState(null, '', '/' + legacy);
  }
  render(normalize(location.pathname));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
