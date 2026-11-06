import { createHeader } from '../utils';

export function renderHow(container: HTMLElement) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page';
  page.style.overflow = 'auto';
  page.appendChild(createHeader());

  const main = document.createElement('main');
  main.className = 'xp-main';
  main.innerHTML = `
    <div class="wrap">
      <h1 class="xp-title">How the chat works</h1>
      <div class="prose">
      <p>The chat on the home page answers questions about me. It runs on a small Python (FastAPI) backend hosted on Render.</p>
      <p>When you send a message, a classifier (Typesafe's JEV) first checks whether it's about me. If it isn't, you get a short reply and the message never reaches the language model. If it is, it goes to GPT-4o mini through OpenRouter, along with a profile I wrote about my background. The model is told to answer only from that profile and to say so when it doesn't know something.</p>
      <p>There's a limit on how many messages one visitor can send, and a few topics, like salary or GPA, are off-limits. Conversations are saved so I can see what people ask. No names or accounts are attached.</p>
      </div>
    </div>
  `;

  page.appendChild(main);
  container.appendChild(page);
}
