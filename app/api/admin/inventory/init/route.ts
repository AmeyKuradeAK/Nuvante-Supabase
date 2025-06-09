import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Product from "@/models/Product";
import connect from "@/db";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const body = await req.json();
    const { 
      defaultTotalQuantity = 20, 
      defaultSizeQuantity = 5, 
      lowStockThreshold = 5,
      onlyIfMissing = true 
    } = body;

    // Find products that need inventory initialization
    const query = onlyIfMissing 
      ? { $or: [{ inventory: { $exists: false } }, { inventory: null }] }
      : {};

    const products = await Product.find(query);

    console.log(`Found ${products.length} products to initialize inventory for...`);

    let updatedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const product of products) {
      try {
        // Skip if inventory already exists and we only want to initialize missing ones
        if (onlyIfMissing && product.inventory) {
          skippedCount++;
          continue;
        }

        // Initialize inventory structure
        product.inventory = {
          totalQuantity: defaultTotalQuantity,
          sizes: {
            S: defaultSizeQuantity,
            M: defaultSizeQuantity,
            L: defaultSizeQuantity,
            XL: defaultSizeQuantity
          },
          lowStockThreshold,
          trackInventory: true,
          lastUpdated: new Date(),
          inventoryHistory: [{
            action: 'manual_update',
            quantity: defaultTotalQuantity,
            previousQuantity: 0,
            newQuantity: defaultTotalQuantity,
            timestamp: new Date(),
            adminId: user.id,
            reason: 'Initial inventory setup via admin'
          }]
        };

        await product.save();
        updatedCount++;

        results.push({
          productId: product._id,
          productName: product.productName,
          status: 'initialized',
          inventory: product.inventory
        });

        console.log(`✓ Initialized inventory for: ${product.productName}`);

      } catch (error: any) {
        console.error(`✗ Failed to initialize inventory for ${product.productName}:`, error);
        results.push({
          productId: product._id,
          productName: product.productName,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Inventory initialization complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`,
      updatedCount,
      skippedCount,
      totalProcessed: products.length,
      results
    });

  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to initialize inventory",
      details: error.message
    }, { status: 500 });
  }
}

// GET: Check which products need inventory initialization
export async function GET(req: NextRequest) {
  try {
    await connect();

    const url = new URL(req.url);
    const checkType = url.searchParams.get('check') || 'missing';

    let query = {};
    if (checkType === 'missing') {
      query = { $or: [{ inventory: { $exists: false } }, { inventory: null }] };
    } else if (checkType === 'all') {
      query = {};
    }

    const products = await Product.find(query).select('_id productName inventory soldOut soldOutSizes');

    const productsNeedingInit = products.filter(product => !product.inventory);
    const productsWithInventory = products.filter(product => product.inventory);

    return NextResponse.json({
      totalProducts: products.length,
      productsNeedingInit: productsNeedingInit.length,
      productsWithInventory: productsWithInventory.length,
      products: products.map(product => ({
        _id: product._id,
        productName: product.productName,
        hasInventory: !!product.inventory,
        soldOut: product.soldOut,
        soldOutSizes: product.soldOutSizes,
        inventory: product.inventory ? {
          totalQuantity: product.inventory.totalQuantity,
          sizes: product.inventory.sizes,
          trackInventory: product.inventory.trackInventory
        } : null
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to check inventory status",
      details: error.message
    }, { status: 500 });
  }
} 