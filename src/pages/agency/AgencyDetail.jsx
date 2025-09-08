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
import { toast } from "sonner";

export default function AgencyDetail() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activatingVeu, setActivatingVeu] = useState(false);

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const fetchAgency = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${baseApi}/agencies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgency(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch agency detail:", err);
      setError(err.response?.data?.message || "Failed to fetch agency detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAgency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, baseApi]);

  if (loading)
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!agency) return <div className="text-center p-4">No agency found.</div>;

  const handleEditProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/property/tasks/${taskId}`);
  };

  const handleActivateVeu = async () => {
    if (!token) return;
    try {
      setActivatingVeu(true);
      await axios.put(
        `${baseApi}/agencies/veu-active/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAgency(); // get veu_activated=true from server
      toast.success("VEU activated");
    } catch (e) {
      console.error("Activate VEU failed:", e);
      toast.error(e.response?.data?.message || "Activate VEU failed");
    } finally {
      setActivatingVeu(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Agency card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-6">
          <img
            src={agency.logo}
            alt={agency.agency_name}
            className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{agency.agency_name}</h1>
          <p className="text-gray-600">
            <strong>Address:</strong> {agency.address}
          </p>
          <p className="text-gray-600">
            <strong>Phone:</strong> {agency.phone}
          </p>
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
        <div className="flex justify-end mt-4 ">
          <button
            className="btn btn-secondary"
            onClick={() => setEditModalOpen(true)}
          >
            Edit Agency
          </button>
        </div>
      </div>

      {/* VEU status card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">VEU Project</h2>
        {agency.veu_activated ? (
          <div className="text-green-700 font-semibold">Activated</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-gray-700">Not activated</div>
            <button
              className="btn btn-primary"
              onClick={handleActivateVeu}
              disabled={activatingVeu}
            >
              {activatingVeu ? "Activating..." : "Activate"}
            </button>
          </div>
        )}
      </div>

      {/* Properties */}
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

      {/* Job Orders */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Job Orders</h2>
        {(agency.tasks || []).length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No job orders found.
          </div>
        ) : (
          <TasksDataTable
            tasks={agency.tasks}
            onTaskClick={handleTaskClick}
            hideColumns={["property_address", "agency_name"]}
          />
        )}
      </div>

      {/* Email Whitelist */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Email Whitelist</h2>
        <AgencyWhitelistEmails agencyId={id} />
      </div>

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
