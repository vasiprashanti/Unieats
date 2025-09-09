import admin from "firebase-admin";
import User from "../models/User.model.js"; // Import our User model

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  console.log("Backend", idToken);

  try {
    // 1. Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 2. Use the UID from the token to find the user in OUR database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    // 3. If the user doesn't exist in our DB, they can't proceed
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not found in database." });
    }

    // 4. Attach OUR user object (with the role) to the request
    req.user = user;

    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token has expired." });
    }
    return res.status(403).json({ message: "Forbidden: Invalid token." });
  }
};

export { verifyFirebaseToken };
