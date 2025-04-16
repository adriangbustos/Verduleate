import { Component, inject } from '@angular/core';
import { Database, ref, onValue, remove } from '@angular/fire/database';
import { CommonModule } from '@angular/common';

interface Message {
  sender: string;
  text: string;
  timestamp: number;
}

interface Chat {
  id: string;
  fullname?: string;
  messages?: Message[];
}

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html'
})
export class AdminChatComponent {
  db = inject(Database);
  chats: Chat[] = [];

  constructor() {
    const chatsRef = ref(this.db, 'chats');
    onValue(chatsRef, (snapshot) => {
      const allChats: Chat[] = [];
      snapshot.forEach(child => {
        const chatId = child.key!;
        const chatData = child.val();
        allChats.push({
          id: chatId,
          ...chatData
        });
      });
      this.chats = allChats;
    });
  }

  deleteChat(chatId: string) {
    remove(ref(this.db, `chats/${chatId}`));
  }
}
