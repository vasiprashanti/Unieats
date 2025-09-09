// This function takes an array of allowed roles as arguments
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // We assume the verifyFirebaseToken middleware has already run
    // and attached the user's profile from our DB to req.user.
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // If the user object doesn't exist or their role is not in the allowed list,
      // send a 'Forbidden' error.
      return res.status(403).json({
        message: `Forbidden: Access requires one of the following roles: ${allowedRoles.join(
          ", "
        )}`,
      });
    }

    // If the user's role is allowed, continue to the next function.
    next();
  };
};

export { checkRole };
