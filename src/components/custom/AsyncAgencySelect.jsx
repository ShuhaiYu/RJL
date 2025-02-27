// src/components/custom/AsyncAgencySelect.jsx
import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuthContext } from "@/auth";

export default function AsyncAgencySelect({ onChange, placeholder = "Select agency...", ...props }) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const loadOptions = async (inputValue) => {
    try {
      const searchParam = inputValue.trim() || "";
      const response = await axios.get(`${baseApi}/agencies`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchParam },
      });
      const agencies = response.data; // 假设返回 [{ id, agency_name }, ...]
      return agencies.map((agency) => ({
        value: agency.id,
        label: agency.agency_name,
      }));
    } catch (error) {
      console.error("Error fetching agencies:", error);
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
      {...props}
    />
  );
}
