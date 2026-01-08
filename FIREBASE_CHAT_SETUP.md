# 🔥 Firebase Chat System - Security Rules & Setup Guide

## 📋 Table of Contents
1. [Firestore Database Structure](#firestore-database-structure)
2. [Security Rules](#security-rules)
3. [Implementation Summary](#implementation-summary)
4. [Setup Instructions](#setup-instructions)
5. [Testing Guide](#testing-guide)

---

## 🗂️ Firestore Database Structure

### Collection: `tickets`
```
tickets/
  {ticketId}/
    farmerId: string          // UID of the farmer
    farmerName: string         // Display name from agricultores collection
    adminId?: string           // UID of admin (null if pending)
    adminName?: string         // Display name from administradores collection
    status: 'pending' | 'active' | 'closed'
    createdAt: Timestamp
    updatedAt: Timestamp
    lastMessage?: string       // Preview of last message
    unreadCount?: number       // Count of unread messages
    
    messages/                  // Subcollection
      {messageId}/
        text: string
        senderId: string       // UID of sender
        senderName: string     // Display name
        senderRole: 'agricultor' | 'admin'
        timestamp: Timestamp
        read: boolean
```

### Existing Collections (User Data)
```
agricultores/
  {uid}/
    name: string              // Farmer's display name
    email: string
    // ... other fields

administradores/
  {uid}/
    name: string              // Admin's display name
    email: string
    // ... other fields
```

---

## 🔐 Firebase Security Rules

### Firestore Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/administradores/$(request.auth.uid));
    }
    
    function isFarmer() {
      return isSignedIn() && exists(/databases/$(database)/documents/agricultores/$(request.auth.uid));
    }
    
    // Tickets Collection Rules
    match /tickets/{ticketId} {
      // Allow farmers to create tickets
      allow create: if isFarmer() && 
                      request.resource.data.farmerId == request.auth.uid &&
                      request.resource.data.status == 'pending';
      
      // Allow farmers to read their own tickets
      // Allow admins to read all tickets
      allow read: if (isFarmer() && resource.data.farmerId == request.auth.uid) ||
                     isAdmin();
      
      // Allow admins to update tickets (claim, close)
      // Allow farmers to update their pending tickets
      allow update: if (isAdmin()) ||
                       (isFarmer() && resource.data.farmerId == request.auth.uid && 
                        resource.data.status == 'pending');
      
      // Messages Subcollection
      match /messages/{messageId} {
        // Allow create if user is the farmer of the ticket OR is an admin with the ticket
        allow create: if isSignedIn() && 
                        ((isFarmer() && get(/databases/$(database)/documents/tickets/$(ticketId)).data.farmerId == request.auth.uid) ||
                         (isAdmin() && get(/databases/$(database)/documents/tickets/$(ticketId)).data.adminId == request.auth.uid));
        
        // Allow read if user is the farmer OR admin assigned to ticket
        allow read: if isSignedIn() &&
                      ((isFarmer() && get(/databases/$(database)/documents/tickets/$(ticketId)).data.farmerId == request.auth.uid) ||
                       (isAdmin() && (get(/databases/$(database)/documents/tickets/$(ticketId)).data.adminId == request.auth.uid || 
                                     get(/databases/$(database)/documents/tickets/$(ticketId)).data.status == 'pending')));
        
        // Allow update for marking messages as read
        allow update: if isSignedIn() &&
                        ((isFarmer() && get(/databases/$(database)/documents/tickets/$(ticketId)).data.farmerId == request.auth.uid) ||
                         (isAdmin() && get(/databases/$(database)/documents/tickets/$(ticketId)).data.adminId == request.auth.uid));
      }
    }
    
    // Read-only access to user collections (for fetching display names)
    match /agricultores/{userId} {
      allow read: if isSignedIn();
    }
    
    match /administradores/{userId} {
      allow read: if isSignedIn();
    }
  }
}
```

---

## 📦 Implementation Summary

### ✅ Files Created/Modified

#### 1. **Shared Service** - `src/app/services/chat.service.ts`
- **Purpose**: Centralized Firebase operations for chat functionality
- **Key Features**:
  - Fetches user names from specific Firestore collections
  - Manages ticket lifecycle (create, claim, close)
  - Real-time message synchronization using `onSnapshot`
  - Type-safe interfaces for Ticket and Message
  - Separation of farmer and admin operations

#### 2. **Farmer Interface** - `src/app/sistemaagricultor/support/`
- **Component**: `support.component.ts`
- **Template**: `support.component.html`
- **Styles**: `support.component.css`
- **Features**:
  - Auto-creates or resumes farmer's active ticket
  - Real-time message updates
  - Clean, user-friendly chat interface
  - Status indicators (pending/active/closed)
  - Responsive design

#### 3. **Admin Interface** - `src/app/sistemaadmin/chat/`
- **Component**: `chat.component.ts`
- **Template**: `chat.component.html`
- **Styles**: `chat.component.css`
- **Features**:
  - Three-tab system: Pending, Active, My Tickets
  - Ticket claiming mechanism
  - Real-time ticket list updates
  - Chat interface with farmer details
  - Ticket closing capability
  - Professional dashboard UI

---

## 🚀 Setup Instructions

### Step 1: Deploy Firestore Rules

1. Navigate to your project root:
   ```bash
   cd c:\Users\Adrian\Documents\Coding\Proyectos\VERDULEATE
   ```

2. Create/update `firestore.rules` file with the security rules provided above.

3. Deploy rules to Firebase:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 2: Verify Firebase Configuration

Ensure your Firebase configuration in `src/environments/environment.ts` is correct:
```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyC0GIlssVm0jsFRaRLyrzmwAS3WSrcJ5so",
  authDomain: "verduleate-4e5c0.firebaseapp.com",
  projectId: "verduleate-4e5c0",
  storageBucket: "verduleate-4e5c0.firebasestorage.app",
  messagingSenderId: "337862343335",
  appId: "1:337862343335:web:82ec306acef5c4fb5e7982"
}
```

### Step 3: Install Dependencies (if needed)

```bash
npm install @angular/fire firebase
```

### Step 4: Update Routes (Optional)

Ensure your routes are configured:

**Farmer Route** (`sistemaagricultor.routes.ts`):
```typescript
{
  path: 'support',
  component: SupportComponent,
  canActivate: [authAgricultorGuard]
}
```

**Admin Route** (`sistemaadmin.routes.ts`):
```typescript
{
  path: 'chat',
  component: ChatComponent,
  canActivate: [authAdminGuard]
}
```

---

## 🧪 Testing Guide

### Test Scenario 1: Farmer Creates Ticket

1. **Login as Farmer**
   - Navigate to farmer support page
   - Component auto-creates ticket on load

2. **Send First Message**
   - Type message and press Enter or click Send
   - Verify message appears in chat
   - Check Firestore: ticket status should be "pending"

3. **Verify Real-time Updates**
   - Open Firestore console
   - Check `tickets` collection for new document
   - Verify `messages` subcollection

### Test Scenario 2: Admin Claims Ticket

1. **Login as Admin**
   - Navigate to admin chat panel
   - Verify "Pendientes" tab shows farmer's ticket

2. **Claim Ticket**
   - Click "Tomar Ticket" button
   - Verify ticket moves to "Mis Tickets" tab
   - Check Firestore: ticket status should be "active"
   - Admin name should be populated

3. **Send Response**
   - Open claimed ticket
   - Send message to farmer
   - Verify real-time update

### Test Scenario 3: Two-Way Communication

1. **Farmer Side**
   - Send message
   - Verify status changes to "Conectado con [Admin Name]"

2. **Admin Side**
   - Receive message in real-time
   - Reply to farmer
   - Verify message appears immediately

3. **Close Ticket**
   - Admin clicks "Cerrar" button
   - Verify both sides show "Chat cerrado"
   - Message input should be disabled

### Test Scenario 4: Multiple Admins

1. **Login with Admin 1**
   - View pending tickets

2. **Login with Admin 2** (different browser)
   - View same pending tickets

3. **Admin 1 Claims Ticket**
   - Verify ticket disappears from Admin 2's pending list
   - Only Admin 1 can see it in "Mis Tickets"

---

## 📊 Database Indexes (Recommended)

Create composite indexes for optimal performance:

### Index 1: Pending Tickets Query
- **Collection**: `tickets`
- **Fields**: 
  - `status` (Ascending)
  - `createdAt` (Descending)

### Index 2: Admin's Active Tickets
- **Collection**: `tickets`
- **Fields**:
  - `adminId` (Ascending)
  - `status` (Ascending)
  - `updatedAt` (Descending)

### Index 3: Farmer's Tickets
- **Collection**: `tickets`
- **Fields**:
  - `farmerId` (Ascending)
  - `status` (Ascending)

Firebase will automatically prompt you to create these indexes when you run queries that require them.

---

## 🎯 Key Features Implemented

### ✅ Architecture
- ✅ Modular TypeScript service with separation of concerns
- ✅ Firebase v9+ Modular SDK
- ✅ Real-time synchronization with `onSnapshot`
- ✅ Type-safe interfaces (Ticket, Message)
- ✅ Proper subscription management (prevent memory leaks)

### ✅ Security
- ✅ Authentication required for all operations
- ✅ Role-based access control (Farmer vs Admin)
- ✅ Firestore security rules enforce data isolation
- ✅ User display names fetched from specific collections

### ✅ User Experience
- ✅ Auto-scroll to latest messages
- ✅ Real-time message delivery
- ✅ Professional, responsive UI
- ✅ Loading and error states
- ✅ Ticket status indicators

### ✅ Admin Features
- ✅ Ticket claiming mechanism
- ✅ Three-tab organization (Pending/Active/My)
- ✅ Real-time ticket list updates
- ✅ Ticket closing capability
- ✅ Multiple admin support

### ✅ Free Tier Optimization
- ✅ Efficient queries with proper indexing
- ✅ Subcollections for messages (better data organization)
- ✅ Minimal read/write operations
- ✅ No continuous polling (uses Firebase listeners)

---

## 🔧 Troubleshooting

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy Firestore security rules and ensure user is authenticated.

### Issue: Display name shows "Usuario"
**Solution**: Verify user document exists in `agricultores` or `administradores` collection with a `name` field.

### Issue: Messages not updating in real-time
**Solution**: 
1. Check browser console for errors
2. Verify Firebase configuration
3. Ensure component subscriptions are active

### Issue: Composite index required
**Solution**: Click the Firebase console link in the error message to auto-create the index.

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## 🎉 System Ready!

Your dual-interface real-time chat system is now complete and follows industry best practices for customer service applications. The system is optimized for Firebase's free tier and provides a professional, scalable solution for farmer-admin communication.

**Next Steps**:
1. Deploy Firestore security rules
2. Test both farmer and admin interfaces
3. Monitor Firebase usage in the console
4. Adjust styling to match your brand guidelines
