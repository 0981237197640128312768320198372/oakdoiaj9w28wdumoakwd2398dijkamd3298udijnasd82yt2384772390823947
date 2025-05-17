import React from 'react';
import { Edit, Trash2, AlertTriangle, Check } from 'lucide-react';
import { Product } from '@/types';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const mainImage =
    product.images.length > 0 ? product.images[0] : '/images/dokmai-placeholder.webp';

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image
          width={100}
          height={100}
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div
          className={`absolute top-3 right-3 ${
            product.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200'
          } px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
          {product.status === 'active' ? (
            <>
              <Check size={12} />
              <span>Active</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} />
              <span>Draft</span>
            </>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 p-5">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {product.title}
          </h3>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</span>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200">
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
