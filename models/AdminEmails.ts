import mongoose from "mongoose";

const adminEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

// Index for faster lookups
adminEmailSchema.index({ email: 1 });
adminEmailSchema.index({ isActive: 1 });

const AdminEmail = mongoose.models.AdminEmail || mongoose.model("AdminEmail", adminEmailSchema);

export default AdminEmail; 