/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import EmptyState from './EmptyState';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import useToast from '@/hooks/useToast';
import Modal from '@/components/ui/Modal';

interface SellerProductsProps {
  seller: { id: string; name: string } | null;
}

const SellerProducts: React.FC<SellerProductsProps> = ({ seller }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const {
    products,
    categories,
    formData,
    formErrors,
    isLoading,
    error,
    success,
    updateFormData,
    addProduct,
    resetForm,
    setError,
    setSuccess,
    setProducts,
  } = useProducts(seller?.id);

  const { showSuccess, showError } = useToast();

  // Handle form submission
  const handleSubmit = async () => {
    const result = await addProduct();
    if (result) {
      setIsFormModalOpen(false);
      showSuccess('Product added successfully!');
    } else {
      showError(error || 'Failed to add product');
    }
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    setIsFormModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete product
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter((p) => p._id !== productToDelete));
      setIsDeleteModalOpen(false);
      showSuccess('Product deleted successfully!');
      setProductToDelete(null);
    }
  };

  // Open form modal
  const openAddProductModal = () => {
    resetForm();
    setIsEditing(false);
    setEditingProductId(null);
    setIsFormModalOpen(true);
  };

  // Handle form modal close
  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your store inventory and product listings
          </p>
        </div>

        <button
          onClick={openAddProductModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-5 py-2.5 font-medium transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-1">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState onAddProduct={openAddProductModal} />
      ) : (
        <ProductList
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          isLoading={isLoading}
        />
      )}

      {/* Add/Edit Product Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleFormModalClose} size="lg">
        <ProductForm
          formData={formData}
          formErrors={formErrors}
          categories={categories}
          isLoading={isLoading}
          onInputChange={updateFormData}
          onSubmit={handleSubmit}
          onCancel={handleFormModalClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Delete Product</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200">
              Cancel
            </button>
            <button
              onClick={confirmDeleteProduct}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SellerProducts;
