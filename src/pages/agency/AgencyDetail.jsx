// src/pages/AgencyDetail.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import MyPropertiesDataTable from "../property/blocks/MyPropertiesDataTable";
import TasksDataTable from "../task/blocks/TasksDataTable";
import { Box, CircularProgress } from "@mui/material";
import EditAgencyModal from "./blocks/EditAgencyModal";
import AgencyWhitelistEmails from "./blocks/AgencyWhitelistEmails";

export default function AgencyDetail() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${baseApi}/agencies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAgency(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch agency detail:", err);
        setError(
          err.response?.data?.message || "Failed to fetch agency detail"
        );
        setLoading(false);
      });
  }, [id, token, baseApi]);

  if (loading)
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!agency) return <div className="text-center p-4">No agency found.</div>;

  // 点击属性“Edit”按钮时触发
  const handleEditProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // 点击任务“View”按钮时触发
  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* 机构详情卡片 */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-6">
          <img
            src={agency.logo}
            alt={agency.agency_name}
            className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{agency.agency_name}</h1>
            <p className="text-gray-600">
              <strong>Address:</strong> {agency.address}
            </p>
            <p className="text-gray-600">
              <strong>Phone:</strong> {agency.phone}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <strong>Created At:</strong>{" "}
            {new Date(agency.created_at).toLocaleString()}
          </div>
          <div>
            <strong>Updated At:</strong>{" "}
            {new Date(agency.updated_at).toLocaleString()}
          </div>
        </div>
        {/* 添加编辑机构按钮 */}
        <div className="flex justify-end mt-4 ">
          <button
            className="btn btn-secondary"
            onClick={() => setEditModalOpen(true)}
          >
            Edit Agency
          </button>
        </div>
      </div>

      {/* 房产列表 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Properties</h2>
        {(agency.properties || []).length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No properties found.
          </div>
        ) : (
          <MyPropertiesDataTable
            properties={agency.properties}
            onEdit={handleEditProperty}
            hideColumns={["agency_name"]}
          />
        )}
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tasks</h2>
        {(agency.tasks || []).length === 0 ? (
          <div className="text-center py-6 text-gray-500">No tasks found.</div>
        ) : (
          <TasksDataTable
            tasks={agency.tasks}
            onTaskClick={handleTaskClick}
            hideColumns={["property_address", "agency_name"]}
          />
        )}
      </div>

      {/* ============ 新增: 机构白名单管理区块 ============ */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Email Whitelist</h2>
        <AgencyWhitelistEmails agencyId={id} />
      </div>
      {/* ============ 新增结束 ============ */}

      {/* 编辑机构弹窗 */}
      {editModalOpen && (
        <EditAgencyModal
          agency={agency}
          onClose={() => setEditModalOpen(false)}
          onUpdated={(updatedAgency) =>
            setAgency((prev) => ({
              ...prev,
              ...updatedAgency,
              properties:
                updatedAgency.properties !== undefined
                  ? updatedAgency.properties
                  : prev.properties,
              tasks:
                updatedAgency.tasks !== undefined
                  ? updatedAgency.tasks
                  : prev.tasks,
            }))
          }
        />
      )}
    </div>
  );
}
