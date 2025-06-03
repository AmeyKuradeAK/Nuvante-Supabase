/**
 * Utility to initialize inventory for existing products
 * This can be run once to set up inventory tracking for products that don't have it yet
 */

import Product from "@/models/Product";
import connect from "@/db";

interface InitializeInventoryOptions {
  defaultTotalQuantity?: number;
  defaultSizeQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  onlyIfMissing?: boolean; // Only initialize if inventory field is missing
}

export async function initializeInventory(options: InitializeInventoryOptions = {}) {
  const {
    defaultTotalQuantity = 0,
    defaultSizeQuantity = 0,
    lowStockThreshold = 5,
    trackInventory = true,
    onlyIfMissing = true
  } = options;

  try {
    await connect();

    // Find products that need inventory initialization
    const query = onlyIfMissing 
      ? { $or: [{ inventory: { $exists: false } }, { inventory: null }] }
      : {};

    const products = await Product.find(query);

    console.log(`Found ${products.length} products to initialize inventory for...`);

    let updatedCount = 0;
    let skippedCount = 0;

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
          trackInventory,
          lastUpdated: new Date(),
          inventoryHistory: [{
            action: 'manual_update',
            quantity: defaultTotalQuantity,
            previousQuantity: 0,
            newQuantity: defaultTotalQuantity,
            timestamp: new Date(),
            adminId: 'system',
            reason: 'Initial inventory setup'
          }]
        };

        await product.save();
        updatedCount++;

        console.log(`✓ Initialized inventory for: ${product.productName}`);

      } catch (error) {
        console.error(`✗ Failed to initialize inventory for ${product.productName}:`, error);
      }
    }

    console.log(`\nInventory initialization complete:`);
    console.log(`- Updated: ${updatedCount} products`);
    console.log(`- Skipped: ${skippedCount} products`);

    return {
      success: true,
      updatedCount,
      skippedCount,
      totalProcessed: products.length
    };

  } catch (error: any) {
    console.error('Error initializing inventory:', error);
    return {
      success: false,
      error: error.message,
      updatedCount: 0,
      skippedCount: 0
    };
  }
}

/**
 * Initialize inventory with sample data (useful for testing)
 */
export async function initializeInventoryWithSampleData() {
  return initializeInventory({
    defaultTotalQuantity: 20,
    defaultSizeQuantity: 5, // 5 of each size (S, M, L, XL) = 20 total
    lowStockThreshold: 5,
    trackInventory: true,
    onlyIfMissing: true
  });
}

/**
 * Reset all inventory to zero (useful for fresh start)
 */
export async function resetAllInventory() {
  try {
    await connect();

    const result = await Product.updateMany(
      {},
      {
        $set: {
          'inventory.totalQuantity': 0,
          'inventory.sizes.S': 0,
          'inventory.sizes.M': 0,
          'inventory.sizes.L': 0,
          'inventory.sizes.XL': 0,
          'inventory.lastUpdated': new Date(),
          soldOut: true,
          soldOutSizes: ['S', 'M', 'L', 'XL']
        },
        $push: {
          'inventory.inventoryHistory': {
            action: 'manual_update',
            quantity: 0,
            previousQuantity: 0,
            newQuantity: 0,
            timestamp: new Date(),
            adminId: 'system',
            reason: 'Bulk inventory reset to zero'
          }
        }
      }
    );

    console.log(`Reset inventory for ${result.modifiedCount} products`);
    
    return {
      success: true,
      modifiedCount: result.modifiedCount
    };

  } catch (error: any) {
    console.error('Error resetting inventory:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Example usage in a Next.js API route or script:
 * 
 * import { initializeInventoryWithSampleData } from '@/utils/initializeInventory';
 * 
 * // Initialize all products with sample inventory
 * const result = await initializeInventoryWithSampleData();
 * console.log(result);
 */ 