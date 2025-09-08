// src/pages/veu/VeuDashboardPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";

export default function VeuDashboardPage() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${baseApi}/veu/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((e) => setErr(e.response?.data?.message || "Failed to load"));
  }, [token, baseApi]);

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">Loading...</div>;

  const {
    total_property_count = 0,
    completed_property_count = 0,
    incomplete_total_count = 0,
    incomplete_water_heater_count = 0,
    incomplete_air_conditioner_count = 0,
  } = data;

  const incomplete_items_sum =
    (incomplete_water_heater_count || 0) + (incomplete_air_conditioner_count || 0);

  return (
    <div className="p-6 space-y-2 text-lg">
      <div>
        Total Properties: <b>{total_property_count}</b>
      </div>
      <div>
        Completed Properties: <b>{completed_property_count}</b>
      </div>
      <div>
        Incomplete Properties: <b>{incomplete_total_count}</b>
      </div>
      <div>
        Incomplete VEU Items: <b>{incomplete_items_sum}</b>
      </div>
      <div>
        Incomplete Water Heater: <b>{incomplete_water_heater_count}</b>
      </div>
      <div>
        Incomplete Air Conditioner: <b>{incomplete_air_conditioner_count}</b>
      </div>
    </div>
  );
}
