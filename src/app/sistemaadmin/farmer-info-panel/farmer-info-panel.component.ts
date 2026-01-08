/* ============================================
   FARMER INFO PANEL COMPONENT
   Right-side panel displaying farmer details
   ============================================ */

import { Component, Input, Output, EventEmitter, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/* ========== SERVICES ========== */
import { Ticket } from '../../services/chat.service';

@Component({
  selector: 'app-farmer-info-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-info-panel.component.html',
  styleUrl: './farmer-info-panel.component.css'
})
export class FarmerInfoPanelComponent {
  /* ========== INPUTS/OUTPUTS ========== */
  @Input() farmerProfile: any | null = null;
  @Input() ticket!: Ticket;
  
  @Output() closePanel = new EventEmitter<void>();

  /* ========== UI STATE ========== */
  isNotesExpanded = signal<boolean>(false);
  newNote = signal<string>('');

  /* ========== UI LOGIC ========== */

  /**
   * Get farmer initials for avatar
   */
  getInitials(): string {
    const name = this.farmerProfile?.fullname || 'A';
    const parts = name.split(' ');
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  /**
   * Get farmer display name
   */
  getFarmerName(): string {
    return this.farmerProfile?.fullname || 'Agricultor';
  }

  /**
   * Get farmer finca name
   */
  getFincaName(): string {
    return this.farmerProfile?.fincaname || this.farmerProfile?.fincaName || 'No especificada';
  }

  /**
   * Get farmer email
   */
  getEmail(): string {
    return this.farmerProfile?.email || 'No disponible';
  }

  /**
   * Get farmer phone
   */
  getPhone(): string {
    return this.farmerProfile?.cellphone || this.farmerProfile?.phone || 'No disponible';
  }

  /**
   * Get farmer address
   */
  getAddress(): string {
    return this.farmerProfile?.address || 'No disponible';
  }

  /**
   * Format timestamp for display
   */
  formatDate(timestamp: any): string {
    if (!timestamp) return 'No disponible';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'No disponible';
    }
  }

  /**
   * Toggle notes section
   */
  toggleNotes(): void {
    this.isNotesExpanded.update(v => !v);
  }

  /**
   * Add new note (placeholder for future implementation)
   */
  addNote(): void {
    const note = this.newNote().trim();
    if (note) {
      // TODO: Implement note saving to Firestore
      console.log('Adding note:', note);
      this.newNote.set('');
    }
  }

  /**
   * Close the info panel
   */
  onClose(): void {
    this.closePanel.emit();
  }
}
