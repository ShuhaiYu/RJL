// src/pages/MyProperties.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import PropertyDetailModal from './blocks/PropertyDetailModal'; // NEW

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState(null); // NEW
  const { auth } = useAuthContext();
  const token = auth?.accessToken;

  const fetchProperties = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/agency/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProperties(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch properties');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchProperties();
    }
  }
  , [token]);

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // 当点击某个property时，设置selectedPropertyId -> 打开Modal
  const handlePropertyClick = (propertyId) => {
    setSelectedPropertyId(propertyId);
  };

  const closeModal = () => {
    setSelectedPropertyId(null);
    fetchProperties(); // 关闭Modal后再次获取最新列表
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Properties</h1>

      {properties.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No properties found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePropertyClick(prop.id)}
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {prop.name}
              </h2>
              <p className="text-gray-600 mt-1">{prop.address}</p>
            </div>
          ))}
        </div>
      )}

      {selectedPropertyId && (
        <PropertyDetailModal
          propertyId={selectedPropertyId}
          token={token}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
