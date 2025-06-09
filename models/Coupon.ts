import mongoose from "mongoose";

let couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    default: null, // For percentage coupons, limit max discount
    min: 0
  },
  totalAvailable: {
    type: Number,
    required: true,
    min: 0
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  expirationDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  usageHistory: [{
    userEmail: String,
    orderAmount: Number,
    discountApplied: Number,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for performance
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ expirationDate: 1 });

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function() {
  return Math.max(0, this.totalAvailable - this.usedCount);
});

// Method to check if coupon is valid
couponSchema.methods.isValidForUse = function() {
  const now = new Date();
  return (
    this.isActive &&
    this.expirationDate > now &&
    this.remainingUses > 0
  );
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount: number) {
  if (!this.isValidForUse()) {
    return { valid: false, discount: 0, message: "Coupon is not valid" };
  }

  if (orderAmount < this.minimumOrderAmount) {
    return { 
      valid: false, 
      discount: 0, 
      message: `Minimum order amount of ₹${this.minimumOrderAmount} required` 
    };
  }

  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderAmount * this.value) / 100;
    
    // Apply maximum discount limit for percentage coupons
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else {
    // Fixed amount discount
    discount = Math.min(this.value, orderAmount);
  }

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
    message: "Coupon applied successfully"
  };
};

// Method to use coupon
couponSchema.methods.useCoupon = function(userEmail: string, orderAmount: number, discountApplied: number) {
  this.usedCount += 1;
  this.usageHistory.push({
    userEmail,
    orderAmount,
    discountApplied,
    usedAt: new Date()
  });
  return this.save();
};

let couponModel = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default couponModel; 