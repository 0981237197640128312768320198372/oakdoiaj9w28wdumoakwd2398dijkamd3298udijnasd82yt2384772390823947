'use client';
import React, { useState } from 'react';
import { Edit, Link, Link2Off, Trash2, Save, X } from 'lucide-react';
import { HiOutlineInboxStack } from 'react-icons/hi2';
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
  onDelete: () => void;
  onSave?: () => void;
  isSelected: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  // onDuplicate prop removed as per user request
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  inventory,
  onEdit,
  onLink,
  onUnlink,
  onDelete,
  onSave,
  isSelected,
  isEditing = false,
  isSaving = false,
}) => {
  const isLinked = !!inventory.connectedProduct;
  const assetCount = inventory.digitalAssets.length;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDeleteInventory = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className={`bg-dark-600 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'border-primary/50 border-2'
          : isLinked
          ? 'border-dark-400 border'
          : 'border-yellow-500/50 border shadow-lg shadow-yellow-500/40'
      } overflow-hidden`}>
      <div className="p-4">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h3 className="text-light-100 font-medium text-lg flex items-center gap-2 truncate max-w-[250px]">
                {inventory.inventoryGroup}
                {isSelected && (
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                )}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
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
        </div>

        {/* Bottom action bar */}
        <div className="mt-3 flex justify-between items-center pt-3 border-t border-dark-500">
          <Button2
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 bg-red-500/15 text-red-500 border-red-500 hover:bg-red-500/40 transition-colors rounded-md flex items-center gap-1"
            title="Delete inventory">
            <Trash2 size={16} />
            <span className="text-xs">Delete</span>
          </Button2>{' '}
          {isEditing ? (
            <Button2
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="text-xs bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 flex-1 sm:flex-none">
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
                  className="text-xs bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 flex-1 sm:flex-none">
                  <Link2Off size={14} className="mr-1" />
                  <span className="hidden sm:inline">Unlink</span>
                </Button2>
              ) : (
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={onLink}
                  className="text-xs bg-primary/10 text-primary border-primary/10 hover:bg-primary/10 flex-1 sm:flex-none">
                  <Link size={14} className="mr-1" />
                  <span className="hidden sm:inline">Link</span>
                </Button2>
              )}
            </>
          )}
          <Button2
            variant="outline"
            size="sm"
            onClick={onEdit}
            className={`text-xs flex-1 sm:flex-none ${
              isSelected
                ? 'bg-red-500/15 text-red-500 border-red-500 hover:bg-red-500/40'
                : 'bg-primary/10 text-primary border-primary/10 hover:bg-primary/10'
            }`}>
            {isSelected ? (
              <>
                <HiOutlineInboxStack size={14} className="mr-1" />
                Close
              </>
            ) : (
              <>
                <Edit size={14} className="mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </>
            )}
          </Button2>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-700 rounded-xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-light-100">Delete Inventory</h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-light-500 hover:text-light-300 p-1 rounded-full hover:bg-dark-600">
                  <X size={20} />
                </button>
              </div>

              <p className="text-light-300 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-medium text-light-100">"{inventory.inventoryGroup}"</span>?
                This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-light-300 bg-dark-600 hover:bg-dark-500 rounded-lg font-medium transition-colors duration-200 order-2 sm:order-1">
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteInventory}
                  className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors duration-200 order-1 sm:order-2">
                  Delete Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCard;
