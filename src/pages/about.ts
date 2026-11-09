import { createHeader } from '../utils';
import { setupPlaces } from '../places';

export function renderAbout(container: HTMLElement) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page';
  page.style.overflow = 'auto';

  // Header
  page.appendChild(createHeader());

  // Main content
  const main = document.createElement('main');
  main.style.padding = '3rem 0';
  main.style.flex = '1';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';


  const h1 = document.createElement('h1');
  h1.style.fontFamily = 'var(--font-display)';
  h1.style.fontWeight = '500';
  h1.style.fontSize = 'clamp(2rem, 3vw, 2.8rem)';
  h1.style.lineHeight = '1.2';
  h1.style.marginBottom = '2rem';
  h1.textContent = 'About';
  wrap.appendChild(h1);

  const content = document.createElement('div');
  content.innerHTML = `
    <p style="max-width: 65ch; margin-bottom: 1rem; color: var(--text-muted);">
      I'm a senior at Carnegie Mellon studying Statistics &amp; Machine Learning (graduating May 2027) and a forward on the varsity soccer team. Born in Brazil, I grew up across six countries and speak English, Spanish and Portuguese.
    </p>
    <p style="max-width: 65ch; margin-bottom: 1rem; color: var(--text-muted);">
      On the field, I play forward (#27) for the Carnegie Mellon Tartans, an NCAA Division III men's soccer team in the UAA.
    </p>
    <section class="places" aria-labelledby="places-title">
      <h2 id="places-title">Places I've lived</h2>
      <div class="places-body">
        <div class="places-globe">
          <canvas aria-label="Globe marking the cities Nick has lived in. Drag to spin it." role="img"></canvas>
        </div>
        <div class="places-side">
          <ul class="places-list"></ul>
          <p class="places-hint">Drag the globe to spin it, or pick a city.</p>
        </div>
      </div>
    </section>
    <section class="about-courses" aria-labelledby="about-courses-title">
      <h2 id="about-courses-title">Relevant coursework</h2>
      <ul>
        <li>AI Engineering</li>
        <li>Algorithms and Advanced Data Structures</li>
        <li>Intro to Machine Learning</li>
        <li>Applied Machine Learning / ML in Practice</li>
        <li>Statistics Capstone</li>
        <li>Principles of Imperative Computation</li>
        <li>Fundamentals of Computer Science</li>
        <li>Statistical Computing</li>
        <li>Regression</li>
        <li>Advanced Data Analysis</li>
        <li>Probability and Statistical Inference I &amp; II</li>
        <li>Linear Algebra</li>
        <li>Multivariate Calculus</li>
        <li>Discrete Math</li>
      </ul>
    </section>
  `;
  wrap.appendChild(content);

  main.appendChild(wrap);
  page.appendChild(main);

  container.appendChild(page);
  setupPlaces(page);
}
