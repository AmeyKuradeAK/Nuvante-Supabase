import mongoose from "mongoose";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  timestamp: string;
  estimatedDeliveryDate: string;
  items: string[];
  trackingId: string;
  itemStatus: string;
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
  };
}

let clientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  cart: {
    type: Array,
    required: true,
  },
  cartQuantities: {
    type: Map,
    of: Number,
    default: new Map()
  },
  cartSizes: {
    type: Map,
    of: String,
    default: new Map()
  },
  wishlist: {
    type: Array,
    required: true,
  },
  orders: {
    type: [{
      orderId: String,
      paymentId: String,
      amount: Number,
      currency: String,
      timestamp: String,
      estimatedDeliveryDate: String,
      items: [String],
      trackingId: {
        type: String,
        default: "Tracking ID will be available soon"
      },
      itemStatus: {
        type: String,
        default: "Order Accepted"
      },
      itemDetails: [{
        productId: String,
        size: String,
        quantity: Number
      }],
      shippingAddress: {
        firstName: String,
        lastName: String,
        streetAddress: String,
        apartment: String,
        city: String,
        phone: String,
        email: String
      }
    }],
    required: true,
    default: []
  }
});

// let clientModel = mongoose.model("Client", clientSchema);

let clientModel =
  mongoose.models.Client || mongoose.model("Client", clientSchema);

export default clientModel;
