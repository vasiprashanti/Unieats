import React from "react";

export default function MenuItem({ 
  item, 
  selected, 
  onSelect, 
  onEdit, 
  onToggleAvailability,
  onDelete
}) {
  const handleAvailabilityToggle = (e) => {
    e.stopPropagation();
    onToggleAvailability(item.id, !item.isAvailable);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item.id);
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
            className="w-4 h-4 text-[#ff6600] bg-[hsl(var(--background))] border-[hsl(var(--border))] rounded focus:ring-[#ff6600] focus:ring-2"
          />
        </div>

        {/* Item Image */}
        <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-8 h-8 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[hsl(var(--foreground))] truncate">{item.name}</h3>
                {item.tags && item.tags.map((tag) => (
                  <span 
                    key={tag}
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      tag === 'Popular' 
                        ? 'bg-blue-100 text-blue-700'
                        : tag === 'Bestseller'
                        ? 'bg-green-100 text-green-700'
                        : tag === 'Vegetarian'
                        ? 'bg-green-100 text-green-700'
                        : tag === 'Spicy'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="font-semibold text-[hsl(var(--foreground))]">₹{item.price}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.prepTime} mins
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[#ff6600] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                title="Edit item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-600 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                title="Delete item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={item.isAvailable}
                  onChange={handleAvailabilityToggle}
                />
                <div className="w-11 h-6 bg-[hsl(var(--muted))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6600]"></div>
              </label>
              <span className={`text-sm font-medium ${
                item.isAvailable ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.isAvailable ? 'Available' : 'Sold Out'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}