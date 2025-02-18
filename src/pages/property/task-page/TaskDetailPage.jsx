// src/pages/TaskDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import TaskDetailModal from "../tasks/blocks/TaskDetailModal";

export default function TaskDetailPage() {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [processingMarkAsDone, setProcessingMarkAsDone] = useState(false);

  // 获取任务详情（包括 contacts 和 emails）
  const fetchTaskDetail = async () => {
    if (!taskId || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleCopyTask = () => {
    navigate("/property/tasks/create", { state: { originalTask: task } });
  };

  // 点击按钮后将当前任务标记为 DONE，
  // 若任务 repeat_frequency 不为 "none"，则创建一个新的 undo 任务
  // 新任务名称格式为：repeat task {number} - old task name
  const handleMarkAsDone = async () => {
    if (!task) return;
    setProcessingMarkAsDone(true);
    try {
      // 1. 更新当前任务状态为 done
      await axios.put(
        `${baseApi}/tasks/${task.id}`,
        { status: "done" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 如果任务不设置重复（repeat_frequency === "none"），则只更新状态
      if (task.repeat_frequency === "none") {
        toast.success("Task marked as done!");
        fetchTaskDetail();
        return;
      }

      // 2. 根据重复频率计算新任务的到期日期
      let newDueDate = new Date();
      const repeat = task.repeat_frequency; // "monthly", "quarterly", "yearly"
      if (repeat === "monthly") {
        newDueDate.setMonth(newDueDate.getMonth() + 1);
      } else if (repeat === "quarterly") {
        newDueDate.setMonth(newDueDate.getMonth() + 3);
      } else if (repeat === "yearly") {
        newDueDate.setFullYear(newDueDate.getFullYear() + 1);
      }

      // 3. 根据旧任务名称确定重复次数，构造新任务名称
      // 如果旧任务名称已经包含 "repeat task {number} - ..."，则递增，否则设为 1
      let baseName = task.task_name;
      let repeatNumber = 1;
      const regex = /^repeat task (\d+)\s*-\s*(.*)$/i;
      const match = task.task_name.match(regex);
      if (match) {
        repeatNumber = Number(match[1]) + 1;
        baseName = match[2];
      }
      const newTaskName = `repeat task ${repeatNumber} - ${baseName}`;

      // 4. 创建新的任务，状态固定为 "undo"
      const newTaskPayload = {
        property_id: task.property_id,
        due_date: newDueDate.toISOString(),
        task_name: newTaskName,
        task_description: task.task_description,
        type: task.type,
        repeat_frequency: task.repeat_frequency,
        status: "undo",
      };

      await axios.post(`${baseApi}/tasks/create`, newTaskPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Task marked as done and next repeat task created!");
      fetchTaskDetail();
    } catch (error) {
      console.error("Error marking task as done:", error);
      toast.error("Failed to complete task");
    } finally {
      setProcessingMarkAsDone(false);
    }
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
      {/* Back Button */}
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate("/property/tasks")}
      >
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>

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
            {task.due_date
              ? new Date(task.due_date).toLocaleString()
              : "N/A"}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Status: </span>
            {task.status}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Type: </span>
            {task.type}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Repeat Frequency: </span>
            {task.repeat_frequency}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Description: </span>
            {task.task_description}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowEditModal(true)}
            disabled={task.status === "done"}
          >
            Edit
          </button>
          <button className="btn btn-secondary" onClick={handleCopyTask}>
            Copy Task
          </button>
          {/* 如果当前任务未完成，则显示“完成并创建下个任务”的按钮 */}
          {task.status !== "done" && (
            <button
              className="btn bg-emerald-50 text-emerald-700 border-emerald-200"
              onClick={handleMarkAsDone}
              disabled={processingMarkAsDone}
            >
              {processingMarkAsDone
                ? "Processing..."
                : "Mark as Done & Create Next Task"}
            </button>
          )}
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
                          <i className="ki-outline ki-exit-right-corner"></i>
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
