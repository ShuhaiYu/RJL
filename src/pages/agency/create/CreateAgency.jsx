import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
// import { toast } from 'sonner';

export default function CreateAgency() {
  // 定义表单状态
  const [form, setForm] = useState({
    agency_name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    logo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 从 auth context 获取 token
  const { auth } = useAuthContext();
  const token = auth?.accessToken;

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/agencies/create`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Agency created:', response.data);
      toast.success('Agency created successfully');
      // 显示成功提示，或者重置表单
      setForm({
        agency_name: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        logo: '',
      });
    } catch (err) {
      console.error('Failed to create agency:', err);
      setError(err.response?.data?.message || 'Failed to create agency');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create Agency</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency Name
          </label>
          <Input
            type="text"
            name="agency_name"
            value={form.agency_name}
            onChange={handleChange}
            placeholder="Enter agency name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <Input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <Input
            type="text"
            name="logo"
            value={form.logo}
            onChange={handleChange}
            placeholder="Enter logo URL"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Agency'}
        </Button>
      </form>
      
    </div>
  );
}
