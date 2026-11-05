import { createHeader } from '../utils';

interface Role {
  title: string;
  team?: string;
  location: string;
  dates: string;
  bullets: string[];
}

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

interface Company {
  name: string;
  roles: Role[];
  photos?: Photo[];
}

const COMPANIES: Company[] = [
  {
    name: 'L3Harris',
    roles: [
      {
        title: 'Machine Learning Engineer Intern',
        location: 'Melbourne, FL',
        dates: 'Jun – Aug 2026',
        bullets: [
          'Built an evaluation harness where an agentic system (Hermes) tried to exploit 250 known CVEs in containerized environments, to benchmark model capabilities. Runs were traced in Langfuse.',
          'Reverse-engineered a proprietary driver-level framework for a wireless product by tracing data paths and cross-referencing incomplete vendor documentation.',
        ],
      },
      {
        title: 'ML / Software Engineer Intern',
        team: 'Cyber division',
        location: 'Washington, DC',
        dates: 'Jun – Aug 2025',
        bullets: [
          'Built an AI tool that triages Linux kernel commits for security vulnerabilities using Risk Management Frameworks.',
          'Connected OpenAI models with GitPython to generate security reports from raw diffs.',
          'Wrote an async analyzer that processes 1,300 commits an hour across three kernel versions.',
          'Tuned prompts and model settings, improving bug-detection precision by 83%.',
        ],
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
    roles: [
      {
        title: 'Academic Success Coach',
        team: 'Student Academic Success Center',
        location: 'Pittsburgh, PA',
        dates: 'May 2025 – Present',
        bullets: [
          'Coach undergraduate and graduate students one-on-one on exam prep, time management and goal setting.',
          'Run study-habit workshops.',
          'Writing a coaching guide for first-generation, student-athlete, low-income and minoritized students.',
        ],
      },
    ],
  },
  {
    name: 'Waimea Investments',
    roles: [
      {
        title: 'Research & Operations Assistant',
        location: 'Remote, part-time',
        dates: 'Present',
        bullets: [
          'Help a real estate investor with properties in Texas and Illinois: insurance, lease renewals, appraisals, construction budgets, and finding title companies and attorneys.',
          'Handle tenant and vendor communication.',
        ],
      },
    ],
  },
  {
    name: 'Rush Premier Sports',
    roles: [
      {
        title: 'Database Management Intern',
        location: 'Miami, FL',
        dates: 'May – Aug 2024',
        bullets: [
          'Reorganized a 33,000-contact database to prioritize high-revenue prospects.',
          'Managed inbound website leads.',
        ],
      },
    ],
  },
  {
    name: 'U.S. Embassy Singapore',
    roles: [
      {
        title: 'Economic / Political Intern',
        location: 'Singapore',
        dates: 'May – Jul 2022',
        bullets: [
          'Consolidated and analyzed reports on the U.S.–Singapore relationship.',
          'Redesigned the embassy homepage layout.',
        ],
      },
    ],
  },
];

const SKILLS: [string, string][] = [
  ['Languages', 'Python, SQL, R, C'],
  ['ML / AI', 'PyTorch, scikit-learn, LangGraph, RAG, MCP, OpenAI API, Langfuse'],
  ['Data', 'pandas, matplotlib, Jupyter, Weights & Biases, DVC'],
  ['Backend', 'FastAPI, Supabase, Kafka'],
  ['Cloud & DevOps', 'Docker, Kubernetes, AWS, Prometheus, Grafana, Render'],
  ['Tools', 'Git, LaTeX, Obsidian'],
  ['Spoken', 'English, Spanish (fluent), Portuguese (fluent)'],
];

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderRole(r: Role): string {
  return `
    <div class="xp-role">
      <div class="xp-role-head">
        <h3>${esc(r.title)}</h3>
        <span class="xp-dates">${esc(r.dates)}</span>
      </div>
      <p class="xp-meta">${r.team ? esc(r.team) + ', ' : ''}${esc(r.location)}</p>
      <ul class="xp-bullets">${r.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>`;
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
      <h1 class="xp-title">Experience</h1>

      <ol class="xp-list">
        ${COMPANIES.map(
          (c) => `
          <li class="xp-entry">
            <h2 class="xp-company">${esc(c.name)}</h2>
            ${c.roles.map(renderRole).join('')}
            ${c.photos ? renderPhotos(c.photos) : ''}
          </li>`,
        ).join('')}
      </ol>

      <section class="xp-skills" aria-labelledby="skills-title">
        <h2 id="skills-title" class="xp-section-title">Skills</h2>
        <dl>
          ${SKILLS.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
      </section>
    </div>
  `;

  page.appendChild(main);
  container.appendChild(page);
}
