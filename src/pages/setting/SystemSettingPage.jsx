import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded shadow">
        <div>
          <label className="block mb-2 font-medium">IMAP Host</label>
          <Input
            type="text"
            name="imap_host"
            value={settings.imap_host}
            onChange={handleChange}
            placeholder="imap.gmail.com"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">IMAP Port</label>
          <Input
            type="text"
            name="imap_port"
            value={settings.imap_port}
            onChange={handleChange}
            placeholder="993"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">IMAP User</label>
          <Input
            type="text"
            name="imap_user"
            value={settings.imap_user}
            onChange={handleChange}
            placeholder="your@gmail.com"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">IMAP Password</label>
          <Input
            type="password"
            name="imap_password"
            value={settings.imap_password}
            onChange={handleChange}
            placeholder="application-specific password"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Email User</label>
          <Input
            type="text"
            name="email_user"
            value={settings.email_user}
            onChange={handleChange}
            placeholder="your@gmail.com"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Email Password</label>
          <Input
            type="password"
            name="email_password"
            value={settings.email_password}
            onChange={handleChange}
            placeholder="application-specific password"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Email Host</label>
          <Input
            type="text"
            name="email_host"
            value={settings.email_host}
            onChange={handleChange}
            placeholder="Enter email host"
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
