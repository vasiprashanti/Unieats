import React from 'react';

const MenuItemCard = ({ 
  item, 
  onAddToCart, 
  quantity, 
  onUpdateQuantity, 
  isSoldOut = false 
}) => {
  const handleAddClick = () => {
    onAddToCart(item);
  };

  const handleQuantityChange = (newQuantity) => {
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className={`py-4 border-b border-border last:border-b-0 transition-all duration-200 ${
      isSoldOut ? 'opacity-60' : ''
    }`}>
      <div className="flex space-x-3 md:space-x-4 max-w-4xl">
        {/* Item Details - Left Side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
          <div>
            {/* Veg/Non-veg Icon - Top Left */}
            <div className="flex items-start space-x-2 mb-2">
              {item.tags && item.tags.some(tag => tag.toLowerCase() === 'vegetarian') && (
                <div className="bg-white rounded-sm p-0.5 shadow-sm border border-green-600 flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              )}
              
              <h3 className="font-bold text-foreground text-base md:text-lg leading-tight">
                {item.name}
              </h3>
            </div>
            
            {/* Rating if available */}
            {item.rating && (
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-green-600 text-sm">★</span>
                <span className="text-sm font-medium text-green-600">
                  {item.rating}
                </span>
                {item.ratingCount && (
                  <span className="text-sm text-muted-foreground">
                    ({item.ratingCount})
                  </span>
                )}
              </div>
            )}
            
            {item.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2">
                {item.description}
              </p>
            )}

            {/* Price - Below Description */}
            <div className="flex items-center">
              <span className="text-foreground font-bold text-base">
                ₹{item.price}
              </span>
            </div>
          </div>
        </div>

        {/* Item Image with Controls - Right Side */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-lg object-cover"
            />
            
            {/* Bestseller Badge */}
            {item.isBestseller && (
              <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Best
              </div>
            )}
            
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-semibold">Sold Out</span>
              </div>
            )}

            {/* Add/Quantity Controls - Overlaid on Image */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              {isSoldOut ? (
                <button
                  disabled
                  className="px-3 py-1.5 bg-gray-300 text-gray-500 rounded text-xs cursor-not-allowed shadow-sm"
                >
                  N/A
                </button>
              ) : quantity > 0 ? (
                <div className="flex items-center border border-[#ff6600] rounded text-[#ff6600] bg-white shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="px-2 py-1 text-xs font-semibold min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddClick}
                  className="px-4 py-1.5 bg-[#ff6600] text-white rounded text-sm font-bold hover:bg-[#e55a00] transition-colors shadow-sm"
                >
                  ADD
                </button>
              )}
            </div>
          </div>
          
          {/* Customisable text */}
          {!isSoldOut && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              Customisable
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;