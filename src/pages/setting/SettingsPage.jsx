import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";

export default function SettingsPage() {
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");

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
      const res = await axios.put(`${baseApi}/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Settings updated successfully");
      setSettings(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    }
    setLoading(false);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setImportError("");

    if (!selectedFile) {
      setImportError("Please select a file to upload");
      return;
    }

    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setImportError("Only CSV files are allowed");
      return;
    }

    setImportLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${baseApi}/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Data imported successfully");
        setSelectedFile(null);
      } else {
        setImportError(res.data.error || "Import failed");
      }
    } catch (error) {
      let errorMessage = "Import failed";

      // 根据假设的API响应结构处理错误
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Invalid file format";
        } else if (error.response.status === 413) {
          errorMessage = "File size too large";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }

      setImportError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div>
      <section>
        <div className="container mx-auto p-4 max-w-xl">
          <h1 className="text-2xl font-bold mb-6">System Settings</h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white p-5 rounded shadow"
          >
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
      </section>

      {/* Data Import */}
      <section className="container mx-auto p-4 max-w-xl">
        <div className="space-y-5 bg-white p-5 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Data Import</h2>

          <form onSubmit={handleFileSubmit} className="space-y-4">
            {importError && (
              <div className="text-red-500 text-sm mb-2">{importError}</div>
            )}

            <div>
              <label className="block mb-2 font-medium">CSV File</label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                disabled={importLoading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Only CSV files are accepted
              </p>
            </div>

            <Button type="submit" disabled={importLoading || !selectedFile}>
              {importLoading ? (
                <Box className="flex justify-center items-center h-40">
                  <CircularProgress />
                </Box>
              ) : (
                "Import Data"
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
