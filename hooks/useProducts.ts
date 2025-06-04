/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
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
    categoryId: '',
    price: 0,
    discountPercentage: 0,
    images: [],
    status: 'draft',
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('seller.') || hostname.startsWith('seller.')) {
        return window.location.origin;
      }
      if (hostname.includes('localhost')) {
        return 'http://localhost:3000';
      }
      return process.env.NEXT_PUBLIC_API_URL || 'https://dokmaistore.com';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://dokmaistore.com';
  };

  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    setApiUrl(getApiUrl());
  }, []);

  const fetchProducts = async () => {
    if (!sellerId || !apiUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch(`${apiUrl}/api/v3/products`, {
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
    if (!apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/api/v3/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        // console.error('Failed to fetch categories');
      }
    } catch (err) {
      // console.error('An unexpected error occurred while fetching categories');
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

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      errors.discountPercentage = 'Discount must be between 0 and 100';
    }

    // if (formData.images.length === 0) {
    //   errors.images = 'At least one image is required';
    // }

    if (formData.images.length > 3) {
      errors.images = 'Maximum 3 images allowed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addProduct = async (): Promise<boolean> => {
    if (!validateForm() || !apiUrl) {
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('sellerToken');
      const method = editMode ? 'PUT' : 'POST';
      const url = `${apiUrl}/api/v3/products`;

      const body = editMode
        ? JSON.stringify({ ...formData, id: currentProductId })
        : JSON.stringify(formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(editMode ? 'Product updated successfully' : 'Product added successfully');

        if (editMode) {
          setProducts((prev) => prev.map((p) => (p._id === currentProductId ? data.product : p)));
        } else {
          setProducts((prev) => [...prev, data.product]);
        }

        resetForm();
        return true;
      } else {
        setError(data.error || (editMode ? 'Failed to update product' : 'Failed to add product'));
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
      setEditMode(false);
      setCurrentProductId(null);
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!apiUrl) return false;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch(`${apiUrl}/api/v3/products?id=${productId}`, {
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
    setEditMode(false);
    setCurrentProductId(null);
  };

  // Use useCallback to prevent this function from being recreated on every render
  const updateFormData = useCallback(
    (field: keyof ProductFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (formErrors[field]) {
        setFormErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    },
    [formErrors]
  );

  const editProduct = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      discountPercentage: product.discountPercentage || 0,
      images: product.images.slice(0, 3), // Limit to 3 images
      status: product.status,
    });

    setEditMode(true);
    setCurrentProductId(product._id);
  };

  useEffect(() => {
    if (sellerId && apiUrl) {
      fetchProducts();
      fetchCategories();
    }
  }, [sellerId, apiUrl]);

  return {
    products,
    categories,
    formData,
    formErrors,
    isLoading,
    error,
    success,
    editMode,
    resetForm,
    updateFormData,
    addProduct,
    deleteProduct,
    editProduct,
    setSuccess,
    setError,
    setProducts,
  };
};

export default useProducts;
