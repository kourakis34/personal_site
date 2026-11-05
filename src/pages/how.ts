import { createHeader } from '../utils';

const STEPS = [
  {
    title: 'Rate limit',
    body: 'Each visitor gets a small number of messages per minute and per day, so a script can’t run up the model bill.',
  },
  {
    title: 'Topic check',
    body: 'Typesafe’s JEV classifier scores whether the question is about me. Clearly off-topic questions get a fixed reply and never reach the language model, which keeps costs down and the bot on-task. If the classifier is unavailable, the question goes through rather than failing.',
  },
  {
    title: 'Grounded answer',
    body: 'On-topic questions go to GPT-4o mini through OpenRouter. The system prompt contains a hand-written profile of my background, and the model is told to answer only from it, never invent details, and point visitors to email for anything it doesn’t know.',
  },
  {
    title: 'Guardrails',
    body: 'The prompt also lists topics the bot declines, such as GPA, salary, security clearance, recruiting status and anything about other people.',
  },
];

const STACK = [
  ['Frontend', 'TypeScript and Vite, hosted on GitHub Pages'],
  ['Backend', 'Python and FastAPI on Render'],
  ['Topic classifier', 'Typesafe JEV'],
  ['Language model', 'GPT-4o mini via OpenRouter'],
  ['Logging', 'Supabase (Postgres)'],
];

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
      <a href="#" class="xp-back">← Back</a>
      <header class="xp-hero">
        <p class="xp-eyebrow">How the chat works</p>
        <h1>A small, grounded assistant that only talks about me.</h1>
        <p class="xp-lede">The “Ask about me” box on the home page is a real LLM app. Here’s what happens when you send a question.</p>
      </header>

      <ol class="how-steps">
        ${STEPS.map(
          (s, i) => `
          <li>
            <span class="how-num" aria-hidden="true">${i + 1}</span>
            <div>
              <h2>${s.title}</h2>
              <p>${s.body}</p>
            </div>
          </li>`,
        ).join('')}
      </ol>

      <section class="how-section">
        <h2>Why no retrieval?</h2>
        <p>My profile is short enough to fit in the prompt, so a vector database would add moving parts without improving answers. If the profile grows, retrieval over it is the natural next step.</p>
      </section>

      <section class="how-section">
        <h2>Stack</h2>
        <dl class="how-stack">
          ${STACK.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
        </dl>
      </section>

      <section class="how-section">
        <h2>Privacy</h2>
        <p>Your browser gets a random chat ID; no account or name is attached. Questions and answers may be logged to improve the bot.</p>
      </section>
    </div>
  `;

  page.appendChild(main);
  container.appendChild(page);
}
