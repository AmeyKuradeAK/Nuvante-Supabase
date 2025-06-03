import { NextRequest, NextResponse } from "next/server";
import connect from "@/db";
import Product from "@/models/Product";
import { currentUser } from "@clerk/nextjs/server";

// GET: Fetch inventory data for a specific product or all products
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    // Add admin authorization check here if needed
    // This is just a basic check - you can enhance this based on your admin system
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const includeHistory = url.searchParams.get('includeHistory') === 'true';

    if (productId) {
      // Fetch specific product inventory
      const product = await Product.findById(productId);
      
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const response = {
        productId: product._id,
        productName: product.productName,
        inventory: product.inventory,
        soldOut: product.soldOut,
        soldOutSizes: product.soldOutSizes
      };

      if (!includeHistory && response.inventory?.inventoryHistory) {
        response.inventory.inventoryHistory = [];
      }

      return NextResponse.json(response);
    } else {
      // Fetch inventory for all products
      const products = await Product.find({})
        .select('_id productName inventory soldOut soldOutSizes')
        .lean();

      // Remove history if not requested to reduce payload size
      if (!includeHistory) {
        products.forEach((product: any) => {
          if (product.inventory?.inventoryHistory) {
            product.inventory.inventoryHistory = [];
          }
        });
      }

      return NextResponse.json({ products });
    }

  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Update inventory for a product
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    // Add admin authorization check here
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const body = await request.json();
    const { productId, action, size, quantity, reason } = body;

    if (!productId || !action || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: productId, action, quantity" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let result;
    const adminId = user.id;

    switch (action) {
      case 'increase':
        if (!size) {
          return NextResponse.json(
            { error: "Size is required for increase action" },
            { status: 400 }
          );
        }
        result = product.increaseInventory(size, quantity, reason, adminId);
        break;

      case 'decrease':
        if (!size) {
          return NextResponse.json(
            { error: "Size is required for decrease action" },
            { status: 400 }
          );
        }
        result = product.reduceInventory(size, quantity, `Admin manual adjustment: ${reason || 'No reason provided'}`);
        break;

      case 'set':
        if (!size) {
          return NextResponse.json(
            { error: "Size is required for set action" },
            { status: 400 }
          );
        }
        // Set specific size quantity
        const currentQuantity = product.inventory?.sizes?.[size] || 0;
        const difference = quantity - currentQuantity;
        
        if (difference > 0) {
          result = product.increaseInventory(size, difference, `Set to ${quantity} (${reason || 'Admin adjustment'})`, adminId);
        } else if (difference < 0) {
          result = product.reduceInventory(size, Math.abs(difference), `Set to ${quantity} (${reason || 'Admin adjustment'})`);
        } else {
          result = { success: true, message: 'No change needed' };
        }
        break;

      case 'set_all':
        // Set quantities for all sizes
        const { sizes } = body;
        if (!sizes || typeof sizes !== 'object') {
          return NextResponse.json(
            { error: "Sizes object is required for set_all action" },
            { status: 400 }
          );
        }

        const results = [];
        for (const [sizeKey, newQuantity] of Object.entries(sizes)) {
          if (['S', 'M', 'L', 'XL'].includes(sizeKey)) {
            const currentSizeQuantity = product.inventory?.sizes?.[sizeKey] || 0;
            const sizeDifference = (newQuantity as number) - currentSizeQuantity;
            
            if (sizeDifference > 0) {
              const sizeResult = product.increaseInventory(sizeKey, sizeDifference, `Bulk set to ${newQuantity} (${reason || 'Admin bulk update'})`, adminId);
              results.push({ size: sizeKey, ...sizeResult });
            } else if (sizeDifference < 0) {
              const sizeResult = product.reduceInventory(sizeKey, Math.abs(sizeDifference), `Bulk set to ${newQuantity} (${reason || 'Admin bulk update'})`);
              results.push({ size: sizeKey, ...sizeResult });
            }
          }
        }
        result = { success: true, message: 'Bulk update completed', results };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: increase, decrease, set, set_all" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Save the product
    await product.save();

    return NextResponse.json({
      success: true,
      message: result.message,
      productId,
      updatedInventory: product.inventory,
      soldOut: product.soldOut,
      soldOutSizes: product.soldOutSizes
    });

  } catch (error: any) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Reset inventory tracking for a product
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const body = await request.json();
    const { productId, trackInventory, lowStockThreshold } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update inventory settings
    if (!product.inventory) {
      product.inventory = {
        totalQuantity: 0,
        sizes: { S: 0, M: 0, L: 0, XL: 0 },
        lowStockThreshold: 5,
        trackInventory: true,
        lastUpdated: new Date(),
        inventoryHistory: []
      };
    }

    if (typeof trackInventory === 'boolean') {
      product.inventory.trackInventory = trackInventory;
    }

    if (typeof lowStockThreshold === 'number' && lowStockThreshold >= 0) {
      product.inventory.lowStockThreshold = lowStockThreshold;
    }

    // Add history entry
    product.inventory.inventoryHistory.push({
      action: 'manual_update',
      quantity: 0,
      previousQuantity: 0,
      newQuantity: 0,
      adminId: user.id,
      reason: `Settings updated: trackInventory=${product.inventory.trackInventory}, lowStockThreshold=${product.inventory.lowStockThreshold}`,
      timestamp: new Date()
    });

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Inventory settings updated",
      productId,
      inventory: product.inventory
    });

  } catch (error: any) {
    console.error("Error updating inventory settings:", error);
    return NextResponse.json(
      { error: "Failed to update inventory settings", details: error.message },
      { status: 500 }
    );
  }
} 