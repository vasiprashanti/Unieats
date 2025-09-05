import React, { useState, useEffect, useRef } from "react";

export default function AddEditItemModal({ 
  isOpen, 
  onClose, 
  onSave, 
  item, 
  categories,
  loading 
}) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    prepTime: '',
    isVegetarian: false,
    tags: [],
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [newTag, setNewTag] = useState('');

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Edit mode
        setFormData({
          name: item.name || '',
          description: item.description || '',
          price: item.price?.toString() || '',
          categoryId: item.categoryId || '',
          prepTime: item.prepTime?.toString() || '',
          isVegetarian: item.isVegetarian || false,
          tags: item.tags || [],
          image: null
        });
        setImagePreview(item.image || null);
      } else {
        // Add mode
        setFormData({
          name: '',
          description: '',
          price: '',
          categoryId: categories[0]?.id || '',
          prepTime: '',
          isVegetarian: false,
          tags: [],
          image: null
        });
        setImagePreview(null);
      }
      setNewTag('');
    }
  }, [isOpen, item, categories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      prepTime: parseInt(formData.prepTime)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--card))] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--card-foreground))]">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">Item Image</label>
            <div 
              onClick={handleImageClick}
              className="w-full h-40 border-2 border-dashed border-[hsl(var(--border))] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ff6600] transition-colors relative overflow-hidden"
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <button type="button" className="px-4 py-2 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-lg text-sm hover:bg-[hsl(var(--accent))]">
                    Browse...
                  </button>
                  <span className="text-[hsl(var(--muted-foreground))] text-sm ml-2">No file selected.</span>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Upload an image for your menu item (JPG, PNG)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent placeholder-[hsl(var(--muted-foreground))]"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent resize-none placeholder-[hsl(var(--muted-foreground))]"
              placeholder="Enter item description"
            />
          </div>

          {/* Price and Prep Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent placeholder-[hsl(var(--muted-foreground))]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">
                Preparation Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent placeholder-[hsl(var(--muted-foreground))]"
                placeholder="15"
              />
            </div>
          </div>

          {/* Vegetarian Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[hsl(var(--muted))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6600]"></div>
            </label>
            <span className="text-sm font-medium text-[hsl(var(--card-foreground))]">Vegetarian Item</span>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent placeholder-[hsl(var(--muted-foreground))]"
                placeholder="Add a tag (e.g., Spicy, Popular)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                item ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}