import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, Reminder, NewUser, AnalyticsData, UserDetails } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

interface Order {
  productName: string;
  productNumber: string;
  paymentStatus: string;
  status: string;
}

@Component({
  selector: 'app-mainpage-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mainpage-admin.component.html',
  styleUrls: ['./mainpage-admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainPageAdminComponent implements OnInit, OnDestroy {
  reminders: Reminder[] = [];
  newUsers: NewUser[] = [];
  analytics: AnalyticsData = {
    users: { count: 0, percentage: 0 },
    visits: { count: 0, percentage: 0 },
    searches: { count: 0, percentage: 0 }
  };

  showAddReminderForm = false;
  newReminderTitle = '';
  newReminderTime = '';
  editingReminder: Reminder | null = null;

  selectedUser: UserDetails | null = null;
  showUserModal = false;

  private unsubscribeReminders?: () => void;
  private unsubscribeUsers?: () => void;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService
  ) { }

  goToChat(){
    this.router.navigate(['/admin/chat']);
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/admin/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  orders: Order[] = [
    {
      productName: 'Tutorial de JavaScript',
      productNumber: '85743',
      paymentStatus: 'Pendiente',
      status: 'Pendiente'
    },
    {
      productName: 'Curso Completo de CSS',
      productNumber: '97245',
      paymentStatus: 'Reembolsado',
      status: 'Rechazado'
    },
    {
      productName: 'Tutorial de Flex-Box',
      productNumber: '36452',
      paymentStatus: 'Pagado',
      status: 'Activo'
    }
  ];

  ngOnInit() {
    this.initializeDOMElements();
    this.loadAnalytics();
    this.loadNewUsers();
    this.loadReminders();
    this.setupRealtimeListeners();
  }

  ngOnDestroy() {
    if (this.unsubscribeReminders) {
      this.unsubscribeReminders();
    }
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
    }
  }

  private async loadAnalytics() {
    this.analytics = await this.adminService.getAnalytics();
  }

  private async loadNewUsers() {
    this.newUsers = await this.adminService.getNewUsers(3);
  }

  private async loadReminders() {
    this.reminders = await this.adminService.getReminders();
  }

  private setupRealtimeListeners() {
    // Listen to reminders changes
    this.unsubscribeReminders = this.adminService.listenToReminders((reminders) => {
      this.reminders = reminders;
    });

    // Listen to new users
    this.unsubscribeUsers = this.adminService.listenToNewUsers((users) => {
      this.newUsers = users.slice(0, 3);
    });
  }

  // ========== REMINDER METHODS ==========

  openAddReminderForm() {
    this.showAddReminderForm = true;
    this.editingReminder = null;
    this.newReminderTitle = '';
    this.newReminderTime = '';
  }

  async addReminder() {
    if (!this.newReminderTitle || !this.newReminderTime) {
      return;
    }

    try {
      await this.adminService.createReminder({
        title: this.newReminderTitle,
        time: this.newReminderTime,
        type: 'active'
      });
      this.showAddReminderForm = false;
      this.newReminderTitle = '';
      this.newReminderTime = '';
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  }

  editReminder(reminder: Reminder) {
    this.editingReminder = reminder;
    this.newReminderTitle = reminder.title;
    this.newReminderTime = reminder.time;
    this.showAddReminderForm = true;
  }

  async saveEditedReminder() {
    if (!this.editingReminder || !this.newReminderTitle || !this.newReminderTime) {
      return;
    }

    try {
      await this.adminService.updateReminder(this.editingReminder.id!, {
        title: this.newReminderTitle,
        time: this.newReminderTime
      });
      this.showAddReminderForm = false;
      this.editingReminder = null;
      this.newReminderTitle = '';
      this.newReminderTime = '';
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  }

  async deleteReminder(reminder: Reminder) {
    if (!reminder.id) return;

    if (confirm(`¿Eliminar el recordatorio "${reminder.title}"?`)) {
      try {
        await this.adminService.deleteReminder(reminder.id);
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  }

  async toggleReminderType(reminder: Reminder) {
    if (!reminder.id) return;

    try {
      await this.adminService.updateReminder(reminder.id, {
        type: reminder.type === 'active' ? 'inactive' : 'active'
      });
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  }

  cancelReminderForm() {
    this.showAddReminderForm = false;
    this.editingReminder = null;
    this.newReminderTitle = '';
    this.newReminderTime = '';
  }

  // ========== UTILITY METHODS ==========

  getTimeAgo(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  // ========== USER METHODS ==========

  async viewUserDetails(user: NewUser) {
    try {
      const details = await this.adminService.getUserDetails(user.id, user.type);
      if (details) {
        this.selectedUser = details;
        this.showUserModal = true;
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  }

  closeUserModal() {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  async deleteUserAccount() {
    if (!this.selectedUser) return;

    const userName = this.selectedUser.fullname || this.selectedUser.fincaname || this.selectedUser.email;
    const confirmMessage = `¿Estás seguro de que deseas eliminar la cuenta de ${userName}? Esta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      try {
        const success = await this.adminService.deleteUser(this.selectedUser.id, this.selectedUser.type);
        if (success) {
          alert('Usuario eliminado exitosamente');
          this.closeUserModal();
          this.loadNewUsers(); // Refresh the list
        } else {
          alert('Error al eliminar el usuario');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar el usuario');
      }
    }
  }

  private initializeDOMElements(): void {
    const sideMenu = document.querySelector('aside');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const darkMode = document.querySelector('.dark-mode');

    if (menuBtn && sideMenu) {
      menuBtn.addEventListener('click', () => {
        if (sideMenu instanceof HTMLElement) {
          sideMenu.style.display = 'block';
        }
      });
    }

    if (closeBtn && sideMenu) {
      closeBtn.addEventListener('click', () => {
        if (sideMenu instanceof HTMLElement) {
          sideMenu.style.display = 'none';
        }
      });
    }

    if (darkMode) {
      darkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode-variables');
        const icons = darkMode.querySelectorAll('i');
        icons.forEach(icon => icon.classList.toggle('active'));
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Rechazado':
        return 'danger';
      case 'Pendiente':
        return 'warning';
      default:
        return 'primary';
    }
  }
}
