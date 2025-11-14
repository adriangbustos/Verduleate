import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, limit, where, Timestamp, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Reminder {
  id?: string;
  title: string;
  time: string;
  type: 'active' | 'inactive';
  createdAt?: Date;
}

export interface NewUser {
  id: string;
  email: string;
  type: 'Comprador' | 'Agricultor';
  createdAt: Date;
  displayName?: string;
}

export interface UserDetails {
  id: string;
  email: string;
  type: 'Comprador' | 'Agricultor';
  fullname?: string;
  fincaname?: string;
  displayName?: string;
  creationDate?: Date;
  emailverificado?: boolean;
  onboarding?: boolean;
  cellphone?: string;
  address?: string;
  birthday?: Date;
  gender?: string;
  advertisements?: string;
  descripcionFinca?: string;
}

export interface AnalyticsData {
  users: {
    count: number;
    percentage: number;
  };
  visits: {
    count: number;
    percentage: number;
  };
  searches: {
    count: number;
    percentage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private firestore: Firestore) { }

  // ========== REMINDERS ==========

  async getReminders(): Promise<Reminder[]> {
    try {
      const remindersRef = collection(this.firestore, 'reminders');
      const q = query(remindersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()['createdAt']?.toDate()
      })) as Reminder[];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  async createReminder(reminder: Omit<Reminder, 'id'>): Promise<string> {
    try {
      const remindersRef = collection(this.firestore, 'reminders');
      const docRef = await addDoc(remindersRef, {
        ...reminder,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async updateReminder(id: string, reminder: Partial<Reminder>): Promise<void> {
    try {
      const reminderRef = doc(this.firestore, 'reminders', id);
      await updateDoc(reminderRef, reminder);
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  async deleteReminder(id: string): Promise<void> {
    try {
      const reminderRef = doc(this.firestore, 'reminders', id);
      await deleteDoc(reminderRef);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  // ========== NEW USERS ==========

  async getNewUsers(limitCount: number = 10): Promise<NewUser[]> {
    try {
      const users: NewUser[] = [];
      
      // Get compradores (buyers)
      const compradoresRef = collection(this.firestore, 'users');
      const compradoresQuery = query(compradoresRef, orderBy('emailverificado', 'desc'), limit(limitCount));
      const compradoresSnapshot = await getDocs(compradoresQuery);
      
      compradoresSnapshot.docs.forEach(doc => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data['email'] || '',
          type: 'Comprador',
          createdAt: data['creationDate']?.toDate() || new Date(),
          displayName: data['fullname'] || 'Usuario sin nombre'
        });
      });

      // Get agricultores (farmers)
      const agricultoresRef = collection(this.firestore, 'agricultores');
      const agricultoresQuery = query(agricultoresRef, orderBy('emailverificado', 'desc'), limit(limitCount));
      const agricultoresSnapshot = await getDocs(agricultoresQuery);
      
      agricultoresSnapshot.docs.forEach(doc => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data['email'] || '',
          type: 'Agricultor',
          createdAt: data['creationDate']?.toDate() || new Date(),
          displayName: data['fullname'] || data['fincaname'] || 'Usuario sin nombre'
        });
      });

      // Sort by creation date and limit
      return users
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting new users:', error);
      return [];
    }
  }

  // ========== ANALYTICS ==========

  async getAnalytics(): Promise<AnalyticsData> {
    try {
      // Get total users count for visits
      const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
      const agricultoresSnapshot = await getDocs(collection(this.firestore, 'agricultores'));
      const totalVisits = usersSnapshot.size + agricultoresSnapshot.size;

      // Get products count for searches
      const productsSnapshot = await getDocs(collection(this.firestore, 'productos'));
      const totalSearches = productsSnapshot.size * 10; // Estimate based on products

      // Calculate total registered users
      const totalUsers = usersSnapshot.size + agricultoresSnapshot.size;

      return {
        users: {
          count: totalUsers,
          percentage: 0 // This should be calculated from previous period
        },
        visits: {
          count: totalVisits,
          percentage: -48 // This should be calculated from previous period
        },
        searches: {
          count: totalSearches,
          percentage: 21 // This should be calculated from previous period
        }
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        users: { count: 0, percentage: 0 },
        visits: { count: 0, percentage: 0 },
        searches: { count: 0, percentage: 0 }
      };
    }
  }

  // ========== USER DETAILS & DELETION ==========

  async getUserDetails(userId: string, userType: 'Comprador' | 'Agricultor'): Promise<UserDetails | null> {
    try {
      const collectionName = userType === 'Comprador' ? 'users' : 'agricultores';
      const userRef = doc(this.firestore, collectionName, userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        return {
          id: userSnapshot.id,
          email: data['email'] || '',
          type: userType,
          fullname: data['fullname'],
          fincaname: data['fincaname'],
          displayName: data['displayName'],
          creationDate: data['creationDate']?.toDate(),
          emailverificado: data['emailverificado'],
          onboarding: data['onboarding'],
          cellphone: data['cellphone'],
          address: data['address'],
          birthday: data['birthday']?.toDate(),
          gender: data['gender']?.gender,
          advertisements: data['ads']?.advertisements,
          descripcionFinca: data['descripcionFinca']
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  }

  async deleteUser(userId: string, userType: 'Comprador' | 'Agricultor'): Promise<boolean> {
    try {
      const collectionName = userType === 'Comprador' ? 'users' : 'agricultores';
      const userRef = doc(this.firestore, collectionName, userId);
      await deleteDoc(userRef);
      console.log(`User ${userId} deleted from ${collectionName}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // ========== REAL-TIME LISTENERS ==========

  listenToNewUsers(callback: (users: NewUser[]) => void): () => void {
    const unsubscribers: (() => void)[] = [];

    // Listen to compradores
    const usersRef = collection(this.firestore, 'users');
    const usersQuery = query(usersRef, orderBy('emailverificado', 'desc'), limit(5));
    
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      this.getNewUsers(10).then(callback);
    });
    unsubscribers.push(unsubUsers);

    // Listen to agricultores
    const agricultoresRef = collection(this.firestore, 'agricultores');
    const agricultoresQuery = query(agricultoresRef, orderBy('emailverificado', 'desc'), limit(5));
    
    const unsubAgricultores = onSnapshot(agricultoresQuery, (snapshot) => {
      this.getNewUsers(10).then(callback);
    });
    unsubscribers.push(unsubAgricultores);

    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  listenToReminders(callback: (reminders: Reminder[]) => void): () => void {
    const remindersRef = collection(this.firestore, 'reminders');
    const q = query(remindersRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const reminders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()['createdAt']?.toDate()
      })) as Reminder[];
      callback(reminders);
    });
  }
}
