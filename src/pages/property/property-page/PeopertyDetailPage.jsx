// src/pages/PropertyDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";
import PropertyDetailModal from "./blocks/PropertyDetailModal";
import CreateTaskModal from "./blocks/CreateTaskModal";
import TasksDataTable from "../tasks/blocks/TasksDataTable";
import { useNavigate } from "react-router-dom";

export default function PropertyDetailPage() {
  const { id: propertyId } = useParams();
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const navigate = useNavigate();

  const fetchPropertyDetail = async () => {
    if (!propertyId || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperty(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load property details"
      );
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };
  useEffect(() => {
    fetchPropertyDetail();
  }, [propertyId, token]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading property details...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Property not found.
      </div>
    );
  }

  // 只读展示房产详情（顶部区域）及任务列表（下方区域）
  return (
    <div className="container mx-auto p-4">
      {/* 顶部区域 */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 shadow rounded mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Detail</h1>
          <p className="mt-2 text-gray-600">
            <span className="font-medium">Address: </span>
            {property.address}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Agency: </span>
            {property.agency_name || "N/A"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="btn btn-primary"
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreateTaskModal(true)}
          >
            Create Task
          </button>
        </div>
      </div>

      {/* 下方区域：任务列表 */}
      <TasksDataTable tasks={property.tasks} onTaskClick={handleTaskClick} />

      {/* 编辑弹窗：点击 Edit 按钮后打开 */}
      {showEditModal && (
        <PropertyDetailModal
          propertyId={propertyId}
          token={token}
          onClose={() => {
            setShowEditModal(false);
            fetchPropertyDetail(); // 刷新详情以显示更新后的数据
          }}
        />
      )}

      {/* 创建 Task 弹窗 */}
      {showCreateTaskModal && (
        <CreateTaskModal
          propertyId={propertyId}
          token={token}
          baseApi={baseApi}
          onClose={() => setShowCreateTaskModal(false)}
          onCreated={() => {
            // 回调: 关闭弹窗后刷新 property 详情, 以便看到新任务
            setShowCreateTaskModal(false);
            fetchPropertyDetail();
          }}
        />
      )}
    </div>
  );
}
