import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const initializeFirebaseAdmin = () => {
  try {
    // --- The Single Source of Truth ---
    // Get the path to the complete credentials file from the environment variable.
    // This is the official, recommended way to do this.
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Add a clear check to ensure the variable is actually set.
    if (!serviceAccountPath) {
      throw new Error(
        'CRITICAL: The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Please point it to your serviceAccountKey.json file.'
      );
    }

    // Read and parse the file. This method is robust and handles all formatting correctly.
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath));

    // Initialize the app with the credentials from the file.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error(`Firebase Admin SDK initialization error: ${error.message}`);
    // Exit the process with a failure code, as the app cannot run without this.
    process.exit(1);
  }
};

export default initializeFirebaseAdmin;