// auth.service.ts
import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, UserCredential, sendPasswordResetEmail, signOut, deleteUser } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/environment';
import { Firestore, collection, addDoc, doc, setDoc, updateDoc, getDoc, getDocs, where, query, onSnapshot, DocumentSnapshot, Timestamp, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Password } from 'primeng/password';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth: Auth;
  public isUserAuthenticatedSubject = new BehaviorSubject<boolean>(false);


  user: User | null = null; // Almacenar el usuario

  constructor(
    private firestore: Firestore,
    private router: Router // Inyecta Router en el constructor
  ) {
    const app = initializeApp(firebaseConfig); // Inicializa la app de Firebase
    this.auth = getAuth(app); // Obtiene la instancia de autenticación
  }

  async deleteUserAccount(): Promise<boolean> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error("No hay un usuario autenticado.");
      }

      // Intentar eliminar la cuenta del usuario en Firebase Authentication
      await deleteUser(user);
      console.log("Cuenta de usuario eliminada de Firebase Authentication.");

      // Si se eliminó correctamente, proceder con Firestore
      const userRef = doc(this.firestore, 'users', user.uid);
      const agricultorRef = doc(this.firestore, 'agricultores', user.uid);

      const userSnapshot = await getDoc(userRef);
      const agricultorSnapshot = await getDoc(agricultorRef);

      if (userSnapshot.exists()) {
        await deleteDoc(userRef);
        console.log("Usuario eliminado de la colección 'users'.");
      }

      if (agricultorSnapshot.exists()) {
        await deleteDoc(agricultorRef);
        console.log("Usuario eliminado de la colección 'agricultores'.");
      }

      return true;
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      return false;
    }
  }

  async logout(): Promise<void> {
    const user = this.getCurrentUser();

    if (user) {
      try {
        await signOut(this.auth); // Solo cierra sesión, sin redirigir
        console.log('Usuario cerró sesión con éxito');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw new Error('Error al cerrar sesión');
      }
    } else {
      console.error('No hay usuario autenticado para cerrar sesión');
    }
  }

  isAuthenticatedPromise(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          console.log(user)
          this.isUserAuthenticatedSubject.next(true);
          resolve(true); // Usuario autenticado
        } else {
          this.isUserAuthenticatedSubject.next(false);
          resolve(false); // Usuario no autenticado
        }
      });
    });
  }


  async sendRecoveryEmailCompradores(email: string): Promise<void> {
    try {
      // Directly send a password reset email using Firebase Authentication
      await sendPasswordResetEmail(this.auth, email);
      console.log('Correo de recuperación enviado con éxito a:', email);
    } catch (error) {
      console.error('Error enviando el correo de recuperación:', error);
      throw error;
    }
  }

  async sendRecoveryEmailAgricultores(email: string): Promise<void> {
    try {
      // Directly send a password reset email using Firebase Authentication
      await sendPasswordResetEmail(this.auth, email);
      console.log('Correo de recuperación enviado con éxito a:', email);
    } catch (error) {
      console.error('Error enviando el correo de recuperación:', error);
      throw error;
    }
  }

  async loginWithGoogleCompradores() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // Verificar si la cuenta ya existe en "agricultores"
      const agricultoresRef = doc(this.firestore, 'agricultores', user.uid);
      const agricultoresSnapshot = await getDoc(agricultoresRef);

      if (agricultoresSnapshot.exists()) {
        return { success: false, message: 'Esta cuenta de Google ya está registrada en el sistema de agricultores.' };
      }

      // Si el usuario no está en "agricultores", continuar con el flujo normal
      if (additionalInfo?.isNewUser) {
        await this.createDocument('users', user.uid, {
          email: user.email,
          uid: user.uid,
          onboarding: false,
          emailverificado: true,
        });
      }

      // Verificar el estado del onboarding
      const userRef = doc(this.firestore, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const onboarding = userData?.['onboarding'];

        if (onboarding === false) {
          this.router.navigate(['comprador/onboarding-comprador']);
        } else {
          this.router.navigate(['comprador/main-comprador']);
        }
      } else {
        console.error('No se encontraron datos del usuario en Firestore');
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      return { success: false, message: 'Ocurrió un error al iniciar sesión con Google.' };
    }
  }

  async loginWithGoogleAgricultores() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user2 = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // Verificar si la cuenta ya existe en "compradores"
      const compradoresRef = doc(this.firestore, 'users', user2.uid);
      const compradoresSnapshot = await getDoc(compradoresRef);

      if (compradoresSnapshot.exists()) {
        return { success: false, message: 'Esta cuenta de Google ya está registrada en el sistema de compradores.' };
      }

      // Si el usuario no está en "compradores", continuar con el flujo normal
      if (additionalInfo?.isNewUser) {
        console.log('Nuevo usuario registrado con Google:', user2);
        await this.createDocument('agricultores', user2.uid, {
          email: user2.email,
          uid: user2.uid,
          onboarding: false,
          emailverificado: true,
        });
      }

      // Verificar el estado del onboarding
      const userRef = doc(this.firestore, 'agricultores', user2.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const onboarding = userData?.['onboarding'];

        if (onboarding === false) {
          this.router.navigate(['agricultor/onboarding-agricultor']);
        } else {
          this.router.navigate(['agricultor/main-agricultor']);
        }
      } else {
        console.error('No se encontraron datos del usuario en Firestore');
      }

      return { success: true, user: user2 };
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      return { success: false, message: 'Ocurrió un error al iniciar sesión con Google.' };
    }
  }



  async signInAgricultores(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Verificar si el usuario está en la colección 'agricultores'
      const userDoc: DocumentSnapshot = await getDoc(doc(this.firestore, 'agricultores', user.uid));

      if (!userDoc.exists()) {
        throw new Error('Access denied: User not found in agricultores collection.');
      }

      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signInCompradores(email: string, password: string): Promise<User> {
    try {
      // Autenticación del usuario
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Verificar si el usuario está en la colección 'users'
      const userDoc: DocumentSnapshot = await getDoc(doc(this.firestore, 'users', user.uid));

      if (!userDoc.exists()) {
        throw new Error('Access denied: User not found in users collection.');
      }

      // Si el usuario existe en la colección 'users', puedes devolver el usuario
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential; // Ahora devuelve el objeto completo
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }
  // Método para guardar datos en una colección específica
  async createDocument(nombreColeccion: string, id: string, datos: any): Promise<void> {
    try {
      const coleccionRef = collection(this.firestore, nombreColeccion);
      const docRef = doc(coleccionRef, id);
      await setDoc(docRef, datos);
      console.log('Documento guardado con ID:', docRef.id);
    } catch (error) {
      console.error('Error al guardar el documento:', error);
    }
  }

  async createDocumentWithId(nombreColeccion: string, datos: any): Promise<void> {
    try {
      const coleccionRef = collection(this.firestore, nombreColeccion);
      await addDoc(coleccionRef, datos);
    } catch (error) {
      console.error('Error al guardar el documento:', error);
    }
  }



  // Método para actualizar un documento
  async updateDocument(nombreColeccion: string, id: string, datos: any): Promise<void> {
    try {
      const coleccionRef = collection(this.firestore, nombreColeccion);
      const docRef = doc(coleccionRef, id);
      await updateDoc(docRef, datos);
      console.log('Documento actualizado con ID:', docRef.id);
    } catch (error) {
      console.error('Error al actualizar el documento:', error);
    }
  }

  //Obtenemos un documento por ID

  async getDocument(nombreColeccion: string, id: string): Promise<any> {
    try {
      const docRef = doc(this.firestore, nombreColeccion, id); // Referencia al documento
      const docSnap = await getDoc(docRef); // Obtener el documento

      if (docSnap.exists()) {
        return docSnap.data(); //Retornar los datos del documento
      } else {
        return null; // Retornar null si no se encuentra el documento
      }
    } catch (error) {
      console.error('Error al obtener el documento:', error);
      throw error; // Re-lanzar el error para manejarlo más arriba si es necesario
    }
  }

  async getCollection(nombreColeccion: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, nombreColeccion); // Referencia a la colección
      const querySnapshot = await getDocs(colRef); // Obtener los documentos de la colección
      const documentos = querySnapshot.docs.map(doc => ({
        id: doc.id, // Agregar el ID del documento
        ...doc.data(), // Agregar los datos del documento
      }));
      return documentos; // Retornar los documentos en un array
    } catch (error) {
      console.error('Error al obtener la colección:', error);
      throw error; // Re-lanzar el error para manejarlo más arriba si es necesario
    }
  }

  async addSubCollectionDocument(collectionName: string, documentId: string, subCollectionName: string, data: any): Promise<void> {
    try {
      // Referencia al documento principal (padre)
      const docRef = doc(this.firestore, collectionName, documentId);

      // Referencia a la subcolección dentro de ese documento
      const subCollectionRef = collection(docRef, subCollectionName);

      // Crear el nuevo documento en la subcolección
      await addDoc(subCollectionRef, data);
      console.log('Documento creado en la subcolección.');
    } catch (error) {
      console.error('Error al agregar documento en la subcolección:', error);
    }
  }



  // Devuelve true si hay un usuario autenticado
  isAuthenticated() {
    return this.isUserAuthenticatedSubject.asObservable();
  }

  // Método para obtener el usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser; // Retorna el usuario actual o null
  }

  // Nuevo método que retorna un Observable del usuario actual
  getCurrentUserObservable(): Observable<User | null> {
    return new Observable<User | null>(observer => {
      const unsubscribe = onAuthStateChanged(this.auth, 
        (user) => {
          observer.next(user);
        },
        (error) => {
          console.error('Auth state error:', error);
          observer.error(error);
        }
      );
      
      // Return cleanup function
      return () => unsubscribe();
    });
  }

  async getUserData(userId: string) {
    try {
      const userRef = doc(this.firestore, 'users', userId); // Obtén la referencia del documento
      const userSnapshot = await getDoc(userRef); // Obtiene los datos del usuario

      if (userSnapshot.exists()) {
        return userSnapshot.data(); // Devuelve los datos del usuario
      } else {
        console.log('El usuario no existe en Firestore');
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }

  async getAgricultorData(userId: string) {
    try {
      const userRef = doc(this.firestore, 'agricultores', userId); // Obtén la referencia del documento
      const userSnapshot = await getDoc(userRef); // Obtiene los datos del usuario

      if (userSnapshot.exists()) {
        return userSnapshot.data(); // Devuelve los datos del usuario
      } else {
        console.log('El usuario no existe en Firestore');
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }
}