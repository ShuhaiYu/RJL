// ChangePasswordModal.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner"; // 或任意通知库
import clsx from "clsx";
import { useAuthContext } from "@/auth";

// 注意：这里假设你项目中有 tailwindcss classes如 .btn .input 等，
// 如果是MUI或其他UI库，需要自己改写相应样式

export function ChangePasswordModal({ open, onClose }) {
  const { auth } = useAuthContext();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL + "/auth";


  // 不显示时直接返回 null
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/change-password`,
        { oldPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );

      toast.success("Password changed successfully!");
      onClose(); // 关闭弹窗
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Failed to change password. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 半透明背景 + 居中的白色弹窗容器
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Old Password</label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx("btn btn-primary", { "opacity-50": loading })}
              disabled={loading}
            >
              {loading ? "Updating..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
