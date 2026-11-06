export function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // Load saved theme
  const saved = localStorage.getItem('theme');
  if (saved) {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }
}

export function createSvgIcon(type: 'mail' | 'linkedin' | 'sun' | 'moon'): string {
  const icons: Record<string, string> = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="m3 6.5 9 6.5 9-6.5"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="2.5" width="19" height="19" rx="2"/><path d="M7.5 10v6.5M7.5 7.2v.1M12 16.5V12.8c0-1.5 1-2.6 2.5-2.6s2.5 1 2.5 2.6v3.7"/></svg>',
    sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>',
    moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>'
  };
  return icons[type] || '';
}

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'top';

  const here = location.pathname.replace(/\/+$/, '') || '/';
  const links = [
    ['/about', 'About'],
    ['/experience', 'Experience'],
    ['/projects', 'Projects'],
    ['/books', 'Books'],
  ];
  const nav = links
    .map(([href, label]) => `<a href="${href}"${here === href ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');

  header.innerHTML = `
    <div class="wrap top-row">
      <a class="wordmark" href="/" aria-label="Nick Kourakis, home"${here === '/' ? ' aria-current="page"' : ''}>nk<span>.</span></a>
      <nav class="site-nav" aria-label="Main">${nav}</nav>
      <div class="top-actions">
        <a class="icon-link" href="mailto:nicholaskourakis2004@gmail.com" aria-label="Email Nick" title="nicholaskourakis2004@gmail.com">
          ${createSvgIcon('mail')}
        </a>
        <a class="icon-link" href="https://www.linkedin.com/in/nick-kourakis/" target="_blank" rel="noopener" aria-label="Nick on LinkedIn" title="LinkedIn">
          ${createSvgIcon('linkedin')}
        </a>
        <button id="theme-toggle" aria-label="Toggle color theme">
          ${createSvgIcon('sun')}
          ${createSvgIcon('moon')}
        </button>
      </div>
    </div>
  `;

  return header;
}
