'use client';

import { useCart } from '@/context/CartContext';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import { ThemeType } from '@/types';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  duration: string;
  price: number;
  theme: ThemeType | null;
  className?: string;
  variant?: 'icon' | 'full';
  quantity?: number;
  imageUrl?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  duration,
  price,
  theme,
  className,
  variant = 'full',
  quantity = 1,
  imageUrl,
}) => {
  const { addToCart, getCartItemQuantity } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const itemQuantity = getCartItemQuantity(productId);
  const isInCart = itemQuantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click events (like card navigation)
    e.stopPropagation();

    addToCart({
      id: productId,
      appName: productName,
      duration,
      price,
      quantity: quantity || 1,
      imageUrl,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        variant === 'full'
          ? 'flex items-center justify-center gap-2 px-4 py-2 font-medium'
          : 'p-2 aspect-square',
        themeUtils.getButtonRoundednessClass(),
        isInCart
          ? isLight
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
          : themeUtils.getButtonClass(),
        isInCart ? '' : themeUtils.getPrimaryColorClass('bg'),
        className
      )}
      disabled={isAdded}>
      {isAdded ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1">
          <Check size={variant === 'full' ? 18 : 16} />
          {variant === 'full' && <span>เพิ่มแล้ว</span>}
        </motion.div>
      ) : (
        <>
          {isInCart ? (
            <div className="flex items-center gap-1">
              <Check size={variant === 'full' ? 18 : 16} />
              {variant === 'full' && (
                <span>อยู่ในตะกร้า {itemQuantity > 1 && `(${itemQuantity})`}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {variant === 'icon' ? (
                <ShoppingCart size={16} />
              ) : (
                <>
                  <Plus size={18} />
                  <span>เพิ่มลงตะกร้า</span>
                </>
              )}
            </div>
          )}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
