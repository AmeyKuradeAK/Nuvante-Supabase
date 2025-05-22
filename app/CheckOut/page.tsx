"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { GlobalContext } from "@/context/Global";
import { useAlert } from "@/context/AlertContext";
import PaymentButton from "@/components/PaymentButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

const CheckoutPage = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    throw new Error("CheckoutPage must be used within GlobalContextProvider");
  }

  const { GlobalCart } = globalContext;
  const [products, setProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.email.trim() !== ''
    );
  };

  useEffect(() => {
    // Redirect if cart is empty
    if (GlobalCart.length === 0) {
      showAlert("Your cart is empty", "warning");
      router.push("/Cart");
      return;
    }

    // Load quantities from database
    const fetchQuantities = async () => {
      try {
        const response = await axios.get<{ quantities: { [key: string]: number } }>('/api/cart/quantities');
        if (response.status === 200 && response.data.quantities) {
          setQuantities(response.data.quantities);
        }
      } catch (error) {
        console.error('Error fetching quantities:', error);
        showAlert('Error loading quantities. Please try again.', 'error');
      }
    };
    fetchQuantities();
  }, [GlobalCart, showAlert, router]);

  useEffect(() => {
    // Redirect if cart is empty
    if (GlobalCart.length === 0) {
      return;
    }

    // Fetch products to calculate total
    const fetchProducts = async () => {
      try {
        console.log('Fetching products for cart:', GlobalCart);
        const response = await axios.post<any[]>('/api/propagation', { every: true });
        console.log('API Response:', response.data);
        
        if (response.data) {
          // Filter products to only include those in cart
          const cartProducts = response.data.filter((product: { _id: string }) => 
            GlobalCart.includes(product._id)
          );
          console.log('Filtered cart products:', cartProducts);
          setProducts(cartProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Error loading products. Please try again.', 'error');
      }
    };
    fetchProducts();
  }, [GlobalCart, showAlert]);

  // Add debugging for quantities
  useEffect(() => {
    console.log('Current quantities:', quantities);
    console.log('Current products:', products);
  }, [quantities, products]);

  const calculateTotal = () => {
    return products.reduce((total, item) => {
      const quantity = quantities[item._id] || 1;
      return total + (quantity * item.productPrice);
    }, 0);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444]">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/Cart" className="text-gray-600 hover:text-[#DB4444]">Cart</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#DB4444]">Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Billing Details Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 space-y-6"
            >
              {/* Order Summary Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 relative">
                        <img
                          src={product.productImages[0]}
                          alt={product.productName}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{product.productName}</h3>
                        <p className="text-sm text-gray-600">Quantity: {quantities[product._id] || 1}</p>
                        <p className="text-[#DB4444] font-semibold">Rs. {product.productPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Details Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Billing Details</h1>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="firstName"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="lastName"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="streetAddress"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, Floor, etc.
                    </label>
                    <input
                      name="apartment"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Town/City <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="city"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="phone"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="tel"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="email"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="email"
                      required
                    />
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Payment Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4"
            >
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Payment Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({GlobalCart.length} items)</span>
                    <span>Rs. {calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-[#DB4444]">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rs. {calculateTotal()}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <PaymentButton
                      amount={calculateTotal()}
                      currency="INR"
                      receipt={`order_${Date.now()}`}
                      className="w-full bg-[#DB4444] text-white py-3 px-6 rounded-md hover:bg-[#c13a3a] transition-colors duration-200 font-medium"
                    >
                      Place Order
                    </PaymentButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
