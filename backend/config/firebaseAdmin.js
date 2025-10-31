import admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  try {
    // --- Construct service account object from environment variables ---
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    // Check that all required fields are set
    if (!serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error(
        "CRITICAL: Firebase environment variables are not properly set."
      );
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error(`Firebase Admin SDK initialization error: ${error.message}`);
    process.exit(1);
  }
};

export default initializeFirebaseAdmin;
