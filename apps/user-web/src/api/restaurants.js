// Mock data for development - replace with actual API calls
const mockRestaurants = [
  {
    id: 1,
    name: "Campus Pizza Corner",
    cuisine: "Italian",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    rating: 4.5,
    deliveryTime: "20-30 min",
    avgPrice: "₹25",
    costForTwo: 250,
    isOpen: true,
    isNew: false,
    isTrending: false,
    dietType: "both", // veg, non-veg, both
    popularity: 85,
    tags: ["popular"]
  },
  {
    id: 2,
    name: "Burger Junction",
    cuisine: "American",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    rating: 4.2,
    deliveryTime: "15-25 min",
    avgPrice: "₹20",
    costForTwo: 200,
    isOpen: true,
    isNew: true,
    isTrending: false,
    dietType: "non-veg",
    popularity: 72,
    tags: ["fast-delivery"]
  },
  {
    id: 3,
    name: "Spice Garden",
    cuisine: "Indian",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    rating: 4.7,
    deliveryTime: "25-35 min",
    avgPrice: "₹30",
    costForTwo: 300,
    isOpen: false,
    isNew: false,
    isTrending: true,
    dietType: "veg",
    popularity: 92,
    tags: ["top-rated"]
  },
  {
    id: 4,
    name: "Dragon Wok",
    cuisine: "Chinese",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop",
    rating: 4.3,
    deliveryTime: "20-30 min",
    avgPrice: "₹25",
    costForTwo: 250,
    isOpen: true,
    isNew: false,
    isTrending: false,
    dietType: "both",
    popularity: 68,
    tags: []
  },
  {
    id: 5,
    name: "Healthy Bites",
    cuisine: "Healthy",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    rating: 4.6,
    deliveryTime: "15-20 min",
    avgPrice: "₹35",
    costForTwo: 350,
    isOpen: true,
    isNew: false,
    isTrending: true,
    dietType: "veg",
    popularity: 89,
    tags: ["fast-delivery", "top-rated"]
  },
  {
    id: 6,
    name: "Coffee Central",
    cuisine: "Beverages",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    rating: 4.4,
    deliveryTime: "10-15 min",
    avgPrice: "₹15",
    costForTwo: 150,
    isOpen: true,
    isNew: false,
    isTrending: false,
    dietType: "both",
    popularity: 75,
    tags: ["fast-delivery"]
  }
];

export const getRestaurants = async (filters = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let filteredRestaurants = [...mockRestaurants];
  
  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredRestaurants = filteredRestaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm)
    );
  }
  
  // Removed old filter logic for isOpen, fastDelivery, and topRated

  // Apply diet filter
  if (filters.dietType && filters.dietType !== 'all') {
    filteredRestaurants = filteredRestaurants.filter(restaurant => {
      if (filters.dietType === 'veg') {
        return restaurant.dietType === 'veg' || restaurant.dietType === 'both';
      } else if (filters.dietType === 'non-veg') {
        return restaurant.dietType === 'non-veg' || restaurant.dietType === 'both';
      }
      return true;
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'rating':
        filteredRestaurants.sort((a, b) => b.rating - a.rating);
        break;
      case 'deliveryTime':
        filteredRestaurants.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[1]);
          const bTime = parseInt(b.deliveryTime.split('-')[1]);
          return aTime - bTime;
        });
        break;
      case 'costLowToHigh':
        filteredRestaurants.sort((a, b) => a.costForTwo - b.costForTwo);
        break;
      case 'costHighToLow':
        filteredRestaurants.sort((a, b) => b.costForTwo - a.costForTwo);
        break;
      case 'popularity':
        filteredRestaurants.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'relevance':
      default:
        // Default relevance sorting - mix of rating, popularity, and whether it's trending
        filteredRestaurants.sort((a, b) => {
          const aScore = a.rating * 20 + a.popularity * 0.5 + (a.isTrending ? 20 : 0);
          const bScore = b.rating * 20 + b.popularity * 0.5 + (b.isTrending ? 20 : 0);
          return bScore - aScore;
        });
        break;
    }
  }
  
  return {
    success: true,
    data: filteredRestaurants,
    total: filteredRestaurants.length
  };
};

export const getRestaurantById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const restaurant = mockRestaurants.find(r => r.id === parseInt(id));
  
  if (!restaurant) {
    return {
      success: false,
      error: 'Restaurant not found'
    };
  }
  
  return {
    success: true,
    data: restaurant
  };
};

// Mock menu data
const mockMenuData = {
  1: { // Campus Pizza Corner
    restaurant: {
      id: 1,
      name: "Campus Pizza Corner",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
      rating: 4.5,
      reviewCount: 900,
      deliveryTime: "20-30 min",
      isOpen: true
    },
    categories: [
      {
        id: 1,
        name: "Main Course",
        itemCount: 3
      },
      {
        id: 2,
        name: "Starters",
        itemCount: 2
      },
      {
        id: 3,
        name: "Breads",
        itemCount: 2
      },
      {
        id: 4,
        name: "Desserts",
        itemCount: 0
      },
      {
        id: 5,
        name: "Beverages",
        itemCount: 0
      }
    ],
    menuItems: [
      {
        id: 1,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, tomato sauce, and basil",
        price: 299,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop",
        categoryId: 1,
        prepTime: 20,
        tags: ["Popular", "Vegetarian"],
        isBestseller: true,
        isAvailable: true
      },
      {
        id: 2,
        name: "Pepperoni Pizza", 
        description: "Loaded with pepperoni and mozzarella cheese",
        price: 399,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop",
        categoryId: 1,
        prepTime: 25,
        tags: ["Bestseller", "Spicy"],
        isBestseller: true,
        isAvailable: true
      },
      {
        id: 3,
        name: "Veggie Supreme",
        description: "Loaded with fresh vegetables and cheese",
        price: 349,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
        categoryId: 1,
        prepTime: 22,
        tags: ["Vegetarian"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 4,
        name: "Garlic Bread",
        description: "Crispy bread with garlic butter and herbs",
        price: 149,
        image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&h=400&fit=crop",
        categoryId: 2,
        prepTime: 10,
        tags: ["Popular"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 5,
        name: "Mozzarella Sticks",
        description: "Golden fried mozzarella with marinara sauce",
        price: 199,
        image: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=400&fit=crop",
        categoryId: 2,
        prepTime: 12,
        tags: ["Popular"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 6,
        name: "Focaccia Bread",
        description: "Italian flatbread with rosemary and olive oil",
        price: 179,
        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop",
        categoryId: 3,
        prepTime: 15,
        tags: ["Vegetarian"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 7,
        name: "Cheesy Breadsticks",
        description: "Soft breadsticks topped with melted cheese",
        price: 159,
        image: "https://images.unsplash.com/photo-1549611012-54cfae65039e?w=400&h=400&fit=crop",
        categoryId: 3,
        prepTime: 12,
        tags: ["Popular"],
        isBestseller: false,
        isAvailable: true
      }
    ],
    bestsellers: [1, 2] // Item IDs
  },
  // Spice Kitchen data (matching the design)
  3: {
    restaurant: {
      id: 3,
      name: "Spice Kitchen",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      rating: 4.5,
      reviewCount: 900,
      deliveryTime: "25-35 min",
      isOpen: true
    },
    categories: [
      {
        id: 1,
        name: "Main Course",
        itemCount: 2
      },
      {
        id: 2,
        name: "Starters",
        itemCount: 1
      },
      {
        id: 3,
        name: "Breads",
        itemCount: 1
      },
      {
        id: 4,
        name: "Rice & Biryani",
        itemCount: 1
      },
      {
        id: 5,
        name: "Dal & Curry",
        itemCount: 1
      },
      {
        id: 6,
        name: "Desserts",
        itemCount: 0
      },
      {
        id: 7,
        name: "Beverages",
        itemCount: 0
      }
    ],
    menuItems: [
      {
        id: 10,
        name: "Butter Chicken",
        description: "Tender chicken in rich tomato and butter gravy",
        price: 320,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop",
        categoryId: 1,
        prepTime: 20,
        tags: ["Popular", "Bestseller"],
        isBestseller: true,
        isAvailable: true
      },
      {
        id: 11,
        name: "Paneer Tikka Masala",
        description: "Grilled paneer in spicy tomato gravy",
        price: 280,
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=400&fit=crop",
        categoryId: 1,
        prepTime: 18,
        tags: ["Vegetarian", "Spicy"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 12,
        name: "Chicken Tikka",
        description: "Marinated chicken grilled to perfection",
        price: 250,
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop",
        categoryId: 2,
        prepTime: 15,
        tags: ["Popular"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 13,
        name: "Naan",
        description: "Soft and fluffy Indian bread",
        price: 60,
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop",
        categoryId: 3,
        prepTime: 5,
        tags: ["Vegetarian"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 14,
        name: "Chicken Biryani",
        description: "Fragrant basmati rice with spiced chicken",
        price: 350,
        image: "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=400&h=400&fit=crop",
        categoryId: 4,
        prepTime: 25,
        tags: ["Popular", "Spicy"],
        isBestseller: false,
        isAvailable: true
      },
      {
        id: 15,
        name: "Dal Tadka",
        description: "Yellow lentils tempered with spices",
        price: 180,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
        categoryId: 5,
        prepTime: 10,
        tags: ["Vegetarian"],
        isBestseller: false,
        isAvailable: true
      }
    ],
    bestsellers: [10] // Item IDs
  }
};

export const getRestaurantMenu = async (restaurantId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const menuData = mockMenuData[restaurantId];
  
  if (!menuData) {
    return {
      success: false,
      error: 'Restaurant menu not found'
    };
  }
  
  return {
    success: true,
    data: menuData
  };
};