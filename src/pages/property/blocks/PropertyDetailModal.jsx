// src/components/PropertyDetailModal.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import TasksDataTable from "../../task/blocks/TasksDataTable";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export default function PropertyDetailModal({ propertyId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [propertyDetail, setPropertyDetail] = useState(null);

  // 编辑属性状态
  const [propertyAddress, setPropertyAddress] = useState("");

  const { baseApi, auth, currentUser } = useAuthContext();
  const isDisableAssignUser = currentUser?.agency_id ? true : false;
  const token = auth?.accessToken;

  const navigate = useNavigate();

  // 新增状态
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  // 新增 useEffect 获取用户列表
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${baseApi}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserList(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, [token]);

  // 获取属性详情：使用 Agency Admin 路径
  const fetchPropertyDetail = () => {
    if (!propertyId) return;
    setLoading(true);
    setError("");
    axios
      .get(`${baseApi}/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPropertyDetail(res.data);

        setPropertyAddress(res.data.address || "");
        setSelectedUserId(res.data.user_id || "");

        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load property detail"
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPropertyDetail();
  }, [propertyId, token]);

  if (!propertyId) return null;

  // 更新属性信息
  const handleSave = () => {
    axios
      .put(
        `${baseApi}/properties/${propertyId}`,
        {
          address: propertyAddress,
          user_id: selectedUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setPropertyDetail({
          ...propertyDetail,
          address: propertyAddress,
          user_id: selectedUserId,
        });
        toast("Property updated successfully!");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to update property");
      });
  };

  const handleCreateTask = () => {
    navigate(`/property/tasks/create`, {
      state: {
        originalTask: {
          property_id: propertyId,
        },
      },
    });
  };

  // 删除属性：使用 Agency Admin 路径
  const handleDeleteProperty = () => {
    axios
      .delete(`${baseApi}/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast("Property deleted successfully!");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to delete property");
      });
  };

  const closeThisModal = () => {
    onClose();
  };

  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={closeThisModal}
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 & 关闭按钮 */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">Property Detail</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={closeThisModal}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div>Loading property detail...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : propertyDetail ? (
          <>
            {/* 编辑表单 */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Address</label>
              <input
                type="text"
                className="border w-full p-2 rounded"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Assigned User</label>
              <select
                className="select select-bordered w-full"
                value={selectedUserId}
                disabled={isDisableAssignUser}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Select User --</option>
                {userList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email} 
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end mb-6">
              <Button variant="edit" onClick={handleSave}>
                Save
              </Button>
            </div>

            {/* 显示任务列表 */}
            {propertyDetail.tasks && propertyDetail.tasks.length > 0 ? (
              <TasksDataTable
                tasks={propertyDetail.tasks}
                onTaskClick={handleTaskClick}
              />
            ) : (
              <p>No tasks found for this property.</p>
            )}
          </>
        ) : (
          <div>No data</div>
        )}

        {/* Footer: Create Task & Delete Property */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Button onClick={handleCreateTask} variant="create">
            Create Job Order
          </Button>
          <Button onClick={handleDeleteProperty} variant="delete">
            Delete Property
          </Button>
        </div>
      </div>
    </div>
  );
}
