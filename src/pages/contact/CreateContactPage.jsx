import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from '@/auth';

export const CreateContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property_id: '' // 修改字段名称
  });
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const navigate = useNavigate();
  const { auth, baseApi } = useAuthContext();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${baseApi}/properties`, {
          headers: { Authorization: `Bearer ${auth?.accessToken}` }
        });
        setProperties(response.data);
        setLoadingProperties(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [auth, baseApi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseApi}/contacts`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      });
      if (response.status === 201) {
        navigate('/contacts');
      }
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  if (loadingProperties) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create Contact
      </Typography>
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
        <TextField
          select
          fullWidth
          label="Property"
          margin="normal"
          value={formData.property_id}
          onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
        >
          {properties.map((property) => (
            <MenuItem key={property.id} value={property.id}>
              {property.address}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Create
        </Button>
      </form>
    </Box>
  );
};
