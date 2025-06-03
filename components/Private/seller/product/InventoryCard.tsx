'use client';
import React, { useState } from 'react';
import { Database, Edit, Link, Link2Off, Copy, Trash2, Save } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import StatusBadge from './StatusBadge';

interface InventoryCardProps {
  inventory: {
    _id?: string;
    inventoryGroup: string;
    digitalAssets: Array<Record<string, string>>;
    productId?: string;
    connectedProduct?: {
      _id: string;
      title: string;
    };
  };
  onEdit: () => void;
  onLink: () => void;
  onUnlink: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSave?: () => void;
  isSelected: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  inventory,
  onEdit,
  onLink,
  onUnlink,
  onDuplicate,
  onDelete,
  onSave,
  isSelected,
  isEditing = false,
  isSaving = false,
}) => {
  const isLinked = !!inventory.connectedProduct;
  const assetCount = inventory.digitalAssets.length;

  // Get a preview of the first asset's fields
  const getAssetPreview = () => {
    if (assetCount === 0) return [];

    const firstAsset = inventory.digitalAssets[0];
    return Object.entries(firstAsset)
      .slice(0, 3)
      .map(([key, value]) => ({
        key,
        value: value || '—',
      }));
  };

  const assetPreview = getAssetPreview();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDeleteInventory = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className={`bg-dark-800/50 rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-primary/50 shadow-lg shadow-primary/10'
          : 'border-dark-600 hover:border-dark-500'
      } overflow-hidden`}>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
          <div>
            <h3 className="text-light-100 font-medium text-lg flex items-center gap-2">
              {inventory.inventoryGroup}
              {isSelected && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge
                status={isLinked ? 'linked' : 'unlinked'}
                text={
                  isLinked
                    ? `Linked to: ${inventory.connectedProduct?.title}`
                    : 'Not linked to any product'
                }
              />
              <StatusBadge
                status="available"
                text={`${assetCount} ${assetCount === 1 ? 'item' : 'items'}`}
                size="sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button2
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-9 text-xs bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 mr-1"
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
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-1" />
                    Save
                  </>
                )}
              </Button2>
            ) : (
              <>
                {isLinked ? (
                  <Button2
                    variant="outline"
                    size="sm"
                    onClick={onUnlink}
                    className="h-9 text-xs bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                    <Link2Off size={14} className="mr-1" />
                    Unlink
                  </Button2>
                ) : (
                  <Button2
                    variant="outline"
                    size="sm"
                    onClick={onLink}
                    className="h-9 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    <Link size={14} className="mr-1" />
                    Link
                  </Button2>
                )}
              </>
            )}
            <Button2
              variant="outline"
              size="sm"
              onClick={onEdit}
              className={`h-9 text-xs ${
                isSelected
                  ? 'bg-primary text-white border-primary hover:bg-primary'
                  : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              }`}>
              {isSelected ? (
                <>
                  <Database size={14} className="mr-1" />
                  Close
                </>
              ) : (
                <>
                  <Edit size={14} className="mr-1" />
                  Edit
                </>
              )}
            </Button2>
          </div>
        </div>

        {/* Asset preview */}
        <div className="mt-3 bg-dark-700/50 rounded-lg p-3 border border-dark-600">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-medium text-light-400">Asset Preview</h4>
            <span className="text-xs text-light-500">{assetCount} total assets</span>
          </div>

          {assetPreview.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {assetPreview.map(({ key, value }, index) => (
                <div key={index} className="bg-dark-800/50 p-2 rounded-md border border-dark-600">
                  <div className="text-xs text-light-500 mb-1">{key}</div>
                  <div className="text-sm text-light-200 truncate">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-light-500 text-sm">No assets available</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-3 flex justify-start items-center pt-3 border-t border-dark-600">
          <div className="flex gap-1">
            <button
              onClick={onDuplicate}
              className="p-1.5 text-light-500 hover:text-primary transition-colors rounded-md hover:bg-dark-700"
              title="Duplicate inventory">
              <Copy size={16} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 text-light-500 hover:text-red-400 transition-colors rounded-md hover:bg-dark-700"
              title="Delete inventory">
              <Trash2 size={16} />
            </button>
            {isDeleteModalOpen && (
              <div
                className={`absolute left-0 top-0 w-fit bg-dark-800 rounded-xl shadow-xl transform transition-all duration-300 animate-scale-in`}>
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
              </div>
            )}
          </div>
          <div className="ml-auto text-xs text-light-500">
            {assetCount} {assetCount === 1 ? 'asset' : 'assets'} total
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
