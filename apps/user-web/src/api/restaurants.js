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
    isOpen: true,
    isNew: false,
    isTrending: false,
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
    isOpen: true,
    isNew: true,
    isTrending: false,
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
    isOpen: false,
    isNew: false,
    isTrending: true,
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
    isOpen: true,
    isNew: false,
    isTrending: false,
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
    isOpen: true,
    isNew: false,
    isTrending: true,
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
    isOpen: true,
    isNew: false,
    isTrending: false,
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
  
  if (filters.isOpen) {
    filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.isOpen);
  }
  
  if (filters.fastDelivery) {
    filteredRestaurants = filteredRestaurants.filter(restaurant => 
      restaurant.tags.includes('fast-delivery') || 
      parseInt(restaurant.deliveryTime.split('-')[1]) <= 20
    );
  }
  
  if (filters.topRated) {
    filteredRestaurants = filteredRestaurants.filter(restaurant => 
      restaurant.rating >= 4.5 || restaurant.tags.includes('top-rated')
    );
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