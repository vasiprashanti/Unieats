import axios from "axios";
import { getAuth } from "firebase/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getRestaurants = async (filters = {}) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // 🔑 Get fresh Firebase ID token
    const token = await user.getIdToken();

    // Build query params
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    // Call backend with token
    const res = await axios.get(`${API_BASE_URL}/api/v1/vendors/restaurants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    let restaurants = res.data.data || [];

    // 🔹 Apply frontend-only filters
    if (filters.dietType && filters.dietType !== "all") {
      restaurants = restaurants.filter((restaurant) => {
        if (filters.dietType === "veg") {
          return restaurant.dietType === "veg" || restaurant.dietType === "both";
        } else if (filters.dietType === "non-veg") {
          return (
            restaurant.dietType === "non-veg" || restaurant.dietType === "both"
          );
        }
        return true;
      });
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "rating":
          restaurants.sort((a, b) => b.rating - a.rating);
          break;
        case "deliveryTime":
          restaurants.sort((a, b) => {
            const aTime = parseInt(a.deliveryTime?.split("-")[1] || 0);
            const bTime = parseInt(b.deliveryTime?.split("-")[1] || 0);
            return aTime - bTime;
          });
          break;
        case "costLowToHigh":
          restaurants.sort((a, b) => a.costForTwo - b.costForTwo);
          break;
        case "costHighToLow":
          restaurants.sort((a, b) => b.costForTwo - a.costForTwo);
          break;
        default:
          break;
      }
    }
    console.log("Restaurants Data Received from backend-",restaurants);
    return {
      success: true,
      data: restaurants,
      total: res.data.totalPages * (filters.limit || 10),
      currentPage: res.data.currentPage,
    };
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return {
      success: false,
      data: [],
      total: 0,
      currentPage: 1,
    };
  }
};

// Fetch restaurant by ID
export const getRestaurantById = async (id, token) => {
  console.log(`[getRestaurantById] Fetching restaurant with id: ${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/restaurants/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('[getRestaurantById] Response:', data);

    if (!response.ok || !data.success) {
      console.error(`[getRestaurantById] Error fetching restaurant: ${data.error || response.statusText}`);
      return {
        success: false,
        error: data.error || 'Failed to fetch restaurant'
      };
    }

    // Map API response to your frontend structure if needed
    const restaurantData = {
      id: data.data.vendor._id,
      name: data.data.vendor.businessName,
      address: data.data.vendor.businessAddress,
      phone: data.data.vendor.phone,
      cuisineType: data.data.vendor.cuisineType,
      approvalStatus: data.data.vendor.approvalStatus,
      categories: data.data.categories,
      menuItems: data.data.menuItems,
    };

    return {
      success: true,
      data: restaurantData
    };
  } catch (err) {
    console.error('[getRestaurantById] Exception:', err);
    return {
      success: false,
      error: err.message || 'Unexpected error'
    };
  }
};

// Fetch restaurant menu by ID
export const getRestaurantMenu = async (restaurantId) => {
  console.log(`[getRestaurantMenu] Fetching menu for restaurant id: ${restaurantId}`);

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // 🔑 Get fresh Firebase ID token
    const token = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/restaurants/${restaurantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('[getRestaurantMenu] Response:', data);

    if (!response.ok || !data.success) {
      console.error(`[getRestaurantMenu] Error fetching menu: ${data.error || response.statusText}`);
      return {
        success: false,
        error: data.error || 'Failed to fetch menu'
      };
    }

    // ✅ RETURN THE RAW DATA - Let the React component transform it
    return {
      success: true,
      data: data.data // This contains { menu: [...], vendor: {...} }
    };
  } catch (err) {
    console.error('[getRestaurantMenu] Exception:', err);
    return {
      success: false,
      error: err.message || 'Unexpected error'
    };
  }
};