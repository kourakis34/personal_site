export interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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
  private backendUrl = '/api/chat';
  private isLoading = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initialize();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }

  private initialize() {
    this.logElement = document.querySelector('.cc-log');
    this.inputElement = document.querySelector('.chat-console input') as HTMLInputElement;
    this.formElement = document.querySelector('.chat-console form') as HTMLFormElement;
    this.statusElement = document.querySelector('.cc-status');
    this.chatConsole = document.querySelector('.chat-console');
    this.photoFrame = document.querySelector('.photo-frame');

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

    this.updateStatus('Ready to chat');
  }

  private expand() {
    this.isExpanded = true;
    if (this.chatConsole) {
      this.chatConsole.classList.add('expanded');
    }
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
    if (this.photoFrame) {
      this.photoFrame.classList.remove('hidden');
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.inputElement || !this.inputElement.value.trim() || this.isLoading) {
      return;
    }

    const userMessage = this.inputElement.value.trim();
    this.inputElement.value = '';

    this.addMessage({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    this.generateResponse(userMessage);
  }

  private addMessage(message: Message) {
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  }

  private renderMessage(message: Message) {
    if (!this.logElement) return;

    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';

    if (message.type === 'user') {
      lineDiv.innerHTML = `<span class="prompt-char">&gt;</span>${this.escapeHtml(message.content)}`;
    } else {
      lineDiv.innerHTML = this.escapeHtml(message.content);
    }

    this.logElement.appendChild(lineDiv);
  }

  private async generateResponse(userMessage: string) {
    this.isLoading = true;
    this.updateStatus('Thinking...');

    try {
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.addMessage({
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      });
      this.updateStatus('Ready to chat');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.addMessage({
        type: 'assistant',
        content: `Sorry, I couldn't get a response (${errorMsg}). Try again?`,
        timestamp: new Date()
      });
      this.updateStatus('Error — try again');
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom() {
    if (this.logElement) {
      this.logElement.scrollTop = this.logElement.scrollHeight;
    }
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
