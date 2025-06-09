import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import Product from "@/models/Product";
import { currentUser } from "@clerk/nextjs/server";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  estimatedDeliveryDate: string;
  items: string[];
  itemDetails: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartment: string;
    city: string;
    phone: string;
    email: string;
    pin: string;
  };
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();
    
    const global_user_email = user.emailAddresses[0].emailAddress;
    if (!global_user_email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 401 }
      );
    }

    const client = await clientModel.findOne({ email: global_user_email });
    
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Ensure orders is an array
    const orders = Array.isArray(client.orders) ? client.orders : [];

    return NextResponse.json({
      orders: orders,
      message: "Orders fetched successfully"
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connect();
      
      const global_user_email = user.emailAddresses[0].emailAddress;
      if (!global_user_email) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 401 }
        );
      }

      const orderData = await request.json() as OrderItem;
      
      // Validate required fields
      const requiredFields = ['orderId', 'paymentId', 'amount', 'items', 'itemDetails', 'shippingAddress'];
      for (const field of requiredFields) {
        if (!orderData[field as keyof OrderItem]) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      // COMPREHENSIVE DUPLICATE CHECK
      // 1. Check across ALL users for this orderId/paymentId (global check)
      const globalDuplicateCheck = await clientModel.findOne({
        $or: [
          { "orders.orderId": orderData.orderId },
          { "orders.paymentId": orderData.paymentId }
        ]
      });

      if (globalDuplicateCheck) {
        return NextResponse.json({ 
          error: "Duplicate order detected",
          message: "This order has already been processed",
          orderId: orderData.orderId,
          isDuplicate: true
        }, { status: 409 }); // 409 Conflict
      }

      // 2. Check for recent orders from same user (prevent rapid clicking)
      const recentOrderWindow = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      const userWithRecentOrders = await clientModel.findOne({
        email: global_user_email,
        "orders.timestamp": { 
          $gte: recentOrderWindow.toISOString()
        }
      });

      if (userWithRecentOrders) {
        // Check if any recent order has similar content (same items, similar amount)
        const recentOrders = userWithRecentOrders.orders.filter((order: any) => 
          new Date(order.timestamp) >= recentOrderWindow
        );

        for (const recentOrder of recentOrders) {
          // Check for similar order (same amount and similar items)
          if (Math.abs(recentOrder.amount - orderData.amount) < 1 && 
              recentOrder.items.length === orderData.items.length) {
            
            // If items are very similar, it's likely a duplicate click
            const itemsSimilar = orderData.items.every((item: string) => 
              recentOrder.items.includes(item)
            );

            if (itemsSimilar) {
              return NextResponse.json({ 
                error: "Recent similar order detected",
                message: "Please wait before placing another order",
                recentOrderId: recentOrder.orderId,
                isDuplicate: true
              }, { status: 429 }); // 429 Too Many Requests
            }
          }
        }
      }

      // Find or create client with robust error handling
      let client = await clientModel.findOne({ email: global_user_email });
      
      if (!client) {
        // Create a new client if not found (fallback for edge cases)
        client = new clientModel({
          clerkId: user.id,
          email: global_user_email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          mobileNumber: user.phoneNumbers[0]?.phoneNumber || '',
          password: "clerk-auth",
          username: user.firstName || global_user_email.split('@')[0],
          cart: [],
          wishlist: [],
          orders: [],
          cartQuantities: new Map(),
          cartSizes: new Map()
        });
        
        await client.save();
      }

      // 3. Final user-specific duplicate check (defensive programming)
      const userDuplicateOrder = client.orders.find((order: any) => 
        order.orderId === orderData.orderId || order.paymentId === orderData.paymentId
      );
      
      if (userDuplicateOrder) {
        return NextResponse.json({ 
          message: "Order already exists for this user",
          orderId: orderData.orderId,
          isDuplicate: true
        }, { status: 409 });
      }

      // INVENTORY VALIDATION AND DEDUCTION
      const inventoryResults = [];
      const inventoryErrors = [];

      for (const item of orderData.itemDetails) {
        const { productId, size, quantity } = item;

        try {
          const product = await Product.findById(productId);
          
          if (!product) {
            inventoryErrors.push(`Product ${productId} not found`);
            continue;
          }

          // Check availability before deducting
          const availability = product.checkAvailability(size, quantity);
          
          if (!availability.available) {
            inventoryErrors.push(
              `${product.productName} (Size ${size}): ${availability.message}`
            );
            continue;
          }

          // Deduct inventory
          const deductionResult = product.reduceInventory(size, quantity, orderData.orderId);
          
          if (!deductionResult.success) {
            inventoryErrors.push(
              `${product.productName} (Size ${size}): ${deductionResult.message}`
            );
            continue;
          }

          // Save the product with updated inventory
          await product.save();
          
          inventoryResults.push({
            productId,
            productName: product.productName,
            size,
            quantity,
            message: 'Inventory deducted successfully'
          });

        } catch (error: any) {
          inventoryErrors.push(
            `Product ${productId}: Error processing inventory - ${error.message}`
          );
        }
      }

      // If there are inventory errors, don't create the order
      if (inventoryErrors.length > 0) {
        // Rollback any successful inventory deductions
        for (const result of inventoryResults) {
          try {
            const product = await Product.findById(result.productId);
            if (product) {
              product.increaseInventory(result.size, result.quantity, 'Order creation rollback', 'system');
              await product.save();
            }
          } catch (rollbackError) {
            // Error rolling back, but continue
          }
        }

        return NextResponse.json({
          error: "Inventory validation failed",
          details: inventoryErrors,
          message: "Some items are no longer available. Please update your cart."
        }, { status: 400 });
      }

      // Ensure orders array exists
      if (!client.orders) {
        client.orders = [];
      }

      // Add timestamp and processing info to order data
      const orderWithMetadata = {
        ...orderData,
        inventoryDeducted: true,
        inventoryLog: inventoryResults,
        inventoryProcessedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userEmail: global_user_email
      };

      // Add the new order to the orders array
      client.orders.push(orderWithMetadata);

      // Clear the cart after successful order
      client.cart = [];
      client.cartQuantities = new Map();
      client.cartSizes = new Map();

      // Save with error handling - use atomic operation
      const savedClient = await client.save();

      return NextResponse.json({ 
        message: "Order added successfully",
        orderId: orderData.orderId,
        success: true,
        inventoryProcessed: true,
        inventoryResults,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      retryCount++;
      
      // If it's the last retry or it's a validation error, return the error
      if (retryCount >= maxRetries || error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            error: error.message || "Failed to save order after multiple attempts",
            retryCount,
            details: error.name === 'ValidationError' ? error.errors : undefined
          },
          { status: 500 }
        );
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
} 