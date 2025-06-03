import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: string | number;
  currency: string;
  status: string;
  created_at: number;
  email?: string;
  contact?: string;
  notes?: any;
  method?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
}

interface MissingOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
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
  createdAt: Date;
  userEmail?: string;
  userPhone?: string;
  notes?: any;
  inDatabase: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const url = new URL(req.url);
    const userEmail = url.searchParams.get('userEmail');
    const days = parseInt(url.searchParams.get('days') || '7');
    const includeAll = url.searchParams.get('includeAll') === 'true';

    // For admin access, we don't restrict to current user's email
    // Admin can trace any user's orders by providing their email
    
    // Calculate date range
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const toDate = new Date();

    try {
      // Fetch payments from Razorpay
      const payments = await razorpay.payments.all({
        from: Math.floor(fromDate.getTime() / 1000),
        to: Math.floor(toDate.getTime() / 1000),
        count: 100
      });

      // Get all users' orders from database for comparison
      let dbUsers;
      if (includeAll) {
        dbUsers = await clientModel.find({}, 'email orders');
      } else if (userEmail) {
        dbUsers = await clientModel.find({ email: userEmail }, 'email orders');
      } else {
        // If no specific email provided and not includeAll, use current user's email as fallback
        const currentUserEmail = user.emailAddresses[0]?.emailAddress;
        if (!currentUserEmail) {
          return NextResponse.json({ error: "No user email specified" }, { status: 400 });
        }
        dbUsers = await clientModel.find({ email: currentUserEmail }, 'email orders');
      }

      // Create a map of all orders in database
      const dbOrderMap = new Map();
      const dbPaymentMap = new Map();
      
      dbUsers.forEach(user => {
        if (user.orders && Array.isArray(user.orders)) {
          user.orders.forEach((order: any) => {
            if (order.orderId) dbOrderMap.set(order.orderId, { ...order, userEmail: user.email });
            if (order.paymentId) dbPaymentMap.set(order.paymentId, { ...order, userEmail: user.email });
          });
        }
      });

      // Analyze payments and find missing orders
      const missingOrders: MissingOrder[] = [];
      const tracedOrders: TracedOrder[] = [];

      payments.items.forEach((payment: any) => {
        const isInDatabase = dbPaymentMap.has(payment.id) || dbOrderMap.has(payment.order_id);
        
        const orderInfo: TracedOrder = {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: typeof payment.amount === 'string' ? parseInt(payment.amount) / 100 : payment.amount / 100, // Convert from paise to rupees
          currency: payment.currency,
          status: payment.status,
          createdAt: new Date(payment.created_at * 1000),
          userEmail: payment.email || payment.notes?.email,
          userPhone: payment.contact || payment.notes?.phone,
          notes: payment.notes,
          inDatabase: isInDatabase
        };

        tracedOrders.push(orderInfo);

        // Filter based on user email if specified
        if (!includeAll && userEmail) {
          const paymentUserEmail = payment.email || payment.notes?.email;
          if (paymentUserEmail !== userEmail) {
            return; // Skip this payment as it's not for the specified user
          }
        }

        // If searching for current user only (no userEmail specified and not includeAll)
        if (!includeAll && !userEmail) {
          const currentUserEmail = user.emailAddresses[0]?.emailAddress;
          const paymentUserEmail = payment.email || payment.notes?.email;
          if (paymentUserEmail !== currentUserEmail) {
            return; // Skip this payment as it's not for the current user
          }
        }

        // Only include successful payments that are missing from database
        if (payment.status === 'captured' && !isInDatabase) {
          missingOrders.push(orderInfo);
        }
      });

      // Filter tracedOrders for response
      let filteredTracedOrders = tracedOrders;
      if (!includeAll) {
        if (userEmail) {
          filteredTracedOrders = tracedOrders.filter(order => order.userEmail === userEmail);
        } else {
          const currentUserEmail = user.emailAddresses[0]?.emailAddress;
          filteredTracedOrders = tracedOrders.filter(order => order.userEmail === currentUserEmail);
        }
      }

      return NextResponse.json({
        success: true,
        summary: {
          totalPayments: payments.items.length,
          missingOrders: missingOrders.length,
          daysScanned: days,
          dateRange: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          },
          searchScope: includeAll ? 'All users' : userEmail ? `User: ${userEmail}` : `Current user: ${user.emailAddresses[0]?.emailAddress}`
        },
        missingOrders,
        allOrders: filteredTracedOrders
      });

    } catch (razorpayError: any) {
      console.error('Razorpay API error:', razorpayError);
      return NextResponse.json({
        error: "Failed to fetch payments from Razorpay",
        details: razorpayError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error tracing orders:", error);
    return NextResponse.json({
      error: "Failed to trace orders",
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const { paymentId, orderId, userEmail } = await req.json();

    if (!paymentId || !orderId) {
      return NextResponse.json({
        error: "Missing required fields: paymentId, orderId"
      }, { status: 400 });
    }

    try {
      // Fetch both payment and order details from Razorpay
      const [payment, order] = await Promise.all([
        razorpay.payments.fetch(paymentId),
        razorpay.orders.fetch(orderId).catch(() => null) // Order might not exist or be accessible
      ]);
      
      if (!payment) {
        return NextResponse.json({
          error: "Payment not found in Razorpay"
        }, { status: 404 });
      }

      // Find the user in database
      const targetEmail = userEmail || payment.email || payment.notes?.email;
      
      if (!targetEmail) {
        return NextResponse.json({
          error: "Cannot determine user email for order recovery"
        }, { status: 400 });
      }

      const client = await clientModel.findOne({ email: targetEmail });
      
      if (!client) {
        return NextResponse.json({
          error: "User not found in database"
        }, { status: 404 });
      }

      // Check if order already exists
      const existingOrder = client.orders.find((order: any) => 
        order.orderId === orderId || order.paymentId === paymentId
      );
      
      if (existingOrder) {
        return NextResponse.json({
          message: "Order already exists in database",
          orderId: orderId
        });
      }

      // Convert payment amount safely
      const paymentAmount = typeof payment.amount === 'string' ? parseInt(payment.amount) : payment.amount;

      // Try to extract product information from order notes or payment notes
      let productInfo: {
        items: string[];
        itemDetails: Array<{
          productId: string;
          size: string;
          quantity: number;
        }>;
      } = {
        items: [],
        itemDetails: []
      };

      // Check order notes first, then payment notes
      const notes = order?.notes || payment.notes || {};
      
      // Try to parse product information from notes
      if (notes.products) {
        try {
          const products = typeof notes.products === 'string' ? JSON.parse(notes.products) : notes.products;
          if (Array.isArray(products)) {
            productInfo.items = products.map((p: any) => p.productId || p._id || p.id).filter(Boolean);
            productInfo.itemDetails = products.map((p: any) => ({
              productId: p.productId || p._id || p.id || '',
              size: p.size || '',
              quantity: p.quantity || 1
            })).filter(item => item.productId);
          }
        } catch (e) {
          console.log('Could not parse product information from notes');
        }
      }

      // If no product info found in notes, check for individual product fields
      if (productInfo.items.length === 0) {
        const itemKeys = Object.keys(notes).filter(key => key.startsWith('item_') || key.startsWith('product_'));
        if (itemKeys.length > 0) {
          itemKeys.forEach(key => {
            const value = notes[key];
            if (typeof value === 'string' && value.length > 0) {
              productInfo.items.push(value);
              // Try to extract size and quantity from related fields
              const baseKey = key.replace(/^(item_|product_)/, '');
              const sizeValue = notes[`size_${baseKey}`] || notes[`${baseKey}_size`] || '';
              const quantityValue = notes[`quantity_${baseKey}`] || notes[`${baseKey}_quantity`] || '1';
              productInfo.itemDetails.push({
                productId: value,
                size: typeof sizeValue === 'string' ? sizeValue : String(sizeValue),
                quantity: parseInt(String(quantityValue))
              });
            }
          });
        }
      }

      // Create order from payment data
      const orderData = {
        orderId: payment.order_id,
        paymentId: payment.id,
        amount: paymentAmount / 100, // Convert from paise
        currency: payment.currency,
        status: 'completed',
        timestamp: new Date(payment.created_at * 1000).toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: productInfo.items.length > 0 ? productInfo.items : (payment.notes?.productIds ? payment.notes.productIds.split(',') : []),
        trackingId: "Tracking ID will be provided soon",
        itemStatus: 'processing',
        itemDetails: productInfo.itemDetails.length > 0 ? productInfo.itemDetails : parseItemDetailsFromNotes(payment.notes),
        shippingAddress: {
          firstName: payment.notes?.firstName || payment.notes?.name?.split(' ')[0] || '',
          lastName: payment.notes?.lastName || payment.notes?.name?.split(' ').slice(1).join(' ') || '',
          streetAddress: payment.notes?.streetAddress || payment.notes?.address || '',
          apartment: payment.notes?.apartment || '',
          city: payment.notes?.city || '',
          phone: payment.contact || payment.notes?.phone || '',
          email: payment.email || targetEmail,
          pin: payment.notes?.pin || payment.notes?.pincode || ''
        },
        recoveredFromRazorpay: true,
        recoveredAt: new Date().toISOString(),
        originalPaymentData: {
          method: payment.method,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa
        },
        razorpayOrderNotes: order?.notes || null,
        razorpayPaymentNotes: payment.notes || null,
        productInfoFound: productInfo.items.length > 0 || (payment.notes?.productIds ? true : false),
        recoverySource: productInfo.items.length > 0 ? 'database_match' : 'razorpay_notes'
      };

      // Add the recovered order
      client.orders.push(orderData);
      await client.save();

      return NextResponse.json({
        message: "Order recovered successfully from Razorpay",
        orderId: orderId,
        recovered: true,
        productInfoFound: productInfo.items.length > 0,
        productDetails: productInfo,
        orderData
      });

    } catch (razorpayError: any) {
      console.error('Razorpay fetch error:', razorpayError);
      return NextResponse.json({
        error: "Failed to fetch payment from Razorpay",
        details: razorpayError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error recovering order:", error);
    return NextResponse.json({
      error: "Failed to recover order",
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const { userEmail, orderId, paymentId, productDetails } = await req.json();

    if (!orderId && !paymentId) {
      return NextResponse.json({
        error: "Either orderId or paymentId is required"
      }, { status: 400 });
    }

    if (!productDetails || !Array.isArray(productDetails.itemDetails)) {
      return NextResponse.json({
        error: "Product details with itemDetails array is required"
      }, { status: 400 });
    }

    try {
      // Find the user in database
      const client = await clientModel.findOne({ email: userEmail });
      
      if (!client) {
        return NextResponse.json({
          error: "User not found in database"
        }, { status: 404 });
      }

      // Find the order
      const orderIndex = client.orders.findIndex((order: any) => 
        order.orderId === orderId || order.paymentId === paymentId
      );
      
      if (orderIndex === -1) {
        return NextResponse.json({
          error: "Order not found"
        }, { status: 404 });
      }

      // Update the order with product details
      client.orders[orderIndex].items = productDetails.items || [];
      client.orders[orderIndex].itemDetails = productDetails.itemDetails;
      client.orders[orderIndex].productDetailsUpdated = true;
      client.orders[orderIndex].productDetailsUpdatedAt = new Date().toISOString();
      client.orders[orderIndex].productDetailsUpdatedBy = user.emailAddresses[0]?.emailAddress || 'admin';

      await client.save();

      return NextResponse.json({
        message: "Product details updated successfully",
        orderId: orderId || client.orders[orderIndex].orderId,
        updated: true
      });

    } catch (error: any) {
      console.error('Error updating product details:', error);
      return NextResponse.json({
        error: "Failed to update product details",
        details: error.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json({
      error: "Failed to update order",
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to parse item details from Razorpay notes
function parseItemDetailsFromNotes(notes: any) {
  if (!notes || !notes.productIds) {
    return [];
  }

  try {
    const productIds = notes.productIds.split(',');
    const quantities = notes.quantities ? notes.quantities.split(',').map(Number) : [];
    const sizes = notes.sizes ? notes.sizes.split(',') : [];

    return productIds.map((productId: string, index: number) => ({
      productId: productId.trim(),
      size: sizes[index] || '',
      quantity: quantities[index] || 1
    }));
  } catch (error) {
    console.error('Error parsing item details from notes:', error);
    return [];
  }
} 