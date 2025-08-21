import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import AsyncAgencySelect from "../../components/custom/AsyncAgencySelect";
import { useNavigate } from "react-router-dom";
import { KeenIcon } from "@/components/keenicons";
import StatsCards from "@/components/common/StatsCards";

// Available permission scopes/values
const permissionOptions = {
  user: ["create", "read", "update", "delete"],
  agency: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  contact: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
};

// Default permission sets for each role we can create
// Adjust these defaults based on your actual needs
const defaultRolePermissions = {
  admin: {
    user: ["create", "read", "update", "delete"],
    agency: ["create", "read", "update", "delete"],
    property: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
    contact: ["create", "read", "update", "delete"],
    role: ["create", "read", "update", "delete"],
  },
  "agency-admin": {
    user: ["create", "read", "update"],
    agency: ["read", "update"],
    property: ["create", "read", "update"],
    task: ["create", "read", "update"],
    contact: ["create", "read", "update"],
    role: [], // agency-admin typically can't manage roles
  },
  "agency-user": {
    user: ["read"],
    agency: ["read"],
    property: ["read", "update"],
    task: ["create", "read", "update"],
    contact: ["create", "read", "update"],
    role: [], // no role management
  },
};

/**
 * Helper to clamp the assigned permissions to not exceed the current user's own
 * If the creator doesn't have a scope's permission, that permission is removed.
 */
function clampPermissionsToCurrentUser(creatorPermissions, newUserPermissions) {
  const clamped = {};
  for (const scope of Object.keys(newUserPermissions)) {
    const newPerms = newUserPermissions[scope] || [];
    const creatorPerms = creatorPermissions[scope] || [];
    // Keep only the ones the creator also has
    const filtered = newPerms.filter((p) => creatorPerms.includes(p));
    if (filtered.length > 0) {
      clamped[scope] = filtered;
    }
  }
  return clamped;
}

export default function CreateUserPage() {
  const { auth, currentUser, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const navigate = useNavigate();

  // Current user’s own permissions
  const currentUserPermissions = currentUser?.permissions || {};

  // Based on current user’s role, define which roles are creatable
  let creatableRoles = [];
  // For example:
  // superuser/admin => can create ["agency-admin","agency-user"]
  // agency-admin => can create ["agency-user"]
  // else => can create none
  if (currentUser?.role === "admin") {
    creatableRoles = ["agency-admin", "agency-user"];
  } else if (currentUser?.role === "superuser") {
    creatableRoles = ["admin", "agency-admin", "agency-user"];
  } else if (currentUser?.role === "agency-admin") {
    creatableRoles = ["agency-user"];
  }

  // Agency selection for superuser/admin
  const [selectedAgencyId, setSelectedAgencyId] = useState("");

  // Basic user info form
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "", // to be chosen from creatableRoles
  });
  const [permissions, setPermissions] = useState({}); // { scope: [perm,...], ... }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 统计数据状态
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    recentUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // 表单进度状态
  const [formProgress, setFormProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  
  // 表单验证状态
  const [validationErrors, setValidationErrors] = useState({});

  // If creatableRoles is empty => the user cannot create anything
  const canCreate = creatableRoles.length > 0;
  
  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        setStatsLoading(true);
        const response = await axios.get(`${baseApi}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const users = response.data || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentUsers = users.filter(user => {
          const createdAt = new Date(user.created_at);
          return createdAt >= thirtyDaysAgo;
        }).length;
        
        const uniqueRoles = [...new Set(users.map(user => user.role))].length;
        
        setStats({
          totalUsers: users.length,
          totalRoles: uniqueRoles,
          recentUsers: recentUsers
        });
      } catch (error) {
        console.error('Failed to fetch user statistics:', error);
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
      
      // 基本信息 (40%)
      if (form.email) progress += 15;
      if (form.name) progress += 10;
      if (form.password && form.confirmPassword) progress += 15;
      
      // 角色选择 (30%)
      if (form.role) {
        progress += 30;
        step = 2;
      }
      
      // 权限配置 (30%)
      const hasPermissions = Object.keys(permissions).some(scope => 
        permissions[scope] && permissions[scope].length > 0
      );
      if (hasPermissions) {
        progress += 30;
        step = 3;
      }
      
      setFormProgress(Math.min(progress, 100));
      setCurrentStep(step);
    };
    
    calculateProgress();
  }, [form, permissions]);

  // Whenever the user selects a role, apply default permissions for that role
  // and clamp them to the current user's own permission set
  const handleRoleChange = (newRole) => {
    setForm((prev) => ({ ...prev, role: newRole }));
    // If selecting "admin", clear selected agency and show a message
    if (newRole === "admin" && selectedAgencyId) {
      toast.warning(
        "Admin does not belong to any agency. Agency selection has been cleared."
      );
      setSelectedAgencyId(""); // Clear agency selection
    }

    if (defaultRolePermissions[newRole]) {
      // Make a copy of the default
      const rawDefaults = JSON.parse(
        JSON.stringify(defaultRolePermissions[newRole])
      );
      const clamped = clampPermissionsToCurrentUser(
        currentUserPermissions,
        rawDefaults
      );
      setPermissions(clamped);
    } else {
      setPermissions({});
    }
  };

  // Generic change handler for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Permission checkbox logic
  const handleCheckboxChange = (scope, permission, checked) => {
    setPermissions((prev) => {
      const currentScopePerms = prev[scope] || [];
      let updated;
      if (checked) {
        updated = [...currentScopePerms, permission];
      } else {
        updated = currentScopePerms.filter((p) => p !== permission);
      }
      // still clamp to currentUser's perms in case user tries to check something they don't have
      const creatorPerms = currentUserPermissions[scope] || [];
      updated = updated.filter((p) => creatorPerms.includes(p));

      return { ...prev, [scope]: updated };
    });
  };

  // If the creator doesn't have the scope/permission, disable
  const getCheckboxDisabled = (scope, permission) => {
    if (!canCreate) return true; // can't create at all
    const creatorPerms = currentUserPermissions[scope] || [];
    return !creatorPerms.includes(permission);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!canCreate) {
      setError("You do not have permission to create new users.");
      setLoading(false);
      return;
    }

    // Confirm password
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Must choose a role from the allowed list
    if (!creatableRoles.includes(form.role)) {
      setError("Invalid role selection.");
      setLoading(false);
      return;
    }

    // Prevent admin from having an agency
    if (form.role === "admin" && selectedAgencyId) {
      toast.warning(
        "Admin does not belong to any agency. Agency selection has been removed."
      );
      setSelectedAgencyId(""); // Auto-clear agency selection
    }

    // If superuser/admin => must choose an agency
    let finalAgencyId = null;
    if (form.role !== "admin") {
      // If superuser/admin => must choose an agency (except when creating admin)
      if (currentUser?.role === "superuser" || currentUser?.role === "admin") {
        if (!selectedAgencyId) {
          setError("Please select an agency.");
          setLoading(false);
          return;
        }
        finalAgencyId = selectedAgencyId;
      }
      // If agency-admin => use their own agency
      else if (currentUser?.role === "agency-admin") {
        finalAgencyId = currentUser?.agency_id || null;
      }
    }

    // Double-check final permission set
    // Because user might have changed some checkboxes
    // We clamp them again just in case
    const finalPermissions = clampPermissionsToCurrentUser(
      currentUserPermissions,
      permissions
    );

    // Construct payload for register
    const payload = {
      email: form.email,
      password: form.password,
      name: form.name,
      role: form.role,
      agency_id: finalAgencyId,
      permissions: finalPermissions, // We assume the backend can handle this
    };

    // Confirm
    const confirmed = window.confirm(
      `Create new user with role "${form.role}"?`
    );
    if (!confirmed) {
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${baseApi}/users`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User created successfully!");
      // Reset
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        role: "",
      });
      setPermissions({});
      setSelectedAgencyId("");
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err.response?.data?.message || "Failed to create user");
    }
    setLoading(false);
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
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <KeenIcon icon="user" className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
                <p className="text-gray-600 text-sm">Add a new user to the system with appropriate permissions</p>
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
          title="User Management Overview"
          loading={statsLoading}
          cards={[
            {
              key: 'total',
              title: 'Total Users',
              value: stats.totalUsers,
              icon: 'people',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
              borderColor: 'border-blue-200',
              route: '/users/all-users'
            },
            {
              key: 'roles',
              title: 'Available Roles',
              value: stats.totalRoles,
              icon: 'security-user',
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              borderColor: 'border-purple-200',
              route: null
            },
            {
              key: 'recent',
              title: 'Recent Users (30d)',
              value: stats.recentUsers,
              icon: 'calendar',
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              borderColor: 'border-green-200',
              route: null
            }
          ]}
        />
      </div>

      {!canCreate && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <KeenIcon icon="information-5" className="text-red-500 text-lg" />
            <p className="text-red-700 font-medium">
              You do not have permission to create new users.
            </p>
          </div>
        </div>
      )}

      {/* Form Steps Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Basic Info', icon: 'profile-circle', completed: form.email && form.password },
              { step: 2, title: 'Role Selection', icon: 'security-user', completed: form.role },
              { step: 3, title: 'Permissions', icon: 'setting-2', completed: Object.keys(permissions).length > 0 }
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
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <KeenIcon icon="profile-circle" className="text-sm" />
                  </div>
                  Basic Information
                  {form.email && form.password && (
                    <KeenIcon icon="check-circle" className="text-green-500 text-sm" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Enter the user's basic details</p>
              </div>

              {/* Agency Selection */}
              {(currentUser?.role === "superuser" || currentUser?.role === "admin") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeenIcon icon="office-bag" className="text-gray-500 text-sm" />
                    Agency
                  </label>
                  <div className="relative">
                    <AsyncAgencySelect
                      onChange={(option) => setSelectedAgencyId(option)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors group-focus-within:text-blue-600">
                  <KeenIcon icon="profile-circle" className="text-gray-500 text-sm transition-colors group-focus-within:text-blue-600" />
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter user's full name"
                    disabled={!canCreate}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  />
                  {form.name && (
                    <KeenIcon icon="check" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm animate-in fade-in duration-200" />
                  )}
                </div>
                <p className="text-xs text-gray-500">Optional field</p>
              </div>

              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors group-focus-within:text-blue-600">
                  <KeenIcon icon="sms" className="text-gray-500 text-sm transition-colors group-focus-within:text-blue-600" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    disabled={!canCreate}
                    required
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  />
                  {form.email && form.email.includes('@') && (
                    <KeenIcon icon="check" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm animate-in fade-in duration-200" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors group-focus-within:text-blue-600">
                    <KeenIcon icon="lock" className="text-gray-500 text-sm transition-colors group-focus-within:text-blue-600" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      disabled={!canCreate}
                      required
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                    />
                    {form.password && form.password.length >= 6 && (
                      <KeenIcon icon="check" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm animate-in fade-in duration-200" />
                    )}
                  </div>
                  {form.password && form.password.length < 6 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <KeenIcon icon="information" className="text-xs" />
                      Password should be at least 6 characters
                    </p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors group-focus-within:text-blue-600">
                    <KeenIcon icon="lock" className="text-gray-500 text-sm transition-colors group-focus-within:text-blue-600" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      disabled={!canCreate}
                      required
                      className={`h-11 transition-all duration-200 hover:border-gray-400 ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? 'focus:ring-2 focus:ring-red-500 focus:border-red-500 border-red-300'
                          : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <KeenIcon icon="check" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm animate-in fade-in duration-200" />
                    )}
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <KeenIcon icon="close" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-sm animate-in fade-in duration-200" />
                    )}
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <KeenIcon icon="information" className="text-xs" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Role & Permissions */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 2 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <KeenIcon icon="security-user" className="text-sm" />
                  </div>
                  Role & Permissions
                  {form.role && Object.keys(permissions).length > 0 && (
                    <KeenIcon icon="check-circle" className="text-green-500 text-sm" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Configure user role and access permissions</p>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="crown" className="text-gray-500 text-sm" />
                  User Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={!canCreate}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">-- Select a role --</option>
                  {creatableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
               <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                       Object.keys(permissions).some(scope => permissions[scope]?.length > 0) 
                         ? 'bg-green-100 text-green-600' 
                         : 'bg-blue-100 text-blue-600'
                     }`}>
                       <KeenIcon icon="setting-2" className="text-sm" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-gray-900">Custom Permissions</h4>
                       <p className="text-sm text-gray-600">Configure access levels for different modules</p>
                     </div>
                   </div>
                   {Object.keys(permissions).some(scope => permissions[scope]?.length > 0) && (
                     <div className="flex items-center gap-2">
                       <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                         {Object.keys(permissions).filter(scope => permissions[scope]?.length > 0).length} modules configured
                       </span>
                       <KeenIcon icon="check-circle" className="text-green-500" />
                     </div>
                   )}
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                   {Object.keys(permissionOptions).map((scope) => {
                     const scopePermissions = permissions[scope] || [];
                     const totalPermissions = permissionOptions[scope].length;
                     const hasPermissions = scopePermissions.length > 0;
                     
                     return (
                       <div key={scope} className={`bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
                         hasPermissions 
                           ? 'border-blue-200 shadow-sm' 
                           : 'border-gray-200 hover:border-gray-300'
                       }`}>
                         <div className={`px-4 py-3 border-b transition-all duration-300 ${
                           hasPermissions 
                             ? 'bg-blue-50 border-blue-200' 
                             : 'bg-gray-50 border-gray-200'
                         }`}>
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
                                 hasPermissions ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                               }`}>
                                 <KeenIcon 
                                   icon={
                                     scope === 'user' ? 'profile-circle' :
                                     scope === 'agency' ? 'office-bag' :
                                     scope === 'property' ? 'home-2' :
                                     scope === 'task' ? 'notepad-edit' :
                                     scope === 'contact' ? 'phone' :
                                     'security-user'
                                   } 
                                   className="text-xs" 
                                 />
                               </div>
                               <h5 className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                                 hasPermissions ? 'text-blue-900' : 'text-gray-700'
                               }`}>
                                 {scope}
                               </h5>
                             </div>
                             {hasPermissions && (
                               <div className="flex items-center gap-2">
                                 <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                   {scopePermissions.length}/{totalPermissions}
                                 </span>
                                 <KeenIcon icon="check" className="text-blue-600 text-xs" />
                               </div>
                             )}
                           </div>
                         </div>
                         <div className="p-4">
                           <div className="grid grid-cols-2 gap-2">
                             {permissionOptions[scope].map((perm) => {
                               const isChecked = permissions[scope]?.includes(perm) || false;
                               const disabled = getCheckboxDisabled(scope, perm);
                               const permissionIcon = {
                                 create: 'plus',
                                 read: 'eye',
                                 update: 'pencil',
                                 delete: 'trash'
                               }[perm] || 'setting-2';
                               
                               return (
                                 <label
                                   key={perm}
                                   className={`group flex items-center gap-2 p rounded-md cursor-pointer transition-all duration-200 ${
                                     disabled 
                                       ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60' 
                                       : isChecked
                                       ? 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                                       : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                   }`}
                                   title={disabled ? "You do not have permission to assign this" : `${perm.charAt(0).toUpperCase() + perm.slice(1)} access for ${scope}`}
                                 >
                                   <Checkbox
                                     checked={isChecked}
                                     disabled={disabled || !canCreate}
                                     onCheckedChange={(checked) =>
                                       handleCheckboxChange(scope, perm, checked)
                                     }
                                     className="w-4 h-4 transition-all duration-200"
                                   />
                                   <KeenIcon 
                                     icon={permissionIcon} 
                                     className={`text-xs transition-colors ${
                                       isChecked ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                                     }`} 
                                   />
                                   <span className={`text-xs font-medium capitalize transition-colors ${
                                     isChecked ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                                   }`}>
                                     {perm}
                                   </span>
                                 </label>
                               );
                             })}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
                 
                 {/* Permission Summary */}
                 {Object.keys(permissions).some(scope => permissions[scope]?.length > 0) && (
                   <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                     <div className="flex items-center gap-2 mb-3">
                       <KeenIcon icon="information-5" className="text-blue-600" />
                       <h6 className="font-medium text-blue-900">Permission Summary</h6>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {Object.keys(permissions).map(scope => {
                         const scopePerms = permissions[scope] || [];
                         if (scopePerms.length === 0) return null;
                         return (
                           <div key={scope} className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1">
                             <span className="text-xs font-medium text-blue-800 capitalize">
                               {scope}: {scopePerms.join(', ')}
                             </span>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <KeenIcon icon="information-5" className="text-red-600 text-sm" />
                </div>
                <div>
                  <p className="text-red-800 font-semibold">Creation Failed</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
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
              <span>Role Selection</span>
              <span>Permissions</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-6 py-2.5 transition-all duration-200 hover:shadow-md"
              >
                <KeenIcon icon="arrow-left" className="mr-2 text-sm" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !canCreate || formProgress < 100}
                className={`px-8 py-2.5 text-white flex items-center gap-2 transition-all duration-200 hover:shadow-md ${
                  formProgress === 100 && !loading 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin text-sm" />
                    Creating User...
                  </>
                ) : formProgress === 100 ? (
                  <>
                    <KeenIcon icon="check" className="text-sm" />
                    Create User
                  </>
                ) : (
                  <>
                    <KeenIcon icon="user-plus" className="text-sm" />
                    Complete Form ({Math.round(formProgress)}%)
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
