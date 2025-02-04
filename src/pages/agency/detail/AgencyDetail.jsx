import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '@/auth';

export default function AgencyDetail() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 从 useAuthContext 中取 token
  const { auth } = useAuthContext();
  const token = auth?.accessToken;

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/admin/agencies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAgency(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch agency detail:', err);
        setError(err.response?.data?.message || 'Failed to fetch agency detail');
        setLoading(false);
      });
  }, [id, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!agency) return <div>No agency found.</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{agency.agency_name}</h1>
      <img src={agency.logo} alt={agency.agency_name} className="w-32 h-32 mb-4" />
      <p className="mb-2"><strong>Address:</strong> {agency.address}</p>
      <p className="mb-2"><strong>Phone:</strong> {agency.phone}</p>
      {/* 根据返回数据展示更多信息 */}
      <p className="mb-2">
        <strong>Created At:</strong> {new Date(agency.created_at).toLocaleString()}
      </p>
      <p className="mb-2">
        <strong>Updated At:</strong> {new Date(agency.updated_at).toLocaleString()}
      </p>
      {/* 其它信息根据实际情况展示 */}
    </div>
  );
}
