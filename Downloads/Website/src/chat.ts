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

  constructor() {
    this.initialize();
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

    if (!this.inputElement || !this.inputElement.value.trim()) {
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

  private generateResponse(userMessage: string) {
    const lowerMessage = userMessage.toLowerCase();

    let response = '';

    if (lowerMessage.includes('l3harris') || lowerMessage.includes('work')) {
      response = 'I worked on some cool projects at L3Harris. Add your details here!';
    } else if (lowerMessage.includes('experience') || lowerMessage.includes('background')) {
      response = 'I have experience in various areas. Check the experience page for more!';
    } else if (lowerMessage.includes('project')) {
      response = 'I have several projects I\'m working on. Visit the projects page to learn more!';
    } else if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      response = 'Hey! Nice to meet you. Ask me anything!';
    } else if (lowerMessage.includes('?')) {
      response = 'That\'s a great question! You can customize these responses in chat.ts';
    } else {
      response = 'Interesting! Tell me more or check out my experience page.';
    }

    setTimeout(() => {
      this.addMessage({
        type: 'assistant',
        content: response,
        timestamp: new Date()
      });
    }, 300);
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
