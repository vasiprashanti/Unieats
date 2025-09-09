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
    <div className={`bg-card rounded-lg p-3 md:p-4 border border-border transition-all duration-200 ${
      isSoldOut ? 'opacity-60' : 'hover:shadow-lg'
    }`}>
      <div className="flex space-x-3 md:space-x-4">
        {/* Item Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
            />
            {item.isBestseller && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                🔥
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-foreground text-base md:text-lg leading-tight pr-2">
              {item.name}
            </h3>
            {isSoldOut && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                Sold Out 😔
              </span>
            )}
          </div>
          
          {item.description && (
            <p className="text-muted-foreground text-sm mb-3 leading-relaxed line-clamp-2 md:line-clamp-none">
              {item.description}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tag.toLowerCase() === 'bestseller'
                      ? 'bg-red-100 text-red-800'
                      : tag.toLowerCase() === 'popular'
                      ? 'bg-blue-100 text-blue-800'
                      : tag.toLowerCase() === 'spicy'
                      ? 'bg-orange-100 text-orange-800'
                      : tag.toLowerCase() === 'vegetarian'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price and Time */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-[#ff6600] font-bold text-lg md:text-xl">
                ₹{item.price}
              </span>
              {item.prepTime && (
                <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>{item.prepTime} min</span>
                </div>
              )}
            </div>

            {/* Add/Quantity Controls */}
            <div className="flex-shrink-0">
              {isSoldOut ? (
                <button
                  disabled
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
                >
                  Unavailable
                </button>
              ) : quantity > 0 ? (
                <div className="flex items-center space-x-2 md:space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#ff6600] text-[#ff6600] flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="font-semibold text-foreground min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#ff6600] text-[#ff6600] flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddClick}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-[#ff6600] text-white rounded-lg font-medium hover:bg-[#e55a00] transition-colors text-sm"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;