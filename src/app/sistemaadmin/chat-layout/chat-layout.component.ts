/* ============================================
   ADMIN CHAT LAYOUT - TRI-PANE ARCHITECTURE
   Main container for the admin chat dashboard
   ============================================ */

import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

/* ========== CHILD COMPONENTS ========== */
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { FarmerInfoPanelComponent } from '../farmer-info-panel/farmer-info-panel.component';
import { ChatComponent } from '../chat/chat.component';

/* ========== SERVICES ========== */
import { ChatService, Ticket } from '../../services/chat.service';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebarComponent,
    FarmerInfoPanelComponent,
    ChatComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.css'
})
export class ChatLayoutComponent implements OnInit, OnDestroy {
  /* ========== DEPENDENCY INJECTION ========== */
  private auth = inject(Auth);
  private chatService = inject(ChatService);

  /* ========== AUTH/STATE LOGIC ========== */
  currentAdminUid = signal<string | null>(null);
  adminProfile = signal<any | null>(null);
  
  /* ========== TICKET STATE ========== */
  selectedTicket = signal<Ticket | null>(null);
  selectedFarmerProfile = signal<any | null>(null);
  
  /* ========== UI STATE ========== */
  isInfoPanelOpen = signal<boolean>(true);
  isSidebarCollapsed = signal<boolean>(false);

  /* ========== SUBSCRIPTIONS ========== */
  private farmerProfileSub?: Subscription;

  ngOnInit(): void {
    this.initializeAdmin();
  }

  ngOnDestroy(): void {
    this.farmerProfileSub?.unsubscribe();
  }

  /* ========== FIRESTORE LOGIC ========== */

  /**
   * Initialize admin authentication and profile
   */
  private async initializeAdmin(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      this.currentAdminUid.set(user.uid);
      const profile = await this.chatService.getAdminProfile(user.uid);
      this.adminProfile.set(profile);
    }
  }

  /**
   * Handle ticket selection from sidebar
   */
  onTicketSelected(ticket: Ticket): void {
    this.selectedTicket.set(ticket);
    
    // Load farmer profile
    if (ticket.farmerId) {
      this.loadFarmerProfile(ticket.farmerId);
    }
  }

  /**
   * Handle farmer selection from chat component
   */
  onFarmerSelected(farmerId: string): void {
    this.loadFarmerProfile(farmerId);
  }

  /**
   * Load farmer profile by ID
   */
  private loadFarmerProfile(farmerId: string): void {
    // Unsubscribe from previous farmer profile
    this.farmerProfileSub?.unsubscribe();
    
    // Subscribe to farmer profile updates
    this.farmerProfileSub = this.chatService.getFarmerProfileRealtime(farmerId)
      .subscribe({
        next: (profile) => {
          this.selectedFarmerProfile.set(profile);
        },
        error: (err) => {
          console.error('Error loading farmer profile:', err);
          this.selectedFarmerProfile.set(null);
        }
      });
  }

  /**
   * Handle ticket closed event
   */
  onTicketClosed(): void {
    // Clear selected ticket after a brief delay to show success state
    setTimeout(() => {
      this.selectedTicket.set(null);
      this.selectedFarmerProfile.set(null);
    }, 1000);
  }

  /* ========== UI LOGIC ========== */

  /**
   * Toggle the right-side info panel
   */
  toggleInfoPanel(): void {
    this.isInfoPanelOpen.update(open => !open);
  }

  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed.update(collapsed => !collapsed);
  }

  /**
   * Get admin display name
   */
  getAdminName(): string {
    return this.adminProfile()?.nombre || 'Administrador';
  }
}
