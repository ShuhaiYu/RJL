// src/components/PropertyDetailModal.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import TaskDetailModal from "@/pages/property/tasks/blocks/TaskDetailModal";

export default function PropertyDetailModal({ propertyId, token, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [propertyDetail, setPropertyDetail] = useState(null);

  // 用于编辑
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [agencyId, setAgencyId] = useState("");

  // 控制二级弹窗Task
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // 控制“创建task”的简易弹窗
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  const fetchPropertyDetail = () => {
    if (!propertyId) return;
    setLoading(true);
    setError("");
    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL}/agency/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setPropertyDetail(res.data);
        // 初始化编辑状态
        setPropertyName(res.data.name || "");
        setPropertyAddress(res.data.address || "");
        setAgencyId(res.data.agency_id || "");
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

  const handleSave = () => {
    // 调用后端PUT接口更新property
    axios
      .put(
        `${import.meta.env.VITE_API_BASE_URL}/agency/properties/${propertyId}`,
        {
          name: propertyName,
          address: propertyAddress,
          agency_id: agencyId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        // 可在此处再刷新一下详情
        // 也可以直接更新 state
        if (propertyDetail) {
          setPropertyDetail({
            ...propertyDetail,
            name: propertyName,
            address: propertyAddress,
            agency_id: agencyId,
          });
        }
        toast("Property updated successfully!");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to update property");
      });
  };

  const handleCreateTask = () => {
    // POST /agency/tasks
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/agency/tasks/create`,
        {
          property_id: propertyId,
          task_name: newTaskName,
          task_description: newTaskDesc,
          due_date: newTaskDue ? new Date(newTaskDue).toISOString() : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        toast("Task created successfully!");
        setShowCreateTask(false);
        
        // 创建成功后刷新property详情
        fetchPropertyDetail();
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to create task");
      });
  };

  const handleDeleteProperty = () => {
    // DELETE /agency/properties/:id
    axios
      .delete(
        `${import.meta.env.VITE_API_BASE_URL}/agency/properties/${propertyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        toast("Property deleted successfully!");
        onClose(); // 关闭当前弹窗
        // 父页面最好再刷新 property 列表
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
    setSelectedTaskId(taskId);
  };

  const closeTaskModal = () => {
    setSelectedTaskId(null);
    // 可考虑重新加载propertyDetail来刷新task的最新数据
    // handleRefreshPropertyDetail();
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
              <label className="block mb-1 font-medium">Property Name</label>
              <input
                type="text"
                className="border w-full p-2 rounded"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            </div>
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
              <label className="block mb-1 font-medium">Agency ID</label>
              <input
                type="number"
                className="border w-full p-2 rounded"
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
              />
            </div>

            <div className="flex justify-end mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>

            {/* Tasks 列表 */}
            {propertyDetail.tasks && propertyDetail.tasks.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Tasks for this Property:</h4>
                <ul className="space-y-2">
                  {propertyDetail.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="p-3 border rounded hover:shadow cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <p className="font-medium">{task.task_name}</p>
                      {task.due_date && (
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.due_date).toLocaleString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No tasks found for this property.</p>
            )}
          </>
        ) : (
          <div>No data</div>
        )}

        {/* 二级弹窗: TaskDetailModal */}
        {selectedTaskId && (
          <TaskDetailModal
            taskId={selectedTaskId}
            token={token}
            onClose={closeTaskModal}
          />
        )}

        {/* Footer: Create Task & Delete Property */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Create Task
          </button>

          <button
            onClick={handleDeleteProperty}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete Property
          </button>
        </div>

        {/* 简易 Create Task mini-form (可用Modal或inline) */}
        {showCreateTask && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
            onClick={() => setShowCreateTask(false)}
          >
            <div
              className="bg-white p-4 rounded shadow"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">Create Task</h3>
              <input
                className="border p-2 w-full mb-2"
                placeholder="Task Name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
              <textarea
                className="border p-2 w-full mb-2"
                placeholder="Task Description"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
              />
              <label className="block mb-1">Due Date</label>
              <input
                type="datetime-local"
                className="border p-2 w-full mb-2"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded mr-2"
                  onClick={() => setShowCreateTask(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={handleCreateTask}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
