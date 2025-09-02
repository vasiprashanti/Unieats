import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Read the service account key from the file path specified in the .env file
const serviceAccount = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
);

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