import { createHeader } from '../utils';

interface Role {
  title: string;
  team?: string;
  location: string;
  dates: string;
  bullets: string[];
  metrics?: { value: string; label: string }[];
  tags?: string[];
}

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

interface Company {
  name: string;
  kind: string;
  current?: boolean;
  roles: Role[];
  photos?: Photo[];
}

const HIGHLIGHTS = [
  { value: '2×', label: 'L3Harris ML internships' },
  { value: '250', label: 'CVEs in agent eval harness' },
  { value: '1,300', label: 'kernel commits analyzed / hour' },
  { value: '+83%', label: 'bug-detection precision' },
];

const COMPANIES: Company[] = [
  {
    name: 'L3Harris',
    kind: 'Defense technology',
    roles: [
      {
        title: 'Machine Learning Engineer Intern',
        location: 'Melbourne, FL',
        dates: 'Jun – Aug 2026',
        bullets: [
          'Built an evaluation harness in which an agentic system (Hermes) attempted to exploit 250 known CVEs in containerized environments to benchmark model capabilities, with every run traced in Langfuse.',
          'Reverse-engineered a proprietary driver-level framework for a wireless product by tracing data paths and cross-referencing incomplete vendor documentation.',
        ],
        metrics: [{ value: '250', label: 'CVEs benchmarked' }],
        tags: ['AI agents', 'Evaluation', 'Docker', 'Langfuse'],
      },
      {
        title: 'ML / Software Engineer Intern',
        team: 'Cyber division',
        location: 'Washington, DC',
        dates: 'Jun – Aug 2025',
        bullets: [
          'Built an AI tool that triages Linux kernel commits for security vulnerabilities using Risk Management Frameworks.',
          'Connected OpenAI LLMs with GitPython to generate security reports directly from raw diffs.',
          'Built an async analyzer that processes 1,300 commits per hour across three kernel versions.',
          'Tuned prompts and model settings to improve bug-detection precision by 83%.',
        ],
        metrics: [
          { value: '1,300/hr', label: 'commits analyzed' },
          { value: '+83%', label: 'precision' },
        ],
        tags: ['Python', 'OpenAI API', 'GitPython', 'asyncio', 'Security'],
      },
    ],
    photos: [
      {
        src: 'experience/l3harris-intern-cohort.jpg',
        alt: 'Nick with the L3Harris intern class in front of the L3Harris headquarters building',
        caption: 'With the L3Harris intern class',
      },
      {
        src: 'experience/l3harris-melbourne.jpg',
        alt: 'Nick standing next to the red L3Harris sculpture on campus',
        caption: 'On campus at L3Harris',
      },
    ],
  },
  {
    name: 'Carnegie Mellon University',
    kind: 'Student Academic Success Center',
    current: true,
    roles: [
      {
        title: 'Academic Success Coach',
        location: 'Pittsburgh, PA',
        dates: 'May 2025 – Present',
        bullets: [
          'Coaches undergraduate and graduate students one-on-one on exam prep, time management and goal setting.',
          'Runs study-habit workshops for students across the university.',
          'Writing a coaching best-practices guide for first-generation, student-athlete, low-income and minoritized students.',
        ],
        tags: ['Coaching', 'Workshops', 'Mentorship'],
      },
    ],
  },
  {
    name: 'Waimea Investments',
    kind: 'Real estate',
    current: true,
    roles: [
      {
        title: 'Research & Operations Assistant',
        location: 'Remote',
        dates: 'Part-time · Present',
        bullets: [
          'Supports a real estate investor across Texas and Illinois with insurance procurement, lease renewals, appraisals, construction budgets and title/attorney sourcing.',
          'Handles tenant and vendor communication.',
        ],
        tags: ['Operations', 'Real estate'],
      },
    ],
  },
  {
    name: 'Rush Premier Sports',
    kind: 'Sports',
    roles: [
      {
        title: 'Database Management Intern',
        location: 'Miami, FL',
        dates: 'May – Aug 2024',
        bullets: [
          'Optimized a 33,000-contact database to prioritize high-revenue prospects.',
          'Managed inbound website leads.',
        ],
        metrics: [{ value: '33K', label: 'contacts optimized' }],
        tags: ['Data', 'CRM'],
      },
    ],
  },
  {
    name: 'U.S. Embassy Singapore',
    kind: 'U.S. Department of State',
    roles: [
      {
        title: 'Economic / Political Intern',
        location: 'Singapore',
        dates: 'May – Jul 2022',
        bullets: [
          'Consolidated and analyzed reports on the U.S.–Singapore relationship.',
          'Redesigned the embassy homepage layout.',
        ],
        tags: ['Research', 'Policy'],
      },
    ],
  },
];

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function initials(name: string): string {
  return name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter((w) => w && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

function renderPhotos(photos: Photo[]): string {
  const base = import.meta.env.BASE_URL;
  return `
    <div class="xp-photos">
      ${photos
        .map(
          (p) => `
        <figure>
          <img src="${base}${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">
          <figcaption>${esc(p.caption)}</figcaption>
        </figure>`,
        )
        .join('')}
    </div>`;
}

function renderRole(r: Role): string {
  return `
    <div class="xp-role">
      <div class="xp-role-head">
        <h3>${esc(r.title)}</h3>
        <span class="xp-dates">${esc(r.dates)}</span>
      </div>
      <p class="xp-meta">${r.team ? esc(r.team) + ' · ' : ''}${esc(r.location)}</p>
      ${
        r.metrics
          ? `<div class="xp-metrics">${r.metrics
              .map((m) => `<div class="xp-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`)
              .join('')}</div>`
          : ''
      }
      <ul class="xp-bullets">${r.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      ${r.tags ? `<div class="xp-tags">${r.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
    </div>`;
}

export function renderExperience(container: HTMLElement) {
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
        <p class="xp-eyebrow">Experience</p>
        <h1>Building and evaluating AI systems that hold up in production.</h1>
        <p class="xp-lede">Two machine learning internships at L3Harris, a coaching role at Carnegie Mellon, and a path that runs from an embassy in Singapore to Linux kernel security.</p>
      </header>

      <section class="xp-stats" aria-label="Highlights">
        ${HIGHLIGHTS.map(
          (h, i) =>
            `<div class="xp-stat" style="animation-delay:${0.1 + i * 0.07}s"><strong>${esc(h.value)}</strong><span>${esc(h.label)}</span></div>`,
        ).join('')}
      </section>

      <ol class="xp-timeline">
        ${COMPANIES.map(
          (c, i) => `
          <li class="xp-item" style="animation-delay:${0.2 + i * 0.08}s">
            <div class="xp-node" aria-hidden="true">${esc(initials(c.name))}</div>
            <article class="xp-card">
              <div class="xp-card-head">
                <div>
                  <h2>${esc(c.name)}</h2>
                  <p class="xp-kind">${esc(c.kind)}</p>
                </div>
                ${c.current ? '<span class="xp-badge">Current</span>' : ''}
                ${c.roles.length > 1 ? `<span class="xp-badge xp-badge-soft">${c.roles.length} roles</span>` : ''}
              </div>
              ${c.roles.map(renderRole).join('')}
              ${c.photos ? renderPhotos(c.photos) : ''}
            </article>
          </li>`,
        ).join('')}
      </ol>
    </div>
  `;

  page.appendChild(main);
  container.appendChild(page);
}
