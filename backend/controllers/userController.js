import User from "../models/User.model.js";

// GET USER PROFILE CONTROLLER
// const getMe = async (req, res) => {
//   try {
//     // The middleware may attach either the full user object or the decoded token.
//     // Prefer our stored user's firebaseUid, fall back to token uid if present.
//     const firebaseUid = req.user?.firebaseUid || req.user?.uid;

//     if (!firebaseUid) {
//       return res.status(401).json({ message: "Unauthorized: missing user." });
//     }

//     // Find the user and populate favorites (restaurants) with useful public fields
//     const user = await User.findOne({ firebaseUid })
//       .select("-password -__v")
//       .populate({
//         path: "favorites",
//         // pick common vendor fields; if a field doesn't exist it's harmless
//         select: "businessName cuisine location isOpen logo averageRating",
//       });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found in our database." });
//     }

//     // Return structured response including populated favorites
//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// UPDATE current user's profile
const updateMe = async (req, res) => {
  try {
    // basic validation
    const { name, email } = req.body;
    const errors = [];
    if (name !== undefined && String(name).trim().length < 2) {
      errors.push({
        field: "name",
        message: "Name must be at least 2 characters long",
      });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: "email", message: "Valid email is required" });
    }
    if (errors.length) return res.status(400).json({ errors });

    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Only allow updating certain fields
    const allowedFields = [
      "name",
      "email",
      "addresses",
      "paymentMethods",
      "favorites",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        paymentMethods: user.paymentMethods,
        favorites: user.favorites,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ADD a new address
const addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, isDefault } = req.body;
    const errors = [];
    if (!street)
      errors.push({ field: "street", message: "Street is required" });
    if (!city) errors.push({ field: "city", message: "City is required" });
    if (!state) errors.push({ field: "state", message: "State is required" });
    if (!zipCode || zipCode.length < 5)
      errors.push({ field: "zipCode", message: "Valid zipCode is required" });
    if (errors.length) return res.status(400).json({ errors });

    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default automatically
    const isFirstAddress = user.addresses.length === 0;

    const newAddress = {
      street,
      city,
      state,
      zipCode,
      isDefault: isDefault || isFirstAddress,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully.",
      address: newAddress,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// UPDATE an address by ID
const updateAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, isDefault } = req.body;
    const errors = [];
    if (street !== undefined && String(street).trim() === "")
      errors.push({ field: "street", message: "Street cannot be empty" });
    if (city !== undefined && String(city).trim() === "")
      errors.push({ field: "city", message: "City cannot be empty" });
    if (state !== undefined && String(state).trim() === "")
      errors.push({ field: "state", message: "State cannot be empty" });
    if (
      zipCode !== undefined &&
      (String(zipCode).length < 5 || String(zipCode).length > 10)
    )
      errors.push({ field: "zipCode", message: "Valid zipCode is required" });
    if (errors.length) return res.status(400).json({ errors });

    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    // If setting this address as default, unset all others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update address fields
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      message: "Address updated successfully.",
      address: address,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE an address by ID
const deleteAddress = async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If deleted address was default and there are other addresses,
    // make the first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      message: "Address deleted successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// GET all addresses
const getAddresses = async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// SET default address
const setDefaultAddress = async (req, res) => {
  try {
    // Get user from database
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the address to make default
    const addressId = req.params.id;
    const targetAddress = user.addresses.id(addressId);
    if (!targetAddress) {
      return res.status(404).json({ message: "Address not found." });
    }

    // Make all addresses not default
    for (let address of user.addresses) {
      address.isDefault = false;
    }

    // Make the selected address default
    targetAddress.isDefault = true;

    // Save changes
    await user.save();

    res.status(200).json({
      message: "Default address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// TOGGLE favorite restaurant
const toggleFavorite = async (req, res) => {
  try {
    // Get user from database
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const restaurantId = req.params.vendorId;

    // Check if restaurant is already in favorites
    const isAlreadyFavorite = user.favorites.includes(restaurantId);
    let message;
    let isFavorite;

    if (isAlreadyFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== restaurantId
      );
      message = "Restaurant removed from favorites.";
      isFavorite = false;
    } else {
      // Add to favorites
      user.favorites.push(restaurantId);
      message = "Restaurant added to favorites.";
      isFavorite = true;
    }

    // Save changes
    await user.save();

    res.status(200).json({
      message,
      favorites: user.favorites,
      isFavorite: isFavorite,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export {
  // getMe,
  updateMe,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  toggleFavorite,
};
