// src/pages/veu/VeuIncompleteListPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import StatsCards from "@/components/common/StatsCards";
import { toast } from "sonner";

export default function VeuIncompleteListPage() {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, filtered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canRead = currentUser?.permissions?.veu_project?.includes("read");

  const agencyIdFromState = location.state?.agency_id;
  const agencyNameFromState = location.state?.agency_name;

  const formatType = (t) =>
    String(t || "")
      .split("_")
      .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ""))
      .join(" ");

  const fetchList = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${baseApi}/veu/incomplete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let list = Array.isArray(data) ? data : [];
      if (agencyIdFromState) {
        list = list.filter((r) => r.agency_id === agencyIdFromState);
      }
      setItems(list);
      setStats({ total: list.length, filtered: list.length });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch VEU list";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && canRead) fetchList();
  }, [token, canRead, agencyIdFromState]);

  if (!canRead) return <div className="p-6 text-red-600">No permission</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
            <KeenIcon icon="cube-3" className="text-2xl text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              VEU Incomplete Projects
              {agencyNameFromState ? ` - ${agencyNameFromState}` : ""}
            </h1>
            <p className="text-gray-600">
              Properties with any incomplete VEU item
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {/* <StatsCards
        title="VEU Statistics"
        loading={loading}
        cards={[
          {
            key: "total",
            title: "Incomplete VEU Items",
            value: stats.total,
            icon: "checklist",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            route: null,
          },
          {
            key: "filtered",
            title: "Filtered Results",
            value: stats.filtered,
            icon: "filter",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            route: null,
          },
        ]}
      /> */}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mx-auto mb-4">
              <KeenIcon icon="information" className="text-2xl text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchList} variant="outline">
              <KeenIcon icon="arrows-circle" className="text-sm mr-2" />
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4">
              <KeenIcon icon="grid-1" className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Incomplete VEU Items
            </h3>
            <p className="text-gray-600">All good here.</p>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Completed By</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Agency</th>
                  <th className="py-2 pr-4">Updated</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{r.property_address || "-"}</td>
                    <td className="py-2 pr-4">{formatType(r.type)}</td>
                    <td className="py-2 pr-4">{r.completed_by || "-"}</td>
                    <td className="py-2 pr-4">{r.price ?? "-"}</td>
                    <td className="py-2 pr-4">{r.agency_name || "-"}</td>
                    <td className="py-2 pr-4">
                      {r.updated_at ? new Date(r.updated_at).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      <Button
                        variant="view"
                        onClick={() => navigate(`/property/${r.property_id}`)}
                      >
                        View Property
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
