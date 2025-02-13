// src/pages/TaskDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";
import TaskDetailModal from "../tasks/blocks/TaskDetailModal";

export default function TaskDetailPage() {
  const { id: taskId } = useParams();
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // 获取任务详情（包括 contacts 和 emails）
  const fetchTaskDetail = async () => {
    if (!taskId || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseApi}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load task details");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId, token]);

  // 在新窗口打开邮件的 HTML 内容
  const handleOpenEmail = (emailHtml) => {
    const newWindow = window.open("", "_blank");
    newWindow.document.write(emailHtml);
    newWindow.document.close();
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading task details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-4 text-red-500">Task not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 顶部区域 */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 shadow rounded mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Detail</h1>
          <p className="mt-2 text-gray-600">
            <span className="font-medium">Task Name: </span>
            {task.task_name}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Due Date: </span>
            {task.due_date ? new Date(task.due_date).toLocaleString() : "N/A"}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Status: </span>
            {task.status}
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

      {/* 下方区域：Contacts DataTable */}
      <div className="card card-grid min-w-full mb-6">
        <div className="card-header py-5 flex items-center justify-between">
          <h3 className="card-title text-xl font-bold">Contacts</h3>
        </div>
        <div className="card-body">
          <div className="scrollable-x-auto">
            <table className="table table-auto table-border">
              <thead>
                <tr>
                  <th className="w-[50px] text-center">ID</th>
                  <th className="min-w-[150px]">Name</th>
                  <th className="min-w-[150px]">Phone</th>
                  <th className="min-w-[150px]">Email</th>
                </tr>
              </thead>
              <tbody>
                {task.contacts && task.contacts.length > 0 ? (
                  task.contacts.map((contact) => (
                    <tr key={contact.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">{contact.id}</td>
                      <td className="px-4 py-2">{contact.name}</td>
                      <td className="px-4 py-2">{contact.phone}</td>
                      <td className="px-4 py-2">{contact.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      No contacts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 下方区域： Emails DataTable */}
      <div className="card card-grid min-w-full mb-6">
        <div className="card-header py-5 flex items-center justify-between">
          <h3 className="card-title text-xl font-bold">Emails</h3>
        </div>
        <div className="card-body">
          <div className="scrollable-x-auto">
            <table className="table table-auto table-border">
              <thead>
                <tr>
                  <th className="w-[50px] text-center">ID</th>
                  <th className="min-w-[200px]">Subject</th>
                  <th className="min-w-[150px]">Sender</th>
                  <th className="w-[100px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {task.emails && task.emails.length > 0 ? (
                  task.emails.map((email) => (
                    <tr key={email.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">{email.id}</td>
                      <td className="px-4 py-2">{email.subject}</td>
                      <td className="px-4 py-2">{email.sender}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          className="btn btn-sm btn-icon btn-clear btn-light"
                          onClick={() => handleOpenEmail(email.html)}
                        >
                          <i className="ki-outline ki-envelope"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      No emails found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 编辑弹窗：点击 Edit 按钮后打开 TaskDetailModal */}
      {showEditModal && (
        <TaskDetailModal
          task={task} // 直接传入 task 对象，而非 taskId
          token={token}
          onClose={() => {
            setShowEditModal(false);
            fetchTaskDetail(); // 如需要刷新详情
          }}
        />
      )}
    </div>
  );
}
