// src/pages/Emails.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import EmailsDataTable from "./blocks/EmailsDataTable";
import { Box, CircularProgress } from "@mui/material";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import StatsCards from "@/components/common/StatsCards";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Emails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [emailStats, setEmailStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    pending: 0
  });
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  
  // Step indicator state
  const [currentStep, setCurrentStep] = useState(1);
  const [stepProgress, setStepProgress] = useState(33);
  
  // Steps: 1. Data Loading, 2. Statistics, 3. View Ready
  const steps = [
    { id: 1, name: "Data Loading", icon: "loading" },
    { id: 2, name: "Statistics", icon: "chart-line" },
    { id: 3, name: "View Ready", icon: "check-circle" }
  ];

  const fetchEmails = async () => {
    if (!token) return;
    setLoading(true);
    setCurrentStep(1);
    setStepProgress(33);
    
    try {
      const response = await axios.get(`${baseApi}/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const emailData = response.data || [];
      setEmails(emailData);
      
      // Step 2: Processing statistics
      setCurrentStep(2);
      setStepProgress(66);
      
      // 计算统计信息
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const todayCount = emailData.filter(email => {
        const emailDate = new Date(email.created_at);
        return emailDate >= today;
      }).length;
      
      const weekCount = emailData.filter(email => {
        const emailDate = new Date(email.created_at);
        return emailDate >= weekAgo;
      }).length;
      
      const pendingCount = emailData.filter(email => !email.is_processed).length;

      setEmailStats({
        total: emailData.length,
        today: todayCount,
        thisWeek: weekCount,
        pending: pendingCount
      });
      
      // Step 3: View ready
      setCurrentStep(3);
      setStepProgress(100);
      
      setLoading(false);
      toast.success(`Loaded ${emailData.length} emails successfully`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch emails");
      setLoading(false);
      setCurrentStep(1);
      setStepProgress(33);
      toast.error("Failed to load emails");
    }
  };

  useEffect(() => {
    if (token) {
      fetchEmails();
    }
  }, [token]);

  // Handle manual email processing
  const handleProcessEmail = async (emailId) => {
    if (processingId) return; // Prevent double-click

    setProcessingId(emailId);
    try {
      await axios.post(
        `${baseApi}/emails/${emailId}/process`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email processed successfully");
      fetchEmails(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process email");
    } finally {
      setProcessingId(null);
    }
  };


  if (error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <KeenIcon icon="information-5" className="text-red-500 text-4xl mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Emails</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEmails}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <CircularProgress className="mb-4" />
          <p className="text-gray-600">Loading emails...</p>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-gray-50"
          >
            <KeenIcon icon="arrow-left" className="text-sm" />
            Back
          </Button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <KeenIcon icon="sms" className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
                <p className="text-gray-600 text-sm">View and manage email communications</p>
              </div>
            </div>
            
            {/* Step Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">Step {currentStep} of 3</div>
                <div className="text-xs text-gray-500">{Math.round(stepProgress)}% Complete</div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${stepProgress}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">{Math.round(stepProgress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="mb-8">
        <StatsCards
          title="Email Communication Overview"
          cards={[
            {
              key: 'total',
              title: "Total Emails",
              value: emailStats.total,
              icon: "sms",
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              borderColor: "border-blue-200",
              route: null
            },
            {
              key: 'today',
              title: "Today's Emails",
              value: emailStats.today,
              icon: "calendar",
              color: "text-green-600",
              bgColor: "bg-green-50",
              borderColor: "border-green-200",
              route: null
            },
            {
              key: 'week',
              title: "This Week",
              value: emailStats.thisWeek,
              icon: "chart-line",
              color: "text-purple-600",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-200",
              route: null
            },
            {
              key: 'pending',
              title: "Pending",
              value: emailStats.pending,
              icon: "time",
              color: "text-yellow-600",
              bgColor: "bg-yellow-50",
              borderColor: "border-yellow-200",
              route: null
            }
          ]}
          loading={loading}
        />
      </div>
      
      {/* Email List Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Step Indicator */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Email List</h2>
            <div className="flex items-center space-x-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep > step.id ? 'bg-green-600 text-white' : 
                    currentStep === step.id ? 'bg-blue-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <KeenIcon icon="check" className="text-sm" />
                    ) : (
                      <KeenIcon icon={step.icon} className={`text-sm ${
                        currentStep === step.id && step.icon === 'loading' ? 'animate-spin' : ''
                      }`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 transition-colors ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Email Content */}
          {emails.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="message-text-2" className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Found</h3>
              <p className="text-gray-600 mb-4">There are no emails to display at the moment.</p>
              <Button 
                onClick={fetchEmails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <KeenIcon icon="arrows-circle" className="mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <EmailsDataTable
              emails={emails}
              onProcessEmail={handleProcessEmail}
              processingId={processingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
