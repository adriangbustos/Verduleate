import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserSession {
  uid: string;
  email: string | null;
  userData?: any;
  userType: 'agricultor' | 'comprador' | null;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionSubject = new BehaviorSubject<UserSession | null>(null);
  public session$ = this.sessionSubject.asObservable();

  constructor() {
    // Inicializar con datos guardados si existen (opcional)
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    // Este método es opcional si quieres persistir datos en localStorage
    // Por ahora, confiaremos en Firebase Auth como fuente de verdad
  }

  setSession(session: UserSession) {
    this.sessionSubject.next(session);
  }

  getSession(): UserSession | null {
    return this.sessionSubject.value;
  }

  clearSession() {
    this.sessionSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.sessionSubject.value !== null;
  }
}
