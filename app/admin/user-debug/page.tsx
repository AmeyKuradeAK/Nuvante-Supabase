"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface DebugInfo {
  clerk: any;
  database: any;
  issues: {
    userNotInDb: boolean;
    namesMismatch: boolean;
    phoneMismatch: boolean;
    emailMismatch: boolean;
    orderIssues: string[];
  };
  recommendations: {
    needsUserSync: boolean;
    needsOrderFieldRepair: boolean;
    canPlaceOrders: boolean;
  };
}

export default function UserDebugPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/debug-user');
      if (!response.ok) {
        throw new Error('Failed to fetch debug info');
      }
      const data = await response.json();
      setDebugInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncUserData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/debug-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync user data');
      }
      
      const result = await response.json();
      setSuccess(`User data synced successfully. Repaired fields: ${result.repaired.join(', ') || 'None'}`);
      
      // Refresh debug info
      await fetchDebugInfo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">User Debug Panel</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={fetchDebugInfo}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Check User Status'}
        </button>
        
        <button
          onClick={syncUserData}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Syncing...' : 'Sync & Repair User Data'}
        </button>
      </div>

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

      {debugInfo && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">Overall Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded ${debugInfo.recommendations.canPlaceOrders ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="font-medium">Can Place Orders</div>
                <div className="text-sm">{debugInfo.recommendations.canPlaceOrders ? 'Yes' : 'No'}</div>
              </div>
              <div className={`p-3 rounded ${debugInfo.recommendations.needsUserSync ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <div className="font-medium">Needs Sync</div>
                <div className="text-sm">{debugInfo.recommendations.needsUserSync ? 'Yes' : 'No'}</div>
              </div>
              <div className={`p-3 rounded ${debugInfo.recommendations.needsOrderFieldRepair ? 'bg-red-100' : 'bg-green-100'}`}>
                <div className="font-medium">Order Fields OK</div>
                <div className="text-sm">{debugInfo.recommendations.needsOrderFieldRepair ? 'Needs Repair' : 'OK'}</div>
              </div>
            </div>
          </div>

          {/* Issues */}
          {(debugInfo.issues.userNotInDb || debugInfo.issues.namesMismatch || 
            debugInfo.issues.phoneMismatch || debugInfo.issues.emailMismatch || 
            debugInfo.issues.orderIssues.length > 0) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 text-red-800">Issues Found</h2>
              <ul className="space-y-2 text-red-700">
                {debugInfo.issues.userNotInDb && <li>• User not found in database</li>}
                {debugInfo.issues.namesMismatch && <li>• Name mismatch between Clerk and database</li>}
                {debugInfo.issues.phoneMismatch && <li>• Phone number mismatch</li>}
                {debugInfo.issues.emailMismatch && <li>• Email mismatch</li>}
                {debugInfo.issues.orderIssues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Clerk Data */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">Clerk Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">User ID</label>
                <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.clerk.id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <div className="text-sm bg-gray-50 p-2 rounded">
                  {debugInfo.clerk.emailAddresses[0]?.emailAddress || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.clerk.firstName || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.clerk.lastName || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Database Data */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">Database Data</h2>
            {debugInfo.database ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Database ID</label>
                  <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.database._id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.database.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Orders Count</label>
                  <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.database.ordersCount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Cart Items</label>
                  <div className="text-sm bg-gray-50 p-2 rounded">{debugInfo.database.cartItemsCount}</div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">User not found in database</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 