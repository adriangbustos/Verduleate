import { 
  Component, 
  inject, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  ElementRef, 
  AfterViewChecked,
  Input,
  Output,
  EventEmitter,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { ChatService, Ticket, Message } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  /** Ticket received from parent layout */
  @Input() set ticket(value: Ticket | null) {
    if (value && value.id !== this.selectedTicket?.id) {
      this.loadTicket(value);
    } else if (!value) {
      this.clearChat();
    }
  }

  /** Emit farmer info for the right panel */
  @Output() farmerSelected = new EventEmitter<string>();

  /** Emit when ticket is closed */
  @Output() ticketClosed = new EventEmitter<void>();

  private chatService = inject(ChatService);
  private auth = inject(Auth);

  // Current Chat State
  selectedTicket: Ticket | null = null;
  messages: Message[] = [];
  newMessageText = signal<string>('');

  // UI State
  isLoading = signal<boolean>(false);
  isSending = signal<boolean>(false);
  error = signal<string | null>(null);
  private shouldScrollToBottom = false;
  showTypingIndicator = signal<boolean>(false);
  showCloseDialog = signal<boolean>(false);

  // Subscriptions
  private messagesSubscription?: Subscription;
  private ticketDetailsSubscription?: Subscription;

  ngOnInit(): void {
    // No route subscription needed - data comes via Input
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.ticketDetailsSubscription?.unsubscribe();
  }

  /** Load ticket from parent input */
  private loadTicket(ticket: Ticket): void {
    if (!ticket.id) return;

    this.ticketDetailsSubscription?.unsubscribe();
    this.messagesSubscription?.unsubscribe();
    
    this.selectedTicket = ticket;
    this.messages = [];

    // Subscribe to ticket details
    this.ticketDetailsSubscription = this.chatService.getTicketDetails(ticket.id)
      .subscribe({
        next: (updatedTicket) => {
          if (updatedTicket) {
            this.selectedTicket = updatedTicket;
          }
        }
      });

    // Emit farmer ID for info panel
    this.farmerSelected.emit(ticket.farmerId);

    // Subscribe to messages
    this.subscribeToMessages(ticket.id);
  }

  /** Subscribe to messages for a ticket */
  private subscribeToMessages(ticketId: string): void {
    this.messagesSubscription?.unsubscribe();
    
    this.messagesSubscription = this.chatService.getMessages(ticketId)
      .subscribe({
        next: (messages) => {
          const previousCount = this.messages.length;
          this.messages = messages;

          if (previousCount === 0 || messages.length > previousCount) {
            this.shouldScrollToBottom = true;
          }
        },
        error: (err) => {
          console.error('Error loading messages:', err);
          this.error.set('Error al cargar mensajes');
        }
      });
  }

  /** Clear chat state */
  private clearChat(): void {
    this.selectedTicket = null;
    this.messages = [];
    this.newMessageText.set('');
    this.messagesSubscription?.unsubscribe();
    this.ticketDetailsSubscription?.unsubscribe();
  }

  /** Send a message */
  async sendMessage(): Promise<void> {
    const text = this.newMessageText().trim();
    if (!text || !this.selectedTicket?.id || this.isSending()) return;

    this.isSending.set(true);
    this.newMessageText.set('');

    try {
      this.error.set(null);
      
      await this.chatService.sendMessage(
        this.selectedTicket.id,
        text,
        'admin'
      );

      this.shouldScrollToBottom = true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      this.error.set('Error al enviar mensaje');
      this.newMessageText.set(text); // Restore message on error
    } finally {
      this.isSending.set(false);
    }
  }

  /** Show close ticket confirmation dialog */
  showCloseTicketDialog(): void {
    if (!this.selectedTicket?.id) return;
    this.showCloseDialog.set(true);
  }

  /** Close the dialog */
  closeDialog(): void {
    this.showCloseDialog.set(false);
  }

  /** Close current ticket after confirmation */
  async closeCurrentTicket(): Promise<void> {
    if (!this.selectedTicket?.id) return;

    try {
      await this.chatService.closeTicket(this.selectedTicket.id);
      this.showCloseDialog.set(false);
      this.ticketClosed.emit();
    } catch (err: any) {
      console.error('Error closing ticket:', err);
      this.error.set('Error al cerrar el ticket');
      this.showCloseDialog.set(false);
    }
  }

  /** Handle Enter key press */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /** Check if message is from current user */
  isOwnMessage(message: Message): boolean {
    return message.senderId === this.auth.currentUser?.uid;
  }

  /** Get initials for avatar */
  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /** Format timestamp */
  formatTime(timestamp: any): string {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  /** Format date */
  formatDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  /** Get status text */
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'active':
        return 'Activo';
      case 'closed':
        return 'Cerrado';
      default:
        return status;
    }
  }

  /** Scroll to bottom */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

