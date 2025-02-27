// src/pages/PropertyDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";
import PropertyDetailModal from "./blocks/PropertyDetailModal";
import TasksDataTable from "../task/blocks/TasksDataTable";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Box, CircularProgress } from "@mui/material";
import ContactDataTable from "../contact/blocks/ContactDataTable";
import { toast } from "sonner";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalContent,
} from "@/components/modal";
import { EditContactForm } from "../contact/blocks/EditContactForm";

export default function PropertyDetailPage() {
  const { id: propertyId } = useParams();
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

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
      {/* Back Button */}
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate("/property/my-properties")}
      >
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>
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
        <div className="flex mt-4 md:mt-0 gap-2">
          <Button variant="edit" onClick={() => setShowEditModal(true)}>
            Edit
          </Button>

          <Button
            variant="view"
            onClick={() =>
              navigate(`/property/tasks/create`, {
                state: {
                  originalTask: {
                    property_id: propertyId,
                  },
                },
              })
            }
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* 下方区域：任务列表 */}
      <TasksDataTable
        tasks={property.tasks}
        onTaskClick={handleTaskClick}
        hideColumns={["property_address"]}
      />

      {/* 下方区域：Contacts DataTable */}
      <div className="bg-white p-6 shadow rounded my-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4">Contacts</h2>
          <Button
            variant="create"
            className="mb-4"
            onClick={() =>
              navigate("/contacts/create", {
                state: { propertyId: property.id },
              })
            }
          >
            Add Contact
          </Button>
        </div>
        <ContactDataTable
          contacts={property.contacts}
          onEdit={(id) => {
            setSelectedContactId(id);
            setEditModalOpen(true);
          }}
          onDelete={(id) => {
            if (!window.confirm("Are you sure to delete this contact?")) return;

            // 删除联系人
            axios
              .delete(`${baseApi}/contacts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(() => {
                toast.success("Contact deleted successfully");
                fetchPropertyDetail(); // 刷新详情以显示更新后的数据
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
                  fetchPropertyDetail(); // 刷新详情以显示更新后的数据
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

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
