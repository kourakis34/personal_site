import { createHeader } from '../utils';

interface Project {
  name: string;
  context: string;
  date?: string;
  bullets: string[];
  stack: string[];
}

const PROJECTS: Project[] = [
  {
    name: 'Wikipedia edit survival',
    context: 'Carnegie Mellon Statistics Capstone, team project',
    bullets: [
      'Modeled which edits get reverted on the Shakespeare Authorship Question pages.',
      'Led the exploratory analysis of reverts and helped set the project direction.',
      'Own the decision tree model: 76.3% accuracy and 82.7% recall. Article identity turned out to be the strongest feature.',
    ],
    stack: ['Python', 'pandas', 'matplotlib', 'mwxml'],
  },
  {
    name: 'Obsidian vault research agent',
    context: 'Solo project',
    bullets: ['A research agent that answers questions over my personal Obsidian notes using retrieval-augmented generation.'],
    stack: ['LangGraph', 'RAG', 'FastAPI', 'OpenRouter'],
  },
  {
    name: 'MLS roster modeling',
    context: 'Sports analytics',
    date: 'Apr 2026',
    bullets: [
      'Fit multilevel and fixed-effects regressions on 10+ years of MLS salary data.',
      'Found that roster efficiency and how salary is distributed (Gini) predict performance better than total spend.',
    ],
    stack: ['R', 'Mixed-effects models'],
  },
  {
    name: 'Reinforcement learning Pong agent',
    context: 'Deep learning',
    date: 'Dec 2025',
    bullets: ['Trained an Advantage Actor-Critic (A2C) agent to play Atari Pong.'],
    stack: ['PyTorch', 'Reinforcement learning'],
  },
  {
    name: 'Deep RNN language model',
    context: 'Deep learning',
    date: 'Nov 2025',
    bullets: ['Built an RNN language model with self-attention and trained it on the TinyStories dataset.'],
    stack: ['PyTorch'],
  },
  {
    name: 'Ames housing price prediction',
    context: 'Applied Machine Learning final project',
    date: 'Fall 2026, in progress',
    bullets: ['Predicting home sale prices on the Ames, Iowa housing dataset.'],
    stack: [],
  },
];

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function renderProjects(container: HTMLElement) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page';
  page.style.overflow = 'auto';
  page.appendChild(createHeader());

  const main = document.createElement('main');
  main.className = 'xp-main';
  main.innerHTML = `
    <div class="wrap">
      <h1 class="xp-title">Projects</h1>
      <ol class="xp-list">
        ${PROJECTS.map(
          (p) => `
          <li class="xp-entry">
            <div class="xp-role-head">
              <h2 class="xp-company">${esc(p.name)}</h2>
              ${p.date ? `<span class="xp-dates">${esc(p.date)}</span>` : ''}
            </div>
            <p class="xp-meta">${esc(p.context)}</p>
            <ul class="xp-bullets">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
            ${p.stack.length ? `<p class="xp-stack">${p.stack.map(esc).join(' · ')}</p>` : ''}
          </li>`,
        ).join('')}
      </ol>
    </div>
  `;

  page.appendChild(main);
  container.appendChild(page);
}
