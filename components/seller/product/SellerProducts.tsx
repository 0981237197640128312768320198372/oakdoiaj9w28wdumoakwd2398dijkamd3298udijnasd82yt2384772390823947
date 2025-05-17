/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from '../product/ProductForm';
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
    deleteProduct,
    resetForm,
    setError,
    setSuccess,
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

  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      const result = await deleteProduct(productToDelete);
      setIsDeleteModalOpen(false);

      if (result) {
        showSuccess('Product deleted successfully!');
      } else {
        showError(error || 'Failed to delete product');
      }

      setProductToDelete(null);
    }
  };

  const openAddProductModal = () => {
    resetForm();
    setIsEditing(false);
    setEditingProductId(null);
    setIsFormModalOpen(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Your Products</h1>
          <p className="text-gray-400 mt-1">Manage your store inventory and product listings</p>
        </div>

        <button
          onClick={openAddProductModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2.5 font-medium transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-1">
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
        <div className="p-6 bg-gray-900 text-gray-100 rounded-lg">
          <h3 className="text-lg font-bold mb-3">Delete Product</h3>
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 border border-gray-700">
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
