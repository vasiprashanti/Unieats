import React, { useState, useEffect } from "react";

export default function AddCategoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  loading 
}) {
  const [categoryName, setCategoryName] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCategoryName('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave({ name: categoryName.trim() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--card))] rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--card-foreground))]">
            Add New Category
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--card-foreground))] rounded-lg hover:bg-[hsl(var(--accent))]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent placeholder-[hsl(var(--muted-foreground))]"
              placeholder="Enter category name (e.g., Appetizers, Main Course)"
              autoFocus
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !categoryName.trim()}
              className="px-6 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}