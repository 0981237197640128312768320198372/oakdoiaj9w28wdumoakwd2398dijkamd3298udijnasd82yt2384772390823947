'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Copy, CheckCircle } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import FormField from '@/components/ui/FormField';

interface DigitalInventoryEditorProps {
  inventoryList: Array<{
    inventoryGroup: string;
    digitalAssets: Array<Record<string, string>>;
  }>;
  assetKeys: string[];
  errors: Record<string, string>;
  onInventoryChange: (
    newList: Array<{
      inventoryGroup: string;
      digitalAssets: Array<Record<string, string>>;
    }>
  ) => void;
  onAssetKeysChange: (newKeys: string[]) => void;
}

export default function DigitalInventoryEditor({
  inventoryList,
  assetKeys,
  errors,
  onInventoryChange,
  onAssetKeysChange,
}: DigitalInventoryEditorProps) {
  const [isEditingKeys, setIsEditingKeys] = useState(false);
  const [editedKeys, setEditedKeys] = useState<string[]>([...assetKeys]);
  const [newKey, setNewKey] = useState('');
  const [editingInventoryIndex, setEditingInventoryIndex] = useState<number | null>(null);
  const [editingAssetIndex, setEditingAssetIndex] = useState<number | null>(null);
  const [editedAsset, setEditedAsset] = useState<Record<string, string>>({});
  const [savingAsset, setSavingAsset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<{ index: number; timestamp: number } | null>(null);

  // Handle removing an inventory item
  const handleRemoveInventory = (index: number) => {
    const updatedList = [...inventoryList];
    updatedList.splice(index, 1);
    onInventoryChange(updatedList);
  };

  // Handle inventory group name change
  const handleInventoryGroupChange = (index: number, value: string) => {
    const updatedList = [...inventoryList];
    updatedList[index] = {
      ...updatedList[index],
      inventoryGroup: value,
    };
    onInventoryChange(updatedList);
  };

  // Handle adding a new digital asset to an inventory
  const handleAddDigitalAsset = (inventoryIndex: number) => {
    const updatedList = [...inventoryList];
    const newAsset = assetKeys.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);

    updatedList[inventoryIndex].digitalAssets.push(newAsset);
    onInventoryChange(updatedList);
  };

  // Handle removing a digital asset from an inventory
  const handleRemoveDigitalAsset = (inventoryIndex: number, assetIndex: number) => {
    const updatedList = [...inventoryList];
    updatedList[inventoryIndex].digitalAssets.splice(assetIndex, 1);
    onInventoryChange(updatedList);
  };

  // Handle duplicating a digital asset
  const handleDuplicateDigitalAsset = (inventoryIndex: number, assetIndex: number) => {
    const updatedList = [...inventoryList];
    const itemToDuplicate = { ...updatedList[inventoryIndex].digitalAssets[assetIndex] };
    updatedList[inventoryIndex].digitalAssets.splice(assetIndex + 1, 0, itemToDuplicate);
    onInventoryChange(updatedList);
  };

  // Start editing a digital asset
  const handleStartEditAsset = (inventoryIndex: number, assetIndex: number) => {
    setEditingInventoryIndex(inventoryIndex);
    setEditingAssetIndex(assetIndex);
    setEditedAsset({ ...inventoryList[inventoryIndex].digitalAssets[assetIndex] });
  };

  // Cancel editing a digital asset
  const handleCancelEditAsset = () => {
    setEditingInventoryIndex(null);
    setEditingAssetIndex(null);
    setEditedAsset({});
  };

  // Save edited digital asset
  const handleSaveAsset = () => {
    if (editingInventoryIndex === null || editingAssetIndex === null) return;

    setSavingAsset(true);

    // Simulate API call with a short delay
    setTimeout(() => {
      const updatedList = [...inventoryList];
      updatedList[editingInventoryIndex].digitalAssets[editingAssetIndex] = { ...editedAsset };
      onInventoryChange(updatedList);

      setSavingAsset(false);
      setSaveSuccess({
        index: editingInventoryIndex * 100 + editingAssetIndex,
        timestamp: Date.now(),
      });

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 2000);

      setEditingInventoryIndex(null);
      setEditingAssetIndex(null);
      setEditedAsset({});
    }, 500);
  };

  // Handle digital asset value change during editing
  const handleEditedAssetChange = (key: string, value: string) => {
    setEditedAsset({
      ...editedAsset,
      [key]: value,
    });
  };

  // Handle digital asset value change (direct mode)
  const handleDigitalAssetChange = (
    inventoryIndex: number,
    assetIndex: number,
    key: string,
    value: string
  ) => {
    const updatedList = [...inventoryList];
    updatedList[inventoryIndex].digitalAssets[assetIndex] = {
      ...updatedList[inventoryIndex].digitalAssets[assetIndex],
      [key]: value,
    };
    onInventoryChange(updatedList);
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
    <div className="space-y-4">
      {/* Asset keys editor */}
      <div className="mb-4">
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
              <div key={index} className="bg-dark-700 px-2 py-1 rounded-md text-xs text-light-300">
                {key}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital Inventory items */}
      <div className="space-y-6">
        {inventoryList.map((inventory, inventoryIndex) => (
          <div
            key={inventoryIndex}
            className="bg-dark-800/50 p-4 rounded-md border border-dark-600">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1 mr-2">
                <FormField
                  id={`inventoryGroup_${inventoryIndex}`}
                  label="Inventory Group"
                  error={errors[`inventoryGroup_${inventoryIndex}`]}>
                  <input
                    id={`inventoryGroup_${inventoryIndex}`}
                    type="text"
                    value={inventory.inventoryGroup}
                    onChange={(e) => handleInventoryGroupChange(inventoryIndex, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm
                      ${
                        errors[`inventoryGroup_${inventoryIndex}`]
                          ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                          : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                      } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
                    placeholder="Enter inventory group name..."
                  />
                </FormField>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveInventory(inventoryIndex)}
                className="p-1.5 text-light-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10 self-end"
                aria-label="Remove inventory"
                disabled={inventoryList.length <= 1}>
                <Trash2 size={16} />
              </button>
            </div>

            {/* Digital Assets */}
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-light-400">
                  Digital Assets ({inventory.digitalAssets.length})
                </h4>
                <div className="text-xs text-light-500">
                  {inventory.digitalAssets.length}{' '}
                  {inventory.digitalAssets.length === 1 ? 'asset' : 'assets'} in this group
                </div>
              </div>

              {inventory.digitalAssets.map((asset, assetIndex) => {
                const isEditing =
                  editingInventoryIndex === inventoryIndex && editingAssetIndex === assetIndex;
                const isShowingSuccess =
                  saveSuccess?.index === inventoryIndex * 100 + assetIndex &&
                  Date.now() - saveSuccess.timestamp < 2000;

                return (
                  <div
                    key={assetIndex}
                    className={`bg-dark-700/50 p-3 rounded-md border transition-all duration-200 ${
                      isEditing
                        ? 'border-blue-500/50 shadow-md shadow-blue-500/10'
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
                            onClick={() => handleStartEditAsset(inventoryIndex, assetIndex)}
                            className="p-1 text-light-500 hover:text-blue-400 transition-colors rounded-md hover:bg-blue-500/10"
                            title="Edit asset">
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateDigitalAsset(inventoryIndex, assetIndex)}
                            className="p-1 text-light-500 hover:text-blue-400 transition-colors rounded-md hover:bg-blue-500/10"
                            title="Duplicate asset">
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDigitalAsset(inventoryIndex, assetIndex)}
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
                          <label className="block text-xs font-medium text-light-400 mb-1">
                            {key}
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedAsset[key] || ''}
                              onChange={(e) => handleEditedAssetChange(key, e.target.value)}
                              className="w-full px-2 py-1.5 text-sm bg-dark-700/80 border border-blue-500/30 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50"
                              placeholder={`Enter ${key.toLowerCase()}...`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={asset[key] || ''}
                              onChange={(e) =>
                                handleDigitalAssetChange(
                                  inventoryIndex,
                                  assetIndex,
                                  key,
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1.5 text-sm bg-dark-700/50 border border-dark-600 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
                              placeholder={`Enter ${key.toLowerCase()}...`}
                              readOnly={isEditing} // Make read-only when another asset is being edited
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Save button for editing mode */}
                    {isEditing && (
                      <div className="flex justify-end mt-3 pt-2 border-t border-dark-600">
                        <button
                          onClick={handleSaveAsset}
                          disabled={savingAsset}
                          className={`flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 h-8 rounded-md transition-colors ${
                            savingAsset ? 'opacity-70 cursor-not-allowed' : ''
                          }`}>
                          {savingAsset ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3 text-white"
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
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save size={14} />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add digital asset button */}
              <div className="flex justify-center">
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddDigitalAsset(inventoryIndex)}
                  className="mt-2 border-dashed border-dark-500 bg-dark-700/30 hover:bg-dark-700/50 text-light-400"
                  disabled={editingInventoryIndex !== null}>
                  <Plus size={14} className="mr-1" />
                  Add Digital Asset
                </Button2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
