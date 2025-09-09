import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const initializeFirebaseAdmin = () => {
  try {
    // Get the path from the environment variable
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Add a check to ensure the variable exists
    if (!serviceAccountPath) {
      throw new Error(
        'The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.'
      );
    }

    // Read and parse the file inside the function
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error(`Firebase Admin SDK initialization error: ${error.message}`);
    // Exit the process with an error code
    process.exit(1);
  }
};

export default initializeFirebaseAdmin;