// src/pages/MyProperties.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import MyPropertiesDataTable from "./blocks/MyPropertiesDataTable";

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const fetchProperties = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${baseApi}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProperties(response.data);
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
  }, [token]);

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // 点击某条属性的 "Edit" 按钮时
  const handleEdit = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Properties</h1>
      {properties.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No properties found.</p>
        </div>
      ) : (
        <MyPropertiesDataTable
          properties={properties}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
