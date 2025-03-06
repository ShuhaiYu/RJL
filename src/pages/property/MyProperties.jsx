import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/auth";
import MyPropertiesDataTable from "./blocks/MyPropertiesDataTable";
import { Box, CircularProgress } from "@mui/material";
import { Button } from "@/components/ui/button";

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        let data = response.data;
        // 如果传入 agency_id，则过滤
        if (agencyIdFromState) {
          data = data.filter((property) => property.agency.id === agencyIdFromState);
        }
        setProperties(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch properties");
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Properties</h1>
      <div className="mb-4 flex justify-end">
        {canCreateProperty && (
          <Button
            variant="create"
            onClick={() => navigate("/property/create")}
          >
            Create Property
          </Button>
        )}
      </div>
      {properties.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No properties found.</p>
        </div>
      ) : (
        <MyPropertiesDataTable properties={properties} onEdit={handleEdit} />
      )}
    </div>
  );
}
