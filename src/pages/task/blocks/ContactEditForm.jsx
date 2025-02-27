// src/components/ContactEditForm.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth';

export default function ContactEditForm({
  contactId,
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  useEffect(() => {
    if (!contactId) return;
    setLoading(true);
    axios
      .get(`${baseApi}/agency/contacts/${contactId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setEmail(res.data.email || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load contact');
        setLoading(false);
      });
  }, [contactId, token]);

  if (!contactId) return null;

  const handleSaveContact = () => {
    axios
      .put(
        `${baseApi}/contacts/${contactId}`,
        { name, phone, email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast('Contact updated successfully!');
        onClose();
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to update contact');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={onClose}>
      <div 
        className="bg-white p-4 rounded shadow-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">Edit Contact</h3>
        {loading ? (
          <p>Loading contact...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Phone</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="px-3 py-1 bg-gray-300 rounded mr-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={handleSaveContact}
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
