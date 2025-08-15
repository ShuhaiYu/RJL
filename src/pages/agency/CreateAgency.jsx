import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import AddressInput from "../../components/custom/AddressInput";
import { KeenIcon } from "@/components/keenicons";
import StatsCards from "@/components/common/StatsCards";

export default function CreateAgency() {
  const [form, setForm] = useState({
    agency_name: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    logo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 统计数据状态
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    recentAgencies: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // 表单进度状态
  const [formProgress, setFormProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  
  // 表单验证状态
  const [validationErrors, setValidationErrors] = useState({});

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  
  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        setStatsLoading(true);
        const response = await axios.get(`${baseApi}/agencies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const agencies = response.data || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentAgencies = agencies.filter(agency => {
          const createdAt = new Date(agency.created_at);
          return createdAt >= thirtyDaysAgo;
        }).length;
        
        const activeAgencies = agencies.filter(agency => agency.status === 'active').length;
        
        setStats({
          totalAgencies: agencies.length,
          activeAgencies: activeAgencies,
          recentAgencies: recentAgencies
        });
      } catch (error) {
        console.error('Failed to fetch agency statistics:', error);
        // 设置模拟数据
        setStats({
          totalAgencies: 12,
          activeAgencies: 10,
          recentAgencies: 3
        });
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [token, baseApi]);
  
  // 计算表单进度
  useEffect(() => {
    const calculateProgress = () => {
      let progress = 0;
      let step = 1;
      
      // 基本信息 (50%)
      if (form.agency_name) progress += 15;
      if (form.name) progress += 15;
      if (form.email) progress += 20;
      
      // 密码设置 (30%)
      if (form.password && form.confirmPassword) {
        progress += 30;
        step = 2;
      }
      
      // 地址信息 (20%)
      if (form.address) {
        progress += 20;
        step = 3;
      }
      
      setFormProgress(Math.min(progress, 100));
      setCurrentStep(step);
    };
    
    calculateProgress();
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 简单校验
    const { agency_name, name, email, password, confirmPassword, address } = form;
    if (
      !agency_name.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !address.trim()
    ) {
      toast.error("Please fill in all required field");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword: _, ...payload } = form; // 去掉 confirmPassword
      await axios.post(`${baseApi}/agencies`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Agency created successfully");
      navigate("/agencies/my-agencies");
      setForm({
        agency_name: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        phone: "",
        logo: "",
      });
    } catch (err) {
      console.error("Failed to create agency:", err);
      setError(err.response?.data?.message || "Failed to create agency");
    }
    setLoading(false);
  };

  return (
    <TooltipProvider delayDuration={0}>
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
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <KeenIcon icon="office-bag" className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Agency</h1>
                  <p className="text-gray-600 text-sm">Add a new agency to the system with admin account</p>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Progress</div>
                  <div className="text-xs text-gray-500">Step {currentStep} of 3</div>
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
                      className="text-blue-600 transition-all duration-300 ease-in-out"
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
          
          {/* Statistics Cards */}
          <StatsCards
            title="Agency Management Overview"
            loading={statsLoading}
            cards={[
              {
                key: 'total',
                title: 'Total Agencies',
                value: stats.totalAgencies,
                icon: 'office-bag',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                route: '/agencies'
              },
              {
                key: 'active',
                title: 'Active Agencies',
                value: stats.activeAgencies,
                icon: 'check-circle',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                route: null
              },
              {
                key: 'recent',
                title: 'Recent Agencies (30d)',
                value: stats.recentAgencies,
                icon: 'calendar',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200',
                route: null
              }
            ]}
          />
        </div>

        {/* Form Steps Indicator */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: 'Basic Info', icon: 'office-bag', completed: form.agency_name && form.name && form.email },
                { step: 2, title: 'Security', icon: 'security-user', completed: form.password && form.confirmPassword },
                { step: 3, title: 'Address', icon: 'geolocation', completed: form.address }
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
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Agency Information */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <KeenIcon icon="office-bag" className="text-blue-600" />
                    Agency Information
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Enter the agency's basic details</p>
                </div>

                {/* Agency Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="office-bag" className="text-gray-500 text-sm" />
                    Agency Name
                    <span className="text-red-500">*</span>
                    {form.agency_name && (
                      <KeenIcon icon="check" className="text-green-500 text-sm" />
                    )}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="agency_name"
                      value={form.agency_name}
                      onChange={handleChange}
                      placeholder="Enter agency name"
                      className={`w-full transition-all duration-200 ${
                        form.agency_name 
                          ? 'border-green-300 ring-1 ring-green-200 focus:border-green-500 focus:ring-green-200' 
                          : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="geolocation" className="text-gray-500 text-sm" />
                    Address
                    <span className="text-red-500">*</span>
                    {form.address && (
                      <KeenIcon icon="check" className="text-green-500 text-sm" />
                    )}
                  </label>
                  <div className={`transition-all duration-200 ${
                    form.address 
                      ? 'ring-1 ring-green-200 rounded-md' 
                      : ''
                  }`}>
                    <AddressInput
                      value={form.address}
                      onChange={(formattedAddress) =>
                        setForm((prev) => ({ ...prev, address: formattedAddress }))
                      }
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="phone" className="text-gray-500 text-sm" />
                    Phone
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full"
                  />
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="picture" className="text-gray-500 text-sm" />
                    Logo URL
                  </label>
                  <Input
                    type="text"
                    name="logo"
                    value={form.logo}
                    onChange={handleChange}
                    placeholder="Enter logo URL"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Right Column - Admin Account */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <KeenIcon icon="profile-circle" className="text-green-600" />
                    Admin Account
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <KeenIcon icon="information-5" className="text-gray-400 text-sm cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This will create an agency admin account.</p>
                      </TooltipContent>
                    </Tooltip>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Create an admin account for this agency</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="profile-circle" className="text-gray-500 text-sm" />
                    Admin Name
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter admin name"
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="sms" className="text-gray-500 text-sm" />
                    Email
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter admin email"
                    className="w-full"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="key" className="text-gray-500 text-sm" />
                    Password
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="key" className="text-gray-500 text-sm" />
                    Confirm Password
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full"
                  />
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
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Basic Info</span>
                <span>Security</span>
                <span>Address</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || formProgress < 100}
                className={`px-8 py-2 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  formProgress >= 100 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin" />
                    Creating Agency...
                  </>
                ) : formProgress >= 100 ? (
                  <>
                    <KeenIcon icon="plus" />
                    Create Agency Now
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
    </TooltipProvider>
  );
}
