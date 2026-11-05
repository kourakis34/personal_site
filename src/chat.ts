export interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Error notices are shown but never saved or sent back to the model. */
  error?: boolean;
}

const HISTORY_KEY = 'chat_history_v1';
const MAX_SAVED = 40; // messages kept in this browser
const MAX_SENT = 8; // recent messages sent with each question for context

export class ChatManager {
  private messages: Message[] = [];
  private logElement: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private formElement: HTMLFormElement | null = null;
  private statusElement: HTMLElement | null = null;
  private chatConsole: HTMLElement | null = null;
  private photoFrame: HTMLElement | null = null;
  private isExpanded = false;
  private sessionId: string;
  private apiBase = 'https://personal-site-7mv2.onrender.com';
  private backendUrl = `${this.apiBase}/api/chat`;
  private toggleButton: HTMLButtonElement | null = null;
  private suggestionsElement: HTMLElement | null = null;
  private initialSuggestions: HTMLElement | null = null;
  private clearButton: HTMLButtonElement | null = null;
  private isLoading = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initialize();
    this.restoreHistory();
    this.warmUp();
  }

  private getOrCreateSessionId(): string {
    try {
      let sessionId = localStorage.getItem('chat_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('chat_session_id', sessionId);
      }
      return sessionId;
    } catch {
      return crypto.randomUUID();
    }
  }

  private restoreHistory() {
    let saved: { type: 'user' | 'assistant'; content: string; timestamp: string }[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      saved = [];
    }
    if (!Array.isArray(saved) || saved.length === 0) return;
    this.suggestionsElement?.remove();
    this.suggestionsElement = null;
    for (const m of saved) {
      if ((m.type === 'user' || m.type === 'assistant') && typeof m.content === 'string') {
        const msg: Message = { type: m.type, content: m.content, timestamp: new Date(m.timestamp) };
        this.messages.push(msg);
        this.renderMessage(msg);
      }
    }
    this.setClearVisible(true);
  }

  private saveHistory() {
    try {
      const keep = this.messages.filter((m) => !m.error).slice(-MAX_SAVED);
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(keep.map((m) => ({ type: m.type, content: m.content, timestamp: m.timestamp.toISOString() }))),
      );
    } catch {
      /* storage unavailable (private mode); history just won't persist */
    }
  }

  private clearHistory() {
    this.messages = [];
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
    if (this.logElement) {
      this.logElement.innerHTML = '';
      if (this.initialSuggestions) {
        this.logElement.appendChild(this.initialSuggestions);
        this.suggestionsElement = this.initialSuggestions;
      }
    }
    this.setClearVisible(false);
    this.updateStatus('Ready to chat');
    this.inputElement?.focus();
  }

  private setClearVisible(visible: boolean) {
    if (this.clearButton) this.clearButton.hidden = !visible;
  }

  private recentHistory(): { role: 'user' | 'assistant'; content: string }[] {
    return this.messages
      .filter((m) => !m.error)
      .slice(-MAX_SENT)
      .map((m) => ({ role: m.type, content: m.content.slice(0, 4000) }));
  }

  // The backend sleeps when idle (Render free plan); ping it on page load so it's
  // usually awake by the time someone types a question.
  private warmUp() {
    fetch(`${this.apiBase}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
  }

  private initialize() {
    this.logElement = document.querySelector('.cc-log');
    this.inputElement = document.querySelector('.chat-console input') as HTMLInputElement;
    this.formElement = document.querySelector('.chat-console form') as HTMLFormElement;
    this.statusElement = document.querySelector('.cc-status');
    this.chatConsole = document.querySelector('.chat-console');
    this.photoFrame = document.querySelector('.photo-frame');
    this.toggleButton = document.querySelector('.chat-console .cc-label');
    this.suggestionsElement = document.querySelector('.cc-suggestions');
    this.initialSuggestions = this.suggestionsElement;
    this.clearButton = document.querySelector('.cc-clear');
    this.clearButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearHistory();
    });

    this.toggleButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isExpanded) {
        this.collapse();
      } else {
        this.expand();
      }
    });

    this.suggestionsElement?.querySelectorAll<HTMLButtonElement>('.cc-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.send(chip.textContent || '');
      });
    });

    // Escape closes the chat and returns focus to its toggle.
    this.chatConsole?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.collapse();
        this.toggleButton?.focus();
      }
    });

    if (this.formElement) {
      this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (this.chatConsole) {
      this.chatConsole.addEventListener('click', (e) => {
        if (!this.isExpanded) {
          e.stopPropagation();
          this.expand();
        }
      });
    }

    if (this.inputElement) {
      this.inputElement.disabled = false;
    }

    // Click anywhere else on the page to collapse
    document.addEventListener('click', (e) => {
      if (this.isExpanded && e.target !== this.chatConsole && !this.chatConsole?.contains(e.target as Node)) {
        this.collapse();
      }
    });

  }

  private expand() {
    this.isExpanded = true;
    if (this.chatConsole) {
      this.chatConsole.classList.add('expanded');
    }
    this.toggleButton?.setAttribute('aria-expanded', 'true');
    if (this.photoFrame) {
      this.photoFrame.classList.add('hidden');
    }
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  private collapse() {
    this.isExpanded = false;
    if (this.chatConsole) {
      this.chatConsole.classList.remove('expanded');
    }
    this.toggleButton?.setAttribute('aria-expanded', 'false');
    if (this.photoFrame) {
      this.photoFrame.classList.remove('hidden');
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.inputElement) return;
    if (this.send(this.inputElement.value)) {
      this.inputElement.value = '';
    }
  }

  private send(text: string): boolean {
    const userMessage = text.trim();
    if (!userMessage || this.isLoading) return false;

    if (!this.isExpanded) this.expand();
    this.suggestionsElement?.remove();
    this.suggestionsElement = null;

    const history = this.recentHistory();
    this.addMessage({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    this.setClearVisible(true);

    this.generateResponse(userMessage, history);
    return true;
  }

  private addMessage(message: Message) {
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
    this.saveHistory();
  }

  private renderMessage(message: Message) {
    if (!this.logElement) return;

    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';

    if (message.type === 'user') {
      lineDiv.innerHTML = `<span class="prompt-char">&gt;</span>${this.escapeHtml(message.content)}`;
    } else {
      lineDiv.classList.add('bot');
      lineDiv.innerHTML = this.formatReply(message.content);
    }

    this.logElement.appendChild(lineDiv);
  }

  private async generateResponse(userMessage: string, history: { role: 'user' | 'assistant'; content: string }[]) {
    this.isLoading = true;
    this.updateStatus('Thinking…');
    const slowTimer = window.setTimeout(
      () => this.updateStatus('Waking up the server — this can take up to a minute…'),
      5000,
    );
    const controller = new AbortController();
    const abortTimer = window.setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: this.sessionId, message: userMessage, history }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = '';
        try {
          const body = await response.json();
          if (typeof body.detail === 'string') detail = body.detail;
        } catch {
          /* ignore */
        }
        throw new Error(response.status === 429 && detail ? detail : `Sorry, I couldn't get a response (HTTP ${response.status}). Try again?`);
      }

      const data = await response.json();
      this.addMessage({ type: 'assistant', content: data.response, timestamp: new Date() });
      this.updateStatus('Ready to chat');
    } catch (error) {
      const msg =
        error instanceof DOMException && error.name === 'AbortError'
          ? "Sorry, that took too long. Please try again, or email Nick at nicholaskourakis2004@gmail.com."
          : error instanceof Error && !error.message.startsWith('Failed to fetch')
            ? error.message
            : "Sorry, I couldn't reach the server. Try again?";
      this.addMessage({ type: 'assistant', content: msg, timestamp: new Date(), error: true });
      this.updateStatus('Something went wrong');
    } finally {
      window.clearTimeout(slowTimer);
      window.clearTimeout(abortTimer);
      this.isLoading = false;
    }
  }

  private scrollToBottom() {
    if (this.logElement) {
      this.logElement.scrollTop = this.logElement.scrollHeight;
    }
  }

  // Escape first, then allow only **bold**; line breaks are kept by CSS (pre-wrap).
  private formatReply(text: string): string {
    return this.escapeHtml(text.trim()).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private updateStatus(status: string) {
    if (this.statusElement) {
      this.statusElement.textContent = status;
    }
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }
}
