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

    // Only allow updating name, email, and phone
    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }
    if (req.body.email !== undefined) {
      user.email = req.body.email;
    }
    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
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

// --- RATE MENU ITEM ---
const rateMenuItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { rating, orderId } = req.body; // rating: 1-5
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }
    // Check if order is delivered and contains the item
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: "delivered",
      "items.menuItem": itemId,
    });
    if (!order) {
      return res.status(403).json({
        success: false,
        message:
          "You can only rate items you have received in a delivered order.",
      });
    }
    // Check if user already rated this item for this order
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found." });
    }
    if (!menuItem.ratings) menuItem.ratings = [];
    const alreadyRated = menuItem.ratings.find(
      (r) =>
        r.user.toString() === userId.toString() &&
        r.order.toString() === orderId.toString()
    );
    if (alreadyRated) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this item for this order.",
      });
    }
    // Add rating
    menuItem.ratings.push({ user: userId, order: orderId, value: rating });
    // Update average rating
    const values = menuItem.ratings.map((r) => r.value);
    menuItem.averageRating = values.reduce((a, b) => a + b, 0) / values.length;
    await menuItem.save();
    res.status(200).json({
      success: true,
      message: "Rating submitted.",
      averageRating: menuItem.averageRating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
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
  rateMenuItem,
};
