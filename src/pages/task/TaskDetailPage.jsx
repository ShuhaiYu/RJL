// src/pages/task/TaskDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { Button } from "../../components/ui/button";
import ContactDataTable from "../contact/blocks/ContactDataTable";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalContent,
} from "@/components/modal";
import { EditContactForm } from "../contact/blocks/EditContactForm";
import { Box, CircularProgress } from "@mui/material";
import TaskDetailModal from "./blocks/TaskDetailModal";

export default function TaskDetailPage() {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // 新增状态：控制状态更新弹窗以及输入内容
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalInput, setStatusModalInput] = useState("");
  const [archiveConflicts, setArchiveConflicts] = useState(true);

  // ========== 联系人相关状态 ==========
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // ========== 文件相关状态 ==========
  const [taskFiles, setTaskFiles] = useState([]); // 文件列表
  const [selectedFile, setSelectedFile] = useState(null); // 当前选择的文件
  const [fileDesc, setFileDesc] = useState(""); // 文件描述
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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

  /**
   * 获取当前任务的所有文件
   */
  const fetchTaskFiles = async () => {
    if (!taskId || !token) return;
    try {
      const res = await axios.get(`${baseApi}/tasks/${taskId}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch task files", err);
      toast.error("Failed to load files");
    }
  };

  useEffect(() => {
    fetchTaskDetail();
    fetchTaskFiles();
  }, [taskId, token]);

  /**
   * 根据当前任务状态确定下一步状态和需要输入的字段
   * UNKNOWN -> INCOMPLETE，需要选择 type
   * INCOMPLETE -> PROCESSING，需要输入 inspection date
   * PROCESSING -> COMPLETED，需要输入 due date（此时默认值根据 repeat_frequency 计算）
   * COMPLETED -> HISTORY，无需输入，直接归档
   */
  const getNextStatusAndField = (currentStatus) => {
    switch (currentStatus) {
      case "UNKNOWN":
        return {
          nextStatus: "INCOMPLETE",
          fieldLabel: "Select Type",
          fieldKey: "type",
          inputType: "select",
        };
      case "INCOMPLETE":
        return {
          nextStatus: "PROCESSING",
          fieldLabel: "Enter Inspection Date",
          fieldKey: "inspection_date",
          inputType: "date",
        };
      case "PROCESSING":
        return {
          nextStatus: "COMPLETED",
          fieldLabel: "Enter Due Date",
          fieldKey: "due_date",
          inputType: "date",
        };
      case "COMPLETED":
      case "DUE SOON":
      case "EXPIRED":
        return {
          nextStatus: "HISTORY",
          fieldLabel: "",
          fieldKey: "",
          inputType: "hidden",
        };
      default:
        return {
          nextStatus: "",
          fieldLabel: "",
          fieldKey: "",
          inputType: "text",
        };
    }
  };

  // 计算默认 Due Date，根据当前任务的 repeat_frequency 设置（格式：YYYY-MM-DD）
  const computeDefaultDueDate = () => {
    if (task && task.repeat_frequency && task.repeat_frequency !== "none") {
      const defaultDueDate = new Date();
      switch (task.repeat_frequency) {
        case "1 month":
          defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);
          break;
        case "3 months":
          defaultDueDate.setMonth(defaultDueDate.getMonth() + 3);
          break;
        case "6 months":
          defaultDueDate.setMonth(defaultDueDate.getMonth() + 6);
          break;
        case "1 year":
          defaultDueDate.setFullYear(defaultDueDate.getFullYear() + 1);
          break;
        case "2 years":
          defaultDueDate.setFullYear(defaultDueDate.getFullYear() + 2);
          break;
        case "3 years":
          defaultDueDate.setFullYear(defaultDueDate.getFullYear() + 3);
          break;
        default:
          break;
      }
      // 返回格式化后的字符串 YYYY-MM-DD
      return defaultDueDate.toISOString().split("T")[0];
    }
    return "";
  };

  // 打开状态更新弹窗
  const handleOpenStatusModal = () => {
    // 如果状态是 PROCESSING，则预计算默认 due date
    if (task.status === "PROCESSING") {
      const defaultDate = computeDefaultDueDate();
      setStatusModalInput(defaultDate);
    } else {
      setStatusModalInput("");
    }
    setShowStatusModal(true);
  };

  // 提交弹窗表单，更新任务状态
  // 在 handleStatusModalSubmit 中增加必填校验
  const handleStatusModalSubmit = async (e) => {
    e.preventDefault();
    const { nextStatus, fieldKey, inputType, fieldLabel } =
      getNextStatusAndField(task.status);

    // 对于需要用户输入的情况，必填校验
    if (fieldLabel && !statusModalInput) {
      toast.error(`Please enter/select ${fieldLabel}`);
      return;
    }

    const payload = { status: nextStatus };
    if (fieldKey && statusModalInput) {
      payload[fieldKey] =
        inputType === "date"
          ? new Date(statusModalInput).toISOString()
          : statusModalInput;
    }
    // 如果是 UNKNOWN -> INCOMPLETE，并且用户勾选了“Archive conflicting job orders”
    if (
      task.status === "UNKNOWN" &&
      nextStatus === "INCOMPLETE" &&
      archiveConflicts
    ) {
      payload.archive_conflicts = true;
    }

    try {
      await axios.put(`${baseApi}/tasks/${task.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task status updated successfully");
      fetchTaskDetail();
      setShowStatusModal(false);
      setStatusModalInput("");
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  /**
   * 文件选择
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  /**
   * 上传文件
   */
  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("desc", fileDesc);

      await axios.post(`${baseApi}/tasks/${taskId}/files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("File uploaded successfully!");
      setSelectedFile(null);
      setFileDesc("");
      // 切换 key，迫使 input 重新渲染
      setFileInputKey(Date.now());
      fetchTaskFiles();
    } catch (err) {
      toast.error("File upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  /**
   * 删除文件
   */
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure to delete this file?")) return;
    try {
      await axios.delete(`${baseApi}/tasks/${taskId}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("File deleted successfully");
      fetchTaskFiles();
    } catch (err) {
      toast.error("File deletion failed");
      console.error(err);
    }
  };

  // 删除函数 handleDeleteTask
  async function handleDeleteTask() {
    if (!window.confirm("Are you sure you want to delete this job order?")) {
      return;
    }
    try {
      await axios.delete(`${baseApi}/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Job Order deleted successfully");
      navigate("/property/tasks");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete Job Order");
    }
  }

  /**
   * 打开文件（通过后端获取预签名URL）
   */
  const handleOpenFile = async (fileId) => {
    try {
      const response = await axios.get(
        `${baseApi}/tasks/${taskId}/files/${fileId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const signedUrl = response.data.url;
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("Failed to get pre-signed URL:", error);
      toast.error("Unable to open file");
    }
  };

  // 辅助函数：根据状态返回对应的颜色类
  const getStatusColorClass = (status) => {
    switch (status) {
      case "UNKNOWN":
        return "text-red-500";
      case "INCOMPLETE":
        return "text-yellow-500";
      case "PROCESSING":
        return "text-blue-500";
      case "COMPLETED":
        return "text-green-500";
      case "DUE SOON":
        return "text-orange-500";
      case "EXPIRED":
        return "text-red-600";
      case "HISTORY":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  // 定义状态按钮文本，根据当前任务状态返回不同的文字
  const getStatusButtonLabel = () => {
    switch (task.status) {
      case "UNKNOWN":
        return "Check";
      case "INCOMPLETE":
        return "Process";
      case "PROCESSING":
        return "Complete";
      case "COMPLETED":
      case "DUE SOON":
      case "EXPIRED":
        return "Archive Task";
      default:
        return "Update Status";
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Job OrderOrder not found.
      </div>
    );
  }

  const userPermissions = currentUser?.permissions || {};
  const hasDeletePermission = userPermissions.task?.includes("delete");

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
          <h1 className="text-2xl font-bold text-gray-800">Job Order Detail</h1>
          <p className="mt-2 text-gray-600">
            <span className="font-medium">Task Name: </span>
            {task.task_name}
          </p>
          {/* 动态日期显示 */}
          {(() => {
            if (task.status === "PROCESSING") {
              // 显示 Inspection Date
              return (
                <p className="mt-1 text-gray-600">
                  <span className="font-medium">Inspection Date: </span>
                  {task.inspection_date
                    ? new Date(task.inspection_date).toLocaleString()
                    : "N/A"}
                </p>
              );
            } else if (
              ["COMPLETED", "DUE SOON", "EXPIRED", "HISTORY"].includes(
                task.status
              )
            ) {
              // 显示 Due Date
              return (
                <p className="mt-1 text-gray-600">
                  <span className="font-medium">Due Date: </span>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleString()
                    : "N/A"}
                </p>
              );
            }
            // 如果是 UNKNOWN 或 INCOMPLETE，则不显示任何日期
            return null;
          })()}
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Status: </span>
            <span className={getStatusColorClass(task.status)}>
              {task.status}
            </span>
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
            <span className="font-medium">Agency: </span>
            {task.agency_name || "N/A"}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Address: </span>
            {task.property_address || "N/A"}
          </p>
          <p className="mt-1 text-gray-600">
            <span className="font-medium">Description: </span>
            <span
              dangerouslySetInnerHTML={{
                __html: task.task_description?.replace(/\n/g, "<br />") || "",
              }}
            />
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col gap-2">
          <Button
            variant="edit"
            onClick={() => setShowEditModal(true)}
            disabled={task.status === "COMPLETED" || task.status === "HISTORY"}
          >
            Edit
          </Button>
          {/*<Button variant="delete" onClick={handleDeleteTask}>*/}
          {/*  Delete*/}
          {/*</Button>*/}
          {task.status !== "HISTORY" && (
            <Button onClick={handleOpenStatusModal}>
              {getStatusButtonLabel()}
            </Button>
          )}
          {
            // 如果用户有权限，则显示 Delete 按钮

            hasDeletePermission && (
              <Button variant="delete" onClick={handleDeleteTask}>
                Delete
              </Button>
            )
          }
        </div>
      </div>

      {/* 文件列表及上传区域 */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h2 className="text-xl font-bold mb-4">Task Files</h2>

        {/* 上传区域 */}
        <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
          <input
            key={fileInputKey}
            className="file-input file-input-bordered file-input-primary"
            type="file"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <input
            type="text"
            placeholder="File Description (Optional)"
            className="input input-bordered w-full max-w-xs"
            value={fileDesc}
            onChange={(e) => setFileDesc(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleUploadFile}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* 文件列表 */}
        {taskFiles.length === 0 ? (
          <p className="text-gray-500">No Related Files</p>
        ) : (
          <ul className="divide-y">
            {taskFiles.map((f) => (
              <li key={f.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{f.file_name}</p>
                  {f.file_desc && (
                    <p className="text-sm text-gray-600">{f.file_desc}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => handleOpenFile(f.id)}
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteFile(f.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contacts DataTable */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4">Contacts</h2>
          <Button
            variant="create"
            className="mb-4"
            onClick={() =>
              navigate("/contacts/create", {
                state: {
                  propertyId: task.property_id,
                  propertyAddress: task.property_address,
                },
              })
            }
          >
            Add Contact
          </Button>
        </div>
        <ContactDataTable
          contacts={task.contacts}
          onEdit={(id) => {
            setSelectedContactId(id);
            setEditModalOpen(true);
          }}
          onDelete={(id) => {
            if (!window.confirm("Are you sure to delete this contact?")) return;
            axios
              .delete(`${baseApi}/contacts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(() => {
                toast.success("Contact deleted successfully");
                fetchTaskDetail();
              })
              .catch((err) => {
                console.error("Failed to delete contact", err);
                toast.error("Failed to delete contact");
              });
          }}
        />
      </div>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Contact</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {selectedContactId && (
              <EditContactForm
                contactId={selectedContactId}
                onSuccess={() => {
                  setEditModalOpen(false);
                  fetchTaskDetail();
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Email Information */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h2 className="text-xl font-bold mb-4">Email Information</h2>
        {!task.emails || task.emails.length === 0 ? (
          <p className="text-gray-500">No Email Info</p>
        ) : (
          task.emails.map((email) => (
            <div key={email.id} className="mb-4">
              <p className="font-medium">Subject: {email.subject}</p>
              <p className="text-gray-600">Sender: {email.sender}</p>
              <div className="mt-2 whitespace-pre-wrap">{email.email_body}</div>
            </div>
          ))
        )}
      </div>

      {/* TaskDetailModal（编辑任务弹窗） */}
      {showEditModal && (
        <TaskDetailModal
          task={task}
          token={token}
          onClose={() => {
            setShowEditModal(false);
            fetchTaskDetail();
          }}
        />
      )}

      {/* 新增状态更新弹窗，根据任务当前状态决定下一步操作 */}
      {showStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalContent>
              <ModalHeader>
                <ModalTitle className="text-xl font-semibold">
                  Update Task Status
                </ModalTitle>
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleStatusModalSubmit}>
                  {(() => {
                    const { fieldLabel, inputType } = getNextStatusAndField(
                      task.status
                    );
                    if (fieldLabel) {
                      if (inputType === "select") {
                        return (
                          <div className="mb-4">
                            <label className="block mb-2 font-medium">
                              {fieldLabel}
                            </label>
                            <select
                              className="select select-bordered w-full"
                              value={statusModalInput}
                              onChange={(e) =>
                                setStatusModalInput(e.target.value)
                              }
                            >
                              <option value="">Select an option</option>
                              <option value="GAS & ELECTRICITY">
                                Gas & Electricity
                              </option>
                              <option value="SMOKE ALARM">Smoke Alarm</option>
                            </select>
                            {task.status === "UNKNOWN" && (
                              <div className="flex items-center mt-3">
                                <input
                                  type="checkbox"
                                  id="archiveConflicts"
                                  className="checkbox mr-2"
                                  checked={archiveConflicts}
                                  onChange={(e) =>
                                    setArchiveConflicts(e.target.checked)
                                  }
                                />
                                <label htmlFor="archiveConflicts">
                                  Archive conflicting job orders
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div className="mb-4">
                            <label className="block mb-2 font-medium">
                              {fieldLabel}
                            </label>
                            <input
                              type={inputType}
                              className="input input-bordered w-full"
                              value={statusModalInput}
                              onChange={(e) =>
                                setStatusModalInput(e.target.value)
                              }
                              placeholder={fieldLabel}
                            />
                          </div>
                        );
                      }
                    } else {
                      return (
                        <div className="mb-4">
                          <p className="text-sm">
                            Are you sure you want to archive this task?
                          </p>
                        </div>
                      );
                    }
                  })()}
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowStatusModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="default" type="submit">
                      Confirm
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </ModalContent>
          </div>
        </div>
      )}
    </div>
  );
}
