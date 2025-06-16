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
  Download
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

  // Preset templates with automatic product details
  const presetTemplates = {
    order_confirmation: {
      name: 'Order Confirmation',
      subject: 'Order Confirmed - {{order_id}} 🎉',
      templateType: 'order_confirmation',
      plainTextContent: `Hello {{customer_name}},

🎉 Thank you for your order! We're excited to get your items to you.

📋 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{order_id}}
Order Date: {{order_date}} at {{order_time}}
Total Amount: {{total_amount}}
Payment Method: {{payment_method}}
Estimated Delivery: {{estimated_delivery}}

🛍️ WHAT YOU ORDERED ({{order_items_count}} items)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{order_items}}

🚚 SHIPPING TO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{shipping_address}}

📦 Track your order: {{website_url}}/orders/{{order_id}}
📞 Need help? Contact: {{support_email}}

Thank you for choosing {{website_name}}!
© {{current_year}} {{website_name}}. All rights reserved.`,
      variables: [
        { name: 'customer_name', description: 'Customer full name (auto-filled)', example: 'John Doe' },
        { name: 'order_id', description: 'Order identifier (auto-filled)', example: 'ORD-123456' },
        { name: 'order_date', description: 'Order date (auto-filled)', example: '15/06/2024' },
        { name: 'order_time', description: 'Order time (auto-filled)', example: '2:30 PM' },
        { name: 'total_amount', description: 'Order total (auto-filled)', example: '₹1,299' },
        { name: 'payment_method', description: 'Payment method (auto-filled)', example: 'Credit Card' },
        { name: 'estimated_delivery', description: 'Delivery date (auto-calculated)', example: '20/06/2024' },
        { name: 'order_items', description: 'Product details (AUTO-FETCHED from database)', example: '• Nuvante Classic T-Shirt\n  Size: M | Qty: 2 | Price: ₹599\n  Subtotal: ₹1,198' },
        { name: 'order_items_count', description: 'Number of items (auto-calculated)', example: '3' },
        { name: 'shipping_address', description: 'Formatted address (auto-filled)', example: 'John Doe\n123 Main Street\nMumbai 400001\nPhone: +91 9876543210' }
      ]
    },
    welcome: {
      name: 'Welcome Email',
      subject: 'Welcome to {{website_name}}! 🎉',
      templateType: 'welcome',
      plainTextContent: `Hello {{customer_name}}! 👋

🎉 Welcome to {{website_name}}!

Thank you for joining our fashion community. We're excited to have you here!

What you can do next:
🛍️ Browse our latest collection
👤 Complete your profile for personalized recommendations  
📧 Subscribe to our newsletter for exclusive deals
📱 Follow us on social media for updates

🚀 Get started: {{getting_started_url}}
🛒 Shop now: {{website_url}}

Questions? Contact us at {{support_email}}

Welcome aboard!
© {{current_year}} {{website_name}}`,
      variables: [
        { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
        { name: 'welcome_message', description: 'Personal welcome message', example: 'Welcome to our fashion community!' },
        { name: 'getting_started_url', description: 'Getting started page URL', example: '/welcome' }
      ]
    },
    order_shipped: {
      name: 'Order Shipped',
      subject: 'Your Order is On the Way! 📦 - {{order_id}}',
      templateType: 'order_shipped',
      plainTextContent: `Hello {{customer_name}}!

📦 Great news! Your order has been shipped and is on its way to you.

📍 TRACKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tracking ID: {{tracking_id}}
Order ID: {{order_id}}
Estimated Delivery: {{estimated_delivery}}

🔍 Track your package: {{tracking_url}}

Thank you for shopping with {{website_name}}!
© {{current_year}} {{website_name}}`,
      variables: [
        { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
        { name: 'order_id', description: 'Order identifier', example: 'ORD-123456' },
        { name: 'tracking_id', description: 'Shipment tracking ID', example: 'TRK-789012' },
        { name: 'estimated_delivery', description: 'Expected delivery date', example: '25/06/2024' },
        { name: 'tracking_url', description: 'Tracking URL', example: 'https://track.shipper.com/TRK-789012' }
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
            {!template && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you want to create your email?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="preset"
                      checked={templateMode === 'preset'}
                      onChange={(e) => setTemplateMode(e.target.value as any)}
                      className="mb-2"
                    />
                    <span className="text-2xl mb-2">🎯</span>
                    <span className="text-sm font-medium text-center">
                      <strong>Smart Templates</strong><br/>
                      Pre-built with automatic product details
                    </span>
                  </label>
                  <label className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="simple"
                      checked={templateMode === 'simple'}
                      onChange={(e) => setTemplateMode(e.target.value as any)}
                      className="mb-2"
                    />
                    <span className="text-2xl mb-2">📝</span>
                    <span className="text-sm font-medium text-center">
                      <strong>Simple</strong><br/>
                      Write content, auto-style
                    </span>
                  </label>
                  <label className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="advanced"
                      checked={templateMode === 'advanced'}
                      onChange={(e) => setTemplateMode(e.target.value as any)}
                      className="mb-2"
                    />
                    <span className="text-2xl mb-2">🎨</span>
                    <span className="text-sm font-medium text-center">
                      <strong>Advanced</strong><br/>
                      Full HTML control
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Preset Template Selection */}
            {templateMode === 'preset' && !template && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Smart Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(presetTemplates).map(([key, preset]) => (
                    <label key={key} className="flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value={key}
                        checked={selectedPreset === key}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                        className="mb-2"
                      />
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {key === 'order_confirmation' && '✨ Auto-fetches product details from your database'}
                        {key === 'welcome' && '🎉 Perfect for new customer onboarding'}
                        {key === 'order_shipped' && '📦 Keeps customers updated on deliveries'}
                      </span>
                    </label>
                  ))}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HTML Content *
                  </label>
                  <textarea
                    required
                    value={formData.htmlContent}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      htmlContent: e.target.value 
                    }))}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="<!DOCTYPE html>
<html>
<head>
  <title>{{subject}}</title>
</head>
<body>
  <h1>Hello {{customer_name}}!</h1>
  <!-- Your HTML content here -->
</body>
</html>"
                  />
                </div>
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

This is the plain text version of your email...

Best regards,
The Nuvante Team"
                  />
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
                  Get started by creating a new email template.
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
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Email Analytics</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Advanced analytics coming soon...</p>
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