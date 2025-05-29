'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle, Edit2, Trash2, X, Upload, ChevronDown, Search } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  logoUrl?: string;
  parentId?: string;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(
        categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v3/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch('/api/v3/categories', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setCategories((prev) => [...prev, data.category]);
        toast.success('Category added successfully');
        setIsAdding(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add category');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch('/api/v3/categories', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setCategories((prev) =>
          prev.map((cat) => (cat._id === data.category._id ? data.category : cat))
        );
        toast.success('Category updated successfully');
        setIsEditing(false);
        setCurrentCategory(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update category');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch(`/api/v3/categories?id=${categoryToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryToDelete));
        toast.success('Category deleted successfully');
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl bg-gray-900 text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-100">Category Management</h1>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="pl-10 pr-4 py-2 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-gray-100"
            />
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-full shadow-sm">
            <PlusCircle size={18} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Form Section - Fixed Transition */}
      <Transition
        show={isAdding || isEditing}
        as="div"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0">
        <div className="mb-8">
          <CategoryForm
            category={currentCategory || undefined}
            onSubmit={isAdding ? handleAddCategory : handleEditCategory}
            onClose={() => {
              setIsAdding(false);
              setIsEditing(false);
              setCurrentCategory(null);
            }}
            categories={categories}
            isLoading={isLoading}
          />
        </div>
      </Transition>

      {/* Category List Section */}
      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
        {isLoading && !isAdding && !isEditing ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-300">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-300">No categories found</p>
          </div>
        ) : (
          <CategoryList
            categories={filteredCategories}
            onEdit={(category) => {
              setCurrentCategory(category);
              setIsEditing(true);
            }}
            onDelete={confirmDelete}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-100">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-200 focus:outline-none">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                disabled={isLoading}>
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 flex items-center gap-2"
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CategoryFormProps {
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  category?: Category;
  categories: Category[];
  isLoading: boolean;
}

const CategoryForm = ({
  onSubmit,
  onClose,
  category,
  categories,
  isLoading,
}: CategoryFormProps) => {
  const [name, setName] = useState(category ? category.name : '');
  const [description, setDescription] = useState(category ? category.description : '');
  const [parentId, setParentId] = useState(category ? category.parentId || '' : '');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(category?.logoUrl || null);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setParentId(category.parentId || '');
      setLogoPreview(category.logoUrl || null);
    } else {
      setName('');
      setDescription('');
      setParentId('');
      setLogo(null);
      setLogoPreview(null);
    }
  }, [category]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (parentId) formData.append('parentId', parentId);
    if (logo) formData.append('logo', logo);
    if (category) formData.append('id', category._id);

    onSubmit(formData);
  };

  const dropdownCategories = category
    ? categories.filter((cat) => cat._id !== category._id)
    : categories;

  const selectedParent = parentId
    ? categories.find((cat) => cat._id === parentId)?.name
    : 'No Parent';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          {category ? 'Edit Category' : 'Add New Category'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 focus:outline-none">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className={`w-full px-4 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-700 text-gray-100`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description"
              rows={4}
              className={`w-full px-4 py-2 border ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-700 text-gray-100`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-300 mb-1">
              Parent Category
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}>
                <span>{selectedParent}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isParentDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {isParentDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  <div
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200"
                    onClick={() => {
                      setParentId('');
                      setIsParentDropdownOpen(false);
                    }}>
                    No Parent
                  </div>
                  {dropdownCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200"
                      onClick={() => {
                        setParentId(cat._id);
                        setIsParentDropdownOpen(false);
                      }}>
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category Logo</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 transition-colors hover:border-blue-500 bg-gray-700">
              {logoPreview ? (
                <div className="relative">
                  <div className="w-32 h-32 mb-3 overflow-hidden rounded-lg">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={128}
                      height={128}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLogo(null);
                      setLogoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-300 mb-1">Drag & drop an image here</p>
                  <p className="text-xs text-gray-400">or click to browse</p>
                </>
              )}
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                  logoPreview ? 'pointer-events-none' : ''
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
          disabled={isLoading}>
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 flex items-center gap-2"
          disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{category ? 'Updating...' : 'Adding...'}</span>
            </>
          ) : (
            <span>{category ? 'Update Category' : 'Add Category'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryList = ({ categories, onEdit, onDelete }: CategoryListProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-700 border-b border-gray-600">
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-300">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-300">Description</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-300">Logo</th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category._id}
              className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium text-gray-200">{category.name}</div>
                {category.parentId && (
                  <div className="text-xs text-gray-400 mt-1">
                    Parent: {categories.find((c) => c._id === category.parentId)?.name || 'Unknown'}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs overflow-hidden text-ellipsis text-gray-300">
                  {category.description.length > 100
                    ? `${category.description.substring(0, 100)}...`
                    : category.description}
                </div>
              </td>
              <td className="py-3 px-4">
                {category.logoUrl ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-transparent">
                    <Image
                      width={48}
                      height={48}
                      src={category.logoUrl}
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No logo</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-blue-400 hover:bg-blue-900 hover:bg-opacity-40 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(category._id)}
                    className="p-2 text-red-400 hover:bg-red-900 hover:bg-opacity-40 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManagement;
