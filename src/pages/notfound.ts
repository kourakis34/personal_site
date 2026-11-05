import { createHeader } from '../utils';

export function renderNotFound(container: HTMLElement) {
  container.innerHTML = '';
  const page = document.createElement('div');
  page.className = 'page';
  page.style.overflow = 'auto';
  page.appendChild(createHeader());
  const main = document.createElement('main');
  main.className = 'xp-main';
  main.innerHTML = `
    <div class="wrap">
      <h1 class="xp-title">Page not found</h1>
      <p class="page-lede">That page doesn't exist. <a class="text-link" href="/">Go to the home page</a>.</p>
    </div>`;
  page.appendChild(main);
  container.appendChild(page);
}
