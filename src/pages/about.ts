import { createHeader } from '../utils';

export function renderAbout(container: HTMLElement) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page';
  page.style.overflow = 'auto';

  // Header
  page.appendChild(createHeader());

  // Main content
  const main = document.createElement('main');
  main.style.padding = '3rem 0';
  main.style.flex = '1';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const backLink = document.createElement('a');
  backLink.href = '#';
  backLink.className = 'back-link';
  backLink.style.display = 'inline-block';
  backLink.style.marginBottom = '2rem';
  backLink.style.color = 'var(--accent)';
  backLink.style.fontSize = '0.95rem';
  backLink.style.transition = 'opacity 0.2s ease';
  backLink.textContent = '← Back';
  backLink.addEventListener('mouseenter', (e) => {
    (e.target as HTMLElement).style.opacity = '0.7';
  });
  backLink.addEventListener('mouseleave', (e) => {
    (e.target as HTMLElement).style.opacity = '1';
  });
  wrap.appendChild(backLink);

  const h1 = document.createElement('h1');
  h1.style.fontFamily = 'var(--font-display)';
  h1.style.fontWeight = '500';
  h1.style.fontSize = 'clamp(2rem, 3vw, 2.8rem)';
  h1.style.lineHeight = '1.2';
  h1.style.marginBottom = '2rem';
  h1.textContent = 'About';
  wrap.appendChild(h1);

  const content = document.createElement('div');
  content.innerHTML = `
    <p style="max-width: 65ch; margin-bottom: 1rem; color: var(--text-muted);">
      Add your about section here. Tell visitors about yourself, your background, and what drives you.
    </p>
  `;
  wrap.appendChild(content);

  main.appendChild(wrap);
  page.appendChild(main);

  container.appendChild(page);
}
