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
    "What are Nick's best projects?",
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
    <a class="cc-how" href="#how-it-works">How does this work?</a>
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
}
