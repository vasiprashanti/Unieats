import admin from "firebase-admin";
import User from "../models/User.model.js"; // Import our User model

/**
 * Middleware to verify a Firebase ID token.
 * This confirms the user's identity and attaches their user profile from our database to the request object.
 * This is the AUTHENTICATION step.
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  // console.log("Backend", idToken);

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
    // This makes it available for the next middleware (like checkRole)
    req.user = user;

    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token has expired." });
    }
      return res.status(403).json({ message: "Forbidden: Invalid token." ,payLoad:{error}});
  }
};

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * This should run AFTER verifyFirebaseToken.
 * This is the AUTHORIZATION step.
 * @param {...string} allowedRoles A list of roles allowed to access the route (e.g., 'admin', 'manager').
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // We assume the verifyFirebaseToken middleware has already run
    // and attached the user's profile from our DB to req.user.
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // If the user object doesn't exist or their role is not in the allowed list,
      // send a 'Forbidden' error.
      return res.status(403).json({
        message: `Forbidden: Access requires one of the following roles: ${allowedRoles.join(
          ', '
        )}`,
      });
    }

    // If the user's role is allowed, continue to the next function.
    next();
  };
};

// Export both functions so they can be imported elsewhere
export { verifyFirebaseToken, checkRole };
