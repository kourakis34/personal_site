import { createHeader } from '../utils';
import { ChatManager } from '../chat';

export function renderHome(container: HTMLElement) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page';

  // Header
  page.appendChild(createHeader());

  // Main hero section
  const main = document.createElement('main');
  main.className = 'hero-wrap';

  const heroDiv = document.createElement('div');
  heroDiv.className = 'hero';

  // Intro section
  const introDiv = document.createElement('div');
  introDiv.className = 'intro';

  const h1 = document.createElement('h1');
  h1.textContent = 'Nick Kourakis';
  introDiv.appendChild(h1);

  const bioP = document.createElement('p');
  bioP.className = 'bio';
  bioP.innerHTML = `
    Hi, I'm <a href="#about" class="bio-link">Nick</a>, a senior at Carnegie Mellon University, studying Statistics & Machine Learning and
    an aspiring technologist.
    <br><br>
    My hours are divided between <a href="#experience" class="bio-link">building</a>, playing soccer and <a href="#books" class="bio-link">reading</a>.
    <br><br>
    <span class="brain-line">Feel free to pick my brain!<svg class="brain-arrow" viewBox="0 0 120 70" aria-hidden="true" focusable="false">
      <path class="brain-arrow-path" pathLength="1" d="M4 18 C 24 4, 44 2, 50 16 C 56 30, 38 38, 35 26 C 32 12, 62 4, 82 16 C 98 26, 106 40, 110 58" />
      <path class="brain-arrow-head" pathLength="1" d="M99 51 L110 59 L115 46" />
    </svg></span>
  `;
  bioP.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = link.href.split('#')[1];
    });
  });
  introDiv.appendChild(bioP);
  heroDiv.appendChild(introDiv);

  // Side section with photo and chat
  const sideDiv = document.createElement('div');
  sideDiv.className = 'side';

  const photoFrame = document.createElement('div');
  photoFrame.className = 'photo-frame';

  const img = document.createElement('img');
  img.src = import.meta.env.BASE_URL + 'Nick%20Kourakis.jpg';
  img.alt = 'Photo of Nick Kourakis';
  photoFrame.appendChild(img);

  sideDiv.appendChild(photoFrame);

  // Chat console
  const chatConsole = document.createElement('div');
  chatConsole.className = 'chat-console';

  const chatLabel = document.createElement('button');
  chatLabel.type = 'button';
  chatLabel.className = 'cc-label';
  chatLabel.textContent = 'Ask about me';
  chatLabel.setAttribute('aria-expanded', 'false');
  chatLabel.setAttribute('aria-controls', 'cc-panel');
  chatConsole.appendChild(chatLabel);

  const chatPanel = document.createElement('div');
  chatPanel.id = 'cc-panel';
  chatPanel.className = 'cc-panel';

  const chatLog = document.createElement('div');
  chatLog.className = 'cc-log';
  chatLog.setAttribute('role', 'log');
  chatLog.setAttribute('aria-live', 'polite');
  chatLog.setAttribute('aria-label', 'Chat about Nick');

  const suggestions = document.createElement('div');
  suggestions.className = 'cc-suggestions';
  suggestions.setAttribute('aria-label', 'Suggested questions');
  [
    'What did Nick work on at L3Harris?',
    'What roles is Nick looking for?',
    "What's Nick's favorite project?",
  ].forEach((q) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'cc-chip';
    chip.textContent = q;
    suggestions.appendChild(chip);
  });
  chatLog.appendChild(suggestions);

  chatPanel.appendChild(chatLog);

  const chatForm = document.createElement('form');
  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type a question…';
  chatInput.setAttribute('aria-label', 'Ask a question about Nick');
  chatInput.maxLength = 500;

  const chatButton = document.createElement('button');
  chatButton.type = 'submit';
  chatButton.textContent = 'Send';

  chatForm.appendChild(chatInput);
  chatForm.appendChild(chatButton);
  chatPanel.appendChild(chatForm);

  const chatFooter = document.createElement('div');
  chatFooter.className = 'cc-footer';
  chatFooter.innerHTML = `
    <span class="cc-status" aria-live="polite">Ready to chat</span>
    <span class="cc-links">
      <button type="button" class="cc-clear" hidden>Clear chat</button>
      <a class="cc-how" href="#how-it-works">How does this work?</a>
    </span>
  `;
  chatPanel.appendChild(chatFooter);

  chatConsole.appendChild(chatPanel);

  sideDiv.appendChild(chatConsole);
  heroDiv.appendChild(sideDiv);

  main.appendChild(heroDiv);
  page.appendChild(main);

  container.appendChild(page);

  // Initialize chat
  new ChatManager();
  setupBrainArrow(page);
}

// Draw the hand-drawn arrow from "pick my brain" to the chat box's left edge.
// It's measured at runtime so it lands on the box at any screen width.
function setupBrainArrow(page: HTMLElement) {
  const line = page.querySelector<HTMLElement>('.brain-line');
  const svg = page.querySelector<SVGSVGElement>('.brain-arrow');
  const chat = page.querySelector<HTMLElement>('.chat-console');
  if (!line || !svg || !chat) return;
  const body = svg.querySelector<SVGPathElement>('.brain-arrow-path');
  const head = svg.querySelector<SVGPathElement>('.brain-arrow-head');
  if (!body || !head) return;

  const draw = () => {
    if (!svg.isConnected) return;
    if (getComputedStyle(svg).display === 'none') return;
    if (chat.classList.contains('expanded')) return;
    const l = line.getBoundingClientRect();
    const c = chat.getBoundingClientRect();
    // Start just after the text; end a little before the chat box, at the top of its label row.
    const sx = l.right + 10;
    const sy = l.top + l.height * 0.55;
    const ex = c.left - 12;
    const ey = c.top + Math.min(28, c.height / 2);
    const w = Math.max(60, ex - sx);
    const h = ey - sy;
    const pad = 40;

    svg.style.left = `${sx - l.left}px`;
    svg.style.top = `${sy - l.top - pad}px`;
    svg.style.width = `${w + 4}px`;
    svg.style.height = `${Math.abs(h) + pad * 2}px`;
    svg.setAttribute('viewBox', `0 ${-pad} ${w + 4} ${Math.abs(h) + pad * 2}`);

    // Hand-drawn feel: a short rise, one relaxed loop, then a lazy arc that
    // drops onto the chat box. The loop uses fixed pixel sizes so it looks the
    // same at any width; only the final arc stretches.
    const y = (v: number) => (h >= 0 ? v : -v);
    const L = Math.min(70, w * 0.22); // where the loop sits
    const c1x = L + 70;
    const c2x = w - Math.min(90, w * 0.3);
    const c2y = h - y(34);
    body.setAttribute(
      'd',
      `M0 0 C 16 ${y(-14)}, ${L - 22} ${y(-22)}, ${L} ${y(-8)} ` +
        `C ${L + 12} ${y(1)}, ${L + 6} ${y(18)}, ${L - 8} ${y(14)} ` +
        `C ${L - 22} ${y(10)}, ${L - 14} ${y(-12)}, ${L + 10} ${y(-12)} ` +
        `C ${c1x} ${y(-12)}, ${c2x} ${c2y}, ${w} ${h}`,
    );

    // Arrowhead follows the curve's final direction, with slightly uneven barbs.
    const ang = Math.atan2(h - c2y, w - c2x);
    const barb = (len: number, spread: number) =>
      `${(w - len * Math.cos(ang - spread)).toFixed(1)} ${(h - len * Math.sin(ang - spread)).toFixed(1)}`;
    head.setAttribute('d', `M${barb(13, 0.5)} L${w} ${h} L${barb(11, -0.45)}`);
  };

  draw();
  // Re-measure after the intro animation settles and on resize (not when the chat opens).
  window.setTimeout(draw, 900);
  document.fonts?.ready.then(draw).catch(() => {});
  const ro = new ResizeObserver(draw);
  ro.observe(page);
  // If the window changed size while the chat was open, catch up once it closes.
  new MutationObserver(() => {
    if (!chat.classList.contains('expanded')) draw();
  }).observe(chat, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', draw);
  window.addEventListener('hashchange', () => {
    ro.disconnect();
    window.removeEventListener('resize', draw);
  }, { once: true });
}
