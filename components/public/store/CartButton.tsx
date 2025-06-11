'use client';

import { useCart } from '@/context/CartContext';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import { ThemeType } from '@/types';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartButtonProps {
  onClick: () => void;
  theme: ThemeType | null;
  className?: string;
}

const CartButton: React.FC<CartButtonProps> = ({ onClick, theme, className }) => {
  const { cart } = useCart();
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center transition-all duration-300 p-2 group',
        isLight ? 'hover:bg-light-300 bg-light-100' : 'hover:bg-dark-500 bg-dark-600',
        themeUtils.getButtonRoundednessClass(),
        className
      )}
      aria-label="ตะกร้าสินค้า">
      <ShoppingCart
        size={18}
        className={
          isLight
            ? 'text-dark-600 group-hover:text-dark-800'
            : 'text-light-500 group-hover:text-light-100'
        }
      />

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={cn(
              'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold',
              themeUtils.getButtonClass()
            )}>
            {itemCount > 99 ? '99+' : itemCount}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default CartButton;
