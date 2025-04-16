import { Component, inject, OnInit } from '@angular/core';
import { Database, ref, push, set, onValue, child, get } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html'
})
export class SupportComponent implements OnInit {
  db = inject(Database);
  auth = inject(Auth);
  newMessage: string = '';
  chatId: string | null = null;
  message = '';
  messages: any[] = [];
  userData: any = null;

  ngOnInit(): void {
    const uid = this.auth.currentUser?.uid;
    if (uid) {
      const userRef = ref(this.db, `users/${uid}`);
      onValue(userRef, (snapshot) => {
        this.userData = snapshot.val();
        this.userData.uid = uid; // ✅ importante guardar uid también
      }, {
        onlyOnce: true
      });
    }
  }

  async startChat() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = ref(this.db, `users/${user.uid}`);
    const snap = await get(userRef);
    this.userData = snap.val();

    // Revisar si ya existe un chat
    const chatsRef = ref(this.db, 'chats');
    onValue(chatsRef, (snapshot) => {
      let found = false;
      snapshot.forEach(childSnap => {
        if (childSnap.val().userId === user.uid) {
          this.chatId = childSnap.key!;
          this.listenMessages();
          found = true;
        }
      });
      if (!found) this.createChat();
    }, { onlyOnce: true });
  }

  createChat() {
    if (!this.userData || !this.userData.fullname) {
      console.warn('No hay datos de usuario aún');
      return;
    }

    this.chatId = this.userData.uid;
    const chatRef = ref(this.db, `chats/${this.chatId}`);
    const newChat = {
      createdAt: Date.now(),
      userName: this.userData.fullname,
      userEmail: this.userData.email
    };
    set(chatRef, newChat);
    this.listenMessages(); // opcional: solo si quieres que inicie inmediatamente
  }

  sendMessage() {
    if (!this.userData || !this.userData.fullname) {
      console.error('Datos del usuario no disponibles');
      return;
    }

    const message = {
      sender: this.userData.fullname,
      text: this.newMessage,
      timestamp: Date.now()
    };

    const msgRef = ref(this.db, `chats/${this.chatId}/messages`);
    push(msgRef, message);
    this.newMessage = '';
  }

  listenMessages() {
    const msgRef = ref(this.db, `chats/${this.chatId}/messages`);
    onValue(msgRef, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((child) => {
        msgs.push(child.val()); // 👈 solo hacemos push, no return
      });
      this.messages = msgs;
    });
  }
}
