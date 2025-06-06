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
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  productId,
  productName,
  duration,
  price,
  theme,
  className,
  imageUrl,
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
    if (isInCart) {
      updateQuantity(productId, itemQuantity + 1);
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
      updateQuantity(productId, itemQuantity - 1);
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
          <Minus size={16} className={isLight ? 'text-light-100' : 'text-dark-800'} />
        </button>

        <span className={cn('font-medium', isLight ? 'text-light-100' : 'text-dark-800')}>
          {itemQuantity || 1}
        </span>

        <button
          onClick={handleIncrement}
          className={cn(
            'p-2 h-full flex items-center justify-center transition-colors',
            isLight ? 'hover:bg-opacity-10 hover:bg-black' : 'hover:bg-opacity-10 hover:bg-white'
          )}>
          <Plus size={16} className={isLight ? 'text-light-100' : 'text-dark-800'} />
        </button>
      </motion.div>
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
      <ShoppingCart size={18} className={isLight ? 'text-light-100' : 'text-dark-800'} />
    </button>
  );
};

export default QuantityControls;
