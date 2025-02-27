// src/components/custom/AsyncPropertySelect.jsx
import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuthContext } from "@/auth";

export default function AsyncPropertySelect({ onChange, placeholder = "Select property..." }) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const loadOptions = async (inputValue) => {
    try {
      const searchParam = inputValue.trim() || "";
      const response = await axios.get(`${baseApi}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchParam },
      });
      const properties = response.data; // 假设返回 [{ id, address }, ...]
      return properties.map((property) => ({
        value: property.id,
        label: property.address,
      }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      return [];
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onChange={(option) => onChange(option ? option.value : null)}
      placeholder={placeholder}
    />
  );
}
