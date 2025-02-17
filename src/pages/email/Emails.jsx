// src/pages/Emails.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import EmailsDataTable from "./blocks/EmailsDataTable"; // 根据实际路径调整

export default function Emails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const fetchEmails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch emails");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEmails();
    }
  }, [token]);

  if (loading) return <div>Loading emails...</div>;
  if (error)
    return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Emails</h1>
      {emails.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p>No emails found.</p>
        </div>
      ) : (
        <EmailsDataTable emails={emails} />
      )}
    </div>
  );
}
