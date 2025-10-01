import React from 'react';

const CategoryList = ({ categories, selectedCategory, onCategorySelect }) => {
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('main') || name.includes('course')) return '🍽️';
    if (name.includes('starter') || name.includes('appetizer')) return '🥗';
    if (name.includes('bread') || name.includes('roti')) return '🥖';
    if (name.includes('rice') || name.includes('biryani')) return '🍚';
    if (name.includes('dal') || name.includes('curry')) return '🍛';
    if (name.includes('dessert') || name.includes('sweet')) return '🧁';
    if (name.includes('beverage') || name.includes('drink')) return '🥤';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('noodle') || name.includes('pasta')) return '🍜';
    if (name.includes('salad')) return '🥙';
    return '🍽️'; // Default icon
  };

  return (
    <div className="p-6 bg-card border-r border-border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Menu</h2>
        <p className="text-muted-foreground text-sm">Choose a category</p>
      </div>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
              selectedCategory?.id === category.id
                ? 'bg-[#ff6600] text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getCategoryIcon(category.name)}</span>
              <span className="font-medium">{category.name}</span>
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${
              selectedCategory?.id === category.id
                ? 'bg-white text-[#ff6600]'
                : 'bg-muted text-muted-foreground'
            }`}>
              {category.itemCount || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;