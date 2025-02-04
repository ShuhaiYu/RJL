import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import { Link } from 'react-router-dom';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuthContext();
  const token = auth?.accessToken;

  useEffect(() => {
    if (!token) return;
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
  }, [token]);

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Properties</h1>
      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li
              key={property.id}
              className="border p-4 rounded hover:shadow-md transition-shadow"
            >
              <Link to={`/admin/properties/${property.id}`}>
                <h2 className="text-xl font-semibold">{property.name}</h2>
                <p className="text-gray-600">{property.address}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
