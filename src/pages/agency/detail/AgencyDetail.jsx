import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";
import MyPropertiesDataTable from "../../property/my-properties/blocks/MyPropertiesDataTable";

export default function AgencyDetail() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 从 useAuthContext 中获取 token 与 baseApi
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
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!agency) return <div className="text-center p-4">No agency found.</div>;

  // 点击属性“Edit”按钮时触发
  const handleEdit = (propertyId) => {
    navigate(`/property/${propertyId}`);
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
      </div>

      {/* 房产列表 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Properties</h2>
        {agency.properties.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No properties found.
          </div>
        ) : (
          <MyPropertiesDataTable
            properties={agency.properties}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
