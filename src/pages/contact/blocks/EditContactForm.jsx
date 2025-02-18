import { useState, useEffect } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
import { useAuthContext } from "@/auth";
import axios from "axios";

export const EditContactForm = ({ contactId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const { auth, baseApi } = useAuthContext();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await axios.get(`${baseApi}/contacts/${contactId}`, {
          headers: { Authorization: `Bearer ${auth?.accessToken}` },
        });
        // axios 返回数据在 response.data 中
        const data = response.data;
        setFormData({
          name: data.name,
          phone: data.phone,
          email: data.email,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contact:", error);
        setLoading(false);
      }
    };
    fetchContact();
  }, [contactId, auth, baseApi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // axios.put 的第二个参数是要提交的数据，第三个参数为配置项
      const response = await axios.put(
        `${baseApi}/contacts/${contactId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );
      // axios 的响应没有 ok 属性，用 status 判断是否为成功
      if (response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Name"
        margin="normal"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <TextField
        fullWidth
        label="Phone"
        margin="normal"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Save
      </Button>
    </form>
  );
};
