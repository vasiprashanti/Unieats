import React from 'react';

const Bestsellers = ({ items, onAddToCart, getItemQuantity, onUpdateQuantity }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xl md:text-2xl">🔥</span>
        <h3 className="text-lg md:text-xl font-bold text-foreground">Bestsellers</h3>
      </div>
      
      <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => {
          const quantity = getItemQuantity(item.id);
          
          return (
            <div
              key={item.id}
              className="flex-shrink-0 bg-card rounded-lg p-3 border border-border hover:shadow-lg transition-shadow duration-200"
              style={{ minWidth: '180px' }}
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-xs md:text-sm line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[#ff6600] font-bold text-sm">
                    ₹{item.price}
                  </p>
                </div>
              </div>
              
              {quantity > 0 ? (
                <div className="flex items-center justify-center space-x-2 md:space-x-3 mt-3">
                  <button
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#ff6600] text-[#ff6600] flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="font-semibold text-foreground min-w-[16px] text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#ff6600] text-[#ff6600] flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full mt-3 bg-[#ff6600] text-white px-2 py-1.5 rounded-lg font-medium hover:bg-[#e55a00] transition-colors text-sm"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bestsellers;