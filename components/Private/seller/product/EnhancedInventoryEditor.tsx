'use client';
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Copy, CheckCircle, Database, Key } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import FormField from '@/components/ui/FormField';
import StatusBadge from './StatusBadge';

interface EnhancedInventoryEditorProps {
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
  assetKeys: string[];
  errors: Record<string, string>;
  onInventoryChange: (inventory: {
    inventoryGroup: string;
    digitalAssets: Array<Record<string, string>>;
  }) => void;
  onAssetKeysChange: (newKeys: string[]) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const EnhancedInventoryEditor: React.FC<EnhancedInventoryEditorProps> = ({
  inventory,
  assetKeys,
  errors,
  onInventoryChange,
  onAssetKeysChange,
  onSave,
  isSaving = false,
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'fields'>('assets');
  const [isEditingKeys, setIsEditingKeys] = useState(false);
  const [editedKeys, setEditedKeys] = useState<string[]>([...assetKeys]);
  const [newKey, setNewKey] = useState('');
  const [editingAssetIndex, setEditingAssetIndex] = useState<number | null>(null);
  const [editedAsset, setEditedAsset] = useState<Record<string, string>>({});
  const [savingAsset, setSavingAsset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<{ index: number; timestamp: number } | null>(null);

  // Handle inventory group name change
  const handleInventoryGroupChange = (value: string) => {
    onInventoryChange({
      ...inventory,
      inventoryGroup: value,
    });
  };

  // Handle adding a new digital asset
  const handleAddDigitalAsset = () => {
    const newAsset = assetKeys.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);

    onInventoryChange({
      ...inventory,
      digitalAssets: [...inventory.digitalAssets, newAsset],
    });
  };

  // Handle removing a digital asset
  const handleRemoveDigitalAsset = (assetIndex: number) => {
    const updatedAssets = [...inventory.digitalAssets];
    updatedAssets.splice(assetIndex, 1);

    onInventoryChange({
      ...inventory,
      digitalAssets: updatedAssets,
    });
  };

  // Handle duplicating a digital asset
  const handleDuplicateDigitalAsset = (assetIndex: number) => {
    const itemToDuplicate = { ...inventory.digitalAssets[assetIndex] };
    const updatedAssets = [...inventory.digitalAssets];
    updatedAssets.splice(assetIndex + 1, 0, itemToDuplicate);

    onInventoryChange({
      ...inventory,
      digitalAssets: updatedAssets,
    });
  };

  // Start editing a digital asset
  const handleStartEditAsset = (assetIndex: number) => {
    setEditingAssetIndex(assetIndex);
    setEditedAsset({ ...inventory.digitalAssets[assetIndex] });
  };

  // Cancel editing a digital asset
  const handleCancelEditAsset = () => {
    setEditingAssetIndex(null);
    setEditedAsset({});
  };

  // Save edited digital asset
  const handleSaveAsset = () => {
    if (editingAssetIndex === null) return;

    setSavingAsset(true);

    // Simulate API call with a short delay
    setTimeout(() => {
      const updatedAssets = [...inventory.digitalAssets];
      updatedAssets[editingAssetIndex] = { ...editedAsset };

      onInventoryChange({
        ...inventory,
        digitalAssets: updatedAssets,
      });

      setSavingAsset(false);
      setSaveSuccess({
        index: editingAssetIndex,
        timestamp: Date.now(),
      });

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 2000);

      setEditingAssetIndex(null);
      setEditedAsset({});
    }, 300);
  };

  // Handle digital asset value change during editing
  const handleEditedAssetChange = (key: string, value: string) => {
    setEditedAsset({
      ...editedAsset,
      [key]: value,
    });
  };

  // Handle digital asset value change (direct mode)
  const handleDigitalAssetChange = (assetIndex: number, key: string, value: string) => {
    const updatedAssets = [...inventory.digitalAssets];
    updatedAssets[assetIndex] = {
      ...updatedAssets[assetIndex],
      [key]: value,
    };

    onInventoryChange({
      ...inventory,
      digitalAssets: updatedAssets,
    });
  };

  // Handle adding a new asset key
  const handleAddKey = () => {
    if (newKey.trim() && !editedKeys.includes(newKey.trim())) {
      const updatedKeys = [...editedKeys, newKey.trim()];
      setEditedKeys(updatedKeys);
      setNewKey('');
    }
  };

  // Handle removing an asset key
  const handleRemoveKey = (keyToRemove: string) => {
    const updatedKeys = editedKeys.filter((key) => key !== keyToRemove);
    setEditedKeys(updatedKeys);
  };

  // Handle saving asset key changes
  const handleSaveKeys = () => {
    onAssetKeysChange(editedKeys);
    setIsEditingKeys(false);
  };

  // Handle canceling asset key edits
  const handleCancelKeyEdit = () => {
    setEditedKeys([...assetKeys]);
    setIsEditingKeys(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 mr-2">
          <FormField
            id="inventoryGroup"
            label="Inventory Group Name"
            error={errors[`inventoryGroup`]}>
            <input
              id="inventoryGroup"
              type="text"
              value={inventory.inventoryGroup}
              onChange={(e) => handleInventoryGroupChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm
                ${
                  errors[`inventoryGroup`]
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                    : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
              placeholder="Enter inventory group name..."
            />
          </FormField>
        </div>

        {inventory.connectedProduct && (
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
            <StatusBadge status="linked" size="sm" />
            <span className="text-sm text-light-300 truncate max-w-[200px]">
              {inventory.connectedProduct.title}
            </span>
          </div>
        )}
      </div>

      <div className="border-b border-dark-600 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'assets' ? 'text-primary' : 'text-light-500 hover:text-light-300'
            }`}>
            <span className="flex items-center gap-1">
              <Database size={14} />
              Digital Assets ({inventory.digitalAssets.length})
            </span>
            {activeTab === 'assets' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'fields' ? 'text-primary' : 'text-light-500 hover:text-light-300'
            }`}>
            <span className="flex items-center gap-1">
              <Key size={14} />
              Asset Fields ({assetKeys.length})
            </span>
            {activeTab === 'fields' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'fields' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-light-400">Digital Asset Fields</h4>
            {!isEditingKeys ? (
              <Button2
                variant="outline"
                size="sm"
                onClick={() => setIsEditingKeys(true)}
                className="h-7 px-2 text-xs">
                <Edit2 size={14} className="mr-1" />
                Edit Fields
              </Button2>
            ) : (
              <div className="flex gap-2">
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={handleCancelKeyEdit}
                  className="h-7 px-2 text-xs bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300">
                  <X size={14} className="mr-1" />
                  Cancel
                </Button2>
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={handleSaveKeys}
                  className="h-7 px-2 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Save size={14} className="mr-1" />
                  Save Fields
                </Button2>
              </div>
            )}
          </div>

          {isEditingKeys ? (
            <div className="bg-dark-800/50 p-3 rounded-md border border-dark-600">
              <div className="flex flex-wrap gap-2 mb-3">
                {editedKeys.map((key, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-dark-700 px-2 py-1 rounded-md text-xs text-light-300">
                    <span>{key}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKey(key)}
                      className="text-light-500 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Add new field..."
                  className="flex-1 px-2 py-1 text-sm bg-dark-700 border border-dark-600 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKey();
                    }
                  }}
                />
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={handleAddKey}
                  className="h-7 px-2 text-xs"
                  disabled={!newKey.trim() || editedKeys.includes(newKey.trim())}>
                  <Plus size={14} className="mr-1" />
                  Add
                </Button2>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assetKeys.map((key, index) => (
                <div
                  key={index}
                  className="bg-dark-700 px-2 py-1 rounded-md text-xs text-light-300">
                  {key}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-4 animate-fadeIn">
          {inventory.digitalAssets.map((asset, assetIndex) => {
            const isEditing = editingAssetIndex === assetIndex;
            const isShowingSuccess =
              saveSuccess?.index === assetIndex && Date.now() - saveSuccess.timestamp < 2000;

            return (
              <div
                key={assetIndex}
                className={`bg-dark-700/50 p-3 rounded-md border transition-all duration-200 ${
                  isEditing
                    ? 'border-primary/50 shadow-md shadow-primary/10'
                    : isShowingSuccess
                    ? 'border-green-500/50 shadow-md shadow-green-500/10'
                    : 'border-dark-600'
                } relative`}>
                {/* Success indicator */}
                {isShowingSuccess && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full animate-fadeIn">
                    <CheckCircle size={12} />
                    <span>Saved successfully</span>
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEditAsset(assetIndex)}
                        className="p-1 text-light-500 hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                        title="Edit asset">
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateDigitalAsset(assetIndex)}
                        className="p-1 text-light-500 hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                        title="Duplicate asset">
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDigitalAsset(assetIndex)}
                        className="p-1 text-light-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
                        title="Remove asset"
                        disabled={inventory.digitalAssets.length <= 1}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleSaveAsset}
                        disabled={savingAsset}
                        className={`p-1 text-light-500 hover:text-green-400 transition-colors rounded-md hover:bg-green-500/10 ${
                          savingAsset ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        title="Save changes">
                        {savingAsset ? (
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-light-500"
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
                        ) : (
                          <Save size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditAsset}
                        className="p-1 text-light-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
                        title="Cancel editing">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {assetKeys.map((key, keyIndex) => (
                    <div key={keyIndex} className="mb-2">
                      <label className="block text-xs font-medium text-light-400 mb-1">{key}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedAsset[key] || ''}
                          onChange={(e) => handleEditedAssetChange(key, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-dark-700/80 border border-primary/30 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                          placeholder={`Enter ${key.toLowerCase()}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={asset[key] || ''}
                          onChange={(e) =>
                            handleDigitalAssetChange(assetIndex, key, e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm bg-dark-700/50 border border-dark-600 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
                          placeholder={`Enter ${key.toLowerCase()}...`}
                          readOnly={isEditing}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center mt-2">
            <Button2
              variant="outline"
              size="sm"
              onClick={handleAddDigitalAsset}
              className="border-dashed border-dark-500 bg-dark-700/30 hover:bg-dark-700/50 text-light-400"
              disabled={editingAssetIndex !== null}>
              <Plus size={14} className="mr-1" />
              Add Digital Asset
            </Button2>
            {onSave && (
              <Button2
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="bg-primary hover:bg-primary text-white shadow-md hover:shadow-lg transition-all duration-300 ml-4">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  <span className="flex items-center gap-1">
                    <Save size={14} />
                    Save
                  </span>
                )}
              </Button2>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInventoryEditor;
