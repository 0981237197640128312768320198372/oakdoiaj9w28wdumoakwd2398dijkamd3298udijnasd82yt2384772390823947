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
    <div className="group bg-dark-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-dark-500 transition-all duration-300 flex flex-col">
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
              ? 'bg-green-500/20 border-[1px] border-green-500/30 text-green-500'
              : 'bg-amber-500/20 border-[1px] border-amber-500/30 text-amber-500 '
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

      <div className="flex-1 p-5">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="text-lg font-semibold text-light-300 truncate">{product.title}</h3>
          <span className="text-primary font-bold">{product.price.toFixed(2)}</span>
        </div>

        <p className="text-light-500 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-500">
          <span className="text-sm text-light-800">Stock: {product.stock}</span>

          <div className="flex space-x-2 bgred">
            <button
              onClick={() => onEdit(product)}
              className="p-2 hover:text-blue-500 text-light-400 rounded-full hover:bg-blue-500/15 transition-colors duration-200">
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="p-2 hover:text-red-500 text-light-400 rounded-full hover:bg-red-500/15 transition-colors duration-200">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
