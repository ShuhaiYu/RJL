// src/pages/PropertyDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth';
import PropertyDetailModal from './blocks/PropertyDetailModal'; // 编辑弹窗组件

export default function PropertyDetailPage() {
  const { id: propertyId } = useParams();
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchPropertyDetail = async () => {
    if (!propertyId || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseApi}/properties/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperty(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load property details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetail();
  }, [propertyId, token]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        Loading property details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Error: {error}
      </div>
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
            {property.agency_name || 'N/A'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="btn btn-primary"
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </button>
        </div>
      </div>

      {/* 下方区域：Tasks DataTable */}
      <div className="card card-grid min-w-full">
        <div className="card-header py-5 flex items-center justify-between">
          <h3 className="card-title text-xl font-bold">Tasks</h3>
        </div>
        <div className="card-body">
          <div className="scrollable-x-auto">
            <table className="table table-auto table-border" data-datatable-table="true">
              <thead>
                <tr>
                  <th className="w-[100px] text-center">ID</th>
                  <th className="min-w-[185px]">Task Name</th>
                  <th className="w-[185px]">Status</th>
                  <th className="w-[150px]">Due Date</th>
                  <th className="w-[60px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {property.tasks && property.tasks.length > 0 ? (
                  property.tasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">{task.id}</td>
                      <td className="px-4 py-2">{task.task_name}</td>
                      <td className="px-4 py-2">{task.status}</td>
                      <td className="px-4 py-2">
                        {task.due_date ? new Date(task.due_date).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {/* 示例：编辑和删除按钮，可扩展功能 */}
                        <button className="btn btn-icon btn-light mr-2">
                          <i className="ki-outline ki-notepad-edit"></i>
                        </button>
                        <button className="btn btn-icon btn-light">
                          <i className="ki-outline ki-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer flex items-center justify-between text-gray-600 text-xs">
          <div className="flex items-center gap-2">
            Show
            <select className="select select-sm w-16">
              <option>5</option>
              <option>10</option>
              <option>20</option>
            </select>
            per page
          </div>
          <div className="pagination">
            {/* 分页控件 */}
          </div>
        </div>
      </div>

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
    </div>
  );
}
