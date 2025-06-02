/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';
import { Plus, Database, Package, LayoutGrid, ListFilter } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from '../product/ProductForm';
import DigitalInventoryManager from './DigitalInventoryManager';
import EmptyState from './EmptyState';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import useToast from '@/hooks/useToast';
import Modal from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SellerProductsProps {
  seller: { id: string; name: string } | null;
}

const SellerProducts: React.FC<SellerProductsProps> = ({ seller }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('products');

  const {
    products,
    categories,
    formData,
    formErrors,
    isLoading,
    error,
    editMode,
    updateFormData,
    addProduct,
    deleteProduct,
    editProduct,
    resetForm,
  } = useProducts(seller?.id);

  const { showSuccess, showError } = useToast();

  const handleSubmit = async (): Promise<boolean> => {
    const result = await addProduct();
    if (result) {
      setIsFormModalOpen(false);
      showSuccess(editMode ? 'Product updated successfully!' : 'Product added successfully!');
    } else {
      showError(error || 'Failed to process product');
    }
    return result;
  };

  const handleEditProduct = (product: Product) => {
    editProduct(product);
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
    setIsFormModalOpen(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-light-100">Your Products</h1>
            <p className="text-light-400 mt-1">Manage your store inventory and product listings</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAddProductModal}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-full px-5 py-2.5 font-medium transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-1">
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-md mx-auto mb-6 bg-dark-700 p-1 rounded-full">
            <TabsTrigger
              value="products"
              className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-dark-800">
              <Package size={16} className="mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="digital-inventory"
              className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-dark-800">
              <Database size={16} className="mr-2" />
              Digital Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4 animate-fadeIn">
            {products.length === 0 ? (
              <EmptyState onAddProduct={openAddProductModal} />
            ) : (
              <ProductList
                products={products}
                categories={categories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onManageData={() => setActiveTab('digital-inventory')}
                isLoading={isLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="digital-inventory" className="mt-4 animate-fadeIn">
            <div className="bg-dark-800/50 rounded-xl border border-dark-700 shadow-lg overflow-hidden">
              <DigitalInventoryManager onClose={() => setActiveTab('products')} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleFormModalClose} size="lg">
        <ProductForm
          formData={formData}
          formErrors={formErrors}
          categories={categories}
          isLoading={isLoading}
          onInputChange={updateFormData}
          onSubmit={handleSubmit}
          onCancel={handleFormModalClose}
          isEditMode={editMode}
        />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
        <div className="p-6 bg-dark-700 text-light-100 rounded-lg border-[1px] border-dark-500">
          <h3 className="text-lg font-bold mb-3">Delete Product</h3>
          <p className="text-light-300 mb-6">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-light-800 bg-dark-600 hover:bg-dark-700 rounded-lg font-medium transition-colors duration-200 ">
              Cancel
            </button>
            <button
              onClick={confirmDeleteProduct}
              className="px-4 py-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg font-medium transition-colors duration-200">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SellerProducts;
