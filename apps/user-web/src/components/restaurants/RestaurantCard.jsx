import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant, mobileCardType = 'default', desktopCardType = 'default' }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  // Define mobile card heights (Pinterest 2-column style)
  const getMobileCardClasses = () => {
    switch (mobileCardType) {
      case 'tall':
        return 'h-96'; // Very tall card for Pinterest effect
      case 'small':
        return 'h-40'; // Compact card
      case 'medium':
        return 'h-72'; // Medium card
      case 'extra-tall':
        return 'h-[28rem]'; // Extra tall card
      default:
        return 'h-60'; // Default card
    }
  };

  // Define desktop card classes (masonry style)
  const getDesktopCardClasses = () => {
    switch (desktopCardType) {
      case 'large':
        return 'md:h-96'; // Large card
      case 'tall':
        return 'md:h-[28rem]'; // Very tall card
      case 'small':
        return 'md:h-48'; // Compact card
      case 'medium':
        return 'md:h-80'; // Medium card
      case 'extra-tall':
        return 'md:h-[32rem]'; // Extra tall card
      default:
        return 'md:h-72'; // Default card
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative bg-white rounded-2xl overflow-hidden cursor-pointer group
        transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
        break-inside-avoid mb-2 md:mb-3 ${getMobileCardClasses()} ${getDesktopCardClasses()}
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
        {/* Top section - Diet badges only */}
        <div className="flex justify-between items-start">
          {/* Diet Type Indicator */}
          <div className="flex items-center gap-2">
            {restaurant.dietType === 'veg' && (
              <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <div className="w-3 h-3 border-2 border-green-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                </div>
              </div>
            )}
            {restaurant.dietType === 'non-veg' && (
              <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <div className="w-3 h-3 border-2 border-red-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-600"></div>
                </div>
              </div>
            )}
            {restaurant.dietType === 'both' && (
              <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 border border-green-600 flex items-center justify-center">
                  <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                </div>
                <div className="w-2.5 h-2.5 border border-red-600 flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-600"></div>
                </div>
              </div>
            )}
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
          <h3 className={`font-bold mb-1 ${
            // Mobile sizing based on mobileCardType
            mobileCardType === 'tall' ? 'text-base' :
            mobileCardType === 'small' ? 'text-sm' : 'text-sm'
          } ${
            // Desktop sizing based on desktopCardType
            desktopCardType === 'large' ? 'md:text-2xl' : 
            desktopCardType === 'tall' ? 'md:text-xl' :
            desktopCardType === 'small' ? 'md:text-lg' : 'md:text-xl'
          }`}>
            {restaurant.name}
          </h3>
          <p className={`text-white/90 mb-3 ${
            // Mobile sizing
            mobileCardType === 'small' ? 'text-xs' : 'text-xs'
          } ${
            // Desktop sizing
            desktopCardType === 'large' ? 'md:text-base' : 
            desktopCardType === 'small' ? 'md:text-xs' : 'md:text-sm'
          }`}>
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