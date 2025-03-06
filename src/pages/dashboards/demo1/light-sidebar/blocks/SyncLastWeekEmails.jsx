import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";

export default function SyncLastWeekEmails() {
  const { baseApi } = useAuthContext();

  // Loading 状态
  const [loading, setLoading] = useState(false);

  // 同步结果信息（后端返回的 JSON）
  const [syncResult, setSyncResult] = useState(null);

  // 如果出错，可以放一个状态存储错误消息
  const [error, setError] = useState("");

  const fetchEmail = async () => {
    setLoading(true);
    setSyncResult(null);
    setError("");
    try {
      const res = await axios.post(`${baseApi}/emails/sync?days=7`);
      // 后端返回形如:
      // {
      //   "message": "Done. Processed=36, newCreated=0, skipped=36",
      //   "sinceDate": "Feb 27, 2025"
      // }
      setSyncResult(res.data);
    } catch (err) {
      console.error("sync error:", err);
      setError(err.response?.data?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Sync Last Week Emails
        </h2>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        This button simulates syncing emails from last week.
      </p>

      <button
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
        onClick={fetchEmail}
        disabled={loading}
      >
        {loading ? "Syncing..." : "Sync Last Week Emails"}
      </button>

      {/* 如果出错了 */}
      {error && (
        <div className="mt-2 text-red-600">
          Error: {error}
        </div>
      )}

      {/* 如果有结果 */}
      {syncResult && (
        <div className="mt-4 p-2 border border-gray-300 rounded">
          <p className="text-sm font-medium text-gray-700">Sync Result:</p>
          <p className="text-sm text-gray-600 mt-1">
            {syncResult.message}
          </p>
          {syncResult.sinceDate && (
            <p className="text-sm text-gray-500">
              Since Date: {syncResult.sinceDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
