import React from "react";

export default function MenuCategoryList({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onAddCategory,
  totalItems,
  totalCategories 
}) {
  return (
    <div className="w-80 bg-[hsl(var(--background))] border-r border-[hsl(var(--border))]">
      {/* Categories Header */}
      <div className="p-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Categories</h2>
          <button 
            onClick={onAddCategory}
            className="text-[#ff6600] text-sm font-medium flex items-center gap-1 hover:text-[#e65c00]"
            title="Add Category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
        
        {/* Category List */}
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#ff6600] text-white'
                  : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                selectedCategory === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
              }`}>
                {category.itemCount || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">Quick Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Total Items:</span>
            <span className="font-medium text-[hsl(var(--foreground))]">{totalItems || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Categories:</span>
            <span className="font-medium text-[hsl(var(--foreground))]">{totalCategories || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}