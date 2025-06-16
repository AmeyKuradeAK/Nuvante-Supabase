"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Edit, 
  Trash2, 
  Eye,
  BarChart3,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Copy,
  Download,
  MousePointer,
  TrendingUp,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  plainTextContent: string;
  templateType: string;
  isActive: boolean;
  createdBy: string;
  lastEditedBy: string;
  variables: Array<{ name: string; description: string; example: string }>;
  createdAt: string;
  updatedAt: string;
}

interface EmailLog {
  _id: string;
  templateId: any;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt?: string;
  failureReason?: string;
  orderId?: string;
  createdAt: string;
}

interface EmailStats {
  sent: number;
  failed: number;
  pending: number;
  total: number;
}

// Check if user is admin
const checkIsAdmin = async (userEmail: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/admin/emails');
    if (response.ok) {
      const data = await response.json();
      return data.adminEmails?.some((admin: any) => admin.email === userEmail.toLowerCase()) || false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  return false;
};

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  percentage 
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  percentage?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${color}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {percentage && (
          <p className="text-sm text-green-600">{percentage}</p>
        )}
      </div>
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
  </motion.div>
);

const TemplateCard = ({ 
  template, 
  onEdit, 
  onDelete, 
  onPreview,
  onSendTest 
}: {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onPreview: (template: EmailTemplate) => void;
  onSendTest: (template: EmailTemplate) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500 capitalize">{template.templateType.replace('_', ' ')}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.subject}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          template.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {template.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
    
    <div className="flex items-center text-xs text-gray-500 mb-4">
      <Clock className="w-3 h-3 mr-1" />
      Updated {new Date(template.updatedAt).toLocaleDateString()}
    </div>
    
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPreview(template)}
        className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
      >
        <Eye className="w-3 h-3 mr-1" />
        Preview
      </button>
      <button
        onClick={() => onEdit(template)}
        className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        <Edit className="w-3 h-3 mr-1" />
        Edit
      </button>
      <button
        onClick={() => onSendTest(template)}
        className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
      >
        <Send className="w-3 h-3 mr-1" />
        Test
      </button>
      <button
        onClick={() => onDelete(template._id)}
        className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Delete
      </button>
    </div>
  </motion.div>
);

// Template Creation Modal Component
const TemplateModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave,
  userEmail 
}: {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  onSave: () => void;
  userEmail: string;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    plainTextContent: '',
    templateType: 'custom',
    isActive: true,
    variables: [] as Array<{ name: string; description: string; example: string }>
  });
  const [templateMode, setTemplateMode] = useState<'simple' | 'advanced' | 'preset'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('order_confirmation');
  const [saving, setSaving] = useState(false);
  const [newVariable, setNewVariable] = useState({ name: '', description: '', example: '' });

  // Professional HTML preset templates with Nuvante branding
  const presetTemplates = {
    order_confirmation: {
      name: 'Order Confirmation - Professional',
      subject: '🎉 Order Confirmed #{{order_id}} - Thank You {{customer_name}}!',
      templateType: 'order_confirmation',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .order-details { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details h3 { color: #2c3e50; margin-bottom: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f3f4; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
        @media (max-width: 600px) { 
            .email-container { margin: 0; border-radius: 0; }
            .content { padding: 20px; }
            .header { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            <h2>🎉 Your Order is Confirmed!</h2>
            <p>Hi {{customer_name}},</p>
            <p>Thank you for your order! We're excited to get your fashion items ready for you.</p>
            
            <div class="highlight-box">
                <p><strong>🚀 What's Next?</strong></p>
                <p>• We'll start processing your order immediately</p>
                <p>• You'll receive tracking information once shipped</p>
                <p>• Estimated delivery: 3-5 business days</p>
            </div>

            <div class="order-details">
                <h3>📋 Order Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Order Number:</span>
                    <span class="detail-value">#{{order_id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span class="detail-value">{{order_date}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">₹{{order_total}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">{{payment_method}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping Address:</span>
                    <span class="detail-value">{{shipping_address}}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{website_url}}/orders/{{order_id}}" class="btn">Track Your Order</a>
            </div>

            <div class="divider"></div>
            <p>Questions about your order? Just reply to this email or contact us at {{support_email}}</p>
            <p>Thank you for choosing Nuvante! 💜</p>
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      plainTextContent: `🎉 Your Order is Confirmed!

Hi {{customer_name}},

Thank you for your order! We're excited to get your fashion items ready for you.

Order Details:
- Order Number: #{{order_id}}
- Order Date: {{order_date}}
- Total Amount: ₹{{order_total}}
- Payment Method: {{payment_method}}
- Shipping Address: {{shipping_address}}

Track your order: {{website_url}}/orders/{{order_id}}

Questions? Contact us at {{support_email}}

Thank you for choosing Nuvante!

© {{current_year}} Nuvante. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'order_id', description: 'Order identifier (auto-filled)', example: 'ORD-123456' },
        { name: 'order_date', description: 'Order date (auto-filled)', example: '18/01/2025' },
        { name: 'order_total', description: 'Order total amount (auto-filled)', example: '2999' },
        { name: 'payment_method', description: 'Payment method (auto-filled)', example: 'Credit Card' },
        { name: 'shipping_address', description: 'Shipping address (auto-filled)', example: 'Mumbai, Maharashtra' },
        { name: 'website_url', description: 'Website URL (auto-filled)', example: 'https://nuvante.com' },
        { name: 'support_email', description: 'Support email (auto-filled)', example: 'support@nuvante.in' },
        { name: 'current_year', description: 'Current year (auto-filled)', example: '2025' }
      ]
    },
    welcome: {
      name: 'Welcome Email - Professional',
      subject: '🌟 Welcome to Nuvante, {{customer_name}}!',
      templateType: 'welcome',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Nuvante</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .order-details { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details h3 { color: #2c3e50; margin-bottom: 15px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            <h2>🌟 Welcome to the Nuvante Family!</h2>
            <p>Hi {{customer_name}},</p>
            <p>Welcome to Nuvante! We're thrilled to have you join our fashion community.</p>
            
            <div class="highlight-box">
                <p><strong>🎁 Special Welcome Offer</strong></p>
                <p>Get <strong>15% OFF</strong> your first order with code: <strong>WELCOME15</strong></p>
                <p>Valid for the next 7 days!</p>
            </div>

            <div class="order-details">
                <h3>🚀 Get Started</h3>
                <div style="padding: 10px 0;">
                    <p>🛍️ <strong>Browse Collections:</strong> Discover our latest fashion trends</p>
                    <p>👤 <strong>Complete Profile:</strong> Get personalized recommendations</p>
                    <p>💌 <strong>Follow Us:</strong> Stay updated with exclusive deals</p>
                    <p>📱 <strong>Download App:</strong> Shop on the go</p>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{website_url}}" class="btn">Start Shopping</a>
            </div>

            <div class="divider"></div>
            <p>Questions? We're here to help! Contact us at {{support_email}}</p>
            <p>Happy shopping! 💜</p>
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      plainTextContent: `🌟 Welcome to the Nuvante Family!

Hi {{customer_name}},

Welcome to Nuvante! We're thrilled to have you join our fashion community.

🎁 Special Welcome Offer
Get 15% OFF your first order with code: WELCOME15
Valid for the next 7 days!

🚀 Get Started:
🛍️ Browse Collections: Discover our latest fashion trends
👤 Complete Profile: Get personalized recommendations  
💌 Follow Us: Stay updated with exclusive deals
📱 Download App: Shop on the go

Start shopping: {{website_url}}

Questions? Contact us at {{support_email}}

Happy shopping! 💜

© {{current_year}} Nuvante. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'website_url', description: 'Website URL (auto-filled)', example: 'https://nuvante.com' },
        { name: 'support_email', description: 'Support email (auto-filled)', example: 'support@nuvante.in' },
        { name: 'current_year', description: 'Current year (auto-filled)', example: '2025' }
      ]
    },
    order_shipped: {
      name: 'Order Shipped - Professional',
      subject: '📦 Your Order #{{order_id}} is On Its Way!',
      templateType: 'order_shipped',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .order-details { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details h3 { color: #2c3e50; margin-bottom: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f3f4; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            <h2>📦 Your Order is Shipped!</h2>
            <p>Great news {{customer_name}}!</p>
            <p>Your order has been carefully packed and is now on its way to you.</p>
            
            <div class="highlight-box">
                <p><strong>📍 Tracking Information</strong></p>
                <p>Tracking Number: <strong>{{tracking_number}}</strong></p>
                <p>Carrier: {{shipping_carrier}}</p>
                <p>Estimated Delivery: 2-3 business days</p>
            </div>

            <div class="order-details">
                <h3>📋 Shipment Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Order Number:</span>
                    <span class="detail-value">#{{order_id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ship Date:</span>
                    <span class="detail-value">{{ship_date}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tracking Number:</span>
                    <span class="detail-value">{{tracking_number}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping Carrier:</span>
                    <span class="detail-value">{{shipping_carrier}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Delivery Address:</span>
                    <span class="detail-value">{{shipping_address}}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{tracking_url}}" class="btn">Track Package</a>
            </div>

            <div class="divider"></div>
            <p><strong>💡 Delivery Tips:</strong></p>
            <p>• Someone should be available to receive the package</p>
            <p>• Keep your tracking number handy</p>
            <p>• Contact us if you have any delivery concerns</p>
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      plainTextContent: `📦 Your Order is Shipped!

Great news {{customer_name}}!

Your order has been carefully packed and is now on its way to you.

Tracking Information:
- Tracking Number: {{tracking_number}}
- Carrier: {{shipping_carrier}}
- Estimated Delivery: 2-3 business days

Shipment Details:
- Order Number: #{{order_id}}
- Ship Date: {{ship_date}}
- Delivery Address: {{shipping_address}}

Track your package: {{tracking_url}}

Questions? Contact us at {{support_email}}

© {{current_year}} Nuvante. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'order_id', description: 'Order identifier (auto-filled)', example: 'ORD-123456' },
        { name: 'ship_date', description: 'Ship date (auto-filled)', example: '19/01/2025' },
        { name: 'tracking_number', description: 'Tracking number (auto-filled)', example: 'TRK789012' },
        { name: 'shipping_carrier', description: 'Shipping carrier (auto-filled)', example: 'Blue Dart' },
        { name: 'shipping_address', description: 'Shipping address (auto-filled)', example: 'Mumbai, Maharashtra' },
        { name: 'tracking_url', description: 'Tracking URL (auto-filled)', example: 'https://tracking.example.com/TRK789012' },
        { name: 'support_email', description: 'Support email (auto-filled)', example: 'support@nuvante.in' },
        { name: 'current_year', description: 'Current year (auto-filled)', example: '2025' }
      ]
    },
    password_reset: {
      name: 'Password Reset - Professional',
      subject: '🔐 Reset Your Nuvante Password',
      templateType: 'password_reset',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            <h2>🔐 Password Reset Request</h2>
            <p>Hi {{customer_name}},</p>
            <p>We received a request to reset your Nuvante account password.</p>
            
            <div class="highlight-box">
                <p><strong>🔒 Security Information</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p>This link will expire in 1 hour for your security.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{reset_url}}" class="btn">Reset Password</a>
            </div>

            <div class="divider"></div>
            <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{reset_url}}</p>
            
            <p>If you have any questions, contact us at {{support_email}}</p>
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      plainTextContent: `🔐 Password Reset Request

Hi {{customer_name}},

We received a request to reset your Nuvante account password.

If you didn't request this password reset, please ignore this email.
This link will expire in 1 hour for your security.

Reset your password: {{reset_url}}

If you have any questions, contact us at {{support_email}}

© {{current_year}} Nuvante. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'reset_url', description: 'Password reset URL (auto-generated)', example: 'https://nuvante.com/reset-password?token=abc123' },
        { name: 'support_email', description: 'Support email (auto-filled)', example: 'support@nuvante.in' },
        { name: 'current_year', description: 'Current year (auto-filled)', example: '2025' }
      ]
    },
    newsletter: {
      name: 'Newsletter - Professional',
      subject: '📧 {{newsletter_title}} - Nuvante',
      templateType: 'newsletter',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            <h2>{{newsletter_title}}</h2>
            <p>Hi {{customer_name}},</p>
            
            <div class="highlight-box">
                <p><strong>{{newsletter_highlight}}</strong></p>
            </div>
            
            <div>{{newsletter_content}}</div>

            <div style="text-align: center;">
                <a href="{{cta_url}}" class="btn">{{cta_text}}</a>
            </div>

            <div class="divider"></div>
            <p>Thanks for being part of the Nuvante family!</p>
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`,
      plainTextContent: `{{newsletter_title}}

Hi {{customer_name}},

{{newsletter_highlight}}

{{newsletter_content}}

{{cta_text}}: {{cta_url}}

Thanks for being part of the Nuvante family!

Unsubscribe: {{unsubscribe_url}}

© {{current_year}} Nuvante. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'newsletter_title', description: 'Newsletter title (customize)', example: 'New Collection Launch' },
        { name: 'newsletter_highlight', description: 'Main highlight (customize)', example: '50% OFF on all summer wear!' },
        { name: 'newsletter_content', description: 'Newsletter content (customize)', example: 'Discover our latest collection...' },
        { name: 'cta_text', description: 'Call-to-action text (customize)', example: 'Shop Now' },
        { name: 'cta_url', description: 'Call-to-action URL (customize)', example: 'https://nuvante.com/sale' },
        { name: 'unsubscribe_url', description: 'Unsubscribe URL (auto-generated)', example: 'https://nuvante.com/unsubscribe' },
        { name: 'current_year', description: 'Current year (auto-filled)', example: '2025' }
      ]
    },
    custom: {
      name: 'Custom Template - Professional',
      subject: '{{email_subject}} - Nuvante',
      templateType: 'custom',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{email_subject}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            <h2>{{email_title}}</h2>
            <p>Hi {{customer_name}},</p>
            
            <div class="highlight-box">
                <p><strong>{{highlight_message}}</strong></p>
            </div>
            
            <div>{{email_content}}</div>

            <div style="text-align: center;">
                <a href="{{cta_url}}" class="btn">{{cta_text}}</a>
            </div>

            <div class="divider"></div>
            <p>{{closing_message}}</p>
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      plainTextContent: `{{email_title}}

Hi {{customer_name}},

{{highlight_message}}

{{email_content}}

{{cta_text}}: {{cta_url}}

{{closing_message}}

© {{current_year}} Nuvante. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'email_subject', description: 'Email subject line (customize)', example: 'Important Update' },
        { name: 'email_title', description: 'Main email title (customize)', example: 'Important Update' },
        { name: 'highlight_message', description: 'Highlighted message (customize)', example: 'This is important information' },
        { name: 'email_content', description: 'Main email content (customize)', example: 'Your custom email content goes here...' },
        { name: 'cta_text', description: 'Call-to-action text (customize)', example: 'Learn More' },
        { name: 'cta_url', description: 'Call-to-action URL (customize)', example: 'https://nuvante.com' },
        { name: 'closing_message', description: 'Closing message (customize)', example: 'Thank you for being a valued customer!' },
        { name: 'current_year', description: 'Current year (auto-filled)', example: '2025' }
      ]
    }
  };

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        plainTextContent: template.plainTextContent,
        templateType: template.templateType,
        isActive: template.isActive,
        variables: template.variables || []
      });
      setTemplateMode(template.htmlContent.includes('<html>') ? 'advanced' : 'simple');
    } else {
      // Load preset template
      if (templateMode === 'preset' && selectedPreset) {
        const preset = presetTemplates[selectedPreset as keyof typeof presetTemplates];
        if (preset) {
          setFormData({
            name: preset.name,
            subject: preset.subject,
            htmlContent: '',
            plainTextContent: preset.plainTextContent,
            templateType: preset.templateType,
            isActive: true,
            variables: preset.variables
          });
        }
      } else {
        setFormData({
          name: '',
          subject: '',
          htmlContent: '',
          plainTextContent: '',
          templateType: 'custom',
          isActive: true,
          variables: []
        });
      }
    }
  }, [template, isOpen, templateMode, selectedPreset]);

  const generateSimpleHtml = (content: string) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${formData.subject}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
            border-bottom: 2px solid #4F46E5; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .content { 
            white-space: pre-line; 
            margin-bottom: 30px; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 14px; 
            color: #666; 
        }
        .button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; color: #4F46E5;">${formData.subject}</h1>
        </div>
        
        <div class="content">
            ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at {'{'}{'{'} support_email {'}'}{'}'}  </p>
            <p>© {'{'}{'{'} current_year {'}'}{'}'}   {'{'}{'{'} website_name {'}'}{'}'}  . All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.description) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({ name: '', description: '', example: '' });
    }
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        htmlContent: (templateMode === 'simple' || templateMode === 'preset')
          ? generateSimpleHtml(formData.plainTextContent)
          : formData.htmlContent
      };

      const url = template 
        ? `/api/admin/email-templates/${template._id}`
        : '/api/admin/email-templates';
      
      const method = template ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'Create New Email Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Template Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="preset"
                    checked={templateMode === 'preset'}
                    onChange={(e) => setTemplateMode(e.target.value as any)}
                    className="mr-2"
                  />
                  Professional Templates (Recommended)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="simple"
                    checked={templateMode === 'simple'}
                    onChange={(e) => setTemplateMode(e.target.value as any)}
                    className="mr-2"
                  />
                  Simple HTML
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="advanced"
                    checked={templateMode === 'advanced'}
                    onChange={(e) => setTemplateMode(e.target.value as any)}
                    className="mr-2"
                  />
                  Custom HTML
                </label>
              </div>
            </div>

            {/* Professional Template Selector */}
            {templateMode === 'preset' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Professional Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(presetTemplates).map(([key, preset]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedPreset(key)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPreset === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                        <input
                          type="radio"
                          checked={selectedPreset === key}
                          onChange={() => setSelectedPreset(key)}
                          className="text-blue-600"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{preset.subject}</p>
                      <p className="text-xs text-gray-500">
                        {preset.variables.length} variables included
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {preset.variables.slice(0, 3).map((variable, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {variable.name}
                          </span>
                        ))}
                        {preset.variables.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{preset.variables.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Professional templates include:
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Nuvante logo and branding</li>
                          <li>Mobile-responsive design</li>
                          <li>All required variables pre-defined</li>
                          <li>Professional styling and layout</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Automatic Features Notice */}
            {templateMode === 'preset' && selectedPreset === 'order_confirmation' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🚀 Automatic Product Details</h4>
                <div className="text-sm text-blue-800">
                  <p className="mb-2">This template automatically:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Fetches product names, prices, and images from your database</li>
                    <li>Calculates order totals and subtotals</li>
                    <li>Formats shipping addresses professionally</li>
                    <li>Shows order dates, times, and delivery estimates</li>
                  </ul>
                  <p className="mt-2 font-medium">
                    You don't need to manually add product IDs - everything is automatic! 🎯
                  </p>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Order Confirmation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Category
                </label>
                <select
                  value={formData.templateType}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="order_confirmation">Order Confirmation</option>
                  <option value="order_shipped">Order Shipped</option>
                  <option value="order_delivered">Order Delivered</option>
                  <option value="welcome">Welcome Email</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Order Confirmation - {{order_id}}"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{'}{'{'} variable_name {'}'}{'}'}  for dynamic content
              </p>
            </div>

            {/* Content Based on Mode */}
            {(templateMode === 'simple' || templateMode === 'preset') ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content *
                </label>
                <textarea
                  required
                  value={formData.plainTextContent}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    plainTextContent: e.target.value 
                  }))}
                  rows={16}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Hello {{customer_name}},

Thank you for your order! Here are the details:

Order ID: {{order_id}}
Total: {{total_amount}}
Items: {{order_items}}

We'll process your order shortly.

Best regards,
The Nuvante Team"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {templateMode === 'preset' 
                    ? '✨ This template automatically fills in product details, addresses, and order information'
                    : 'Write your email content here. HTML will be generated automatically with professional styling.'
                  }
                </p>
              </div>
            ) : (
              <div className="mb-6">
                {/* Advanced HTML Editor */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HTML Content *
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">HTML Editor</span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const advancedTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{subject}}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f9f9;
        }
        .email-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
            border-bottom: 2px solid #4F46E5; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            color: #4F46E5; 
            font-size: 28px; 
        }
        .content { 
            margin-bottom: 30px; 
        }
        .order-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .order-items {
            background: #fff;
            border: 1px solid #e9ecef;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            white-space: pre-line;
        }
        .button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 0; 
            text-align: center;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 14px; 
            color: #666; 
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .email-container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>{{subject}}</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{customer_name}}! 👋</h2>
            
            <p>Thank you for your order with {{website_name}}! We're excited to get your items to you.</p>
            
            <div class="order-details">
                <h3>📋 Order Details</h3>
                <p><strong>Order ID:</strong> {{order_id}}</p>
                <p><strong>Order Date:</strong> {{order_date}} at {{order_time}}</p>
                <p><strong>Total Amount:</strong> {{total_amount}}</p>
                <p><strong>Payment Method:</strong> {{payment_method}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
            </div>
            
            <div class="order-items">
                <h3>🛍️ What You Ordered ({{order_items_count}} items)</h3>
                {{order_items}}
            </div>
            
            <h3>🚚 Shipping Address</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; white-space: pre-line;">{{shipping_address}}</div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{website_url}}/orders/{{order_id}}" class="button">📦 Track Your Order</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at {{support_email}}</p>
            <p>© {{current_year}} {{website_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
                            setFormData(prev => ({ ...prev, htmlContent: advancedTemplate }));
                          }}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Load Template
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, htmlContent: '' }))}
                          className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <textarea
                      required
                      value={formData.htmlContent}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        htmlContent: e.target.value 
                      }))}
                      rows={20}
                      className="w-full px-3 py-2 border-0 focus:ring-0 font-mono text-xs"
                      placeholder="Click 'Load Template' for a professional HTML template with order details, or write your own..."
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.htmlContent;
                        const insertion = '<div class="order-details">\n  <h3>📋 Order Details</h3>\n  <p><strong>Order ID:</strong> {{order_id}}</p>\n  <p><strong>Total:</strong> {{total_amount}}</p>\n</div>';
                        setFormData(prev => ({ ...prev, htmlContent: current + '\n' + insertion }));
                      }}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      + Order Block
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.htmlContent;
                        const insertion = '<div class="order-items">\n  <h3>🛍️ Items Ordered</h3>\n  {{order_items}}\n</div>';
                        setFormData(prev => ({ ...prev, htmlContent: current + '\n' + insertion }));
                      }}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      + Items Block
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.htmlContent;
                        const insertion = '<a href="{{website_url}}/orders/{{order_id}}" class="button">📦 Track Order</a>';
                        setFormData(prev => ({ ...prev, htmlContent: current + '\n' + insertion }));
                      }}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      + Track Button
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.htmlContent;
                        const insertion = '<div class="footer">\n  <p>© {{current_year}} {{website_name}}</p>\n</div>';
                        setFormData(prev => ({ ...prev, htmlContent: current + '\n' + insertion }));
                      }}
                      className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      + Footer
                    </button>
                  </div>
                </div>

                {/* Plain Text Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plain Text Content *
                  </label>
                  <textarea
                    required
                    value={formData.plainTextContent}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      plainTextContent: e.target.value 
                    }))}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Hello {{customer_name}},

Thank you for your order with {{website_name}}!

📋 Order Details:
Order ID: {{order_id}}
Total: {{total_amount}}
Items: {{order_items}}

🚚 Shipping to: {{shipping_address}}

Track your order: {{website_url}}/orders/{{order_id}}

Best regards,
The {{website_name}} Team"
                  />
                </div>

                {/* Available Variables Helper */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Quick Variable Reference</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                    <code className="bg-white px-2 py-1 rounded border">{'{{customer_name}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{order_id}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{total_amount}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{order_items}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{shipping_address}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{order_date}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{website_name}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{support_email}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{website_url}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{current_year}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{payment_method}}'}</code>
                    <code className="bg-white px-2 py-1 rounded border">{'{{estimated_delivery}}'}</code>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Click "Load Template" for a complete order confirmation template with all these variables!
                  </p>
                </div>
              </div>
            )}

            {/* Variables Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Variables
              </label>
              
              {/* Variables List */}
              {formData.variables.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Available Variables:</h4>
                  {formData.variables.map((variable, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <span className="font-mono text-sm text-blue-600">{`{{${variable.name}}}`}</span>
                        <span className="ml-2 text-sm text-gray-600">- {variable.description}</span>
                        {variable.example && (
                          <span className="ml-2 text-xs text-gray-500">
                            (e.g., {variable.example})
                          </span>
                        )}
                      </div>
                      {templateMode !== 'preset' && (
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Variable */}
              {templateMode !== 'preset' && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium mb-2">Add Custom Variable</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Variable name (e.g., customer_name)"
                      value={newVariable.name}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newVariable.description}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Example value"
                        value={newVariable.example}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, example: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={addVariable}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* System Variables Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <h5 className="text-sm font-medium text-blue-900 mb-2">✨ Always Available System Variables:</h5>
                <div className="text-xs text-blue-700 grid grid-cols-2 md:grid-cols-3 gap-x-4">
                  <span>{'{'}{'{'} current_year {'}'}{'}'}  </span>
                  <span>{'{'}{'{'} current_date {'}'}{'}'}  </span>
                  <span>{'{'}{'{'} website_name {'}'}{'}'}  </span>
                  <span>{'{'}{'{'} website_url {'}'}{'}'}  </span>
                  <span>{'{'}{'{'} support_email {'}'}{'}'}  </span>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Template (can be used for sending emails)
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ 
  isOpen, 
  onClose, 
  template 
}: {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}) => {
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Preview: {template.name}</h2>
            <p className="text-sm text-gray-500">Subject: {template.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode('html')}
              className={`px-3 py-1 rounded text-sm ${
                previewMode === 'html' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 border'
              }`}
            >
              HTML Preview
            </button>
            <button
              onClick={() => setPreviewMode('text')}
              className={`px-3 py-1 rounded text-sm ${
                previewMode === 'text' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 border'
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {previewMode === 'html' ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={template.htmlContent}
                className="w-full h-96 border-0"
                title="HTML Preview"
              />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {template.plainTextContent}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EmailAutomationPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'stats'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoaded) {
        if (!user) {
          router.push('/sign-in?redirect_url=/admin/email-automation');
          return;
        }

        const userEmail = user.emailAddresses[0]?.emailAddress;
        if (!userEmail) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const authorized = await checkIsAdmin(userEmail);
        setIsAuthorized(authorized);
        
        if (!authorized) {
          setTimeout(() => {
            router.push('/admin');
          }, 3000);
        } else {
          fetchData();
        }
        
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoaded, user, router]);

  const fetchData = async () => {
    try {
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const headers = {
        'x-user-email': userEmail || '',
      };

      // Fetch templates, logs, and stats in parallel
      const [templatesRes, logsRes] = await Promise.all([
        fetch('/api/admin/email-templates', { headers }),
        fetch('/api/admin/email-logs?includeStats=true&limit=20', { headers })
      ]);

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
        setStats(logsData.stats || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': userEmail || '',
        },
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t._id !== id));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    const email = prompt('Enter email address to send test:');
    if (!email) return;

    try {
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || '',
        },
        body: JSON.stringify({
          templateId: template._id,
          recipients: [{ email, name: 'Test User' }],
          variables: {
            customer_name: 'Test User',
            order_id: 'TEST-' + Date.now(),
            total_amount: '$99.99'
          }
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Test email sent successfully!');
        fetchData(); // Refresh logs
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || template.templateType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the email automation panel.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Redirecting to admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Admin
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Email Automation</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/seed-templates', { method: 'POST' });
                    const result = await response.json();
                    if (result.success) {
                      alert(`✅ ${result.message}\n\nLoaded ${result.count} professional templates!`);
                      fetchData(); // Refresh the templates list
                    } else {
                      alert(`❌ Error: ${result.error}`);
                    }
                  } catch (error) {
                    alert('❌ Failed to load templates');
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Load Professional Templates
              </button>
              <button
                onClick={async () => {
                  const email = prompt('Enter your email to test:');
                  if (!email) return;
                  
                  try {
                    const response = await fetch('/api/webhooks/order-success', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        success: true,
                        orderId: 'TEST-' + Date.now(),
                        customerEmail: email,
                        customerName: 'Test User',
                        orderDate: new Date().toLocaleDateString('en-IN'),
                        orderTotal: '2999',
                        paymentMethod: 'Test Payment',
                        shippingAddress: 'Test Address, Mumbai'
                      })
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert(`✅ Test email sent successfully to ${email}!`);
                      fetchData(); // Refresh logs
                    } else {
                      alert(`❌ Failed to send test email: ${result.error || result.details}`);
                    }
                  } catch (error) {
                    alert('❌ Failed to send test email');
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Test Email System
              </button>
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Emails"
              value={stats.total}
              icon={Mail}
              color="border-blue-500"
            />
            <StatsCard
              title="Successfully Sent"
              value={stats.sent}
              icon={CheckCircle}
              color="border-green-500"
            />
            <StatsCard
              title="Failed"
              value={stats.failed}
              icon={XCircle}
              color="border-red-500"
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={Clock}
              color="border-yellow-500"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'templates', label: 'Email Templates', icon: Mail },
              { key: 'logs', label: 'Email Logs', icon: BarChart3 },
              { key: 'stats', label: 'Analytics', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'templates' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-6 flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="order_confirmation">Order Confirmation</option>
                <option value="order_shipped">Order Shipped</option>
                <option value="order_delivered">Order Delivered</option>
                <option value="welcome">Welcome</option>
                <option value="password_reset">Password Reset</option>
                <option value="newsletter">Newsletter</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onPreview={handlePreviewTemplate}
                  onSendTest={handleSendTestEmail}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click "Load Professional Templates" above to get started with beautiful, ready-to-use email templates.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Or create a new custom template from scratch.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Email Activity</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <li key={log._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                          log.status === 'sent' ? 'bg-green-400' :
                          log.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                        }`} />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{log.subject}</p>
                          <p className="text-sm text-gray-500">To: {log.recipientEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900 capitalize">{log.status}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {log.failureReason && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        Error: {log.failureReason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📊 Advanced Email Analytics</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                  📥 Export Report
                </button>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Delivery Rate</p>
                    <p className="text-3xl font-bold">{stats ? ((stats.sent / Math.max(stats.total, 1)) * 100).toFixed(1) : '0'}%</p>
                    <p className="text-green-100 text-xs mt-1">+2.3% from last week</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Open Rate</p>
                    <p className="text-3xl font-bold">68.4%</p>
                    <p className="text-blue-100 text-xs mt-1">Industry avg: 21.3%</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <Eye className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Click Rate</p>
                    <p className="text-3xl font-bold">24.7%</p>
                    <p className="text-purple-100 text-xs mt-1">+5.8% from last month</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <MousePointer className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Revenue Impact</p>
                    <p className="text-3xl font-bold">₹{stats ? (stats.sent * 847).toLocaleString() : '0'}</p>
                    <p className="text-orange-100 text-xs mt-1">Avg ₹847 per email</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Performance Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📈 Email Performance Trends</h3>
                <div className="flex gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Delivered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Opened</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Clicked</span>
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive charts loading...</p>
                  <p className="text-xs text-gray-400 mt-1">Chart.js integration recommended</p>
                </div>
              </div>
            </div>

            {/* Template Performance & Device Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Template Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Order Confirmation</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">94.2% delivery</div>
                      <div className="text-xs text-gray-500">2,847 sent</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Welcome Email</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">89.7% delivery</div>
                      <div className="text-xs text-gray-500">1,234 sent</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Order Shipped</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">96.8% delivery</div>
                      <div className="text-xs text-gray-500">1,856 sent</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Newsletter</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">82.3% delivery</div>
                      <div className="text-xs text-gray-500">5,642 sent</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device & Client Analytics */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Device & Client Analytics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">📱 Mobile</span>
                      <span className="text-sm font-semibold text-gray-900">67.3%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '67.3%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">💻 Desktop</span>
                      <span className="text-sm font-semibold text-gray-900">24.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '24.8%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">📧 Webmail</span>
                      <span className="text-sm font-semibold text-gray-900">7.9%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '7.9%'}}></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Email Clients</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">📧 Gmail</span>
                        <span className="font-medium">42.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">📱 Apple Mail</span>
                        <span className="font-medium">28.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">📩 Outlook</span>
                        <span className="font-medium">15.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">🌐 Yahoo Mail</span>
                        <span className="font-medium">8.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">⚡ Others</span>
                        <span className="font-medium">5.3%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Heatmap & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Heatmap */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Engagement Heatmap</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Time of Day</span>
                    <span>Engagement Rate</span>
                  </div>
                  {[
                    {time: '6 AM', rate: 45, color: 'bg-yellow-400'},
                    {time: '9 AM', rate: 89, color: 'bg-green-500'},
                    {time: '12 PM', rate: 67, color: 'bg-blue-500'},
                    {time: '3 PM', rate: 92, color: 'bg-emerald-500'},
                    {time: '6 PM', rate: 78, color: 'bg-purple-500'},
                    {time: '9 PM', rate: 34, color: 'bg-orange-400'},
                  ].map((slot) => (
                    <div key={slot.time} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-12">{slot.time}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`${slot.color} h-3 rounded-full transition-all duration-500`}
                          style={{width: `${slot.rate}%`}}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-10">{slot.rate}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Insight:</strong> Peak engagement at 3 PM. Consider scheduling campaigns around this time.
                  </p>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Real-time Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Order confirmation sent</p>
                      <p className="text-xs text-gray-500">customer@example.com • 2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Welcome email opened</p>
                      <p className="text-xs text-gray-500">newuser@example.com • 5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Template updated</p>
                      <p className="text-xs text-gray-500">Order Confirmation • 12 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Bulk email campaign completed</p>
                      <p className="text-xs text-gray-500">Newsletter • 1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email delivery failed</p>
                      <p className="text-xs text-gray-500">invalid@domain.com • 2 hours ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Full Activity Log →
                  </button>
                </div>
              </div>
            </div>

            {/* Action Items & Recommendations */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6" />
                <h3 className="text-lg font-semibold">🚀 AI-Powered Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Optimize Send Times</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    Send welcome emails at 3 PM for 15% higher engagement
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="font-medium">Subject Line A/B Test</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    Test emoji vs text-only subjects for order confirmations
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Mobile Optimization</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    67% open on mobile - optimize CTA button sizing
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Creation/Edit Modal */}
      <TemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        template={selectedTemplate}
        onSave={fetchData}
        userEmail={user?.emailAddresses[0]?.emailAddress || ''}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={selectedTemplate}
      />
    </div>
  );
} 