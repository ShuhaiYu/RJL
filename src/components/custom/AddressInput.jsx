import { useState, useEffect } from "react";
import Autocomplete from "react-google-autocomplete";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Box, CircularProgress } from "@mui/material";

export default function AddressInput({ value, onChange, onCoordinatesChange }) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalValue, setInternalValue] = useState(value || "");


  useEffect(() => {
    if (!token) return;

    // 从后端获取google_map_key
    setLoading(true);
    axios
      .get(`${baseApi}/google-map-key`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const key = res.data.key || res.data.google_map_key || "";
        setApiKey(key);
      })
      .catch((err) => {
        console.error("Failed to fetch settings:", err);
        setApiKey("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [baseApi, token]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );
  }

  if (!apiKey) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800">
        Google Maps API key not configured. Please set it in System Settings.
      </div>
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

        // Extract and pass coordinates if available
        if (onCoordinatesChange && place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onCoordinatesChange({ lat, lng });
        }
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
