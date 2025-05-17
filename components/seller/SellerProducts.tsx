/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';

interface Product {
  _id: string;
  title: string;
  description: string;
  stock: number;
  type: string;
  categoryId: string;
  price: number;
  images: string[];
  status: 'active' | 'draft';
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  title: string;
  description: string;
  stock: number;
  type: string;
  categoryId: string;
  price: number;
  images: string[];
  status: 'active' | 'draft';
}

const SellerProducts = () => {
  const { seller } = useSellerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    stock: 0,
    type: '',
    categoryId: '',
    price: 0,
    images: [],
    status: 'draft',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch products when component mounts or seller changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v3/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      }
    };

    if (seller) {
      fetchProducts();
    }
  }, [seller]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/v3/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (err) {
        console.error('An unexpected error occurred while fetching categories');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v3/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Product added successfully');
        setProducts((prev) => [...prev, data.product]); // Add new product to list
        setIsAddingProduct(false);
        setFormData({
          title: '',
          description: '',
          stock: 0,
          type: '',
          categoryId: '',
          price: 0,
          images: [],
          status: 'draft',
        }); // Reset form
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-100">Your Products</h1>
        <button
          onClick={() => setIsAddingProduct(true)}
          className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-white text-sm rounded-full px-4 py-2 font-bold transition-all duration-300">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isAddingProduct && (
        <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-light-100 mb-4">Add New Product</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2"
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2"
            />
            <input
              type="text"
              name="type"
              placeholder="Type"
              value={formData.type}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2"
            />
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2">
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2"
            />
            <input
              type="text"
              name="images"
              placeholder="Images (comma-separated URLs)"
              value={formData.images.join(',')}
              onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',') })}
              className="block w-full border rounded-md p-2"
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="block w-full border rounded-md p-2">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
            <button
              onClick={handleSubmit}
              className="bg-primary/90 hover:bg-primary text-white text-sm rounded-full px-4 py-2 font-bold transition-all duration-300">
              Save Product
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-dark-600 border border-dark-400 rounded-xl p-4">
              <h3 className="text-lg font-bold text-light-100">{product.title}</h3>
              <p className="text-light-500">{product.description.substring(0, 100)}...</p>
              <p className="text-light-100">Price: ${product.price}</p>
              <p className="text-light-100">Stock: {product.stock}</p>
              <p className="text-light-100">Status: {product.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 text-center">
          <Package size={64} className="mx-auto text-light-500 mb-4" />
          <h2 className="text-xl font-bold text-light-100 mb-2">No Products Yet</h2>
          <p className="text-light-500 mb-4">
            Start adding products to your store to begin selling.
          </p>
          <button
            onClick={() => setIsAddingProduct(true)}
            className="inline-flex items-center gap-2 bg-primary/90 hover:bg-primary text-white text-sm rounded-full px-4 py-2 font-bold transition-all duration-300">
            <Plus size={16} /> Create First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
