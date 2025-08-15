import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KeenIcon } from "@/components";

export default function SystemSettingPage() {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [settings, setSettings] = useState({
    imap_host: "",
    imap_port: "",
    imap_user: "",
    imap_password: "",
    email_user: "",
    email_password: "",
    email_host: "",
    google_map_key: "",
  });
  const [loading, setLoading] = useState(false);

  // 获取当前系统设置
  useEffect(() => {
    axios
      .get(`${baseApi}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) {
          setSettings((prev) => ({
            ...prev,
            imap_host: res.data.imap_host || "",
            imap_port: res.data.imap_port || "",
            imap_user: res.data.imap_user || "",
            imap_password: res.data.imap_password || "",
            email_user: res.data.email_user || "",
            email_password: res.data.email_password || "",
            email_host: res.data.email_host || "",
            google_map_key: res.data.google_map_key || "",
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
      });
  }, [baseApi, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `${baseApi}/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Settings updated successfully");
      setSettings(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="setting-2" className="text-xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Configure system-wide settings and integrations</p>
            </div>
          </div>
        </div>

        {/* 设置表单 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <KeenIcon icon="gear" className="text-lg text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Configuration Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Update your system configuration parameters</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IMAP Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <KeenIcon icon="message" className="text-lg text-blue-600" />
                  <h3 className="font-semibold text-gray-900">IMAP Configuration</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="cloud" className="inline mr-1" />
                      IMAP Host
                    </label>
                    <Input
                      type="text"
                      name="imap_host"
                      value={settings.imap_host}
                      onChange={handleChange}
                      placeholder="imap.gmail.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="router" className="inline mr-1" />
                      IMAP Port
                    </label>
                    <Input
                      type="text"
                      name="imap_port"
                      value={settings.imap_port}
                      onChange={handleChange}
                      placeholder="993"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="profile-user" className="inline mr-1" />
                      IMAP User
                    </label>
                    <Input
                      type="text"
                      name="imap_user"
                      value={settings.imap_user}
                      onChange={handleChange}
                      placeholder="your@gmail.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="key" className="inline mr-1" />
                      IMAP Password
                    </label>
                    <Input
                      type="password"
                      name="imap_password"
                      value={settings.imap_password}
                      onChange={handleChange}
                      placeholder="application-specific password"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Email Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <KeenIcon icon="sms" className="text-lg text-green-600" />
                  <h3 className="font-semibold text-gray-900">Email Configuration</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="profile-user" className="inline mr-1" />
                      Email User
                    </label>
                    <Input
                      type="text"
                      name="email_user"
                      value={settings.email_user}
                      onChange={handleChange}
                      placeholder="your@gmail.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="key" className="inline mr-1" />
                      Email Password
                    </label>
                    <Input
                      type="password"
                      name="email_password"
                      value={settings.email_password}
                      onChange={handleChange}
                      placeholder="application-specific password"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="cloud" className="inline mr-1" />
                      Email Host
                    </label>
                    <Input
                      type="text"
                      name="email_host"
                      value={settings.email_host}
                      onChange={handleChange}
                      placeholder="Enter email host"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <KeenIcon icon="geolocation" className="inline mr-1" />
                      Google Map Key
                    </label>
                    <Input
                      type="text"
                      name="google_map_key"
                      value={settings.google_map_key}
                      onChange={handleChange}
                      placeholder="Enter Google Map key"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="text-sm" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
