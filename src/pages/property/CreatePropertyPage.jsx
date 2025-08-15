import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";
import AsyncUserSelect from "../../components/custom/AsyncUserSelect";
// 导入 AddressInput 组件
import AddressInput from "../../components/custom/AddressInput";
import { KeenIcon } from "@/components/keenicons";
import StatsCards from "@/components/common/StatsCards";

export default function CreatePropertyPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState(""); // 存储选中的 user
  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recent: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Form progress state
  const [formProgress, setFormProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch property statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${baseApi}/properties`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const properties = response.data || [];
        
        setStats({
          total: properties.length,
          active: properties.filter(p => p.status === 'active').length,
          recent: properties.filter(p => {
            const createdAt = new Date(p.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt >= thirtyDaysAgo;
          }).length
        });
      } catch (error) {
        console.error('Failed to fetch property statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token, baseApi]);

  // Calculate form progress
  useEffect(() => {
    const fields = {
      address: !!address,
      selectedUserId: !!selectedUserId
    };
    
    const completedFields = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;
    const progress = (completedFields / totalFields) * 100;
    
    setFormProgress(progress);
    
    // Determine current step
    if (address && selectedUserId) {
      setCurrentStep(2); // All complete
    } else if (address) {
      setCurrentStep(1); // Property info complete
    } else {
      setCurrentStep(1); // Starting
    }
  }, [address, selectedUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!address) {
      setError("Please enter a property address.");
      return;
    }
    
    if (!selectedUserId) {
      setError("Please select a user to assign to this property.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseApi}/properties`,
        { address, user_id: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Property created successfully!");
      navigate(`/property/${response.data.data.id}`);
    } catch (error) {
      console.error("Create property error:", error);
      const errorMessage = error.response?.data?.message || "Failed to create property.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <KeenIcon icon="home-2" className="text-green-600 text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Property</h1>
                <p className="text-gray-600 text-sm">Add a new property to the system</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">Step {currentStep} of 2</div>
                <div className="text-xs text-gray-500">{Math.round(formProgress)}% Complete</div>
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
                    className="text-green-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${formProgress}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">{Math.round(formProgress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="mb-8">
        <StatsCards
          title="Property Management Overview"
          cards={[
            {
              key: 'total',
              title: "Total Properties",
              value: stats.total,
              icon: "home-2",
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              borderColor: "border-blue-200",
              route: null
            },
            {
              key: 'active',
              title: "Active Properties",
              value: stats.active,
              icon: "check-circle",
              color: "text-green-600",
              bgColor: "bg-green-50",
              borderColor: "border-green-200",
              route: null
            },
            {
              key: 'recent',
              title: "Recent Properties",
              value: stats.recent,
              icon: "calendar",
              color: "text-purple-600",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-200",
              route: null
            }
          ]}
          loading={statsLoading}
        />
      </div>

      {/* Form Steps Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Property Info', icon: 'home-2', completed: !!address },
              { step: 2, title: 'User Assignment', icon: 'profile-circle', completed: !!selectedUserId }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center gap-3 ${
                  currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    item.completed 
                      ? 'bg-green-100 text-green-600' 
                      : currentStep >= item.step 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.completed ? (
                      <KeenIcon icon="check" className="text-sm" />
                    ) : (
                      <KeenIcon icon={item.icon} className="text-sm" />
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      currentStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      Step {item.step}
                    </div>
                    <div className={`text-xs ${
                      currentStep >= item.step ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {item.title}
                    </div>
                  </div>
                </div>
                {index < 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Property Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <KeenIcon icon="home-2" className="text-green-600" />
                  Property Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">Enter the property's location details</p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="geolocation" className="text-gray-500 text-sm" />
                  Property Address
                  <span className="text-red-500">*</span>
                  {address && (
                    <KeenIcon icon="check" className="text-green-500 text-sm" />
                  )}
                </label>
                <div className={`transition-all duration-200 ${
                  address 
                    ? 'ring-1 ring-green-200 rounded-md' 
                    : ''
                }`}>
                  <AddressInput
                    value={address}
                    onChange={(formattedAddress) => setAddress(formattedAddress)}
                    placeholder="Enter property address"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Start typing to search for an address
                </p>
              </div>
            </div>

            {/* Right Column - User Assignment */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <KeenIcon icon="profile-circle" className="text-blue-600" />
                  User Assignment
                </h3>
                <p className="text-sm text-gray-600 mt-1">Assign users to this property</p>
              </div>

              {/* User Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="people" className="text-gray-500 text-sm" />
                  Assign to User (Required)
                  {selectedUserId && (
                    <KeenIcon icon="check" className="text-green-500 text-sm" />
                  )}
                </label>
                <div className={`transition-all duration-200 ${
                  selectedUserId 
                    ? 'ring-1 ring-green-200 rounded-md' 
                    : ''
                }`}>
                  <AsyncUserSelect
                    onChange={(option) =>
                      setSelectedUserId(option ? option.value : "")
                    }
                    placeholder="Search and select user..."
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Select a user to assign to this property
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <KeenIcon icon="information-5" className="text-red-500 text-lg" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form Completion Status */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Form Completion</span>
              <span className="text-sm text-gray-600">{Math.round(formProgress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Property Info</span>
              <span>User Assignment</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || formProgress < 100}
              className={`px-8 py-2 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                formProgress >= 100 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <KeenIcon icon="loading" className="animate-spin" />
                  Creating Property...
                </>
              ) : formProgress >= 100 ? (
                <>
                  <KeenIcon icon="plus" />
                  Create Property Now
                </>
              ) : (
                <>
                  <KeenIcon icon="information-5" />
                  Complete All Fields
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
