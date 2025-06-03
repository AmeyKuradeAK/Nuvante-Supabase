import mongoose from "mongoose";

let productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
    default: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=536&h=354&fit=crop&crop=center",
  },
  productImages: {
    type: Array,
    required: true,
  },
  productPrice: {
    type: String,
    required: true,
  },
  cancelledProductPrice: {
    type: String,
    required: true,
  },
  latest: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  materials: {
    type: String,
    required: true,
  },
  productInfo: {
    type: String,
    required: true,
    default: "Round neck t shirt with exquisite print on back.",
  },
  type: {
    type: String,
    required: true,
    default: "T-Shirt",
  },
  soldOut: {
    type: Boolean,
    required: true,
    default: false,
  },
  soldOutSizes: {
    type: [String],
    required: true,
    default: [],
  },
  packaging: {
    type: String,
    required: true,
    default: "Orders are packed within 24 to 48 hours of confirmation.",
  },
  shipping: {
    type: String,
    required: true,
    default: "Dispatch time: 3 to 4 business days.\nFree delivery within Delhi.\nShipping charges apply for deliveries outside Delhi.\nEnjoy free delivery across India on orders above ₹2000.\nFor any queries, feel free to contact our support team.",
  },
  // Inventory Management Fields
  inventory: {
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    sizes: {
      S: {
        type: Number,
        default: 0,
        min: 0
      },
      M: {
        type: Number,
        default: 0,
        min: 0
      },
      L: {
        type: Number,
        default: 0,
        min: 0
      },
      XL: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0
    },
    trackInventory: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    inventoryHistory: [{
      action: {
        type: String,
        enum: ['increase', 'decrease', 'manual_update', 'order_deduction'],
        required: true
      },
      size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL'],
        required: false
      },
      quantity: {
        type: Number,
        required: true
      },
      previousQuantity: {
        type: Number,
        required: true
      },
      newQuantity: {
        type: Number,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      orderId: {
        type: String,
        required: false
      },
      adminId: {
        type: String,
        required: false
      },
      reason: {
        type: String,
        required: false
      }
    }]
  }
});

// Middleware to auto-update soldOut and soldOutSizes based on inventory
productSchema.pre('save', function() {
  if (this.inventory && this.inventory.trackInventory && this.inventory.sizes) {
    // Update soldOutSizes based on inventory
    const soldOutSizes = [];
    const sizes: Array<'S' | 'M' | 'L' | 'XL'> = ['S', 'M', 'L', 'XL'];
    
    for (const size of sizes) {
      if (this.inventory.sizes[size] <= 0) {
        soldOutSizes.push(size);
      }
    }
    
    this.soldOutSizes = soldOutSizes;
    
    // Update soldOut status if total inventory is 0 or all sizes are sold out
    this.soldOut = this.inventory.totalQuantity <= 0 || soldOutSizes.length === 4;
    
    // Update lastUpdated timestamp
    this.inventory.lastUpdated = new Date();
  }
});

// Method to reduce inventory when an order is placed
productSchema.methods.reduceInventory = function(size: 'S' | 'M' | 'L' | 'XL', quantity: number, orderId?: string) {
  if (!this.inventory || !this.inventory.trackInventory) {
    return { success: false, message: 'Inventory tracking is disabled for this product' };
  }

  // Check if we have enough stock
  if (this.inventory.sizes[size] < quantity) {
    return { 
      success: false, 
      message: `Insufficient stock. Only ${this.inventory.sizes[size]} items available in size ${size}` 
    };
  }

  if (this.inventory.totalQuantity < quantity) {
    return { 
      success: false, 
      message: `Insufficient total stock. Only ${this.inventory.totalQuantity} items available` 
    };
  }

  // Record previous quantities for history
  const previousSizeQuantity = this.inventory.sizes[size];
  const previousTotalQuantity = this.inventory.totalQuantity;

  // Reduce inventory
  this.inventory.sizes[size] -= quantity;
  this.inventory.totalQuantity -= quantity;

  // Record inventory history
  this.inventory.inventoryHistory.push({
    action: 'order_deduction',
    size: size,
    quantity: quantity,
    previousQuantity: previousSizeQuantity,
    newQuantity: this.inventory.sizes[size],
    orderId: orderId,
    timestamp: new Date()
  });

  // Also record total quantity change
  this.inventory.inventoryHistory.push({
    action: 'order_deduction',
    quantity: quantity,
    previousQuantity: previousTotalQuantity,
    newQuantity: this.inventory.totalQuantity,
    orderId: orderId,
    timestamp: new Date()
  });

  return { success: true, message: 'Inventory updated successfully' };
};

// Method to increase inventory (for restocks or returns)
productSchema.methods.increaseInventory = function(size: 'S' | 'M' | 'L' | 'XL', quantity: number, reason?: string, adminId?: string) {
  if (!this.inventory) {
    this.inventory = {
      totalQuantity: 0,
      sizes: { S: 0, M: 0, L: 0, XL: 0 },
      lowStockThreshold: 5,
      trackInventory: true,
      lastUpdated: new Date(),
      inventoryHistory: []
    };
  }

  // Record previous quantities for history
  const previousSizeQuantity = this.inventory.sizes[size] || 0;
  const previousTotalQuantity = this.inventory.totalQuantity || 0;

  // Increase inventory
  this.inventory.sizes[size] = (this.inventory.sizes[size] || 0) + quantity;
  this.inventory.totalQuantity = (this.inventory.totalQuantity || 0) + quantity;

  // Record inventory history
  this.inventory.inventoryHistory.push({
    action: 'increase',
    size: size,
    quantity: quantity,
    previousQuantity: previousSizeQuantity,
    newQuantity: this.inventory.sizes[size],
    adminId: adminId,
    reason: reason,
    timestamp: new Date()
  });

  // Also record total quantity change
  this.inventory.inventoryHistory.push({
    action: 'increase',
    quantity: quantity,
    previousQuantity: previousTotalQuantity,
    newQuantity: this.inventory.totalQuantity,
    adminId: adminId,
    reason: reason,
    timestamp: new Date()
  });

  return { success: true, message: 'Inventory increased successfully' };
};

// Method to check availability
productSchema.methods.checkAvailability = function(size: 'S' | 'M' | 'L' | 'XL', quantity: number) {
  if (!this.inventory || !this.inventory.trackInventory) {
    return { available: true, message: 'Inventory tracking disabled' };
  }

  if (this.soldOut) {
    return { available: false, message: 'Product is sold out' };
  }

  if (this.soldOutSizes.includes(size)) {
    return { available: false, message: `Size ${size} is sold out` };
  }

  if (this.inventory.sizes[size] < quantity) {
    return { 
      available: false, 
      message: `Only ${this.inventory.sizes[size]} items available in size ${size}`,
      availableQuantity: this.inventory.sizes[size]
    };
  }

  return { available: true, message: 'Item is available' };
};

//* For a single --forced groping.
// let productModel = mongoose.model("Product", productSchema);

//* For better practice, for continuity, iterative model.
let productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
