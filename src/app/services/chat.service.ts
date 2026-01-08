import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDoc,
  serverTimestamp,
  CollectionReference,
  Query,
  DocumentData,
  getDocs,
  setDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: 'agricultor' | 'admin';
  timestamp: any;
  read?: boolean;
}

export interface Ticket {
  id?: string;
  farmerId: string;
  farmerName: string;
  adminId?: string;
  adminName?: string;
  status: 'pending' | 'active' | 'closed';
  createdAt: any;
  updatedAt: any;
  lastMessage?: string;
  unreadCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private ticketsCollection = collection(this.firestore, 'tickets');
  
  /**
   * Fetch user display name from specific collection
   * @param userId - UID of the user
   * @param role - 'agricultor' or 'admin'
   * @returns User's display name
   */
  async getUserName(userId: string, role: 'agricultor' | 'admin'): Promise<string> {
    try {
      const collectionName = role === 'agricultor' ? 'agricultores' : 'administradores';
      const userRef = doc(this.firestore, collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        // For admins: fetch 'nombre', for farmers: fetch 'fullname'
        if (role === 'admin') {
          return data['nombre'] || data['name'] || data['displayName'] || 'Administrador';
        } else {
          return data['fullname'] || data['name'] || data['displayName'] || 'Agricultor';
        }
      }
      return role === 'admin' ? 'Administrador' : 'Agricultor';
    } catch (error) {
      console.error('Error fetching user name:', error);
      return role === 'admin' ? 'Administrador' : 'Agricultor';
    }
  }

  /**
   * Fetch full farmer profile data from agricultores collection
   * @param farmerId - UID of the farmer
   * @returns Farmer profile data or null
   */
  async getFarmerProfile(farmerId: string): Promise<any | null> {
    try {
      const farmerRef = doc(this.firestore, 'agricultores', farmerId);
      const farmerSnap = await getDoc(farmerRef);
      
      if (farmerSnap.exists()) {
        return { uid: farmerSnap.id, ...farmerSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching farmer profile:', error);
      return null;
    }
  }

  /**
   * Get real-time farmer profile updates
   * @param farmerId - UID of the farmer
   * @returns Observable of farmer profile
   */
  getFarmerProfileRealtime(farmerId: string): Observable<any | null> {
    return new Observable(observer => {
      const farmerRef = doc(this.firestore, 'agricultores', farmerId);
      
      const unsubscribe = onSnapshot(farmerRef, 
        (snapshot) => {
          if (snapshot.exists()) {
            observer.next({ uid: snapshot.id, ...snapshot.data() });
          } else {
            observer.next(null);
          }
        },
        (error) => {
          console.error('Error getting farmer profile:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Fetch admin profile data from administradores collection
   * @param adminId - UID of the admin
   * @returns Admin profile data or null
   */
  async getAdminProfile(adminId: string): Promise<any | null> {
    try {
      const adminRef = doc(this.firestore, 'administradores', adminId);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        return { uid: adminSnap.id, ...adminSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      return null;
    }
  }

  /**
   * FARMER: Create a new support ticket
   * @returns Ticket ID
   */
  async createTicket(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const farmerName = await this.getUserName(user.uid, 'agricultor');

    const ticketData: Ticket = {
      farmerId: user.uid,
      farmerName: farmerName,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: 0,
      lastMessage: ''
    };

    const ticketRef = await addDoc(this.ticketsCollection, ticketData);
    console.log('✅ Ticket created:', ticketRef.id, 'for farmer:', user.uid);
    return ticketRef.id;
  }

  /**
   * FARMER: Get or create farmer's active ticket
   * @returns Ticket ID or null
   */
  async getFarmerActiveTicket(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user');
      return null;
    }

    console.log('🔍 Looking for active ticket for farmer:', user.uid);

    // Check if farmer already has an active or pending ticket
    const q = query(
      this.ticketsCollection,
      where('farmerId', '==', user.uid),
      where('status', 'in', ['pending', 'active'])
    );

    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const ticketId = snapshot.docs[0].id;
      console.log('✅ Found existing ticket:', ticketId);
      return ticketId;
    }

    console.log('➕ Creating new ticket');
    // Create new ticket if none exists
    return await this.createTicket();
  }

  /**
   * ADMIN: Get all pending tickets (unclaimed)
   * @returns Observable of pending tickets
   */
  getPendingTickets(): Observable<Ticket[]> {
    return new Observable(observer => {
      const q = query(
        this.ticketsCollection,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📥 Pending tickets received:', snapshot.docs.length);
          const tickets: Ticket[] = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('  - Ticket:', doc.id, 'Farmer:', data['farmerId'], 'LastMsg:', data['lastMessage']);
            return {
              id: doc.id,
              ...data
            } as Ticket;
          });
          observer.next(tickets);
        },
        (error) => {
          console.error('❌ Error getting pending tickets:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * ADMIN: Get all active tickets (claimed by any admin)
   * @returns Observable of active tickets
   */
  getActiveTickets(): Observable<Ticket[]> {
    return new Observable(observer => {
      const q = query(
        this.ticketsCollection,
        where('status', '==', 'active'),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const tickets: Ticket[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Ticket));
          observer.next(tickets);
        },
        (error) => {
          console.error('Error getting active tickets:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * ADMIN: Get tickets claimed by current admin
   * @returns Observable of admin's tickets
   */
  getMyTickets(): Observable<Ticket[]> {
    const user = this.auth.currentUser;
    if (!user) return new Observable(observer => observer.next([]));

    return new Observable(observer => {
      const q = query(
        this.ticketsCollection,
        where('adminId', '==', user.uid),
        where('status', '==', 'active'),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const tickets: Ticket[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Ticket));
          observer.next(tickets);
        },
        (error) => {
          console.error('Error getting my tickets:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * ADMIN: Claim a pending ticket
   * @param ticketId - ID of the ticket to claim
   */
  async claimTicket(ticketId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Admin not authenticated');

    const adminName = await this.getUserName(user.uid, 'admin');
    const ticketRef = doc(this.firestore, 'tickets', ticketId);

    await updateDoc(ticketRef, {
      adminId: user.uid,
      adminName: adminName,
      status: 'active',
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Close a ticket
   * @param ticketId - ID of the ticket to close
   */
  async closeTicket(ticketId: string): Promise<void> {
    const ticketRef = doc(this.firestore, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      status: 'closed',
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Send a message in a ticket
   * @param ticketId - Ticket ID
   * @param text - Message text
   * @param role - Sender role ('agricultor' or 'admin')
   */
  async sendMessage(ticketId: string, text: string, role: 'agricultor' | 'admin'): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    console.log('📤 Sending message - Ticket:', ticketId, 'Role:', role, 'User:', user.uid);

    const senderName = await this.getUserName(user.uid, role);
    
    const messagesCollection = collection(this.firestore, `tickets/${ticketId}/messages`);
    
    const messageData: Message = {
      text: text.trim(),
      senderId: user.uid,
      senderName: senderName,
      senderRole: role,
      timestamp: serverTimestamp(),
      read: false
    };

    await addDoc(messagesCollection, messageData);
    console.log('✅ Message added to subcollection');

    // Verify ticket exists before updating
    const ticketRef = doc(this.firestore, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);
    
    if (!ticketSnap.exists()) {
      console.error('❌ Ticket not found:', ticketId);
      throw new Error('Ticket no encontrado');
    }

    // Update ticket's last message and timestamp
    await updateDoc(ticketRef, {
      lastMessage: text.trim().substring(0, 100),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Ticket updated with lastMessage');
  }

  /**
   * Get real-time messages for a ticket
   * @param ticketId - Ticket ID
   * @returns Observable of messages
   */
  getMessages(ticketId: string): Observable<Message[]> {
    return new Observable(observer => {
      const messagesCollection = collection(this.firestore, `tickets/${ticketId}/messages`);
      const q = query(messagesCollection, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const messages: Message[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Message));
          observer.next(messages);
        },
        (error) => {
          console.error('Error getting messages:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Get ticket details
   * @param ticketId - Ticket ID
   * @returns Observable of ticket data
   */
  getTicketDetails(ticketId: string): Observable<Ticket | null> {
    return new Observable(observer => {
      const ticketRef = doc(this.firestore, 'tickets', ticketId);

      const unsubscribe = onSnapshot(ticketRef, 
        (snapshot) => {
          if (snapshot.exists()) {
            observer.next({ id: snapshot.id, ...snapshot.data() } as Ticket);
          } else {
            observer.next(null);
          }
        },
        (error) => {
          console.error('Error getting ticket details:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Mark messages as read
   * @param ticketId - Ticket ID
   */
  async markMessagesAsRead(ticketId: string): Promise<void> {
    const messagesCollection = collection(this.firestore, `tickets/${ticketId}/messages`);
    const q = query(messagesCollection, where('read', '==', false));
    
    const snapshot = await getDocs(q);
    
    const promises = snapshot.docs.map(docSnap => 
      updateDoc(doc(this.firestore, `tickets/${ticketId}/messages`, docSnap.id), { read: true })
    );
    
    await Promise.all(promises);
  }
}
