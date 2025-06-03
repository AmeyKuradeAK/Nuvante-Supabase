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

interface Product {
  _id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productDescription: string;
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

  // Product search state
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const searchProducts = async () => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=20`);
      if (!response.ok) throw new Error('Failed to search products');
      
      const result = await response.json();
      setSearchResults(result.products || []);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products');
    } finally {
      setSearchLoading(false);
    }
  };

  const addProductFromSearch = (product: Product) => {
    const existingIndex = productDetails.findIndex(p => p.productId === product._id);
    
    if (existingIndex >= 0) {
      // Update quantity if product already exists
      const updated = [...productDetails];
      updated[existingIndex].quantity += 1;
      setProductDetails(updated);
    } else {
      // Add new product
      setProductDetails([...productDetails, {
        productId: product._id,
        productName: product.productName,
        size: '',
        quantity: 1
      }]);
    }
    
    // Clear search
    setProductSearch('');
    setSearchResults([]);
    setShowProductSearch(false);
  };

  const addEmptyProductDetail = () => {
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
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Update Recovered Order</h1>
      <p className="text-gray-600 mb-6">
        <strong>Admin Access:</strong> Add missing product details and shipping address to any user's recovered orders.
        This tool helps complete orders that were recovered from Razorpay but lack product information.
      </p>

      {/* Admin Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">🛠️ Admin Manual Update Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">For Product Details:</h3>
            <ol className="text-sm text-blue-600 space-y-1">
              <li>1. <strong>Search Products:</strong> Use the product search to find items by name</li>
              <li>2. <strong>Add Products:</strong> Click on products to add them to the order</li>
              <li>3. <strong>Set Details:</strong> Specify size and quantity for each product</li>
              <li>4. <strong>Manual Entry:</strong> If needed, manually enter product ID and name</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">For Missing Address:</h3>
            <ol className="text-sm text-blue-600 space-y-1">
              <li>1. <strong>Contact Customer:</strong> Call/email customer for shipping details</li>
              <li>2. <strong>Verify Payment:</strong> Confirm using Payment ID from Razorpay</li>
              <li>3. <strong>Fill Address:</strong> Enter complete shipping address below</li>
              <li>4. <strong>Save Changes:</strong> Update the order with customer-provided details</li>
            </ol>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white rounded border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Best Practice:</strong> For orders without product details, contact the customer first to confirm 
            what they ordered before manually adding products. Use the Payment ID as proof of payment.
          </p>
        </div>
      </div>

      {/* Order Identification */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Identification</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              User Email * 
              <span className="text-green-600 font-normal">(Any user's email)</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="customer@example.com"
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Search Products
            </button>
            <button
              onClick={addEmptyProductDetail}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Add Manual Entry
            </button>
          </div>
        </div>

        {/* Product Search Panel */}
        {showProductSearch && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold mb-3">Search and Add Products</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name (e.g., 't-shirt', 'jeans', 'shoes')..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
              />
              <button
                onClick={searchProducts}
                disabled={searchLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(product => (
                  <div key={product._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {product.productImage && (
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.productName}</h4>
                        <p className="text-sm text-gray-600">₹{product.productPrice}</p>
                        <p className="text-xs text-gray-500 truncate">ID: {product._id}</p>
                        <button
                          onClick={() => addProductFromSearch(product)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm mt-2 hover:bg-green-600"
                        >
                          Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && productSearch && !searchLoading && (
              <p className="text-gray-500 text-center py-4">No products found. Try different search terms.</p>
            )}
          </div>
        )}
        
        {productDetails.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No products added yet.</p>
            <p className="text-sm text-gray-400">Use "Search Products" to find items or "Add Manual Entry" for custom entries.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productDetails.map((product, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product ID</label>
                    <input
                      type="text"
                      placeholder="Product ID"
                      value={product.productId}
                      onChange={(e) => updateProductDetail(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={product.productName}
                      onChange={(e) => updateProductDetail(index, 'productName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      placeholder="Size"
                      value={product.size}
                      onChange={(e) => updateProductDetail(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={product.quantity}
                      onChange={(e) => updateProductDetail(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeProductDetail(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex-shrink-0 mt-6"
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
        <p className="text-sm text-gray-600 mb-4">
          Contact the customer to get their shipping address if it's not available in the Razorpay notes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              placeholder="First Name"
              value={shippingAddress.firstName}
              onChange={(e) => updateShippingAddress('firstName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              placeholder="Last Name"
              value={shippingAddress.lastName}
              onChange={(e) => updateShippingAddress('lastName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              placeholder="Street Address"
              value={shippingAddress.streetAddress}
              onChange={(e) => updateShippingAddress('streetAddress', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Suite</label>
            <input
              type="text"
              placeholder="Apartment/Suite (Optional)"
              value={shippingAddress.apartment}
              onChange={(e) => updateShippingAddress('apartment', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              placeholder="City"
              value={shippingAddress.city}
              onChange={(e) => updateShippingAddress('city', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="Phone Number"
              value={shippingAddress.phone}
              onChange={(e) => updateShippingAddress('phone', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={shippingAddress.email}
              onChange={(e) => updateShippingAddress('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
            <input
              type="text"
              placeholder="PIN Code"
              value={shippingAddress.pin}
              onChange={(e) => updateShippingAddress('pin', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={saveManualDetails}
          disabled={loading}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg font-medium"
        >
          {loading ? 'Saving...' : 'Save Order Details'}
        </button>
      </div>

      {/* Customer Service Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Customer Service Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-yellow-700 mb-2">When contacting customers:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Confirm their payment using Payment ID</li>
              <li>• Ask what products they ordered with sizes</li>
              <li>• Get complete shipping address</li>
              <li>• Apologize for the technical issue</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-700 mb-2">Order completion checklist:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• All products added with correct sizes</li>
              <li>• Complete shipping address filled</li>
              <li>• Customer contacted and verified</li>
              <li>• Order saved successfully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 