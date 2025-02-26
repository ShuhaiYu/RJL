// src/pages/CreatePropertyPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";

export default function CreatePropertyPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(""); // 存储选中的 user
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${baseApi}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 如果用户是 superuser/admin(RJL管理员)，后端返回所有用户，
      // 但你说"不能选没有agency的用户" => 前端可过滤掉 agency_id=null
      let fetchedUsers = response.data;

      // 假设你用 "is_rjl_admin" 或 "role === 'admin' || role==='superuser'" 来判断
      if (!currentUser.agency) {
        fetchedUsers = fetchedUsers.filter(u => u.agency_id);
      }

      setAllUsers(fetchedUsers);
    } catch (err) {
      console.error("fetchUsers error:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please fill in all fields.");
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
      // 跳转到新创建的房产详情页面（例如 /properties/123）

      navigate(`/property/${response.data.data.id}`);
    } catch (error) {
      console.error("Create property error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="card-header py-5">
        <h3 className="card-title text-xl font-bold">Create New Property</h3>
      </div>
      <div className="card-body p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Address</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter property address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Assign to User (Required)
            </label>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : (
              <select
                className="select select-bordered w-full"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Please choose a user --</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email} {/* 显示用户名或邮箱 */}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
