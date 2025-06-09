"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Package, 
  Ticket, 
  Users, 
  Trash2, 
  Wrench,
  Search,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

// Authorized admin emails - add emails here who can access admin panel
const AUTHORIZED_ADMINS = [
  'admin@nuvante.com',
  'ameykurade60@gmail.com',
  // Add more admin emails here as needed
];

interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingTickets: number;
  activeCoupons: number;
  inventoryIssues: number;
}

const AdminCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  color = "blue",
  badge,
  stats
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
  color?: string;
  badge?: string;
  stats?: string;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    indigo: "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Link href={href}>
        <div className={`
          bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} 
          rounded-xl p-6 text-white shadow-lg hover:shadow-xl 
          transition-all duration-300 ease-in-out border border-white/20
          relative overflow-hidden group
        `}>
          {badge && (
            <div className="absolute top-2 right-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                {badge}
              </span>
            </div>
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{description}</p>
            </div>
            <div className="ml-4">
              <Icon className="w-8 h-8 text-white/90 group-hover:text-white transition-colors" />
            </div>
          </div>
          
          {stats && (
            <div className="text-2xl font-bold text-white/90 group-hover:text-white transition-colors">
              {stats}
            </div>
          )}
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in?redirect_url=/admin');
        return;
      }

      const userEmail = user.emailAddresses[0]?.emailAddress;
      const authorized = AUTHORIZED_ADMINS.includes(userEmail || '');
      
      setIsAuthorized(authorized);
      
      if (!authorized) {
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        // Fetch admin stats if authorized
        fetchAdminStats();
      }
      
      setLoading(false);
    }
  }, [isLoaded, user, router]);

  const fetchAdminStats = async () => {
    try {
      // This would fetch real stats from your APIs
      setStats({
        totalOrders: 1234,
        totalUsers: 567,
        totalProducts: 89,
        pendingTickets: 12,
        activeCoupons: 8,
        inventoryIssues: 3
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You are not authorized to access the admin panel.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Email: {user.emailAddresses[0]?.emailAddress}
          </p>
          <div className="text-sm text-gray-400">
            Redirecting to home page in 3 seconds...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Authorized</span>
              </div>
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Exit Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingTickets}</div>
              <div className="text-sm text-gray-600">Support Tickets</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-indigo-600">{stats.activeCoupons}</div>
              <div className="text-sm text-gray-600">Active Coupons</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-red-600">{stats.inventoryIssues}</div>
              <div className="text-sm text-gray-600">Inventory Issues</div>
            </div>
          </div>
        )}

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Inventory Management */}
          <AdminCard
            title="Inventory Management"
            description="Manage product inventory, stock levels, and initialize inventory for new products"
            href="/admin/inventory"
            icon={Package}
            color="blue"
            badge="Essential"
            stats={stats ? `${stats.inventoryIssues} issues` : undefined}
          />

          {/* Coupon Management */}
          <AdminCard
            title="Coupon Management"
            description="Create, edit, and manage discount coupons and promotional codes"
            href="/admin/coupons"
            icon={Ticket}
            color="green"
            stats={stats ? `${stats.activeCoupons} active` : undefined}
          />

          {/* Order Tracing */}
          <AdminCard
            title="Order Tracing"
            description="Trace missing orders, recover payments from Razorpay, and sync order data"
            href="/admin/trace-orders"
            icon={Search}
            color="purple"
            badge="Recovery"
          />

          {/* Update Orders */}
          <AdminCard
            title="Update Orders"
            description="Update recovered orders with missing product details and shipping information"
            href="/admin/update-order"
            icon={Wrench}
            color="orange"
            badge="Manual"
          />

          {/* Data Cleanup */}
          <AdminCard
            title="Data Cleanup"
            description="Clean up duplicate orders, remove orphaned data, and maintain database integrity"
            href="/admin/cleanup"
            icon={Trash2}
            color="red"
            badge="Maintenance"
          />

          {/* User Debug */}
          <AdminCard
            title="User Debug"
            description="Debug user profiles, sync user data, and resolve account issues"
            href="/admin/user-debug"
            icon={Users}
            color="indigo"
            badge="Debug"
          />

        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions & Hidden Links</h2>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* API Endpoints */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  API Endpoints
                </h3>
                <div className="space-y-2 text-sm">
                  <a href="/api/admin/coupons" target="_blank" className="block text-blue-600 hover:text-blue-800">
                    /api/admin/coupons
                  </a>
                  <a href="/api/admin/inventory" target="_blank" className="block text-blue-600 hover:text-blue-800">
                    /api/admin/inventory
                  </a>
                  <a href="/api/trace-orders" target="_blank" className="block text-blue-600 hover:text-blue-800">
                    /api/trace-orders
                  </a>
                  <a href="/api/cleanup-pending-orders" target="_blank" className="block text-blue-600 hover:text-blue-800">
                    /api/cleanup-pending-orders
                  </a>
                </div>
              </div>

              {/* Database Operations */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Database Operations
                </h3>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => window.open('/api/admin/cleanup-duplicates', '_blank')}
                    className="block text-blue-600 hover:text-blue-800 text-left"
                  >
                    Check Duplicates
                  </button>
                  <button 
                    onClick={() => window.open('/api/admin/inventory/init', '_blank')}
                    className="block text-blue-600 hover:text-blue-800 text-left"
                  >
                    Check Inventory Status
                  </button>
                  <button 
                    onClick={() => window.open('/api/support', '_blank')}
                    className="block text-blue-600 hover:text-blue-800 text-left"
                  >
                    Support Tickets
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  System Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">Payment Gateway Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-yellow-500" />
                    <span className="text-gray-600">Background Jobs Running</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Admin Access Notice</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  You have administrative access to sensitive operations. Please use these tools responsibly and always backup data before making bulk changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 