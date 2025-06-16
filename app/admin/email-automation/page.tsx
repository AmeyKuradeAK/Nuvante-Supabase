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
    </div>
  );
} 