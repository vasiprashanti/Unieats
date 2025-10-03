import User from "../models/User.model.js";
import Order from "../models/Order.model.js";
import MenuItem from "../models/MenuItem.model.js";

// UPDATE current user's profile
const updateMe = async (req, res) => {
  try {
    // Validation is handled in the route middleware

    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prepare update object with only the fields being updated
    const updateFields = {};
    if (req.body.name !== undefined) {
      updateFields.name = req.body.name;
    }
    if (req.body.email !== undefined) {
      updateFields.email = req.body.email;
    }
    if (req.body.phone !== undefined) {
      updateFields.phone = req.body.phone;
    }

    // Update only the specified fields
    await User.findOneAndUpdate(
      { firebaseUid },
      updateFields,
      { runValidators: true } // Validate only the fields being updated
    );

    // Refresh user object with updated data
    const updatedUser = await User.findOne({ firebaseUid });

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
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
    const { street, city, state, zipCode, isDefault, label, landmark } =
      req.body;
    // Validation is handled in the route middleware

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
      ...(label && { label }),
      ...(landmark && { landmark }),
    };

    user.addresses.push(newAddress);

    // Save only the addresses array to avoid full document validation
    await User.findOneAndUpdate(
      { firebaseUid },
      {
        addresses: user.addresses,
      },
      { runValidators: false } // Skip validation for other fields
    );

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
    const { street, city, state, zipCode, isDefault, label, landmark } =
      req.body;
    // Validation is handled in the route middleware

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
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (isDefault !== undefined) address.isDefault = isDefault;
    if (label !== undefined) address.label = label;
    if (landmark !== undefined) address.landmark = landmark;

    // Save only the addresses array to avoid full document validation
    await User.findOneAndUpdate(
      { firebaseUid },
      {
        addresses: user.addresses,
      },
      { runValidators: false } // Skip validation for other fields
    );

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

    // Save only the addresses array to avoid full document validation
    await User.findOneAndUpdate(
      { firebaseUid },
      {
        addresses: user.addresses,
      },
      { runValidators: false } // Skip validation for other fields
    );

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

    // Save only the addresses array to avoid full document validation
    await User.findOneAndUpdate(
      { firebaseUid: req.user.firebaseUid },
      {
        addresses: user.addresses,
      },
      { runValidators: false } // Skip validation for other fields
    );

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

// TOGGLE includeNotification preference
const toggleNotificationPreference = async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Toggle or set explicitly
    if (typeof req.body.value === "boolean") {
      user.includeNotification = req.body.value;
    } else {
      user.includeNotification = !user.includeNotification;
    }
    await user.save();
    res.status(200).json({
      message: "Notification preference updated.",
      includeNotification: user.includeNotification,
    });
  } catch (error) {
    console.error("Error updating notification preference:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export {
  updateMe,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  toggleFavorite,
  toggleNotificationPreference,
};
