"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  totalAvailable: number;
  usedCount: number;
  expirationDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

const CouponAdminPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minimumOrderAmount: 0,
    maximumDiscount: '',
    totalAvailable: 1,
    expirationDate: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('/api/admin/coupons');
      const data = response.data as any;
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleCoupons = async () => {
    try {
      setCreating(true);
      const response = await axios.post('/api/admin/coupons/seed');
      const data = response.data as any;
      alert('Sample coupons created successfully!');
      fetchCoupons();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error creating sample coupons';
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      
      const couponData = {
        ...newCoupon,
        maximumDiscount: newCoupon.maximumDiscount ? parseFloat(newCoupon.maximumDiscount) : null,
        expirationDate: new Date(newCoupon.expirationDate).toISOString()
      };

      await axios.post('/api/admin/coupons', couponData);
      alert('Coupon created successfully!');
      
      // Reset form
      setNewCoupon({
        code: '',
        description: '',
        type: 'percentage',
        value: 0,
        minimumOrderAmount: 0,
        maximumDiscount: '',
        totalAvailable: 1,
        expirationDate: ''
      });
      setShowCreateForm(false);
      fetchCoupons();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error creating coupon';
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) <= new Date();
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
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-2">Manage discount coupons for your store</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-[#DB4444] text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create New Coupon'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createSampleCoupons}
            disabled={creating}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Sample Coupons'}
          </motion.button>
        </div>

        {/* Create Coupon Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value as 'percentage' | 'fixed'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value ({newCoupon.type === 'percentage' ? '%' : 'Rs.'})
                </label>
                <input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({...newCoupon, value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                  min="0"
                  max={newCoupon.type === 'percentage' ? "100" : undefined}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (Rs.)</label>
                <input
                  type="number"
                  value={newCoupon.minimumOrderAmount}
                  onChange={(e) => setNewCoupon({...newCoupon, minimumOrderAmount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                  min="0"
                />
              </div>
              
              {newCoupon.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount (Rs.) - Optional</label>
                  <input
                    type="number"
                    value={newCoupon.maximumDiscount}
                    onChange={(e) => setNewCoupon({...newCoupon, maximumDiscount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                    min="0"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Available Uses</label>
                <input
                  type="number"
                  value={newCoupon.totalAvailable}
                  onChange={(e) => setNewCoupon({...newCoupon, totalAvailable: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="datetime-local"
                  value={newCoupon.expirationDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expirationDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#DB4444] text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Coupons ({coupons.length})</h2>
          </div>
          
          {coupons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No coupons found. Create some coupons to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{coupon.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.type === 'percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `Rs. ${coupon.value}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `Rs. ${coupon.value}`}
                        {coupon.minimumOrderAmount > 0 && (
                          <div className="text-xs text-gray-500">Min: Rs. {coupon.minimumOrderAmount}</div>
                        )}
                        {coupon.maximumDiscount && (
                          <div className="text-xs text-gray-500">Max: Rs. {coupon.maximumDiscount}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.usedCount} / {coupon.totalAvailable}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-[#DB4444] h-2 rounded-full" 
                            style={{ width: `${(coupon.usedCount / coupon.totalAvailable) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !coupon.isActive ? 'bg-gray-100 text-gray-800' :
                          isExpired(coupon.expirationDate) ? 'bg-red-100 text-red-800' :
                          coupon.usedCount >= coupon.totalAvailable ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {!coupon.isActive ? 'Inactive' :
                           isExpired(coupon.expirationDate) ? 'Expired' :
                           coupon.usedCount >= coupon.totalAvailable ? 'Used Up' :
                           'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(coupon.expirationDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponAdminPage; 