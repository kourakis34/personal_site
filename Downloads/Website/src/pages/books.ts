import { createHeader } from '../utils';

interface Book {
  title: string;
  author: string;
  image: string;
}

const BOOKS: Book[] = [
  { title: 'Nuclear War', author: 'Annie Jacobsen', image: '/books/nuclear-war.jpg' },
  { title: 'Biological Warfare', author: 'Annie Jacobsen', image: '/books/biologicalwar.jpg' },
  { title: 'More Money than God', author: 'Sebastian Mallaby', image: '/books/moremoneythangod.jpg' },
  { title: 'Project Hail Mary', author: 'Andy Weir', image: '/books/project-hail-mary.jpg' },
  { title: 'The Bigs', author: 'Ben Carpenter', image: '/books/theb.jpg' },
  { title: 'Atomic Habits', author: 'James Clear', image: '/books/ah.jpg' },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', image: '/books/tsaongaf.jpg' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', image: '/books/powerofhabit.jpg' },
  { title: 'Outliers', author: 'Malcolm Gladwell', image: '/books/outliers.jpg' },
  { title: 'Factfulness', author: 'Hans Rosling', image: '/books/factfullness.jpg' },
];

export function renderBooks(container: HTMLElement) {
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

  const backLink = document.createElement('a');
  backLink.href = '#';
  backLink.className = 'back-link';
  backLink.style.display = 'inline-block';
  backLink.style.marginBottom = '2rem';
  backLink.style.color = 'var(--accent)';
  backLink.style.fontSize = '0.95rem';
  backLink.style.transition = 'opacity 0.2s ease';
  backLink.textContent = '← Back';
  backLink.addEventListener('mouseenter', (e) => {
    (e.target as HTMLElement).style.opacity = '0.7';
  });
  backLink.addEventListener('mouseleave', (e) => {
    (e.target as HTMLElement).style.opacity = '1';
  });
  wrap.appendChild(backLink);

  const h1 = document.createElement('h1');
  h1.style.fontFamily = 'var(--font-display)';
  h1.style.fontWeight = '500';
  h1.style.fontSize = 'clamp(2rem, 3vw, 2.8rem)';
  h1.style.lineHeight = '1.2';
  h1.style.marginBottom = '2rem';
  h1.textContent = 'Books';
  wrap.appendChild(h1);

  // Books grid
  const booksGrid = document.createElement('div');
  booksGrid.style.display = 'grid';
  booksGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  booksGrid.style.gap = '2rem';
  booksGrid.style.marginBottom = '2rem';

  BOOKS.forEach((book) => {
    const bookCard = document.createElement('div');
    bookCard.style.display = 'flex';
    bookCard.style.flexDirection = 'column';
    bookCard.style.gap = '1rem';

    const coverContainer = document.createElement('div');
    coverContainer.style.aspectRatio = '2 / 3';
    coverContainer.style.backgroundColor = 'var(--bg-alt-2)';
    coverContainer.style.borderRadius = '6px';
    coverContainer.style.overflow = 'hidden';
    coverContainer.style.border = '1px solid var(--border)';
    coverContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';

    const img = document.createElement('img');
    img.src = book.image;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.alt = book.title;
    coverContainer.appendChild(img);

    bookCard.appendChild(coverContainer);

    const title = document.createElement('p');
    title.style.fontSize = '0.95rem';
    title.style.fontWeight = '500';
    title.style.lineHeight = '1.4';
    title.textContent = book.title;
    bookCard.appendChild(title);

    if (book.author) {
      const author = document.createElement('p');
      author.style.fontSize = '0.85rem';
      author.style.color = 'var(--text-muted)';
      author.textContent = book.author;
      bookCard.appendChild(author);
    }

    booksGrid.appendChild(bookCard);
  });

  wrap.appendChild(booksGrid);
  main.appendChild(wrap);
  page.appendChild(main);

  container.appendChild(page);
}
