'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Copy, Check } from 'lucide-react';

interface DigitalAsset {
  key: string;
  value: string;
}

interface AssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productTitle: string;
  digitalAssets: DigitalAsset[];
}

const AssetsModal: React.FC<AssetsModalProps> = ({
  isOpen,
  onClose,
  orderId,
  productTitle,
  digitalAssets,
}) => {
  const [copiedAssets, setCopiedAssets] = useState<Record<string, boolean>>({});

  const parseAssetValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const copyIndividualAsset = async (assetIndex: number, asset: DigitalAsset) => {
    const assetId = `modal-${assetIndex}`;
    const parsedValue = parseAssetValue(asset.value);
    let assetText = '';

    if (parsedValue) {
      const assetParts: string[] = [];
      Object.entries(parsedValue).forEach(([key, value]) => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        assetParts.push(`${capitalizedKey}: ${String(value)}`);
      });
      assetText = assetParts.join('\n');
    } else {
      const capitalizedKey = asset.key.charAt(0).toUpperCase() + asset.key.slice(1);
      assetText = `${capitalizedKey}: ${asset.value}`;
    }

    try {
      await navigator.clipboard.writeText(assetText);
      setCopiedAssets((prev) => ({ ...prev, [assetId]: true }));
      setTimeout(() => {
        setCopiedAssets((prev) => ({ ...prev, [assetId]: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to copy asset: ', err);
    }
  };

  const copyAllAssets = async () => {
    const allAssetsText = digitalAssets
      .map((asset) => {
        const parsedValue = parseAssetValue(asset.value);
        if (parsedValue) {
          const assetParts: string[] = [];
          Object.entries(parsedValue).forEach(([key, value]) => {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            assetParts.push(`${capitalizedKey}: ${String(value)}`);
          });
          return assetParts.join('\n');
        } else {
          const capitalizedKey = asset.key.charAt(0).toUpperCase() + asset.key.slice(1);
          return `${capitalizedKey}: ${asset.value}`;
        }
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(allAssetsText);
      setCopiedAssets((prev) => ({ ...prev, all: true }));
      setTimeout(() => {
        setCopiedAssets((prev) => ({ ...prev, all: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to copy all assets: ', err);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset copied states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopiedAssets({});
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-600 bg-dark-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600/20 rounded-lg">
                  <Key size={16} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-light-100">Digital Assets</h3>
                  <p className="text-xs text-light-500 truncate max-w-xs">{productTitle}</p>
                  <p className="text-xs text-light-600">Order: {orderId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
                <X size={16} className="text-light-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Copy All Button */}
              {digitalAssets.length > 1 && (
                <div className="mb-4">
                  <button
                    onClick={copyAllAssets}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-600/50 text-primary-400 rounded-lg transition-colors text-xs font-medium">
                    {copiedAssets['all'] ? (
                      <>
                        <Check size={12} />
                        All Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy All Assets
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Assets List */}
              <div className="space-y-4">
                {digitalAssets.map((asset, assetIndex) => {
                  const parsedValue = parseAssetValue(asset.value);
                  const assetId = `modal-${assetIndex}`;
                  const isCopied = copiedAssets[assetId] || false;

                  return (
                    <motion.div
                      key={assetIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: assetIndex * 0.05 }}
                      className="p-4 border border-dark-600 rounded-lg bg-dark-700 space-y-3">
                      {/* Asset Content */}
                      <div className="space-y-2">
                        {parsedValue ? (
                          <div className="space-y-2">
                            {Object.entries(parsedValue).map(([key, value], idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span className="text-xs text-light-400 font-medium">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                                </span>
                                <span className="text-xs text-light-200 font-mono break-all bg-dark-800 px-2 py-1 rounded">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-xs text-light-400 font-medium">
                              {asset.key.charAt(0).toUpperCase() + asset.key.slice(1)}:
                            </span>
                            <span className="text-xs text-light-200 font-mono break-all bg-dark-800 px-2 py-1 rounded">
                              {asset.value}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => copyIndividualAsset(assetIndex, asset)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-primary-600/20 hover:bg-primary-600/30 border border-primary-600/50 text-primary-400 rounded-lg transition-colors font-medium">
                        {isCopied ? (
                          <>
                            <Check size={12} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy Asset
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-600 bg-dark-700">
              <div className="flex justify-between items-center">
                <p className="text-xs text-light-500">
                  {digitalAssets.length} asset{digitalAssets.length !== 1 ? 's' : ''} available
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-light-100 rounded-lg transition-colors text-xs font-medium">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssetsModal;
