"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface MissingOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  userEmail?: string;
  userPhone?: string;
  notes?: any;
  inDatabase: boolean;
}

interface TracedOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  userEmail?: string;
  userPhone?: string;
  notes?: any;
  inDatabase: boolean;
}

interface TraceResult {
  success: boolean;
  summary: {
    totalPayments: number;
    missingOrders: number;
    daysScanned: number;
    dateRange: {
      from: string;
      to: string;
    };
    searchScope?: string;
  };
  missingOrders: MissingOrder[];
  allOrders: TracedOrder[];
}

export default function TraceOrdersPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [days, setDays] = useState(7);
  const [includeAll, setIncludeAll] = useState(false);

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const traceOrders = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        includeAll: includeAll.toString(),
        ...(userEmail && !includeAll && { userEmail })
      });

      const response = await fetch(`/api/trace-orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trace orders');
      }
      
      const result = await response.json();
      setTraceResult(result);
      
      if (result.summary.missingOrders > 0) {
        setSuccess(`Found ${result.summary.missingOrders} missing orders out of ${result.summary.totalPayments} total payments for ${result.summary.searchScope}`);
      } else {
        setSuccess(`All ${result.summary.totalPayments} payments are properly recorded in the database for ${result.summary.searchScope}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recoverOrder = async (paymentId: string, orderId: string, userEmail?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/trace-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          userEmail
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recover order');
      }
      
      const result = await response.json();
      setSuccess(`Order ${orderId} recovered successfully!`);
      
      // Refresh the trace results
      await traceOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Order Tracing System</h1>
      <p className="text-gray-600 mb-6">
        This tool compares Razorpay payments with database orders to find any missing orders that were paid but not saved.
        <br />
        <strong>Admin Access:</strong> You can search for any user's orders by entering their email address below.
      </p>
      
      {/* Controls */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trace Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Days to scan</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 7)}
              min={1}
              max={30}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              User Email 
              <span className="text-green-600 font-normal">(Enter any user's email)</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={includeAll}
              placeholder="e.g., user@example.com (leave empty for your orders)"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeAll}
                onChange={(e) => setIncludeAll(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Include all users</span>
            </label>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Specific User:</strong> Enter the user's email to find their missing orders</li>
            <li>• <strong>All Users:</strong> Check "Include all users" to scan all payments system-wide</li>
            <li>• <strong>Your Orders:</strong> Leave email empty to search your own orders</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Quick Actions:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setUserEmail('');
                setDays(30);
                setIncludeAll(false);
              }}
              className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-300"
            >
              Check My Orders (30 days)
            </button>
            <button
              onClick={() => {
                setIncludeAll(true);
                setDays(7);
                setUserEmail('');
              }}
              className="bg-red-200 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-300"
            >
              Find All Missing Orders (7 days)
            </button>
            <button
              onClick={() => {
                setIncludeAll(false);
                setDays(1);
                setUserEmail('');
              }}
              className="bg-green-200 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-300"
            >
              Today's Issues Only
            </button>
          </div>
        </div>
        
        <button
          onClick={traceOrders}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Tracing...' : 'Trace Orders'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Results */}
      {traceResult && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{traceResult.summary.totalPayments}</div>
                <div className="text-sm text-blue-600">Total Payments</div>
              </div>
              <div className={`p-4 rounded-lg ${traceResult.summary.missingOrders > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className={`text-2xl font-bold ${traceResult.summary.missingOrders > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {traceResult.summary.missingOrders}
                </div>
                <div className={`text-sm ${traceResult.summary.missingOrders > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Missing Orders
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{traceResult.summary.daysScanned}</div>
                <div className="text-sm text-gray-600">Days Scanned</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {traceResult.summary.totalPayments - traceResult.summary.missingOrders}
                </div>
                <div className="text-sm text-purple-600">Orders in DB</div>
              </div>
            </div>
          </div>

          {/* Missing Orders */}
          {traceResult.missingOrders.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Missing Orders (Need Recovery)</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Payment ID</th>
                      <th className="px-4 py-2 text-left">Order ID</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">User Email</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceResult.missingOrders.map((order, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-mono">{order.paymentId}</td>
                        <td className="px-4 py-2 text-sm font-mono">{order.orderId}</td>
                        <td className="px-4 py-2">{order.currency} {order.amount}</td>
                        <td className="px-4 py-2">{order.userEmail || 'N/A'}</td>
                        <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => recoverOrder(order.paymentId, order.orderId, order.userEmail)}
                            disabled={loading}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                          >
                            Recover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Orders */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">All Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Payment ID</th>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">User Email</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {traceResult.allOrders.slice(0, 20).map((order, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-mono">{order.paymentId}</td>
                      <td className="px-4 py-2 text-sm font-mono">{order.orderId}</td>
                      <td className="px-4 py-2">{order.currency} {order.amount}</td>
                      <td className="px-4 py-2">{order.userEmail || 'N/A'}</td>
                      <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          order.inDatabase 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.inDatabase ? 'In Database' : 'Missing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {traceResult.allOrders.length > 20 && (
                <p className="text-gray-500 text-sm mt-2">
                  Showing first 20 of {traceResult.allOrders.length} total orders
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 