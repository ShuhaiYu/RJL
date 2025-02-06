// src/components/TaskDetailModal.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import ContactEditForm from "./ContactEditForm";
import { toast } from "sonner";

export default function TaskDetailModal({ taskId, token, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [taskDetail, setTaskDetail] = useState(null);

  // Task fields for editing
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // For controlling which contact is being edited
  const [editingContactId, setEditingContactId] = useState(null);

  // For creating new contact
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // 是否显示 Emails 列表
  const [showEmails, setShowEmails] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    loadTask();
  }, [taskId]);

  const loadTask = () => {
    setLoading(true);
    setError("");
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/agency/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTaskDetail(res.data);
        setTaskName(res.data.task_name || "");
        setTaskDescription(res.data.task_description || "");
        setDueDate(
          res.data.due_date
            ? new Date(res.data.due_date).toISOString().slice(0, 16)
            : ""
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load task detail");
        setLoading(false);
      });
  };

  if (!taskId) return null;

  const handleSaveTask = () => {
    // PUT update
    axios
      .put(
        `${import.meta.env.VITE_API_BASE_URL}/agency/tasks/${taskId}`,
        {
          task_name: taskName,
          task_description: taskDescription,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        toast("Task updated successfully");
        loadTask(); // refresh
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to update task");
      });
  };

  const handleCreateContact = () => {
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/agency/contacts/create`,
        {
          task_id: taskId,
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast("Contact created successfully!");
        setShowCreateContact(false);
        loadTask(); // 刷新Task详情
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to create contact");
      });
  };

  const handleDeleteTask = () => {
    axios
      .delete(`${import.meta.env.VITE_API_BASE_URL}/agency/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast("Task deleted successfully!");
        onClose();
        // 父页面若需刷新列表
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to delete task");
      });
  };

  const handleClose = () => {
    onClose();
  };

  const startEditContact = (contactId) => {
    setEditingContactId(contactId);
  };
  const stopEditContact = () => {
    setEditingContactId(null);
    loadTask(); // reload after saving contact
  };

  function showEmailInNewWindow() {
    taskDetail.emails.forEach((email) => {
        const newWindow = window.open('', '_blank');
        // 用 document.write 或 newWindow.document.body.innerHTML
        newWindow.document.write(`<html><body>${email.html}</body></html>`);
        newWindow.document.close();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={handleClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">Task Detail</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div>Loading task detail...</div>
        ) : error ? (
          <div className="text-red-500 mb-2">{error}</div>
        ) : taskDetail ? (
          <>
            {/* Task edit form */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Task Name</label>
              <input
                type="text"
                className="border w-full p-2 rounded"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Task Description</label>
              <textarea
                rows={3}
                className="border w-full p-2 rounded"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Due Date</label>
              <input
                type="datetime-local"
                className="border w-full p-2 rounded"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSaveTask}
              >
                Save Task
              </button>
            </div>

            {/* Contacts list */}
            {taskDetail.contacts && taskDetail.contacts.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Contacts:</h4>
                <ul className="space-y-2">
                  {taskDetail.contacts.map((contact) => (
                    <li
                      key={contact.id}
                      className="p-3 border rounded flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">
                          {contact.phone} | {contact.email}
                        </p>
                      </div>
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        onClick={() => startEditContact(contact.id)}
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No contacts for this task.</p>
            )}

            {/* Contact edit form as a sub-popup or inline */}
            {editingContactId && (
              <ContactEditForm
                contactId={editingContactId}
                token={token}
                onClose={stopEditContact}
              />
            )}

            {/* 显示 Emails (如果 taskDetail?.emails 存在) */}
            {/* {showEmails && taskDetail?.emails && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Emails:</h4>
                {taskDetail.emails.length > 0 ? (
                  <ul className="space-y-2">
                    {taskDetail.emails.map((em) => (
                      <li key={em.id} className="p-2 border rounded">
                        <p className="font-medium">{em.subject}</p>
                        <p className="text-sm text-gray-500">
                          From: {em.sender}
                        </p>
                        <div className="text-gray-700 text-sm mt-1">
                          {em.email_body}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No emails for this task.</p>
                )}
              </div>
            )} */}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div>
                <button
                  className="mr-2 px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => setShowCreateContact(true)}
                >
                  Create Contact
                </button>
                <button
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                  //   onClick={() => setShowEmails(!showEmails)}
                    onClick={showEmailInNewWindow}
                >
                  {showEmails ? "Hide Emails" : "Show Emails"}
                </button>
              </div>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDeleteTask}
              >
                Delete Task
              </button>
            </div>

            {/* Create Contact Mini-Form */}
            {showCreateContact && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
                onClick={() => setShowCreateContact(false)}
              >
                <div
                  className="bg-white p-4 rounded shadow"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold mb-2">Create Contact</h3>
                  <input
                    className="border p-2 w-full mb-2"
                    placeholder="Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full mb-2"
                    placeholder="Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full mb-2"
                    placeholder="Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded mr-2"
                      onClick={() => setShowCreateContact(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={handleCreateContact}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>No task data</div>
        )}
      </div>
    </div>
  );
}
