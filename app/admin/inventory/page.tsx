"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Product {
  _id: string;
  productName: string;
  hasInventory: boolean;
  soldOut: boolean;
  soldOutSizes: string[];
  inventory?: {
    totalQuantity: number;
    sizes: {
      S: number;
      M: number;
      L: number;
      XL: number;
    };
    trackInventory: boolean;
  };
}

const InventoryAdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    productsNeedingInit: 0,
    productsWithInventory: 0
  });

  useEffect(() => {
    fetchInventoryStatus();
  }, []);

  const fetchInventoryStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/inventory/init?check=all');
      const data = response.data as any;
      setProducts(data.products || []);
      setStats({
        totalProducts: data.totalProducts || 0,
        productsNeedingInit: data.productsNeedingInit || 0,
        productsWithInventory: data.productsWithInventory || 0
      });
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      alert('Error fetching inventory status');
    } finally {
      setLoading(false);
    }
  };

  const initializeAllInventory = async () => {
    if (!confirm('This will initialize inventory for all products without inventory. Continue?')) {
      return;
    }

    try {
      setInitializing(true);
      const response = await axios.post('/api/admin/inventory/init', {
        defaultTotalQuantity: 20,
        defaultSizeQuantity: 5,
        lowStockThreshold: 5,
        onlyIfMissing: true
      });

      const data = response.data as any;
      alert(`Inventory initialized! Updated: ${data.updatedCount || 0} products`);
      fetchInventoryStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error initializing inventory');
    } finally {
      setInitializing(false);
    }
  };

  const updateProductInventory = async (productId: string, sizes: any) => {
    try {
      setUpdating(productId);
      const response = await axios.post('/api/admin/inventory', {
        productId,
        action: 'set_all',
        sizes,
        reason: 'Admin manual update'
      });

      alert('Inventory updated successfully!');
      fetchInventoryStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating inventory');
    } finally {
      setUpdating(null);
    }
  };

  const ProductInventoryCard = ({ product }: { product: Product }) => {
    const [editMode, setEditMode] = useState(false);
    const [sizes, setSizes] = useState({
      S: product.inventory?.sizes.S || 0,
      M: product.inventory?.sizes.M || 0,
      L: product.inventory?.sizes.L || 0,
      XL: product.inventory?.sizes.XL || 0
    });

    const handleSave = () => {
      updateProductInventory(product._id, sizes);
      setEditMode(false);
    };

    const handleCancel = () => {
      setSizes({
        S: product.inventory?.sizes.S || 0,
        M: product.inventory?.sizes.M || 0,
        L: product.inventory?.sizes.L || 0,
        XL: product.inventory?.sizes.XL || 0
      });
      setEditMode(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{product.productName}</h3>
            <div className="flex gap-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                product.hasInventory ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.hasInventory ? 'Has Inventory' : 'No Inventory'}
              </span>
              {product.soldOut && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Sold Out
                </span>
              )}
            </div>
          </div>
          {product.hasInventory && (
            <div className="flex gap-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updating === product._id}
                    className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                  >
                    {updating === product._id ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {product.hasInventory ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                <div key={size} className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size {size}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={sizes[size]}
                      onChange={(e) => setSizes({ ...sizes, [size]: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  ) : (
                    <div className={`px-2 py-1 rounded text-lg font-semibold ${
                      (product.inventory?.sizes[size] || 0) <= 0 
                        ? 'bg-red-100 text-red-800' 
                        : (product.inventory?.sizes[size] || 0) <= 5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {product.inventory?.sizes[size] || 0}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center pt-2 border-t">
              <span className="text-sm text-gray-600">Total Quantity: </span>
              <span className="font-semibold text-lg">
                {editMode 
                  ? Object.values(sizes).reduce((sum, qty) => sum + qty, 0)
                  : (product.inventory?.totalQuantity || 0)
                }
              </span>
            </div>
            {product.soldOutSizes.length > 0 && (
              <div className="text-center">
                <span className="text-sm text-red-600">
                  Sold out sizes: {product.soldOutSizes.join(', ')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No inventory tracking set up</p>
            <p className="text-sm">Use "Initialize All Inventory" to set up</p>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage product inventory and stock levels</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">With Inventory</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.productsWithInventory}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Need Setup</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.productsNeedingInit}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          {stats.productsNeedingInit > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeAllInventory}
              disabled={initializing}
              className="bg-[#DB4444] text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {initializing ? 'Initializing...' : `Initialize All Inventory (${stats.productsNeedingInit} products)`}
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchInventoryStatus}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </motion.button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductInventoryCard key={product._id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAdminPage; 