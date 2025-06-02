/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Database,
  Link,
  Link2Off,
  Plus,
  Search,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import ButtonWithLoader from '@/components/ui/ButtonWithLoader';
import DigitalInventoryEditor from './DigitalInventoryEditor';
import { Product } from '@/types';
import useToast from '@/hooks/useToast';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLinkingProduct, setIsLinkingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [filterOption, setFilterOption] = useState<'all' | 'linked' | 'unlinked'>('all');

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

  // Validate before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if any inventory item has an empty group name
    inventoryList.forEach((item, index) => {
      if (!item.inventoryGroup.trim()) {
        newErrors[`inventoryGroup_${index}`] = 'Inventory group name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Save each inventory item
      for (const item of inventoryList) {
        const payload = {
          inventoryGroup: item.inventoryGroup,
          digitalAssets: item.digitalAssets,
          productId: item.productId || null,
        };

        let response;
        // Try the new endpoint first
        if (item._id) {
          // Update existing item
          response = await fetch(`/api/v3/digital-inventory`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
            },
            body: JSON.stringify({
              id: item._id,
              ...payload,
            }),
          });
        } else {
          response = await fetch(`/api/v3/digital-inventory`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
            },
            body: JSON.stringify(payload),
          });
        }

        if (!response.ok) {
          throw new Error(`Failed to save inventory: ${item.inventoryGroup}`);
        }
      }

      showSuccess('Digital inventory saved successfully!');
      fetchInventory(); // Refresh the data
    } catch (error) {
      console.error('Error saving digital inventory:', error);
      showError('Failed to save digital inventory');
    } finally {
      setIsLoading(false);
    }
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
      // Try the new endpoint first
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

  if (isInitialLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-light-100 flex items-center">
            <Database className="mr-2 text-blue-400" size={24} />
            Digital Inventory Manager
          </h2>
          <p className="text-light-400 mt-1">
            Create and manage digital assets that can be linked to your products
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2.5 w-full bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value as 'all' | 'linked' | 'unlinked')}
                className="appearance-none pl-10 pr-8 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50">
                <option value="all">All inventory</option>
                <option value="linked">Linked only</option>
                <option value="unlinked">Unlinked only</option>
              </select>
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
                size={16}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L2 4H10L6 8Z" fill="currentColor" className="text-light-500" />
                </svg>
              </div>
            </div>

            <button
              onClick={fetchInventory}
              className="p-2.5 text-light-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-dark-700 border border-dark-600"
              title="Refresh data">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Total Inventory</h3>
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Database size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">{inventoryList.length}</p>
        </div>

        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Linked Items</h3>
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Link size={18} className="text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">
            {inventoryList.filter((item) => !!item.connectedProduct).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Unlinked Items</h3>
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <Link2Off size={18} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">
            {inventoryList.filter((item) => !item.connectedProduct).length}
          </p>
        </div>
      </div>

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
                className="mx-auto bg-blue-500 hover:bg-blue-600 text-white">
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

                return (
                  <div
                    key={inventory._id || index}
                    className={`bg-dark-800/50 rounded-xl border ${
                      selectedInventoryIndex === originalIndex
                        ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'border-dark-600 hover:border-dark-500'
                    } transition-all duration-200`}>
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <h3 className="text-light-100 font-medium text-lg">
                            {inventory.inventoryGroup}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs bg-dark-600 text-light-400 px-2 py-0.5 rounded-full">
                              {inventory.digitalAssets.length}{' '}
                              {inventory.digitalAssets.length === 1 ? 'item' : 'items'}
                            </span>
                            {inventory.connectedProduct ? (
                              <div className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                <Link size={12} />
                                <span>Linked to: {inventory.connectedProduct.title}</span>
                              </div>
                            ) : (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                Not linked to any product
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {inventory.connectedProduct ? (
                            <Button2
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnlinkProduct(originalIndex)}
                              className="h-9 text-xs bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                              <Link2Off size={14} className="mr-1" />
                              Unlink Product
                            </Button2>
                          ) : (
                            <Button2
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInventoryIndex(originalIndex);
                                setIsLinkingProduct(true);
                              }}
                              className="h-9 text-xs bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                              <Link size={14} className="mr-1" />
                              Link to Product
                            </Button2>
                          )}
                          <Button2
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInventoryIndex(
                                originalIndex === selectedInventoryIndex ? null : originalIndex
                              );
                              setIsLinkingProduct(false);
                            }}
                            className={`h-9 text-xs ${
                              selectedInventoryIndex === originalIndex
                                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                            }`}>
                            <Database size={14} className="mr-1" />
                            {selectedInventoryIndex === originalIndex
                              ? 'Close Editor'
                              : 'Edit Data'}
                          </Button2>
                        </div>
                      </div>

                      {selectedInventoryIndex === originalIndex && (
                        <div className="mt-4 border-t border-dark-600 pt-4 animate-fadeIn">
                          {isLinkingProduct ? (
                            <div className="bg-dark-700/50 p-4 rounded-xl border border-dark-600">
                              <h4 className="text-sm font-medium text-light-300 mb-3">
                                Link to Product
                              </h4>
                              <div className="flex flex-col md:flex-row gap-3">
                                <select
                                  value={selectedProductId}
                                  onChange={(e) => setSelectedProductId(e.target.value)}
                                  className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-light-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50">
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
                                    onClick={() => handleLinkProduct(originalIndex)}
                                    disabled={!selectedProductId || isLoading}
                                    className="h-10 text-xs bg-blue-500 hover:bg-blue-600 text-white">
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
                              <DigitalInventoryEditor
                                inventoryList={[inventory]}
                                assetKeys={assetKeys}
                                onInventoryChange={(newList) => {
                                  const updatedList = [...inventoryList];
                                  updatedList[originalIndex] = {
                                    ...newList[0],
                                    _id: inventory._id,
                                    productId: inventory.productId,
                                    connectedProduct: inventory.connectedProduct,
                                  };
                                  setInventoryList(updatedList);
                                }}
                                onAssetKeysChange={handleAssetKeysChange}
                                errors={errors}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-6">
              <Button2
                onClick={handleAddNewInventory}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Plus size={16} className="mr-1" />
                Add New Inventory
              </Button2>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between pt-5 border-t border-dark-600 mt-8">
        <Button2
          variant="outline"
          onClick={onClose}
          className="bg-dark-700 hover:bg-dark-600 text-light-300 border-dark-600">
          <span className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Products
          </span>
        </Button2>

        <ButtonWithLoader
          disabled={isLoading}
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
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
              Saving Changes...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={16} />
              Save All Changes
            </span>
          )}
        </ButtonWithLoader>
      </div>
    </div>
  );
}
