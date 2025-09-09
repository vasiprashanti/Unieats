import React, { useEffect, useState, useMemo } from "react";
import MenuCategoryList from "../components/menu/MenuCategoryList";
import MenuItem from "../components/menu/MenuItem";
import AddEditItemModal from "../components/menu/AddEditItemModal";
import AddCategoryModal from "../components/menu/AddCategoryModal";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import {
  getVendorMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkDeleteMenuItems,
  updateMenuItemAvailability,
  bulkUpdateMenuItemAvailability,
  getMenuCategories,
  createMenuCategory
} from "../api/vendor";

export default function Menu() {
  const { user } = useAuth();
  const [menuData, setMenuData] = useState({ categories: [], items: [], stats: {} });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Fetch menu data
  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        getVendorMenu({ token: user?.token }),
        getMenuCategories({ token: user?.token })
      ]);
      setMenuData(menuResponse);
      setCategories(categoriesResponse);
      
      // Set first category as selected by default
      if (menuResponse.categories.length > 0 && !selectedCategory) {
        setSelectedCategory(menuResponse.categories[0].id);
      }
    } catch (e) {
      setError('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter items based on selected category and search
  const filteredItems = useMemo(() => {
    let items = menuData.items || [];
    
    // Filter by category
    if (selectedCategory) {
      items = items.filter(item => item.categoryId === selectedCategory);
    }
    
    // Filter by search
    if (search.trim()) {
      const query = search.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return items;
  }, [menuData.items, selectedCategory, search]);

  // Handle item selection
  const handleSelectItem = (id, checked) => {
    setSelectedItems(prev => 
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedItems(checked ? filteredItems.map(item => item.id) : []);
  };

  // Modal handlers
  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  // Save item (create or update)
  const handleSaveItem = async (formData) => {
    setModalLoading(true);
    setError('');
    try {
      if (editingItem) {
        // Update existing item
        await updateMenuItem({ 
          token: user?.token, 
          id: editingItem.id, 
          data: formData 
        });
        setNotice('Menu item updated successfully');
      } else {
        // Create new item
        await createMenuItem({ 
          token: user?.token, 
          data: formData 
        });
        setNotice('Menu item created successfully');
      }
      
      closeModal();
      fetchMenu(); // Refresh data
    } catch (e) {
      setError(e.message || 'Failed to save menu item');
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle item availability
  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await updateMenuItemAvailability({ 
        token: user?.token, 
        id, 
        isAvailable 
      });
      
      // Update local state
      setMenuData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === id ? { ...item, isAvailable } : item
        )
      }));
      
      setNotice(`Item ${isAvailable ? 'marked as available' : 'marked as sold out'}`);
    } catch (e) {
      setError('Failed to update item availability');
    }
  };

  // Bulk operations
  const handleBulkAvailability = async (isAvailable) => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkUpdateMenuItemAvailability({ 
        token: user?.token, 
        ids: selectedItems, 
        isAvailable 
      });
      
      // Update local state
      setMenuData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          selectedItems.includes(item.id) ? { ...item, isAvailable } : item
        )
      }));
      
      setSelectedItems([]);
      setNotice(`${selectedItems.length} items ${isAvailable ? 'marked as available' : 'marked as sold out'}`);
    } catch (e) {
      setError('Failed to update item availability');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      return;
    }

    try {
      await bulkDeleteMenuItems({ 
        token: user?.token, 
        ids: selectedItems 
      });
      
      setSelectedItems([]);
      setNotice(`${selectedItems.length} items deleted successfully`);
      fetchMenu(); // Refresh data
    } catch (e) {
      setError('Failed to delete items');
    }
  };

  // Category handlers
  const openAddCategoryModal = () => {
    setCategoryModalOpen(true);
  };

  const closeAddCategoryModal = () => {
    setCategoryModalOpen(false);
  };

  const handleSaveCategory = async (categoryData) => {
    setCategoryLoading(true);
    setError('');
    try {
      await createMenuCategory({
        token: user?.token,
        ...categoryData
      });
      
      closeAddCategoryModal();
      setNotice('Category added successfully');
      fetchMenu(); // Refresh data
    } catch (e) {
      setError(e.message || 'Failed to create category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const allSelected = selectedItems.length > 0 && selectedItems.length === filteredItems.length;

  return (
    <div className="h-full flex bg-[hsl(var(--background))]">
      {/* Left Sidebar - Categories */}
      <MenuCategoryList
        categories={menuData.categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddCategory={openAddCategoryModal}
        totalItems={menuData.stats?.totalItems}
        totalCategories={menuData.stats?.totalCategories}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Menu Management</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Manage your menu items and categories</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-[#ff6600] text-white px-4 py-2 rounded-lg hover:bg-[#e65c00] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Item
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="pl-10 pr-4 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent w-full"
            />
          </div>
        </div>

        {/* Alert Messages */}
        <div className="px-6 py-2">
          <Alert type={error ? 'error' : 'success'} message={error || notice} />
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-[hsl(var(--accent))] border-b border-[hsl(var(--border))] px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--accent-foreground))]">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAvailability(true)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Mark Available
                </button>
                <button
                  onClick={() => handleBulkAvailability(false)}
                  className="px-3 py-1 bg-[#ff6600] text-white text-sm rounded hover:bg-[#e65c00] transition-colors"
                >
                  Mark Sold Out
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff6600] border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Select All */}
              {filteredItems.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#ff6600] bg-[hsl(var(--background))] border-[hsl(var(--border))] rounded focus:ring-[#ff6600] focus:ring-2"
                  />
                  <label className="text-sm text-[hsl(var(--foreground))]">
                    Select All ({filteredItems.length} items)
                  </label>
                </div>
              )}

              {/* Items Grid */}
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    selected={selectedItems.includes(item.id)}
                    onSelect={handleSelectItem}
                    onEdit={openEditModal}
                    onToggleAvailability={handleToggleAvailability}
                  />
                ))}

                {filteredItems.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7l-7 7-7-7z" />
                    </svg>
                    <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">No items found</h3>
                    <p className="text-[hsl(var(--muted-foreground))] mb-4">
                      {search ? 'Try adjusting your search criteria' : 'Add your first menu item to get started'}
                    </p>
                    <button
                      onClick={openAddModal}
                      className="bg-[#ff6600] text-white px-4 py-2 rounded-lg hover:bg-[#e65c00] transition-colors"
                    >
                      Add New Item
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddEditItemModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
        loading={modalLoading}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={categoryModalOpen}
        onClose={closeAddCategoryModal}
        onSave={handleSaveCategory}
        loading={categoryLoading}
      />

      {/* Alert Messages */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}
      
      {notice && (
        <Alert
          type="success"
          message={notice}
          onClose={() => setNotice('')}
        />
      )}
    </div>
  );
}