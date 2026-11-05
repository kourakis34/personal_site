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

  const roleP = document.createElement('p');
  roleP.className = 'role';
  roleP.textContent = 'seeking eudaimonia!';
  introDiv.appendChild(roleP);

  const bioP = document.createElement('p');
  bioP.className = 'bio';
  bioP.innerHTML = `
    Hi, I'm <a href="#about" class="bio-link">Nick</a>, a senior at Carnegie Mellon University, studying Statistics & Machine Learning and
    an aspiring technologist.
    <br><br>
    My hours are divided between <a href="#experience" class="bio-link">building</a>, playing soccer and <a href="#books" class="bio-link">reading</a>.
    <br><br>
    Feel free to pick my brain!
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
  img.src = 'Nick Kourakis.jpg';
  img.alt = 'Photo of Nick Kourakis';
  photoFrame.appendChild(img);

  sideDiv.appendChild(photoFrame);

  // Chat console
  const chatConsole = document.createElement('div');
  chatConsole.className = 'chat-console';

  const chatLabel = document.createElement('div');
  chatLabel.className = 'cc-label';
  chatLabel.textContent = 'Ask about me';
  chatConsole.appendChild(chatLabel);

  const chatLog = document.createElement('div');
  chatLog.className = 'cc-log';

  const firstLine = document.createElement('div');
  firstLine.className = 'line';
  firstLine.innerHTML = '<span class="prompt-char">&gt;</span>What did Nick work on at L3Harris?';
  chatLog.appendChild(firstLine);

  chatConsole.appendChild(chatLog);

  const chatForm = document.createElement('form');
  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type a question…';

  const chatButton = document.createElement('button');
  chatButton.type = 'submit';
  chatButton.textContent = 'Send';

  chatForm.appendChild(chatInput);
  chatForm.appendChild(chatButton);
  chatConsole.appendChild(chatForm);

  const chatStatus = document.createElement('div');
  chatStatus.className = 'cc-status';
  chatStatus.textContent = 'Conversations may be logged';
  chatConsole.appendChild(chatStatus);

  sideDiv.appendChild(chatConsole);
  heroDiv.appendChild(sideDiv);

  main.appendChild(heroDiv);
  page.appendChild(main);

  container.appendChild(page);

  // Initialize chat
  new ChatManager();
}
