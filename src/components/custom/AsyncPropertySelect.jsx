import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useState, useEffect } from "react";

export default function AsyncPropertySelect({
  onChange,
  placeholder = "Select property...",
  defaultPropertyId, // 新增：默认的 property id
}) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;
  const [value, setValue] = useState(null);

  // 加载列表选项
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
        property: property, // 返回完整的房产对象
      }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      return [];
    }
  };

  // 如果传入了 defaultPropertyId，则在组件挂载时获取该 property 的详细信息
  useEffect(() => {
    if (defaultPropertyId) {
      axios
        .get(`${baseApi}/properties/${defaultPropertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const property = res.data;
          const option = {
            value: property.id,
            label: property.address,
            property: property, // 返回完整的房产对象
          };
          setValue(option);
          onChange && onChange(option);
        })
        .catch((err) => {
          console.error("Error fetching default property:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPropertyId, token, baseApi]);

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={value}
      onChange={(option) => {
        setValue(option);
        onChange && onChange(option);
      }}
      placeholder={placeholder}
    />
  );
}
