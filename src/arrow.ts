// Hand-drawn arrow from "Feel free to pick my brain!" to the chat box.
//
// The arrow is measured and drawn at runtime so it lands on the chat box at any
// window size. Design rules that keep it from breaking:
//  - It stays hidden until fonts are loaded and the intro animation has finished,
//    so it is never drawn from a half-loaded layout.
//  - The draw-on effect uses the path's real measured length (no pathLength /
//    CSS dash tricks that some browsers render as dotted lines), and leaves no
//    dash styles behind once it finishes.
//  - If the layout can't fit a sensible arrow, it is hidden rather than drawn wrong.
//  - It hides while the chat is open and re-measures on resize.

const PAD = 48; // room above/below the curve inside the SVG

export function setupBrainArrow(page: HTMLElement) {
  const line = page.querySelector<HTMLElement>('.brain-line');
  const svg = page.querySelector<SVGSVGElement>('.brain-arrow');
  const chat = page.querySelector<HTMLElement>('.chat-console');
  const bio = page.querySelector<HTMLElement>('.bio');
  if (!line || !svg || !chat) return;
  const body = svg.querySelector<SVGPathElement>('.brain-arrow-path');
  const head = svg.querySelector<SVGPathElement>('.brain-arrow-head');
  if (!body || !head) return;

  let ready = false;
  let animated = false;

  const hide = () => svg.classList.remove('is-ready');

  const draw = (): boolean => {
    if (!svg.isConnected) return false;
    if (getComputedStyle(svg).display === 'none') return false; // stacked/mobile layout
    if (chat.classList.contains('expanded')) return false; // chat open: leave as is (it's faded out)

    const l = line.getBoundingClientRect();
    const c = chat.getBoundingClientRect();
    const sx = l.right + 12;
    const sy = l.top + l.height * 0.6;
    const ex = c.left - 10;
    const ey = c.top + Math.min(24, c.height / 2);
    const w = ex - sx;
    const h = ey - sy;

    // Not enough room for a believable arrow: hide instead of drawing something odd.
    if (w < 90 || h < -60 || h > 700) {
      hide();
      return false;
    }

    const minY = Math.min(0, h) - PAD;
    const height = Math.abs(h) + PAD * 2;
    svg.style.left = `${sx - l.left}px`;
    svg.style.top = `${sy - l.top + minY}px`;
    svg.style.width = `${w + 16}px`;
    svg.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 ${minY} ${w + 16} ${height}`);

    // One relaxed swoosh: leaves the text heading right and slightly up, then
    // bows down and arrives at the box at a gentle downward angle.
    const lift = Math.min(34, 14 + Math.abs(h) * 0.12);
    const c1x = w * 0.42;
    const c1y = -lift;
    const c2x = w - Math.min(110, w * 0.3);
    const c2y = h - Math.min(18, Math.max(6, Math.abs(h) * 0.12));
    body.setAttribute('d', `M0 0 C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${w.toFixed(1)} ${h.toFixed(1)}`);

    // Arrowhead follows the curve's final direction; barbs slightly uneven like a pen stroke.
    const ang = Math.atan2(h - c2y, w - c2x);
    const barb = (len: number, spread: number) =>
      `${(w - len * Math.cos(ang - spread)).toFixed(1)} ${(h - len * Math.sin(ang - spread)).toFixed(1)}`;
    head.setAttribute('d', `M${barb(12, 0.48)} L${w.toFixed(1)} ${h.toFixed(1)} L${barb(10, -0.42)}`);

    if (ready) svg.classList.add('is-ready');
    return true;
  };

  const animateIn = () => {
    if (animated) return;
    animated = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof body.animate !== 'function' || typeof body.getTotalLength !== 'function') return;
    const len = Math.ceil(body.getTotalLength()) + 2;
    body.animate(
      [
        { strokeDasharray: `${len} ${len}`, strokeDashoffset: `${len}` },
        { strokeDasharray: `${len} ${len}`, strokeDashoffset: '0' },
      ],
      { duration: 850, easing: 'cubic-bezier(.3,.6,.4,1)' },
    );
    head.animate([{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], { duration: 1050 });
  };

  // Wait for fonts and the intro "rise" animation so the text is in its final place.
  const introDone = Promise.all(
    (bio?.getAnimations?.() ?? []).map((a) => a.finished.catch(() => undefined)),
  );
  const timeout = new Promise((r) => window.setTimeout(r, 1800));
  const fontsDone = document.fonts?.ready ?? Promise.resolve();

  Promise.race([Promise.all([introDone, fontsDone]), timeout]).then(() => {
    if (!svg.isConnected) return;
    ready = true;
    if (draw()) animateIn();
  });

  const onResize = () => {
    if (ready) draw();
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(page);
  window.addEventListener('resize', onResize);
  // When the chat closes, its box animates back to size. Keep the arrow hidden
  // until that finishes, then measure; measuring mid-animation points it at
  // empty space.
  let settleTimer = 0;
  const settle = () => {
    window.clearTimeout(settleTimer);
    chat.removeEventListener('transitionend', settle);
    if (!chat.classList.contains('expanded')) {
      draw();
      svg.classList.remove('is-waiting');
    }
  };
  const mo = new MutationObserver(() => {
    if (!ready) return;
    if (chat.classList.contains('expanded')) {
      svg.classList.add('is-waiting');
      return;
    }
    svg.classList.add('is-waiting');
    chat.addEventListener('transitionend', settle);
    settleTimer = window.setTimeout(settle, 600); // fallback if no transition fires
  });
  mo.observe(chat, { attributes: true, attributeFilter: ['class'] });
  // Late font swaps can shift the text slightly.
  document.fonts?.addEventListener?.('loadingdone', onResize);

  window.addEventListener(
    'routechange',
    () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', onResize);
      document.fonts?.removeEventListener?.('loadingdone', onResize);
    },
    { once: true },
  );
}
