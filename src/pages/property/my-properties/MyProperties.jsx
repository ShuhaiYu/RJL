// src/pages/MyProperties.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';

function PropertiesDataTable({ properties, onPropertyClick }) {
  return (
    <div className="grid">
      <div className="card card-grid min-w-full">
        <div className="card-header py-5 flex-wrap items-center justify-between">
          <h3 className="card-title text-xl font-bold">My Properties</h3>
          {/* 可在此处添加其他操作按钮或开关 */}
        </div>
        <div className="card-body">
          <div className="scrollable-x-auto">
            <table className="table table-auto table-border" data-datatable-table="true">
              <thead>
                <tr>
                  <th className="w-[100px] text-center">ID</th>
                  <th className="min-w-[185px]">Address</th>
                  <th className="w-[100px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr
                    key={prop.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => onPropertyClick(prop.id)}
                  >
                    <td className="px-4 py-2 text-center">{prop.id}</td>
                    <td className="px-4 py-2">{prop.address}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="btn btn-sm btn-icon btn-clear btn-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPropertyClick(prop.id);
                        }}
                      >
                        <i className="ki-outline ki-notepad-edit"></i>
                      </button>
                      {/* 如需添加删除按钮，可在此处处理 */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* 可添加分页 footer */}
      </div>
    </div>
  );
}

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  // 根据后端 API 获取属性列表（使用 Agency Admin 路径）
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
        setError(err.response?.data?.message || 'Failed to fetch properties');
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

  const handlePropertyClick = (propertyId) => {
    // 跳转到 /property/:id 页面
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
        <PropertiesDataTable properties={properties} onPropertyClick={handlePropertyClick} />
      )}
    </div>
  );
}
