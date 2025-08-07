import { useState, useEffect } from "react";
import Autocomplete from "react-google-autocomplete";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Box, CircularProgress } from "@mui/material";

export default function AddressInput({ value, onChange }) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;
  const [apiKey, setApiKey] = useState("");
  const [internalValue, setInternalValue] = useState(value || "");


  useEffect(() => {
    // 从后端获取google_map_key，假设设置接口返回 { google_map_key: "xxx" }
    axios
      .get(`${baseApi}/google-map-key`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setApiKey(res.data.google_map_key);
      })
      .catch((err) => {
        console.error("Failed to fetch settings:", err);
      });
  }, [baseApi, token]);

  if (!apiKey) {
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Autocomplete
      apiKey={apiKey}
      fields={["formatted_address", "geometry"]} // 请求 'formatted_address'
      onPlaceSelected={(place) => {
        const addr = place.formatted_address || "";
        setInternalValue(addr);
        onChange(addr);
      }}
      value={internalValue}
      onChange={(e) => {
        setInternalValue(e.target.value);
        onChange(e.target.value);
      }}
      options={{ types: ["address"], componentRestrictions: { country: "au" } }}
      placeholder="Enter address..."
      className="input input-bordered w-full"
      language="en"
    />
  );
}
