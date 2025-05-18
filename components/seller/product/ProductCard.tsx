import React from 'react';
import { Edit, Trash2, AlertTriangle, Check } from 'lucide-react';
import { Product } from '@/types';
import Image from 'next/image';
import dokmaicoin from '@/assets/images/dokmaicoin3d.png';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const mainImage =
    product.images.length > 0 ? product.images[0] : '/images/dokmai-placeholder.webp';

  return (
    <div className="group relative bg-gradient-to-b from-dark-800 to-dark-850 rounded-lg overflow-hidden border border-dark-600 hover:border-dark-400 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-dark-800/20 hover:-translate-y-0.5">
      <div className="relative aspect-square w-full overflow-hidden bg-dark-700/50">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-contain p-2 group-hover:scale-102 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 via-transparent to-transparent group-hover:opacity-0 opacity-100 transition-opacity duration-300" />

        <div
          className={`
        absolute bottom-1 right-1 flex items-center gap-1 px-1 py-0.5 rounded-lg text-xs font-medium
        backdrop-blur-md transition-all duration-200
        ${
          product.status === 'active'
            ? 'bg-green-900 border border-green-500/20 text-green-500'
            : 'bg-amber-900 border border-amber-500/20 text-amber-500'
        }
      `}>
          {product.status === 'active' ? (
            <>
              <Check size={10} strokeWidth={2.5} />
              <span>Active</span>
            </>
          ) : (
            <>
              <AlertTriangle size={10} strokeWidth={2.5} />
              <span>Draft</span>
            </>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex flex-col items-start justify-start gap-2">
          <h3 className="text-sm font-medium text-light-200 line-clamp-1">{product.title}</h3>
          <span className="text-xs font-semibold text-primary whitespace-nowrap flex gap-1 items-center">
            <Image src={dokmaicoin} alt="Dokmai Coin" className="h-4 w-4" width={50} height={50} />
            {product.price.toFixed(2)}
          </span>
        </div>

        {/* <p className="text-xs text-light-500 line-clamp-2 min-h-[2.5rem]">{product.description}</p> */}

        <div className="flex items-center justify-between pt-2 border-t border-dark-600">
          <span className="text-xs text-light-600">Stock: {product.stock}</span>
          <div className="flex -space-x-1">
            <button
              onClick={() => onEdit(product)}
              className="relative p-1.5 text-light-500 hover:text-primary rounded-full hover:bg-primary/10 transition-all duration-200 z-10">
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="relative p-1.5 text-light-500 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-all duration-200">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
