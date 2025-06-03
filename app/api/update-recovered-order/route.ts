import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import { currentUser } from "@clerk/nextjs/server";
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface UpdateOrderData {
  userEmail: string;
  orderId?: string;
  paymentId?: string;
  productDetails?: {
    items: string[];
    itemDetails: Array<{
      productId: string;
      size: string;
      quantity: number;
    }>;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartment: string;
    city: string;
    phone: string;
    email: string;
    pin: string;
  };
  reprocessFromRazorpay?: boolean;
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const {
      userEmail,
      orderId,
      paymentId,
      productDetails,
      shippingAddress,
      reprocessFromRazorpay = false
    }: UpdateOrderData = await request.json();

    if (!userEmail || (!orderId && !paymentId)) {
      return NextResponse.json({
        error: "Missing required fields: userEmail and (orderId or paymentId)"
      }, { status: 400 });
    }

    // Find the user
    const client = await clientModel.findOne({ email: userEmail });
    if (!client) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the order to update
    const orderIndex = client.orders.findIndex((order: any) => 
      (orderId && order.orderId === orderId) || 
      (paymentId && order.paymentId === paymentId)
    );

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const existingOrder = client.orders[orderIndex];

    // If reprocessFromRazorpay is true, fetch fresh data from Razorpay
    if (reprocessFromRazorpay && existingOrder.paymentId) {
      try {
        const [payment, order] = await Promise.all([
          razorpay.payments.fetch(existingOrder.paymentId),
          razorpay.orders.fetch(existingOrder.orderId).catch(() => null)
        ]);

        if (payment) {
          console.log('Razorpay payment notes:', payment.notes);
          console.log('Razorpay order notes:', order?.notes);

          // Extract product information from Razorpay notes
          const notes = payment.notes || {};
          
          // Update product details if found in notes
          if (notes.productIds || notes.productNames) {
            const productIds = notes.productIds ? notes.productIds.split(',') : [];
            const productNames = notes.productNames ? notes.productNames.split('|') : [];
            const quantities = notes.quantities ? notes.quantities.split(',').map(Number) : [];
            const sizes = notes.sizes ? notes.sizes.split(',') : [];

            if (productIds.length > 0) {
              existingOrder.items = productIds.map((id: string) => id.trim());
              existingOrder.itemDetails = productIds.map((productId: string, index: number) => ({
                productId: productId.trim(),
                size: sizes[index] || '',
                quantity: quantities[index] || 1
              }));
              existingOrder.productInfoFound = true;
              existingOrder.recoverySource = 'razorpay_notes_reprocess';
            }

            // Store product names for reference
            if (productNames.length > 0) {
              existingOrder.productNames = productNames.map((name: string) => name.trim());
            }
          }

          // Update shipping address if found in notes
          if (notes.firstName || notes.streetAddress) {
            existingOrder.shippingAddress = {
              firstName: notes.firstName || existingOrder.shippingAddress?.firstName || '',
              lastName: notes.lastName || existingOrder.shippingAddress?.lastName || '',
              streetAddress: notes.streetAddress || existingOrder.shippingAddress?.streetAddress || '',
              apartment: notes.apartment || existingOrder.shippingAddress?.apartment || '',
              city: notes.city || existingOrder.shippingAddress?.city || '',
              phone: notes.phone || payment.contact || existingOrder.shippingAddress?.phone || '',
              email: notes.email || payment.email || existingOrder.shippingAddress?.email || userEmail,
              pin: notes.pin || existingOrder.shippingAddress?.pin || ''
            };
            existingOrder.addressInfoFound = true;
          }

          // Store original Razorpay data for reference
          existingOrder.razorpayPaymentNotes = payment.notes;
          existingOrder.razorpayOrderNotes = order?.notes || null;
        }
      } catch (razorpayError: any) {
        console.error('Error fetching from Razorpay:', razorpayError);
        // Continue with manual update even if Razorpay fetch fails
      }
    }

    // Apply manual updates if provided
    if (productDetails) {
      existingOrder.items = productDetails.items || existingOrder.items || [];
      existingOrder.itemDetails = productDetails.itemDetails || existingOrder.itemDetails || [];
      existingOrder.productInfoFound = true;
      existingOrder.manualProductUpdate = true;
    }

    if (shippingAddress) {
      existingOrder.shippingAddress = {
        ...existingOrder.shippingAddress,
        ...shippingAddress
      };
      existingOrder.addressInfoFound = true;
      existingOrder.manualAddressUpdate = true;
    }

    // Update metadata
    existingOrder.lastUpdated = new Date().toISOString();
    existingOrder.updatedBy = user.emailAddresses[0]?.emailAddress || 'admin';

    // Save the updated order
    client.orders[orderIndex] = existingOrder;
    await client.save();

    return NextResponse.json({
      message: "Order updated successfully",
      orderId: existingOrder.orderId,
      paymentId: existingOrder.paymentId,
      productInfoFound: existingOrder.productInfoFound,
      addressInfoFound: existingOrder.addressInfoFound,
      updatedOrder: existingOrder,
      success: true
    });

  } catch (error: any) {
    console.error("Error updating recovered order:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve order details for editing
export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!userEmail || (!orderId && !paymentId)) {
      return NextResponse.json({
        error: "Missing required parameters: userEmail and (orderId or paymentId)"
      }, { status: 400 });
    }

    await connect();

    const client = await clientModel.findOne({ email: userEmail });
    if (!client) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = client.orders.find((order: any) => 
      (orderId && order.orderId === orderId) || 
      (paymentId && order.paymentId === paymentId)
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      order, 
      success: true,
      hasProductInfo: Boolean(order.items?.length > 0 || order.itemDetails?.length > 0),
      hasAddressInfo: Boolean(order.shippingAddress?.streetAddress)
    });

  } catch (error: any) {
    console.error("Error retrieving order:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order", details: error.message },
 