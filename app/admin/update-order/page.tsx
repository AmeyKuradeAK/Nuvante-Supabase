"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface ProductDetail {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  streetAddress: string;
  apartment: string;
  city: string;
  phone: string;
  email: string;
  pin: string;
}

export default function UpdateOrderPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [userEmail, setUserEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    phone: '',
    email: '',
    pin: ''
  });

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const addProductDetail = () => {
    setProductDetails([...productDetails, {
      productId: '',
      productName: '',
      size: '',
      quantity: 1
    }]);
  };

  const updateProductDetail = (index: number, field: keyof ProductDetail, value: string | number) => {
    const updated = [...productDetails];
    if (field === 'quantity') {
      updated[index][field] = value as number;
    } else {
      updated[index][field] = value as string;
    }
    setProductDetails(updated);
  };

  const removeProductDetail = (index: number) => {
    setProductDetails(productDetails.filter((_, i) => i !== index));
  };

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  const reprocessFromRazorpay = async () => {
    if (!userEmail || (!orderId && !paymentId)) {
      setError('Please provide user email and either order ID or payment ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/update-recovered-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          orderId: orderId || undefined,
          paymentId: paymentId || undefined,
          reprocessFromRazorpay: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reprocess order');
      }

      const result = await response.json();
      
      if (result.productInfoFound || result.addressInfoFound) {
        setSuccess(`Order reprocessed successfully! ${result.productInfoFound ? 'Products recovered. ' : ''}${result.addressInfoFound ? 'Address recovered.' : ''}`);
        
        // If address was found, populate the form
        if (result.updatedOrder?.shippingAddress) {
          setShippingAddress(result.updatedOrder.shippingAddress);
        }
      } else {
        setSuccess('Order reprocessed, but no additional details found in Razorpay notes. You can add them manually below.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveManualDetails = async () => {
    if (!userEmail || (!orderId && !paymentId)) {
      setError('Please provide user email and either order ID or payment ID');
      return;
    }

    if (productDetails.length === 0 && !shippingAddress.streetAddress) {
      setError('Please provide either product details or shipping address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/update-recovered-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          orderId: orderId || undefined,
          paymentId: paymentId || undefined,
          productDetails: productDetails.length > 0 ? {
            items: productDetails.map(p => p.productId),
            itemDetails: productDetails.map(p => ({
              productId: p.productId,
              size: p.size,
              quantity: p.quantity
            }))
          } : undefined,
          shippingAddress: shippingAddress.streetAddress ? shippingAddress : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      setSuccess('Order updated successfully with manual details!');
      
      // Clear form
      setProductDetails([]);
      setShippingAddress({
        firstName: '',
        lastName: '',
        streetAddress: '',
        apartment: '',
        city: '',
        phone: '',
        email: '',
        pin: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Update Recovered Order</h1>
      <p className="text-gray-600 mb-6">
        Add missing product details and shipping address to orders that were recovered without complete information.
      </p>

      {/* Order Identification */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Identification</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">User Email *</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="order_xxxxx"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment ID</label>
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="pay_xxxxx"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Provide either Order ID or Payment ID to identify the order</p>
        
        <div className="mt-4">
          <button
            onClick={reprocessFromRazorpay}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Reprocessing...' : 'Try Auto-Recovery from Razorpay'}
          </button>
          <p className="text-sm text-gray-500 mt-2">First try to automatically extract details from Razorpay payment notes</p>
        </div>
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

      {/* Product Details */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Details</h2>
          <button
            onClick={addProductDetail}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Add Product
          </button>
        </div>
        
        {productDetails.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products added yet. Click "Add Product" to start.</p>
        ) : (
          <div className="space-y-4">
            {productDetails.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Product ID"
                    value={product.productId}
                    onChange={(e) => updateProductDetail(index, 'productId', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={product.productName}
                    onChange={(e) => updateProductDetail(index, 'productName', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Size"
                    value={product.size}
                    onChange={(e) => updateProductDetail(index, 'size', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={product.quantity}
                    onChange={(e) => updateProductDetail(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => removeProductDetail(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={shippingAddress.firstName}
            onChange={(e) => updateShippingAddress('firstName', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={shippingAddress.lastName}
            onChange={(e) => updateShippingAddress('lastName', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Street Address"
            value={shippingAddress.streetAddress}
            onChange={(e) => updateShippingAddress('streetAddress', e.target.value)}
            className="md:col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Apartment/Suite"
            value={shippingAddress.apartment}
            onChange={(e) => updateShippingAddress('apartment', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="City"
            value={shippingAddress.city}
            onChange={(e) => updateShippingAddress('city', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={shippingAddress.phone}
            onChange={(e) => updateShippingAddress('phone', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={shippingAddress.email}
            onChange={(e) => updateShippingAddress('email', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="PIN Code"
            value={shippingAddress.pin}
            onChange={(e) => updateShippingAddress('pin', e.target.value)}
            className="md:col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={saveManualDetails}
          disabled={loading}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg font-medium"
        >
          {loading ? 'Saving...' : 'Save Order Details'}
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. <strong>Identify the Order:</strong> Enter the user's email and either Order ID or Payment ID</li>
          <li>2. <strong>Try Auto-Recovery:</strong> Click "Try Auto-Recovery" to extract details from Razorpay automatically</li>
          <li>3. <strong>Add Missing Details:</strong> If auto-recovery doesn't find everything, manually add product details and shipping address</li>
          <li>4. <strong>Save:</strong> Click "Save Order Details" to update the order in the database</li>
        </ol>
      </div>
    </div>
  );
} 