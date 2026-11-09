import type { City } from './globe';

// Same list as globe.ts, kept here so the city list renders before the globe code loads
const NAMES: Pick<City, 'name' | 'country'>[] = [
  { name: 'São Paulo', country: 'Brazil' },
  { name: 'Brasília', country: 'Brazil' },
  { name: 'Washington, DC', country: 'United States' },
  { name: 'Vero Beach', country: 'United States' },
  { name: 'Panama City', country: 'Panama' },
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Guantánamo Bay', country: 'Cuba' },
  { name: 'Pittsburgh', country: 'United States' },
];

export function setupPlaces(page: HTMLElement) {
  const canvas = page.querySelector<HTMLCanvasElement>('.places-globe canvas');
  const list = page.querySelector<HTMLUListElement>('.places-list');
  if (!canvas || !list) return;

  list.innerHTML = NAMES.map(
    (c, i) =>
      `<li><button type="button" data-i="${i}"><span class="places-city">${c.name}</span><span class="places-country">${c.country}</span></button></li>`,
  ).join('');
  const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('button'));

  const mark = (i: number | null) =>
    buttons.forEach((b, j) => b.classList.toggle('is-active', j === i));

  let destroyed = false;
  let api: Awaited<ReturnType<typeof import('./globe').createGlobe>> | null = null;

  import('./globe')
    .then(({ createGlobe }) => createGlobe(canvas, mark))
    .then((g) => {
      if (destroyed) return g.destroy();
      api = g;
      canvas.parentElement?.classList.add('is-ready');
    })
    .catch(() => canvas.parentElement?.classList.add('is-failed'));

  buttons.forEach((b, i) => {
    b.addEventListener('click', () => {
      api?.focus(i);
      mark(i);
    });
    b.addEventListener('mouseenter', () => api?.highlight(i));
    b.addEventListener('mouseleave', () => api?.highlight(null));
    b.addEventListener('focus', () => api?.focus(i));
  });

  window.addEventListener(
    'routechange',
    () => {
      destroyed = true;
      api?.destroy();
    },
    { once: true },
  );
}
