'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';

interface DetailEditorProps {
  keys: string[];
  details: Record<string, string>[];
  onKeysChange: (keys: string[]) => void;
  onDetailsChange: (details: Record<string, string>[]) => void;
}

export default function DetailEditor({
  keys,
  details,
  onKeysChange,
  onDetailsChange,
}: DetailEditorProps) {
  const [isEditingKeys, setIsEditingKeys] = useState(false);
  const [editedKeys, setEditedKeys] = useState<string[]>([...keys]);
  const [newKey, setNewKey] = useState('');

  // Handle adding a new detail row
  const handleAddDetail = () => {
    const newDetail: Record<string, string> = {};
    keys.forEach((key) => {
      newDetail[key] = '';
    });
    onDetailsChange([...details, newDetail]);
  };

  // Handle removing a detail row
  const handleRemoveDetail = (index: number) => {
    const updatedDetails = [...details];
    updatedDetails.splice(index, 1);
    onDetailsChange(updatedDetails);
  };

  // Handle detail value change
  const handleDetailChange = (index: number, key: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [key]: value };
    onDetailsChange(updatedDetails);
  };

  // Handle adding a new key
  const handleAddKey = () => {
    if (newKey.trim() && !editedKeys.includes(newKey.trim())) {
      const updatedKeys = [...editedKeys, newKey.trim()];
      setEditedKeys(updatedKeys);
      setNewKey('');
    }
  };

  // Handle removing a key
  const handleRemoveKey = (keyToRemove: string) => {
    const updatedKeys = editedKeys.filter((key) => key !== keyToRemove);
    setEditedKeys(updatedKeys);
  };

  // Handle saving key changes
  const handleSaveKeys = () => {
    // Update the keys
    onKeysChange(editedKeys);

    // Update all details to include the new keys
    const updatedDetails = details.map((detail) => {
      const newDetail: Record<string, string> = {};
      editedKeys.forEach((key) => {
        newDetail[key] = detail[key] || '';
      });
      return newDetail;
    });

    onDetailsChange(updatedDetails);
    setIsEditingKeys(false);
  };

  // Handle canceling key edits
  const handleCancelKeyEdit = () => {
    setEditedKeys([...keys]);
    setIsEditingKeys(false);
  };

  return (
    <div className="space-y-4">
      {/* Keys editor */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-light-400">Specification Fields</h4>
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
            {keys.map((key, index) => (
              <div key={index} className="bg-dark-700 px-2 py-1 rounded-md text-xs text-light-300">
                {key}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {keys.map((key, index) => (
                <th
                  key={index}
                  className="text-left p-2 text-xs font-medium text-light-400 border-b border-dark-600">
                  {key}
                </th>
              ))}
              <th className="w-10 p-2 border-b border-dark-600"></th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, rowIndex) => (
              <tr key={rowIndex} className="border-b border-dark-700 last:border-0">
                {keys.map((key, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <input
                      type="text"
                      value={detail[key] || ''}
                      onChange={(e) => handleDetailChange(rowIndex, key, e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-dark-700/50 border border-dark-600 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
                      placeholder={`Enter ${key.toLowerCase()}...`}
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(rowIndex)}
                    className="p-1 text-light-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
                    aria-label="Remove detail">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add detail button */}
      <div className="flex justify-center">
        <Button2
          variant="outline"
          size="sm"
          onClick={handleAddDetail}
          className="mt-2 border-dashed border-dark-500 bg-dark-700/30 hover:bg-dark-700/50 text-light-400">
          <Plus size={16} className="mr-1" />
          Add Variant
        </Button2>
      </div>
    </div>
  );
}
