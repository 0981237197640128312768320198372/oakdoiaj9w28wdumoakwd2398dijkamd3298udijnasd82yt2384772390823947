/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import StatusBadge from './StatusBadge';
import { HiOutlineInboxStack } from 'react-icons/hi2';

interface InventoryEditorProps {
  inventory: {
    _id?: string;
    inventoryGroup: string;
    digitalAssets: Array<Record<string, string>>;
    assetKeys?: string[];
    productId?: string;
    connectedProduct?: {
      _id: string;
      title: string;
    };
  };
  assetKeys: string[];
  onInventoryChange: (inventory: {
    inventoryGroup: string;
    digitalAssets: Array<Record<string, string>>;
    assetKeys?: string[];
  }) => void;
  onAssetKeysChange: (newKeys: string[]) => void;
  onSave?: (skipRefresh?: boolean) => void;
  isSaving?: boolean;
}

const InventoryEditor: React.FC<InventoryEditorProps> = ({
  inventory,
  assetKeys,
  onInventoryChange,
  onSave,
  isSaving = false,
}) => {
  // Keep track of asset keys
  const [editedKeys, setEditedKeys] = useState<string[]>([...assetKeys]);
  const [localAssets, setLocalAssets] = useState<Array<Record<string, string>>>([]);

  useEffect(() => {
    setLocalAssets(JSON.parse(JSON.stringify(inventory.digitalAssets)));
  }, [inventory._id]);

  useEffect(() => {
    setEditedKeys([...assetKeys]);
  }, [assetKeys]);

  useEffect(() => {}, [inventory, assetKeys, editedKeys]);

  const handleAddDigitalAsset = () => {
    const keysToUse = assetKeys;

    const newAsset = keysToUse.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);

    const updatedAssets = [...localAssets, newAsset];
    setLocalAssets(updatedAssets);

    onInventoryChange({
      ...inventory,
      digitalAssets: updatedAssets,
    });
  };

  const handleRemoveDigitalAsset = (assetIndex: number) => {
    const updatedAssets = [...localAssets];
    updatedAssets.splice(assetIndex, 1);

    setLocalAssets(updatedAssets);

    onInventoryChange({
      ...inventory,
      digitalAssets: updatedAssets,
    });
  };

  const handleDigitalAssetChange = (assetIndex: number, key: string, value: string) => {
    const updatedAssets = [...localAssets];
    updatedAssets[assetIndex] = {
      ...updatedAssets[assetIndex],
      [key]: value,
    };

    setLocalAssets(updatedAssets);

    onInventoryChange({
      ...inventory,
      digitalAssets: updatedAssets,
    });
  };

  const commitAllChanges = () => {
    const updatedInventory = { ...inventory };
    if (!updatedInventory.inventoryGroup || updatedInventory.inventoryGroup.trim() === '') {
      updatedInventory.inventoryGroup = 'Inventory ' + new Date().toISOString().slice(0, 10);
    }

    onInventoryChange({
      ...updatedInventory,
      digitalAssets: localAssets,
    });
  };

  return (
    <div className="space-y-5">
      {inventory.connectedProduct && (
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/10 mb-5">
          <StatusBadge status="linked" size="sm" />
          <span className="text-sm text-light-300 truncate max-w-[200px]">
            {inventory.connectedProduct.title}
          </span>
        </div>
      )}

      <div className="border-b border-dark-500 mb-5">
        <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
          <div className="pb-2 px-1 text-sm font-medium text-primary relative whitespace-nowrap">
            <span className="flex items-center gap-1">
              <HiOutlineInboxStack size={14} />
              Digital Assets ({inventory.digitalAssets.length})
            </span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 overflow-y-auto __dokmai_scrollbar max-h-96 animate-fadeIn bg-dark-700">
        {localAssets.map((asset, assetIndex) => {
          return (
            <div
              key={assetIndex}
              className="bg-dark-500/50 p-3 rounded-md border border-dark-300 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {assetKeys.map((key, keyIndex) => (
                  <div key={keyIndex} className="mb-2">
                    <div className="flex items-center">
                      <label className="block text-xs font-medium text-light-400 mb-1 flex-1">
                        {key}
                      </label>
                    </div>
                    <input
                      type="text"
                      value={asset[key] || ''}
                      onChange={(e) => handleDigitalAssetChange(assetIndex, key, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm bg-dark-500/50 border border-dark-500 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/10 focus:border-primary/30"
                      placeholder={`Enter ${key.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex w-full items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveDigitalAsset(assetIndex)}
                  className="py-1 px-2 rounded mt-3 text-light-500 text-xs flex gap-1 items-center hover:text-red-400 transition-colors hover:bg-red-500/10"
                  title="Remove asset"
                  disabled={localAssets.length <= 1}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between items-center mt-4">
          <Button2
            variant="outline"
            size="sm"
            onClick={handleAddDigitalAsset}
            type="button"
            className="border-dashed border-dark-300 bg-dark-500/30 hover:bg-dark-500/50 text-light-400 w-full sm:w-auto">
            <Plus size={14} className="mr-1" />
            Add Digital Asset
          </Button2>
        </div>
      </div>

      {onSave && (
        <div className="flex justify-end mt-6">
          <Button2
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              commitAllChanges();
              onSave();
            }}
            type="button"
            disabled={isSaving}
            className="bg-primary hover:bg-primary shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
            {isSaving ? (
              <span className="flex items-center justify-center gap-1">
                <svg
                  className="animate-spin h-4 w-4"
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
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Save size={14} />
                Save Inventory
              </span>
            )}
          </Button2>
        </div>
      )}
    </div>
  );
};

export default InventoryEditor;
