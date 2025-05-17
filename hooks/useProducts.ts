/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Product, Category, ProductFormData, FormErrors } from '@/types';

export const useProducts = (sellerId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initialFormData: ProductFormData = {
    title: '',
    description: '',
    stock: 0,
    type: '',
    categoryId: '',
    price: 0,
    images: [],
    status: 'draft',
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchProducts = async () => {
    if (!sellerId) return;

    setIsLoading(true);
    setError(null);

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
    } finally {
      setIsLoading(false);
    }
  };

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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.stock < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    if (!formData.type.trim()) {
      errors.type = 'Type is required';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (formData.images.length === 0) {
      errors.images = 'At least one image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addProduct = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsLoading(true);
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
        setProducts((prev) => [...prev, data.product]);
        resetForm();
        return true;
      } else {
        setError(data.error || 'Failed to add product');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const deleteProduct = async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v3/products?id=${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Product deleted successfully');
        setProducts((prev) => prev.filter((product) => product._id !== productId));
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete product');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  const updateFormData = (field: keyof ProductFormData, value: string | number | string[]) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev: any) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchProducts();
    }
    fetchCategories();
  }, [sellerId]);

  return {
    products,
    categories,
    formData,
    formErrors,
    isLoading,
    error,
    success,
    resetForm,
    updateFormData,
    addProduct,
    deleteProduct,
    setSuccess,
    setError,
    setProducts,
  };
};

export default useProducts;
