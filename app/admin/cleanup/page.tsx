"use client";

import { useState } from "react";
import Link from "next/link";

interface DuplicateReport {
  summary: {
    totalDuplicates?: number;
    usersWithDuplicates?: number;
    totalDuplicatesRemoved?: number;
    clientsProcessed?: number;
    clientsWithDuplicates?: number;
  };
  duplicateReport?: Array<{
    userEmail: string;
    totalOrders?: number;
    duplicatesFound?: number;
    originalOrderCount?: number;
    finalOrderCount?: number;
    duplicatesRemoved?: number;
    duplicates: Array<{
      orderId: string;
      paymentId: string;
      timestamp: string;
      amount: number;
    }>;
  }>;
}

export default function AdminCleanupPage() {
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const checkDuplicates = async () => {
    setLoading(true);
    setResults("🔍 Checking for duplicates...");
    setIsSuccess(false);
    setIsError(false);

    try {
      const response = await fetch('/api/admin/cleanup-duplicates', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DuplicateReport = await response.json();
      
      setIsSuccess(true);
      setResults(`📊 DUPLICATE CHECK RESULTS:

Total Duplicates Found: ${data.summary?.totalDuplicates || 0}
Users with Duplicates: ${data.summary?.usersWithDuplicates || 0}

${data.summary?.totalDuplicates && data.summary.totalDuplicates > 0 
  ? '⚠️ Duplicates detected! Click "Remove Duplicates" to clean up.' 
  : '✅ No duplicates found!'
}

Detailed Report:
${data.duplicateReport?.map(user => 
  `User: ${user.userEmail}
  Total Orders: ${user.totalOrders || 0}
  Duplicates: ${user.duplicatesFound || 0}
  Details: ${user.duplicates.map(dup => `OrderID: ${dup.orderId}, Amount: ₹${dup.amount}`).join('; ')}`
).join('\n\n') || 'No detailed report available'}`);
    } catch (error: any) {
      setIsError(true);
      setResults(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicates = async () => {
    if (!confirm('⚠️ Are you sure you want to remove duplicate orders?\n\nThis action cannot be undone!')) {
      return;
    }

    setLoading(true);
    setResults("🧹 Cleaning up duplicates...");
    setIsSuccess(false);
    setIsError(false);

    try {
      const response = await fetch('/api/admin/cleanup-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DuplicateReport = await response.json();
      
      setIsSuccess(true);
      setResults(`🧹 CLEANUP COMPLETED!

Duplicates Removed: ${data.summary?.totalDuplicatesRemoved || 0}
Clients Processed: ${data.summary?.clientsProcessed || 0}
Clients with Duplicates: ${data.summary?.clientsWithDuplicates || 0}

${data.summary?.totalDuplicatesRemoved && data.summary.totalDuplicatesRemoved > 0 
  ? '✅ Cleanup successful!' 
  : '✅ No duplicates to remove!'
}

Cleanup Details:
${data.duplicateReport?.map(user => 
  `User: ${user.userEmail}
  Original Orders: ${user.originalOrderCount || 0}
  Final Orders: ${user.finalOrderCount || 0}
  Removed: ${user.duplicatesRemoved || 0}`
).join('\n') || 'No cleanup details available'}`);
    } catch (error: any) {
      setIsError(true);
      setResults(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🔧 Duplicate Order Cleanup Tool
            </h1>
            <p className="text-gray-600">
              Manage and clean up duplicate orders in the database
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={checkDuplicates}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "📊"
              )}
              Check for Duplicates
            </button>

            <button
              onClick={cleanupDuplicates}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "🧹"
              )}
              Remove Duplicates
            </button>
          </div>

          {/* Results */}
          <div 
            className={`p-6 rounded-lg border-2 min-h-[200px] ${
              isSuccess 
                ? 'bg-green-50 border-green-200' 
                : isError 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Results:</h3>
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 bg-white p-4 rounded border overflow-auto max-h-96">
              {results || "Click a button above to start..."}
            </pre>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-400 mr-3 text-xl">⚠️</div>
              <div>
                <h4 className="text-yellow-800 font-semibold">Important Notes:</h4>
                <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                  <li>• Always check for duplicates before removing them</li>
                  <li>• Cleanup operations cannot be undone</li>
                  <li>• This tool keeps the earliest order and removes duplicates</li>
                  <li>• Only orders with same OrderID or PaymentID are considered duplicates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Return to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 