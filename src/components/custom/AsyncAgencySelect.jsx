// src/components/custom/AsyncAgencySelect.jsx
import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useState, useEffect } from "react";

export default function AsyncAgencySelect({ 
  onChange, 
  placeholder = "Select agency...",
  restrictToAgencyId = null, // 限制只显示特定中介ID
  defaultAgencyId = null, // 默认选中的中介ID
  ...props 
}) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;
  const [selectedValue, setSelectedValue] = useState(null);

  const loadOptions = async (inputValue) => {
    try {
      const searchParam = inputValue.trim() || "";
      const response = await axios.get(`${baseApi}/agencies`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchParam },
      });
      let agencies = response.data; // 假设返回 [{ id, agency_name }, ...]
      
      // 如果有限制，只返回特定中介
      if (restrictToAgencyId) {
        agencies = agencies.filter(agency => agency.id === restrictToAgencyId);
      }
      
      return agencies.map((agency) => ({
        value: agency.id,
        label: agency.agency_name,
      }));
    } catch (error) {
      console.error("Error fetching agencies:", error);
      return [];
    }
  };

  // 初始化默认值
  useEffect(() => {
    if (defaultAgencyId && token) {
      axios
        .get(`${baseApi}/agencies/${defaultAgencyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const agency = res.data;
          const option = {
            value: agency.id,
            label: agency.agency_name,
          };
          setSelectedValue(option);
          onChange && onChange(option.value);
        })
        .catch((err) => {
          console.error("Error fetching agency:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAgencyId, token, baseApi]);

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={selectedValue}
      onChange={(option) => {
        setSelectedValue(option);
        onChange(option ? option.value : null);
      }}
      placeholder={placeholder}
      {...props}
    />
  );
}
