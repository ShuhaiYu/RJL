import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/auth";
import MyPropertiesDataTable from "./blocks/MyPropertiesDataTable";
import { Box, CircularProgress } from "@mui/material";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import StatsCards from "@/components/common/StatsCards";

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    available: 0,
    filteredCount: 0
  });
  
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();
  const location = useLocation();
  // 从 state 中获取 agency_id
  const agencyIdFromState = location.state?.agency_id;

  const fetchProperties = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${baseApi}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let data = response.data || [];
        // 如果传入 agency_id，则过滤
        if (agencyIdFromState) {
          data = data.filter((property) => property.agency.id === agencyIdFromState);
        }
        setProperties(data);
        
        // 计算统计信息
        const stats = {
          total: data.length,
          available: data.filter(property => property.status === 'available').length,
          filteredCount: data.length
        };
        setPropertyStats(stats);
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || "Failed to fetch properties";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchProperties();
    }
  }, [token, agencyIdFromState]);

  if (loading)
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );

  if (error) return <div className="text-red-500">Error: {error}</div>;

  const handleEdit = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // check user has create property permission
  const canCreateProperty = currentUser?.permissions?.property?.includes("create");

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <KeenIcon icon="home-2" className="text-blue-600 text-lg" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Property Management</h1>
            <p className="text-gray-600 mt-1">Manage properties and their information</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg text-gray-900 font-semibold">
            {properties.length} Properties
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {canCreateProperty && (
            <Button
              variant="create"
              onClick={() => navigate("/property/create")}
              className="flex items-center gap-2"
            >
              <KeenIcon icon="plus" className="text-sm" />
              Create Property
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <StatsCards
          title="Property Statistics"
          loading={loading}
          cards={[
          {
            key: 'total',
            title: 'Total Properties',
            value: propertyStats.total,
            icon: 'home-2',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            route: null
          },
          {
            key: 'available',
            title: 'Available Properties',
            value: propertyStats.available,
            icon: 'check-circle',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            route: null
          },
          {
            key: 'filtered',
            title: 'Filtered Results',
            value: propertyStats.filteredCount,
            icon: 'filter',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            route: null
          }
        ]}
        />
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Properties List</h3>
            <span className="text-sm text-gray-600">
              Showing {propertyStats.filteredCount} of {properties.length} properties
            </span>
          </div>
        </div>

        <div className="p-6">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="home-2" className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first property.</p>
              {canCreateProperty && (
                <Button
                  variant="create"
                  onClick={() => navigate("/property/create")}
                  className="flex items-center gap-2"
                >
                  <KeenIcon icon="plus" className="text-sm" />
                  Create Property
                </Button>
              )}
            </div>
          ) : (
            <MyPropertiesDataTable properties={properties} onEdit={handleEdit} onRefresh={fetchProperties} />
          )}
        </div>
      </div>
    </div>
  );
}
