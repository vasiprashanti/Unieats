import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

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

    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error(`Firebase Admin SDK initialization error: ${error.message}`);
    // Exit the process with an error code
    process.exit(1);
  }
};

export default initializeFirebaseAdmin;
