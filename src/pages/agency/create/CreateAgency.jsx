import { useState } from "react";
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

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 简单校验
    const {
      agency_name,
      name,
      email,
      password,
      confirmPassword,
    } = form;
    if (
      !agency_name.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() 

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
      {/* TooltipProvider 包住整个表单或者根元素 */}
      <div className="container mx-auto p-4 max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Create Agency</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agency Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="agency_name"
              value={form.agency_name}
              onChange={handleChange}
              placeholder="Enter agency name"
            />
          </div>

          {/* Name */}
          <div>
            <Tooltip>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-help">
                  Name <span className="text-red-500">*</span>
                </label>
                <TooltipTrigger asChild>
                  {/* info icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="12"
                    height="12"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z"></path>
                  </svg>
                </TooltipTrigger>
              </div>

              <TooltipContent>
                <p>This will create an agency admin account.</p>
              </TooltipContent>
            </Tooltip>
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>

          {/* Email + Tooltip */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>

            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address 
            </label>
            <Input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone 
            </label>
            <Input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          {/* Logo (可选) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <Input
              type="text"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              placeholder="Enter logo URL"
            />
          </div>

          {/* 错误提示 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* 提交按钮 */}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Agency"}
          </Button>
        </form>
      </div>
    </TooltipProvider>
  );
}
