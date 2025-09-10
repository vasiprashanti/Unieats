// backend/middleware/devAuth.js
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";

//This is a development middleware to bypass auth in dev environment
//To use this, set SKIP_AUTH=true in your .env file and remove verifyFirebaseToken from routes you want to test and restart the server
//This currently supports testing user and vendor roles.
const devAuth = async (req, res, next) => {
  // Only run if SKIP_AUTH=true
  if (process.env.SKIP_AUTH !== "true") return next();

  // Create a sample user for testing user endpoints
  const userUid = "dev-user-1";
  let user = await User.findOne({ firebaseUid: userUid });
  if (!user) {
    user = await User.create({
      firebaseUid: userUid,
      email: "devuser@local.test",
      name: "Dev User",
      role: "user",
      addresses: [
        {
          street: "456 User St",
          city: "User City",
          state: "User State",
          zipCode: "654321",
          isDefault: true,
        },
        {
          street: "789 Second St",
          city: "User City",
          state: "User State",
          zipCode: "654322",
          isDefault: false,
        },
      ],
      paymentMethods: [
        {
          type: "upi",
          upiId: "devuser@upi",
          isDefault: true,
        },
        {
          type: "cashonDelivery",
          isDefault: false,
        },
      ],
      favorites: [], // You can add vendor ObjectIds here if needed
    });
  }
  req.user = user;

  // Create a sample vendor for vendor endpoints
  const vendorUid = "dev-uid-1";
  let vendorOwner = await User.findOne({ firebaseUid: vendorUid });
  if (!vendorOwner) {
    vendorOwner = await User.create({
      firebaseUid: vendorUid,
      email: "dev@local.test",
      name: "Dev Vendor",
      role: "vendor",
      addresses: [
        {
          street: "123 Main St",
          city: "Test City",
          state: "Test State",
          zipCode: "123456",
          isDefault: true,
        },
      ],
    });
  }
  let vendor = await Vendor.findOne({ owner: vendorOwner._id });
  if (!vendor) {
    vendor = await Vendor.create({
      owner: vendorOwner._id,
      businessName: "Dev Vendor Restaurant",
      phone: "9876543210",
      cuisineType: ["Indian", "Chinese"],
      businessAddress: {
        street: "123 Main St",
        city: "Test City",
        state: "Test State",
        zipCode: "123456",
      },
      approvalStatus: "approved",
      operatingHours: [
        { day: "Monday", open: "09:00", close: "22:00" },
        { day: "Tuesday", open: "09:00", close: "22:00" },
      ],
      documents: {
        businessLicense: {
          url: "https://dummyurl.com/license.pdf",
          public_id: "sample_license_id",
        },
        foodSafetyCertificate: {
          url: "https://dummyurl.com/certificate.pdf",
          public_id: "sample_certificate_id",
        },
      },
    });
  }

  next();
};

export default devAuth;
