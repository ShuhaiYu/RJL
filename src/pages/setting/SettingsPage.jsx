import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [settings, setSettings] = useState({
    email_api_key: "",
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
          setSettings({
            email_api_key: res.data.email_api_key || "",
            google_map_key: res.data.google_map_key || "",
          });
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
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded shadow">
        <div>
          <label className="block mb-2 font-medium">Email API Key</label>
          <Input
            type="text"
            name="email_api_key"
            value={settings.email_api_key}
            onChange={handleChange}
            placeholder="Enter email API key"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Google Map Key</label>
          <Input
            type="text"
            name="google_map_key"
            value={settings.google_map_key}
            onChange={handleChange}
            placeholder="Enter Google Map key"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
