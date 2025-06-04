/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Save, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import Modal from '@/components/ui/Modal';
import StepIndicator from '@/components/ui/StepIndicator';
import FormField from '@/components/ui/FormField';
import { HiOutlineInboxStack } from 'react-icons/hi2';

interface InventoryCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inventory: {
    inventoryGroup: string;
    digitalAssets: Array<Record<string, string>>;
    assetKeys: string[];
  }) => void;
  defaultAssetKeys: string[];
}

const InventoryCreationWizard: React.FC<InventoryCreationWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultAssetKeys,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inventoryName, setInventoryName] = useState('');
  const [assetKeys, setAssetKeys] = useState<string[]>([...defaultAssetKeys]);
  const [newKey, setNewKey] = useState('');
  const [digitalAssets, setDigitalAssets] = useState<Array<Record<string, string>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setInventoryName('');
      setAssetKeys([...defaultAssetKeys]);
      setDigitalAssets([]);
      setIsLoading(false);
      setNameError('');
    }
  }, [isOpen, defaultAssetKeys]);

  // Initialize digital assets when asset keys change
  useEffect(() => {
    if (digitalAssets.length === 0 && assetKeys.length > 0) {
      // Create a default empty asset
      const defaultAsset = assetKeys.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as Record<string, string>);

      setDigitalAssets([defaultAsset]);
    } else if (digitalAssets.length > 0) {
      // Update existing assets with new keys
      const updatedAssets = digitalAssets.map((asset) => {
        const updatedAsset: Record<string, string> = {};

        // Add all current keys from assetKeys
        assetKeys.forEach((key) => {
          // Keep existing values if available, otherwise use empty string
          updatedAsset[key] = asset[key] || '';
        });

        return updatedAsset;
      });

      setDigitalAssets(updatedAssets);
    }
  }, [assetKeys]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate inventory name
      if (!inventoryName.trim()) {
        setNameError('Inventory name is required');
        return;
      }
      setNameError('');
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddKey = () => {
    if (newKey.trim() && !assetKeys.includes(newKey.trim())) {
      setAssetKeys([...assetKeys, newKey.trim()]);
      setNewKey('');
    }
  };

  const handleRemoveKey = (keyToRemove: string) => {
    setAssetKeys(assetKeys.filter((key) => key !== keyToRemove));
  };

  const handleAddDigitalAsset = () => {
    const newAsset = assetKeys.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);

    setDigitalAssets([...digitalAssets, newAsset]);
  };

  const handleRemoveDigitalAsset = (index: number) => {
    const updatedAssets = [...digitalAssets];
    updatedAssets.splice(index, 1);
    setDigitalAssets(updatedAssets);
  };

  const handleDigitalAssetChange = (assetIndex: number, key: string, value: string) => {
    const updatedAssets = [...digitalAssets];
    updatedAssets[assetIndex] = {
      ...updatedAssets[assetIndex],
      [key]: value,
    };
    setDigitalAssets(updatedAssets);
  };

  const handleSaveInventory = () => {
    setIsLoading(true);

    // Create the inventory object
    const inventory = {
      inventoryGroup: inventoryName.trim(),
      digitalAssets,
      assetKeys,
    };

    // Call the onSave callback
    onSave(inventory);

    // Close the modal
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-light-100 flex items-center">
            <HiOutlineInboxStack className="mr-2 text-primary" size={24} />
            Create New Inventory
          </h2>
          <button
            onClick={onClose}
            className="text-light-500 hover:text-light-300 p-1 rounded-full hover:bg-dark-700">
            <X size={20} />
          </button>
        </div>

        <StepIndicator
          currentStep={currentStep}
          totalSteps={3}
          onStepClick={(step) => {
            // Only allow going back to previous steps
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />

        <div className="mt-6">
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-medium text-light-100 mb-4">Step 1: Inventory Name</h3>
              <p className="text-light-400 mb-6">
                Give your inventory a descriptive name to help you identify it later.
              </p>

              <FormField id="inventoryGroup" label="Inventory Name" error={nameError}>
                <input
                  id="inventoryGroup"
                  type="text"
                  value={inventoryName}
                  onChange={(e) => setInventoryName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm
                    ${
                      nameError
                        ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                        : 'border-dark-500 bg-dark-500/50 focus:border-primary/50'
                    } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/10`}
                  placeholder="Enter inventory name..."
                />
              </FormField>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-medium text-light-100 mb-4">
                Step 2: Digital Asset Fields
              </h3>
              <p className="text-light-400 mb-6">
                Define the fields that each digital asset in this inventory will have.
              </p>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-medium text-light-400">Digital Asset Fields</h4>
                </div>

                <div className="bg-dark-500 p-3 rounded-md border border-dark-500">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {assetKeys.map((key, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-dark-500 px-2 py-1 rounded-md text-xs text-light-300">
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Add new field..."
                      className="flex-1 px-2 py-1.5 text-sm bg-dark-400 border border-dark-300 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/10 focus:border-primary/30"
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
                      type="button"
                      className="h-8 px-2 text-xs w-full sm:w-auto"
                      disabled={!newKey.trim() || assetKeys.includes(newKey.trim())}>
                      <Plus size={14} className="mr-1" />
                      Add Field
                    </Button2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-medium text-light-100 mb-4">Step 3: Digital Assets</h3>
              <p className="text-light-400 mb-6">
                Add the digital assets to your inventory with values for each field.
              </p>

              <div className="space-y-5 overflow-y-auto __dokmai_scrollbar max-h-[50vh]">
                {digitalAssets.map((asset, assetIndex) => (
                  <div
                    key={assetIndex}
                    className="bg-dark-500/50 p-3 rounded-md border border-dark-500 relative">
                    {digitalAssets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDigitalAsset(assetIndex)}
                        className="absolute top-2 right-2 p-1 text-light-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
                        title="Remove asset">
                        <X size={14} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {assetKeys.map((key, keyIndex) => (
                        <div key={keyIndex} className="mb-2">
                          <label className="block text-xs font-medium text-light-400 mb-1">
                            {key}
                          </label>
                          <input
                            type="text"
                            value={asset[key] || ''}
                            onChange={(e) =>
                              handleDigitalAssetChange(assetIndex, key, e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-sm bg-dark-500/50 border border-dark-500 rounded-md text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/10 focus:border-primary/30"
                            placeholder={`Enter ${key.toLowerCase()}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-4">
                  <Button2
                    variant="outline"
                    size="sm"
                    onClick={handleAddDigitalAsset}
                    type="button"
                    className="border-dashed border-dark-500 bg-dark-500/30 hover:bg-dark-500/50 text-light-400 w-full sm:w-auto">
                    <Plus size={14} className="mr-1" />
                    Add Digital Asset
                  </Button2>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button2
              variant="outline"
              onClick={handlePreviousStep}
              className="bg-dark-700 border-dark-600 text-light-300 hover:bg-dark-600">
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button2>
          ) : (
            <div></div> // Empty div to maintain layout
          )}

          {currentStep < 3 ? (
            <Button2 onClick={handleNextStep} className="bg-primary hover:bg-primary text-dark-800">
              Next
              <ArrowRight size={16} className="ml-1" />
            </Button2>
          ) : (
            <Button2
              onClick={handleSaveInventory}
              disabled={isLoading}
              className="bg-primary hover:bg-primary text-dark-800">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-1"
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
                  <Save size={16} className="mr-1" />
                  Save Inventory
                </>
              )}
            </Button2>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InventoryCreationWizard;
