# Nick Kourakis Website

A modern, TypeScript-based personal website with an interactive chat feature.

## Features

- **TypeScript** - Fully typed codebase for better development experience
- **Vite** - Fast build tool and dev server
- **Dark/Light Theme** - Theme toggle with localStorage persistence
- **Interactive Chat** - Chat interface with local responses (ready for LLM integration)
- **Responsive Design** - Mobile-friendly layout

## Setup

### Prerequisites

- Node.js 16+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dev server will open automatically at `http://localhost:5173`

## Project Structure

```
src/
├── main.ts           # Entry point
├── styles.css        # Global styles
├── chat.ts           # Chat manager class
├── utils.ts          # Utility functions
└── pages/
    └── home.ts       # Home page component
```

## Customization

### Chat Responses

Edit `src/chat.ts` to customize the chatbot responses. The `generateResponse` method handles incoming questions with hardcoded replies.

To connect to a real LLM:

1. Add your API key handling
2. Replace the response generation logic with actual API calls
3. Stream responses if needed

### About, Experience, and Projects Pages

Create new page components in `src/pages/` and add routing logic in `src/main.ts`.

### Styling

All styles are in `src/styles.css`. The design uses CSS custom properties (variables) for theming.

## Building

```bash
npm run build
```

This generates optimized production files in the `dist/` directory.
