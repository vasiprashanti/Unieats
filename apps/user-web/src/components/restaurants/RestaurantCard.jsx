import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant, isLarge = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative bg-white rounded-2xl overflow-hidden cursor-pointer group
        transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
        ${isLarge ? 'col-span-1 md:col-span-2 h-64' : 'col-span-1 h-72'}
      `}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${restaurant.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Closed overlay */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="text-gray-800 font-semibold">Closed</span>
            </div>
          </div>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top section - Rating and badges */}
        <div className="flex justify-between items-start">
          {/* Rating badge */}
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1 shadow-sm">
            <span className="text-[#FF6B35] text-sm">⭐</span>
            <span className="text-gray-800 font-semibold text-sm">{restaurant.rating}</span>
          </div>

          {/* Status badges */}
          <div className="flex flex-col gap-2">
            {restaurant.isNew && (
              <div className="bg-[#10B981]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-medium">New ✨</span>
              </div>
            )}
            {restaurant.isTrending && (
              <div className="bg-[#F59E0B]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-medium">Trending 🔥</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom section - Restaurant info */}
        <div className="text-white">
          <h3 className={`font-bold mb-1 ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            {restaurant.name}
          </h3>
          <p className={`text-white/90 mb-3 ${isLarge ? 'text-base' : 'text-sm'}`}>
            {restaurant.cuisine}
          </p>
          
          {/* Delivery info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>⏰</span>
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>{restaurant.avgPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-[#FF6B35]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default RestaurantCard;