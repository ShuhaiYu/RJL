// src/pages/CreatePropertyPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { toast } from 'sonner';

export default function CreatePropertyPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [loading, setLoading] = useState(false);
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !agencyId) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseApi}/properties/create`,
        { name, address, agency_id: agencyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Property created successfully!');
      // 跳转到新创建的房产详情页面（例如 /properties/123）
      navigate(`/properties/${response.data.data.id}`);
    } catch (error) {
      console.error('Create property error:', error);
      toast.error(error.response?.data?.message || 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="card card-grid min-w-full">
        <div className="card-header py-5">
          <h3 className="card-title text-xl font-bold">Create New Property</h3>
        </div>
        <div className="card-body p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Property Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter property name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Address</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter property address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Agency ID</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter agency ID"
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
