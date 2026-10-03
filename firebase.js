import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

// Copy these four public values from your Firebase web app configuration.
const firebaseConfig = {
  apiKey: 'AIzaSyDLicZqTOXLb7bhzXf2NqnjU0Frz1QwdJ4',
  authDomain: 'timematcher-dd626.firebaseapp.com',
  projectId: 'timematcher-dd626',
  appId: '1:283869613827:web:413a614d32dd42f5176336'
};

export const configured = firebaseConfig.apiKey !== 'YOUR_API_KEY';
const app = configured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
