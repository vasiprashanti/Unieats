import admin from 'firebase-admin';

// Use the correct Firebase Admin SDK service account object
// Replace the placeholder values below with your actual service account credentials
const serviceAccount = {
  "type": "service_account",
  "project_id": "<YOUR_PROJECT_ID>",
  "private_key_id": "<YOUR_PRIVATE_KEY_ID>",
  "private_key": "<YOUR_PRIVATE_KEY>",
  "client_email": "<YOUR_CLIENT_EMAIL>",
  "client_id": "<YOUR_CLIENT_ID>",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "<YOUR_CLIENT_X509_CERT_URL>"
};

// To get these credentials, download the service account JSON from Firebase Console > Project Settings > Service Accounts.

const initializeFirebaseAdmin = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error(`Firebase Admin SDK initialization error: ${error.message}`);
    process.exit(1);
  }
};

export default initializeFirebaseAdmin;