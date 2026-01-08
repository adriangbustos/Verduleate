import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService, Message, Ticket } from '../../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  private chatService = inject(ChatService);
  private auth = inject(Auth);
  
  // UI State
  currentTicketId: string | null = null;
  messages: Message[] = [];
  ticketDetails: Ticket | null = null;
  newMessageText: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;
  error: string | null = null;
  
  // Subscriptions
  private messagesSubscription?: Subscription;
  private ticketSubscription?: Subscription;
  private shouldScrollToBottom = false;

  ngOnInit(): void {
    this.initializeChat();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.ticketSubscription?.unsubscribe();
  }

  /**
   * Initialize or resume farmer's chat session
   */
  async initializeChat(): Promise<void> {
    if (!this.auth.currentUser) {
      this.error = 'Debes iniciar sesión para usar el soporte';
      console.error('❌ No authenticated user');
      return;
    }

    try {
      this.isLoading = true;
      this.error = null;

      console.log('🌱 Initializing chat for farmer:', this.auth.currentUser.uid);
      console.log('   Email:', this.auth.currentUser.email);

      // Get or create farmer's active ticket
      const ticketId = await this.chatService.getFarmerActiveTicket();
      
      console.log('🎫 Ticket ID obtained:', ticketId);
      
      if (ticketId) {
        this.currentTicketId = ticketId;
        this.subscribeToTicket(ticketId);
        this.subscribeToMessages(ticketId);
        console.log('✅ Chat initialized successfully');
      } else {
        console.error('❌ No ticket ID received');
        this.error = 'No se pudo crear el ticket de soporte';
      }
    } catch (err: any) {
      console.error('❌ Error initializing chat:', err);
      this.error = 'Error al iniciar el chat. Intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Subscribe to ticket details for real-time updates
   */
  private subscribeToTicket(ticketId: string): void {
    this.ticketSubscription = this.chatService.getTicketDetails(ticketId)
      .subscribe({
        next: (ticket) => {
          this.ticketDetails = ticket;
        },
        error: (err) => {
          console.error('Error subscribing to ticket:', err);
        }
      });
  }

  /**
   * Subscribe to messages for real-time updates
   */
  private subscribeToMessages(ticketId: string): void {
    this.messagesSubscription = this.chatService.getMessages(ticketId)
      .subscribe({
        next: (messages) => {
          const previousCount = this.messages.length;
          this.messages = messages;
          
          // Scroll to bottom when new messages arrive or on first load
          if (previousCount === 0 || messages.length > previousCount) {
            this.shouldScrollToBottom = true;
          }
        },
        error: (err) => {
          console.error('Error subscribing to messages:', err);
          this.error = 'Error al cargar mensajes';
        }
      });
  }

  /**
   * Send a new message
   */
  async sendMessage(): Promise<void> {
    if (!this.newMessageText.trim() || !this.currentTicketId || this.isSending) {
      console.warn('⚠️ Cannot send: empty message, no ticket ID, or already sending');
      return;
    }

    console.log('📨 Sending message to ticket:', this.currentTicketId);
    console.log('   Message:', this.newMessageText.substring(0, 50));

    this.isSending = true;
    const messageToSend = this.newMessageText.trim();
    this.newMessageText = '';

    try {
      await this.chatService.sendMessage(
        this.currentTicketId, 
        messageToSend, 
        'agricultor'
      );
      
      console.log('✅ Message sent successfully');
      this.shouldScrollToBottom = true;
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      console.error('   Error details:', err.message);
      this.error = 'Error al enviar mensaje';
      this.newMessageText = messageToSend; // Restore message on error
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Handle Enter key press to send message
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Check if message is from current user
   */
  isOwnMessage(message: Message): boolean {
    return message.senderId === this.auth.currentUser?.uid;
  }

  /**
   * Get status text for display
   */
  getStatusText(): string {
    if (!this.ticketDetails) return 'Cargando...';
    
    switch (this.ticketDetails.status) {
      case 'pending':
        return 'Esperando respuesta del equipo de soporte...';
      case 'active':
        return `Conectado con ${this.ticketDetails.adminName || 'un agente'}`;
      case 'closed':
        return 'Chat cerrado';
      default:
        return '';
    }
  }

  /**
   * Format timestamp for display
   */
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

  /**
   * Scroll chat to bottom
   */
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

  /**
   * Retry connection
   */
  retry(): void {
    this.error = null;
    this.initializeChat();
  }
}

