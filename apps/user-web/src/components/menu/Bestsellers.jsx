import React from 'react';

const Bestsellers = ({ items, onAddToCart, getItemQuantity, onUpdateQuantity }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xl md:text-2xl">🔥</span>
        <h3 className="text-lg md:text-xl font-bold text-foreground">Bestsellers</h3>
      </div>
      
      <div className="space-y-0">
        {items.map((item, index) => {
          const quantity = getItemQuantity(item.id);
          
          return (
            <div
              key={item.id}
              className={`py-4 ${index < items.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex space-x-3 md:space-x-4 max-w-4xl">
                {/* Item Details - Left Side */}
                <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
                  <div className="mb-2">
                    <h4 className="font-bold text-foreground text-base md:text-lg mb-1 line-clamp-1">
                      {item.name}
                    </h4>
                    
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
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-foreground font-bold text-base">
                      ₹{item.price}
                    </span>
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
                    <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Best
                    </div>

                    {/* Controls - Overlaid on Image */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      {quantity > 0 ? (
                        <div className="flex items-center border border-[#ff6600] rounded text-[#ff6600] bg-white shadow-sm">
                          <button
                            onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                          >
                            −
                          </button>
                          <span className="px-2 py-1 text-xs font-semibold min-w-[28px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(item)}
                          className="px-4 py-1.5 bg-[#ff6600] text-white rounded text-sm font-bold hover:bg-[#e55a00] transition-colors shadow-sm"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Customisable text */}
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Customisable
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bestsellers;