/* ============================================
   ADMIN SIDEBAR COMPONENT
   Chat list with modal-based ticket selector
   ============================================ */

import { Component, inject, OnInit, OnDestroy, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

/* ========== SERVICES ========== */
import { ChatService, Ticket } from '../../services/chat.service';

type TabType = 'all' | 'assigned' | 'unassigned' | 'pending' | 'paused';
type StatusFilter = 'pending' | 'active' | 'closed' | 'all';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  /* ========== INPUTS/OUTPUTS ========== */
  @Input() adminProfile: any | null = null;
  @Input() selectedTicketId: string | null = null;
  @Input() isCollapsed: boolean = false;
  
  @Output() ticketSelected = new EventEmitter<Ticket>();
  @Output() toggleCollapse = new EventEmitter<void>();

  /* ========== DEPENDENCY INJECTION ========== */
  private auth = inject(Auth);
  private chatService = inject(ChatService);

  /* ========== STATE LOGIC ========== */
  currentAdminUid = signal<string | null>(null);
  
  /* ========== TICKET DATA ========== */
  allTickets = signal<Ticket[]>([]);
  pendingTickets = signal<Ticket[]>([]);
  activeTickets = signal<Ticket[]>([]);
  myTickets = signal<Ticket[]>([]);

  /* ========== UI STATE ========== */
  activeTab = signal<TabType>('all');
  searchQuery = signal<string>('');
  isTicketModalOpen = signal<boolean>(false);
  selectedStatusFilter = signal<StatusFilter>('all');

  /* ========== SUBSCRIPTIONS ========== */
  private pendingSub?: Subscription;
  private activeSub?: Subscription;
  private myTicketsSub?: Subscription;

  /* ========== COMPUTED VALUES ========== */
  filteredTickets = computed(() => {
    const tab = this.activeTab();
    const search = this.searchQuery().toLowerCase();
    const adminUid = this.currentAdminUid();
    
    let tickets: Ticket[] = [];
    
    switch (tab) {
      case 'all':
        tickets = [...this.pendingTickets(), ...this.activeTickets()];
        break;
      case 'assigned':
        tickets = this.activeTickets().filter(t => t.adminId === adminUid);
        break;
      case 'unassigned':
        tickets = this.pendingTickets();
        break;
      case 'pending':
        tickets = this.pendingTickets();
        break;
      case 'paused':
        tickets = []; // Future implementation
        break;
    }
    
    // Apply search filter
    if (search) {
      tickets = tickets.filter(t => 
        t.farmerName?.toLowerCase().includes(search) ||
        t.lastMessage?.toLowerCase().includes(search) ||
        t.id?.toLowerCase().includes(search)
      );
    }
    
    return tickets;
  });

  pendingCount = computed(() => this.pendingTickets().length);
  assignedCount = computed(() => this.myTickets().length);

  ngOnInit(): void {
    this.initializeAdmin();
    this.subscribeToTickets();
  }

  ngOnDestroy(): void {
    this.pendingSub?.unsubscribe();
    this.activeSub?.unsubscribe();
    this.myTicketsSub?.unsubscribe();
  }

  /* ========== AUTH/STATE LOGIC ========== */

  private initializeAdmin(): void {
    const user = this.auth.currentUser;
    console.log('🔐 Initializing admin - User:', user?.uid, 'Email:', user?.email);
    
    if (user) {
      this.currentAdminUid.set(user.uid);
      
      // Verify admin exists in Firestore
      this.chatService.getAdminProfile(user.uid).then(profile => {
        console.log('👤 Admin profile loaded:', profile);
        if (!profile) {
          console.error('❌ Admin not found in administradores collection');
        } else {
          console.log('✅ Admin authenticated:', profile.nombre || profile.name);
        }
      }).catch(err => {
        console.error('❌ Error loading admin profile:', err);
      });
    } else {
      console.error('❌ No authenticated user');
    }
  }

  /* ========== FIRESTORE LOGIC ========== */

  private subscribeToTickets(): void {
    console.log('🔔 Subscribing to tickets...');
    
    // Subscribe to pending tickets
    this.pendingSub = this.chatService.getPendingTickets()
      .subscribe({
        next: (tickets) => {
          console.log('📋 Pending tickets updated:', tickets.length);
          this.pendingTickets.set(tickets);
        },
        error: (err) => console.error('❌ Error loading pending tickets:', err)
      });

    // Subscribe to active tickets
    this.activeSub = this.chatService.getActiveTickets()
      .subscribe({
        next: (tickets) => {
          console.log('📋 Active tickets updated:', tickets.length);
          this.activeTickets.set(tickets);
        },
        error: (err) => console.error('❌ Error loading active tickets:', err)
      });

    // Subscribe to my tickets
    this.myTicketsSub = this.chatService.getMyTickets()
      .subscribe({
        next: (tickets) => {
          console.log('📋 My tickets updated:', tickets.length);
          this.myTickets.set(tickets);
        },
        error: (err) => console.error('❌ Error loading my tickets:', err)
      });
  }

  /* ========== UI LOGIC ========== */

  /**
   * Select a ticket and emit event
   */
  selectTicket(ticket: Ticket): void {
    this.ticketSelected.emit(ticket);
    this.closeTicketModal();
  }

  /**
   * Claim a pending ticket
   */
  async claimTicket(ticket: Ticket, event: Event): Promise<void> {
    event.stopPropagation();
    if (!ticket.id) return;

    try {
      await this.chatService.claimTicket(ticket.id);
      this.ticketSelected.emit(ticket);
    } catch (err) {
      console.error('Error claiming ticket:', err);
    }
  }

  /**
   * Change active tab
   */
  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  /**
   * Update search query
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Open ticket selector modal
   */
  openTicketModal(): void {
    this.isTicketModalOpen.set(true);
  }

  /**
   * Close ticket selector modal
   */
  closeTicketModal(): void {
    this.isTicketModalOpen.set(false);
  }

  /**
   * Set status filter in modal
   */
  setStatusFilter(status: StatusFilter): void {
    this.selectedStatusFilter.set(status);
  }

  /**
   * Get modal filtered tickets
   */
  getModalTickets(): Ticket[] {
    const status = this.selectedStatusFilter();
    const allTickets = [...this.pendingTickets(), ...this.activeTickets()];
    
    if (status === 'all') return allTickets;
    return allTickets.filter(t => t.status === status);
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      if (hours < 24) {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else if (hours < 48) {
        return 'Ayer';
      } else {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      }
    } catch {
      return '';
    }
  }

  /**
   * Get initials from name
   */
  getInitials(name: string): string {
    if (!name) return 'A';
    const parts = name.split(' ');
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  /**
   * Check if ticket is selected
   */
  isSelected(ticket: Ticket): boolean {
    return ticket.id === this.selectedTicketId;
  }

  /**
   * Get admin display name
   */
  getAdminName(): string {
    return this.adminProfile?.nombre || 'Administrador';
  }
}
