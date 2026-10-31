const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyC0GIlssVm0jsFRaRLyrzmwAS3WSrcJ5so';
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || 'verduleate-4e5c0.firebaseapp.com';
const projectId = process.env.FIREBASE_PROJECT_ID || 'verduleate-4e5c0';
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'verduleate-4e5c0.firebasestorage.app';
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || '337862343335';
const appId = process.env.FIREBASE_APP_ID || '1:337862343335:web:82ec306acef5c4fb5e7982';

const content = `export const firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}"
};
`;

fs.writeFileSync(path.join(dir, 'environment.ts'), content);
console.log('Environment configuration generated at src/environments/environment.ts');
