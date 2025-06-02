/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Link, Plus } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import EnhancedInventoryEditor from './EnhancedInventoryEditor';
import InventoryCard from './InventoryCard';
import InventorySearch from './InventorySearch';
import InventoryStats from './InventoryStats';
import { Product } from '@/types';
import useToast from '@/hooks/useToast';
import Modal from '@/components/ui/Modal';

interface DigitalInventoryManagerProps {
  onClose: () => void;
}

export default function DigitalInventoryManager({ onClose }: DigitalInventoryManagerProps) {
  const [inventoryList, setInventoryList] = useState<
    Array<{
      _id?: string;
      inventoryGroup: string;
      digitalAssets: Array<Record<string, string>>;
      productId?: string;
      connectedProduct?: {
        _id: string;
        title: string;
      };
    }>
  >([]);
  const [products, setProducts] = useState<Array<{ _id: string; title: string }>>([]);
  const [assetKeys, setAssetKeys] = useState<string[]>(['Email', 'Password']);
  const [errors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLinkingProduct, setIsLinkingProduct] = useState(false);
  const [isEditingInCard, setIsEditingInCard] = useState(false);
  const [isSavingInCard, setIsSavingInCard] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [filterOption, setFilterOption] = useState<'all' | 'linked' | 'unlinked'>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  // Fetch all digital inventory on component mount
  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsInitialLoading(true);
      const response = await fetch(`/api/v3/digital-inventory/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch digital inventory');
      }

      const data = await response.json();

      if (data.variants && data.variants.length > 0) {
        // Extract asset keys from the first variant with digital assets
        const firstVariantWithAssets = data.variants.find(
          (v: any) =>
            (v.digitalAssets && v.digitalAssets.length > 0) ||
            (v.specifications && v.specifications.length > 0)
        );

        if (firstVariantWithAssets) {
          const assets =
            firstVariantWithAssets.digitalAssets || firstVariantWithAssets.specifications;
          if (assets && assets.length > 0) {
            setAssetKeys(Object.keys(assets[0]));
          }
        }

        const mappedVariants = await Promise.all(
          data.variants.map(async (variant: any) => {
            let connectedProduct = undefined;
            if (variant.productId) {
              try {
                const productResponse = await fetch(
                  `/api/v3/digital-inventory?productId=${variant.productId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
                    },
                  }
                );

                if (productResponse.ok) {
                  const productData = await productResponse.json();
                  connectedProduct = {
                    _id: productData.product._id,
                    title: productData.product.title,
                  };
                }
              } catch (error) {
                console.error('Error fetching connected product:', error);
              }
            }

            return {
              _id: variant._id,
              inventoryGroup: variant.inventoryGroup || variant.variantName,
              digitalAssets: Array.isArray(variant.digitalAssets)
                ? variant.digitalAssets
                : Array.isArray(variant.specifications)
                ? variant.specifications
                : [variant.digitalAssets || variant.specifications || {}],
              productId: variant.productId,
              connectedProduct,
            };
          })
        );

        setInventoryList(mappedVariants);
      } else {
        // Initialize with one empty inventory item
        setInventoryList([
          {
            inventoryGroup: '',
            digitalAssets: [
              assetKeys.reduce((acc, key) => {
                acc[key] = '';
                return acc;
              }, {} as Record<string, string>),
            ],
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching digital inventory:', error);
      showError('Failed to load digital inventory');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/v3/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(
        data.products.map((p: Product) => ({
          _id: p._id,
          title: p.title,
        }))
      );
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle asset keys change
  const handleAssetKeysChange = (newKeys: string[]) => {
    setAssetKeys(newKeys);

    // Update all inventory items with the new keys
    setInventoryList((prevList) =>
      prevList.map((item) => {
        // Update each asset item in the array
        const updatedAssets = item.digitalAssets.map((asset) => {
          const newAsset = { ...asset };

          // Add new keys with empty values
          newKeys.forEach((key) => {
            if (!newAsset[key]) {
              newAsset[key] = '';
            }
          });

          // Remove keys that are no longer in the list
          Object.keys(newAsset).forEach((key) => {
            if (!newKeys.includes(key)) {
              delete newAsset[key];
            }
          });

          return newAsset;
        });

        return {
          ...item,
          digitalAssets: updatedAssets,
        };
      })
    );
  };

  const handleAddNewInventory = () => {
    setInventoryList([
      ...inventoryList,
      {
        inventoryGroup: '',
        digitalAssets: [
          assetKeys.reduce((acc, key) => {
            acc[key] = '';
            return acc;
          }, {} as Record<string, string>),
        ],
      },
    ]);
  };

  const handleLinkProduct = async (inventoryIndex: number) => {
    if (!selectedProductId) return;

    const inventory = inventoryList[inventoryIndex];
    if (!inventory._id) {
      showError('Please save this inventory before linking to a product');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v3/digital-inventory/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
        body: JSON.stringify({
          variantId: inventory._id,
          productId: selectedProductId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to link product');
      }

      // Update the local state
      const updatedList = [...inventoryList];
      const product = products.find((p) => p._id === selectedProductId);

      updatedList[inventoryIndex] = {
        ...updatedList[inventoryIndex],
        productId: selectedProductId,
        connectedProduct: product ? { _id: product._id, title: product.title } : undefined,
      };

      setInventoryList(updatedList);
      setIsLinkingProduct(false);
      setSelectedInventoryIndex(null);
      setSelectedProductId('');

      showSuccess('Product linked successfully!');
    } catch (error) {
      console.error('Error linking product:', error);
      showError('Failed to link product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkProduct = async (inventoryIndex: number) => {
    const inventory = inventoryList[inventoryIndex];
    if (!inventory._id || !inventory.productId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v3/digital-inventory/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
        body: JSON.stringify({
          variantId: inventory._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unlink product');
      }

      const updatedList = [...inventoryList];
      updatedList[inventoryIndex] = {
        ...updatedList[inventoryIndex],
        productId: undefined,
        connectedProduct: undefined,
      };

      setInventoryList(updatedList);
      showSuccess('Product unlinked successfully!');
    } catch (error) {
      console.error('Error unlinking product:', error);
      showError('Failed to unlink product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInventory = (index: number) => {
    setInventoryToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteInventory = async () => {
    if (inventoryToDelete === null) return;

    const inventory = inventoryList[inventoryToDelete];
    setIsDeleteModalOpen(false);

    if (!inventory._id) {
      // If it's a new inventory item that hasn't been saved yet, just remove it from the state
      const updatedList = [...inventoryList];
      updatedList.splice(inventoryToDelete, 1);
      setInventoryList(updatedList);
      showSuccess('Inventory removed');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v3/digital-inventory?id=${inventory._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete inventory');
      }

      const updatedList = [...inventoryList];
      updatedList.splice(inventoryToDelete, 1);
      setInventoryList(updatedList);
      showSuccess('Inventory deleted successfully!');
    } catch (error) {
      console.error('Error deleting inventory:', error);
      showError('Failed to delete inventory');
    } finally {
      setIsLoading(false);
      setInventoryToDelete(null);
    }
  };

  const handleDuplicateInventory = (index: number) => {
    const inventoryToDuplicate = { ...inventoryList[index] };
    // Remove the _id and productId to create a new inventory item
    delete inventoryToDuplicate._id;
    delete inventoryToDuplicate.productId;
    delete inventoryToDuplicate.connectedProduct;

    // Add " (Copy)" to the inventory group name
    inventoryToDuplicate.inventoryGroup = `${inventoryToDuplicate.inventoryGroup} (Copy)`;

    setInventoryList([...inventoryList, inventoryToDuplicate]);
    showSuccess('Inventory duplicated');
  };

  const handleInventoryChange = (index: number, updatedInventory: any) => {
    const updatedList = [...inventoryList];
    updatedList[index] = {
      ...updatedList[index],
      ...updatedInventory,
    };
    setInventoryList(updatedList);
  };

  // Persist a single inventory item to the server
  const handleSaveInventory = async (index: number) => {
    const item = inventoryList[index];
    setIsSavingInCard(true);
    try {
      const payload = {
        inventoryGroup: item.inventoryGroup,
        digitalAssets: item.digitalAssets,
        productId: item.productId || null,
      };
      const response = item._id
        ? await fetch(`/api/v3/digital-inventory`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
            },
            body: JSON.stringify({ id: item._id, ...payload }),
          })
        : await fetch(`/api/v3/digital-inventory`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
            },
            body: JSON.stringify(payload),
          });
      if (!response.ok) throw new Error('Failed to save inventory');
      showSuccess('Inventory saved successfully!');
      await fetchInventory(); // reload latest list
    } catch (error) {
      console.error('Error saving inventory:', error);
      showError('Failed to save inventory');
    } finally {
      setIsSavingInCard(false);
      setIsEditingInCard(false);
    }
  };

  const filteredInventoryList = inventoryList
    .filter((item) => {
      if (filterOption === 'linked') return !!item.connectedProduct;
      if (filterOption === 'unlinked') return !item.connectedProduct;
      return true;
    })
    .filter((item) => {
      if (!searchTerm) return true;
      return (
        item.inventoryGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.connectedProduct?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Calculate stats
  const totalInventory = inventoryList.length;
  const linkedItems = inventoryList.filter((item) => !!item.connectedProduct).length;
  const unlinkedItems = totalInventory - linkedItems;
  const totalAssets = inventoryList.reduce((total, item) => total + item.digitalAssets.length, 0);

  if (isInitialLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-light-100 flex items-center">
            <Database className="mr-2 text-primary" size={24} />
            Digital Inventory Manager
          </h2>
          <p className="text-light-400 mt-1">
            Create and manage digital assets that can be linked to your products
          </p>
        </div>

        <div className="flex gap-3">
          <Button2
            onClick={handleAddNewInventory}
            className="bg-primary hover:bg-primary text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <Plus size={16} className="mr-1" />
            New Inventory
          </Button2>
        </div>
      </div>

      {/* Stats summary */}
      <InventoryStats
        totalInventory={totalInventory}
        linkedItems={linkedItems}
        unlinkedItems={unlinkedItems}
        totalAssets={totalAssets}
      />

      {/* Search and filters */}
      <InventorySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOption={filterOption}
        onFilterChange={setFilterOption}
        onRefresh={fetchInventory}
      />

      {/* Digital Inventory List */}
      <div className="space-y-4">
        {filteredInventoryList.length === 0 ? (
          <div className="bg-dark-700/30 rounded-xl border border-dark-600 p-8 text-center">
            <Database className="mx-auto text-light-500 mb-3" size={32} />
            <h3 className="text-light-300 text-lg font-medium mb-2">No Digital Inventory Found</h3>
            <p className="text-light-500 mb-4">
              {searchTerm || filterOption !== 'all'
                ? 'No inventory items match your search criteria.'
                : "You haven't created any digital inventory items yet."}
            </p>
            {!searchTerm && filterOption === 'all' && (
              <Button2
                onClick={handleAddNewInventory}
                className="mx-auto bg-primary hover:bg-primary text-white">
                <Plus size={16} className="mr-2" />
                Create New Inventory
              </Button2>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {filteredInventoryList.map((inventory, index) => {
                const originalIndex = inventoryList.findIndex(
                  (item) =>
                    item._id === inventory._id ||
                    (item.inventoryGroup === inventory.inventoryGroup &&
                      !item._id &&
                      !inventory._id)
                );

                const isSelected = selectedInventoryIndex === originalIndex;

                return (
                  <div key={inventory._id || index} className="animate-fade-in">
                    <InventoryCard
                      inventory={inventory}
                      onEdit={() => {
                        if (selectedInventoryIndex === originalIndex) {
                          // If already selected, close it directly
                          setSelectedInventoryIndex(null);
                          setIsEditingInCard(false);
                        } else {
                          // Select this inventory
                          setSelectedInventoryIndex(originalIndex);
                          setIsLinkingProduct(false);
                          setIsEditingInCard(true);
                        }
                      }}
                      onSave={async () => {
                        setIsSavingInCard(true);
                        // Simulate saving with a delay
                        await new Promise((resolve) => setTimeout(resolve, 500));
                        setIsSavingInCard(false);
                        setIsEditingInCard(false);
                        showSuccess('Inventory saved successfully!');
                      }}
                      onLink={() => {
                        setSelectedInventoryIndex(originalIndex);
                        setIsLinkingProduct(true);
                        setIsEditingInCard(false);
                      }}
                      onUnlink={() => handleUnlinkProduct(originalIndex)}
                      onDuplicate={() => handleDuplicateInventory(originalIndex)}
                      onDelete={() => handleDeleteInventory(originalIndex)}
                      isSelected={isSelected}
                      isEditing={isSelected && isEditingInCard}
                      isSaving={isSavingInCard}
                    />

                    {/* Show editor directly below the selected card */}
                    {isSelected && (
                      <div className="mt-2 bg-dark-700/50 p-4 rounded-xl border border-dark-600 animate-fadeIn">
                        {isLinkingProduct ? (
                          <div className="bg-dark-700/50 p-4 rounded-xl border border-dark-600">
                            <h4 className="text-sm font-medium text-light-300 mb-3">
                              Link to Product
                            </h4>
                            <div className="flex flex-col md:flex-row gap-3">
                              <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                                <option value="">Select a product...</option>
                                {products.map((product) => (
                                  <option key={product._id} value={product._id}>
                                    {product.title}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <Button2
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIsLinkingProduct(false);
                                    setSelectedProductId('');
                                  }}
                                  className="h-10 text-xs bg-dark-600 text-light-400 border-dark-500 hover:bg-dark-500">
                                  Cancel
                                </Button2>
                                <Button2
                                  size="sm"
                                  onClick={() => handleLinkProduct(selectedInventoryIndex)}
                                  disabled={!selectedProductId || isLoading}
                                  className="h-10 text-xs bg-primary hover:bg-primary text-white">
                                  {isLoading ? (
                                    <span className="flex items-center gap-2">
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Linking...
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <Link size={14} />
                                      Link Product
                                    </span>
                                  )}
                                </Button2>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-dark-700/50 p-4 rounded-xl border border-dark-600">
                            <EnhancedInventoryEditor
                              inventory={inventoryList[selectedInventoryIndex]}
                              assetKeys={assetKeys}
                              onInventoryChange={(updatedInventory) =>
                                handleInventoryChange(selectedInventoryIndex, updatedInventory)
                              }
                              onAssetKeysChange={handleAssetKeysChange}
                              errors={errors}
                              onSave={() => handleSaveInventory(selectedInventoryIndex!)}
                              isSaving={isSavingInCard}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-start pt-5 border-t border-dark-600 mt-8">
        <Button2
          variant="outline"
          onClick={onClose}
          className="bg-dark-700 hover:bg-dark-600 text-light-300 border-dark-600">
          <span className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Products
          </span>
        </Button2>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
        <div className="p-6 bg-dark-700 text-light-100 rounded-lg border-[1px] border-dark-500">
          <h3 className="text-lg font-bold mb-3">Delete Inventory</h3>
          <p className="text-light-300 mb-6">
            Are you sure you want to delete this inventory? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-light-800 bg-dark-600 hover:bg-dark-700 rounded-lg font-medium transition-colors duration-200 ">
              Cancel
            </button>
            <button
              onClick={confirmDeleteInventory}
              className="px-4 py-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg font-medium transition-colors duration-200">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
