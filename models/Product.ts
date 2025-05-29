import mongoose from "mongoose";

let productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
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
});

//* For a single --forced groping.
// let productModel = mongoose.model("Product", productSchema);

//* For better practice, for continuity, iterative model.
let productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
