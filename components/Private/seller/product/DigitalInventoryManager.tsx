/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Plus } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import EnhancedInventoryEditor from './EnhancedInventoryEditor';
import InventoryCard from './InventoryCard';
import InventorySearch from './InventorySearch';
import InventoryStats from './InventoryStats';
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

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsInitialLoading(true);
      const response = await fetch(`/api/v3/digital-inventory/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('sellerToken')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch digital inventory');
      const data = await response.json();
      if (data.variants?.length) {
        const first = data.variants.find(
          (v: any) => v.digitalAssets?.length || v.specifications?.length
        );
        if (first) {
          const assets = first.digitalAssets || first.specifications;
          setAssetKeys(Object.keys(assets[0] || {}));
        }
        const mapped = await Promise.all(
          data.variants.map(async (variant: any) => {
            let connectedProduct;
            if (variant.productId) {
              try {
                const pr = await fetch(`/api/v3/digital-inventory?productId=${variant.productId}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('sellerToken')}` },
                });
                if (pr.ok) {
                  const pd = await pr.json();
                  connectedProduct = { _id: pd.product._id, title: pd.product.title };
                }
              } catch {}
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
        setInventoryList(mapped);
      } else {
        setInventoryList([
          {
            inventoryGroup: '',
            digitalAssets: [
              assetKeys.reduce((acc, key) => ((acc[key] = ''), acc), {} as Record<string, string>),
            ],
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to load digital inventory');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/v3/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('sellerToken')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products.map((p: Product) => ({ _id: p._id, title: p.title })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssetKeysChange = (newKeys: string[]) => {
    setAssetKeys(newKeys);
    setInventoryList((prev) =>
      prev.map((item) => ({
        ...item,
        digitalAssets: item.digitalAssets.map((asset) => {
          const updated = { ...asset };
          newKeys.forEach((key) => {
            if (!(key in updated)) updated[key] = '';
          });
          Object.keys(updated).forEach((k) => {
            if (!newKeys.includes(k)) delete updated[k];
          });
          return updated;
        }),
      }))
    );
  };

  const handleAddNewInventory = () => {
    setInventoryList((prev) => [
      ...prev,
      {
        inventoryGroup: '',
        digitalAssets: [
          assetKeys.reduce((acc, key) => ((acc[key] = ''), acc), {} as Record<string, string>),
        ],
      },
    ]);
  };

  const handleLinkProduct = async (i: number) => {
    if (!selectedProductId) return;
    const inv = inventoryList[i];
    if (!inv._id) {
      showError('Save inventory first');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v3/digital-inventory/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
        body: JSON.stringify({ variantId: inv._id, productId: selectedProductId }),
      });
      if (!res.ok) throw new Error();
      const prod = products.find((p) => p._id === selectedProductId);
      setInventoryList((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], productId: selectedProductId, connectedProduct: prod };
        return copy;
      });
      setIsLinkingProduct(false);
      setSelectedInventoryIndex(null);
      setSelectedProductId('');
      showSuccess('Product linked');
    } catch {
      showError('Failed to link product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkProduct = async (i: number) => {
    const inv = inventoryList[i];
    if (!inv._id || !inv.productId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v3/digital-inventory/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
        },
        body: JSON.stringify({ variantId: inv._id }),
      });
      if (!res.ok) throw new Error();
      setInventoryList((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], productId: undefined, connectedProduct: undefined };
        return copy;
      });
      showSuccess('Product unlinked');
    } catch {
      showError('Failed to unlink product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateInventory = (i: number) => {
    const inv = { ...inventoryList[i] };
    delete inv._id;
    delete inv.productId;
    delete inv.connectedProduct;
    inv.inventoryGroup += ' (Copy)';
    setInventoryList((prev) => [...prev, inv]);
    showSuccess('Inventory duplicated');
  };

  const handleInventoryChange = (i: number, updated: any) => {
    setInventoryList((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], ...updated };
      return copy;
    });
  };

  const handleSaveInventory = async (i: number) => {
    const inv = inventoryList[i];
    setIsSavingInCard(true);
    try {
      const payload = {
        inventoryGroup: inv.inventoryGroup,
        digitalAssets: inv.digitalAssets,
        productId: inv.productId || null,
      };
      const res = inv._id
        ? await fetch(`/api/v3/digital-inventory`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
            },
            body: JSON.stringify({ id: inv._id, ...payload }),
          })
        : await fetch(`/api/v3/digital-inventory`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sellerToken')}`,
            },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error();
      showSuccess('Saved');
      await fetchInventory();
    } catch {
      showError('Save failed');
    } finally {
      setIsSavingInCard(false);
      setIsEditingInCard(false);
    }
  };

  const filtered = inventoryList
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

  const totalInventory = inventoryList.length;
  const linkedCount = inventoryList.filter((i) => !!i.connectedProduct).length;
  const unlinkedCount = totalInventory - linkedCount;
  const totalAssets = inventoryList.reduce((acc, i) => acc + i.digitalAssets.length, 0);

  if (isInitialLoading) {
    return (
      <div className="p-10 mx-auto my-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
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
              className="bg-primary hover:bg-primary text-dark-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 !rounded-full">
              <Plus size={16} className="mr-1" />
              New Inventory
            </Button2>
          </div>
        </div>

        <InventoryStats
          totalInventory={totalInventory}
          linkedItems={linkedCount}
          unlinkedItems={unlinkedCount}
          totalAssets={totalAssets}
        />

        <InventorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterOption={filterOption}
          onFilterChange={setFilterOption}
          onRefresh={fetchInventory}
        />

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-dark-700/30 rounded-xl border border-dark-600 p-8 text-center">
              <Database className="mx-auto text-light-500 mb-3" size={32} />
              <h3 className="text-light-300 text-lg font-medium mb-2">
                No Digital Inventory Found
              </h3>
              <p className="text-light-500 mb-4">
                {searchTerm || filterOption !== 'all'
                  ? 'No inventory items match your search criteria.'
                  : "You haven't created any digital inventory items yet."}
              </p>
              {!searchTerm && filterOption === 'all' && (
                <Button2
                  className="mx-auto bg-primary hover:bg-primary text-dark-800"
                  onClick={handleAddNewInventory}>
                  <Plus size={16} className="mr-2" />
                  Create New Inventory
                </Button2>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((inventory, idx) => {
                const orig = inventoryList.findIndex(
                  (i) =>
                    i._id === inventory._id ||
                    (i.inventoryGroup === inventory.inventoryGroup && !i._id && !inventory._id)
                );
                const isSelected = selectedInventoryIndex === orig;
                return (
                  <div key={inventory._id || idx} className="animate-fade-in">
                    <InventoryCard
                      inventory={inventory}
                      onEdit={() => {
                        if (isSelected) {
                          setSelectedInventoryIndex(null);
                          setIsEditingInCard(false);
                        } else {
                          setSelectedInventoryIndex(orig);
                          setIsLinkingProduct(false);
                          setIsEditingInCard(true);
                        }
                      }}
                      onSave={() => handleSaveInventory(orig)}
                      onLink={() => {
                        setSelectedInventoryIndex(orig);
                        setIsLinkingProduct(true);
                        setIsEditingInCard(false);
                      }}
                      onUnlink={() => handleUnlinkProduct(orig)}
                      onDuplicate={() => handleDuplicateInventory(orig)}
                      onDelete={() => {}}
                      isSelected={isSelected}
                      isEditing={isSelected && isEditingInCard}
                      isSaving={isSavingInCard}
                    />
                    {isSelected && !isLinkingProduct && (
                      <div className="mt-2 bg-dark-700/50 p-4 rounded-xl border border-dark-600 animate-fadeIn">
                        <EnhancedInventoryEditor
                          inventory={inventoryList[orig]}
                          assetKeys={assetKeys}
                          onInventoryChange={(upd) => handleInventoryChange(orig, upd)}
                          onAssetKeysChange={handleAssetKeysChange}
                          errors={errors}
                          onSave={() => handleSaveInventory(orig)}
                          isSaving={isSavingInCard}
                        />
                      </div>
                    )}
                    {isSelected && isLinkingProduct && (
                      <div className="bg-dark-700/50 p-4 rounded-xl border border-dark-600">
                        <h4 className="text-sm font-medium text-light-300 mb-3">Link to Product</h4>
                        <div className="flex flex-col md:flex-row gap-3">
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                            <option value="">Select a product...</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.title}
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
                              onClick={() => handleLinkProduct(selectedInventoryIndex!)}
                              disabled={!selectedProductId || isLoading}
                              className="h-10 text-xs bg-primary hover:bg-primary text-white">
                              Link Product
                            </Button2>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
      </div>
    </>
  );
}
