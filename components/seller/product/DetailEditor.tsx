/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DetailEditorProps {
  keys: string[];
  details: Record<string, string>[];
  onKeysChange: (keys: string[]) => void;
  onDetailsChange: (details: Record<string, string>[]) => void;
}

const DetailEditor: React.FC<DetailEditorProps> = ({
  keys,
  details,
  onKeysChange,
  onDetailsChange,
}) => {
  const [newKey, setNewKey] = useState('');

  const addKey = () => {
    if (newKey.trim() && !keys.includes(newKey.trim())) {
      const updatedKeys = [...keys, newKey.trim()];
      onKeysChange(updatedKeys);
      setNewKey('');
    }
  };

  const removeKey = (keyToRemove: string) => {
    const updatedKeys = keys.filter((key) => key !== keyToRemove);
    onKeysChange(updatedKeys);

    const updatedDetails = details.map((detail) => {
      const { [keyToRemove]: _, ...rest } = detail;
      return rest;
    });
    onDetailsChange(updatedDetails);
  };

  const addDetail = () => {
    const newDetail: Record<string, string> = {};
    keys.forEach((key) => {
      newDetail[key] = '';
    });
    onDetailsChange([...details, newDetail]);
  };

  const updateDetail = (index: number, key: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index][key] = value;
    onDetailsChange(updatedDetails);
  };

  const removeDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    onDetailsChange(updatedDetails);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKey.trim()) {
      e.preventDefault();
      addKey();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-light-100 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
          Define Product Detail Fields
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new field (e.g., email, password)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-dark-500 bg-dark-700/50 text-light-300 
                      focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200
                      placeholder:text-light-600"
          />
          <Button variant="primary" onClick={addKey} disabled={!newKey.trim()}>
            Add Field
          </Button>
        </div>

        {keys.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-dark-800/50 rounded-lg border border-dark-600 animate-fadeIn">
            {keys.map((key) => (
              <div
                key={key}
                className="flex items-center gap-1.5 bg-dark-600 hover:bg-dark-500 px-3 py-1.5 rounded-full
                           transition-all duration-200 group">
                <span className="text-light-300 text-sm">{key}</span>
                <button
                  type="button"
                  onClick={() => removeKey(key)}
                  className="text-light-500 hover:text-red-400 transition-colors duration-200
                             opacity-70 group-hover:opacity-100"
                  aria-label={`Remove ${key} field`}>
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-light-100 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
            Product Details
            <span className="text-xs font-normal text-light-500 ml-2">
              ({details.length} items)
            </span>
          </h3>
          <Button
            variant="primary"
            size="sm"
            onClick={addDetail}
            disabled={keys.length === 0}
            icon={<Plus size={14} />}>
            Add Detail
          </Button>
        </div>

        {keys.length === 0 && (
          <div className="p-4 border border-dashed border-dark-500 rounded-lg bg-dark-800/30 text-center">
            <p className="text-light-500 text-sm">
              Define fields above before adding product details
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto __dokmai_scrollbar pr-2">
          {details.map((detail, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-b from-dark-700 to-dark-750 rounded-xl border border-dark-600
                       transition-all duration-200 hover:shadow-md hover:shadow-dark-900/50 group">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-dark-600">
                <h4 className="text-sm font-medium text-light-200">Detail #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDetail(index)}
                  className="text-light-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-900/20
                           transition-all duration-200 opacity-60 group-hover:opacity-100"
                  aria-label={`Remove detail ${index + 1}`}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid gap-3">
                {keys.map((key) => (
                  <div key={key} className="group/field">
                    <label className="block text-xs font-medium text-light-500 mb-1 group-hover/field:text-light-300 transition-colors">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={detail[key] || ''}
                      onChange={(e) => updateDetail(index, key, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-dark-500 bg-dark-700/70 text-light-200
                                focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200
                                hover:border-dark-400"
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailEditor;
