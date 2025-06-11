'use client';

import { useCart } from '@/context/CartContext';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import { ThemeType } from '@/types';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuantityControlsProps {
  productId: string;
  productName: string;
  duration: string;
  price: number;
  theme: ThemeType | null;
  className?: string;
  imageUrl?: string;
  stock: number;
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  productId,
  productName,
  duration,
  price,
  theme,
  className,
  imageUrl,
  stock,
}) => {
  const { addToCart, updateQuantity, getCartItemQuantity } = useCart();
  const [showControls, setShowControls] = useState(false);
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const itemQuantity = getCartItemQuantity(productId);
  const isInCart = itemQuantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click events (like card navigation)
    e.stopPropagation();

    // Prevent adding to cart if stock is 0
    if (stock === 0) return;

    if (!isInCart) {
      addToCart({
        id: productId,
        appName: productName,
        duration,
        price,
        quantity: 1,
        imageUrl,
      });
    }

    setShowControls(true);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent increment if stock is 0 or would exceed stock
    if (stock === 0) return;

    if (isInCart) {
      // Don't allow quantity to exceed available stock
      if (itemQuantity < stock) {
        updateQuantity(productId, itemQuantity + 1, stock);
      }
    } else {
      addToCart({
        id: productId,
        appName: productName,
        duration,
        price,
        quantity: 1,
        imageUrl,
      });
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemQuantity > 1) {
      updateQuantity(productId, itemQuantity - 1, stock);
    } else {
      setShowControls(false);
    }
  };

  if (isInCart || showControls) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center w-full justify-between rounded-lg overflow-hidden',
          themeUtils.getButtonClass(),
          themeUtils.getPrimaryColorClass('bg'),
          className
        )}>
        <button
          onClick={handleDecrement}
          className={cn(
            'p-2 h-full flex items-center justify-center transition-colors',
            isLight ? 'hover:bg-opacity-10 hover:bg-black' : 'hover:bg-opacity-10 hover:bg-white'
          )}>
          <Minus size={16} />
        </button>

        <span className={cn('font-medium')}>{itemQuantity || 1}</span>

        <button
          onClick={handleIncrement}
          disabled={itemQuantity >= stock}
          className={cn(
            'p-2 h-full flex items-center justify-center transition-colors',
            itemQuantity >= stock
              ? 'opacity-50 cursor-not-allowed'
              : isLight
              ? 'hover:bg-opacity-10 hover:bg-black'
              : 'hover:bg-opacity-10 hover:bg-white'
          )}>
          <Plus size={16} />
        </button>
      </motion.div>
    );
  }

  // Don't render add to cart button if stock is 0
  if (stock === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-1 w-full p-2 rounded-lg opacity-50 cursor-not-allowed',
          isLight ? 'bg-gray-300 text-gray-500' : 'bg-gray-600 text-gray-400',
          className
        )}>
        สินค้าหมด
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className={cn(
        'flex items-center justify-center gap-1 w-full p-2 rounded-lg transition-all duration-300',
        themeUtils.getButtonClass(),
        themeUtils.getPrimaryColorClass('bg'),
        className
      )}>
      เพิ่มลงตะกร้า
      <ShoppingCart size={18} />
    </button>
  );
};

export default QuantityControls;
