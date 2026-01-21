// src/pages/veu/VeuDashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function VeuDashboardPage() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  // 一次性总览数据（中介 -> 用户）
  const [overview, setOverview] = useState(null);
  const [err, setErr] = useState("");

  // 选择项
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("ALL"); // "ALL" = 该中介汇总

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  // 拉取 overview
  useEffect(() => {
    if (!token) return;
    setErr("");
    setOverview(null);
    axios
      .get(`${baseApi}/veu-projects/overview`, { headers: authHeader })
      .then((res) => {
        // Backend returns { success: true, data: [...agencies] }
        const rawData = res.data?.data || res.data || [];
        const agencies = Array.isArray(rawData) ? rawData : [];

        // Transform backend data to frontend expected format
        const transformedAgencies = agencies.map(agency => {
          // Calculate metrics from properties
          const totalProps = agency.total_properties || 0;
          const whCompleted = agency.water_heater_completed || 0;
          const acCompleted = agency.air_conditioner_completed || 0;

          // Count incomplete from properties
          let whIncomplete = 0;
          let acIncomplete = 0;
          (agency.properties || []).forEach(prop => {
            (prop.veu_projects || []).forEach(veu => {
              if (veu.type === 'water_heater' && !veu.is_completed) whIncomplete++;
              if (veu.type === 'air_conditioner' && !veu.is_completed) acIncomplete++;
            });
          });

          return {
            agency_id: agency.agency_id,
            agency_name: agency.agency_name,
            users: [], // Backend doesn't provide user breakdown
            metrics: {
              total_property_count: totalProps,
              completed_property_count: whCompleted + acCompleted > 0 ? Math.min(whCompleted, acCompleted) : 0,
              incomplete_total_count: whIncomplete + acIncomplete,
              incomplete_water_heater_count: whIncomplete,
              incomplete_air_conditioner_count: acIncomplete,
            },
            pie: {
              ac_done_count: acCompleted,
              ac_not_count: acIncomplete,
              wh_done_count: whCompleted,
              wh_not_count: whIncomplete,
            },
          };
        });

        setOverview({ agencies: transformedAgencies });

        // 默认选中第一个中介
        if (transformedAgencies.length > 0) {
          setSelectedAgencyId(transformedAgencies[0].agency_id ?? 0);
        } else {
          setSelectedAgencyId(null);
        }
        setSelectedUserId("ALL");
      })
      .catch((e) => setErr(e.response?.data?.message || "Failed to load overview"));
  }, [token, baseApi, authHeader]);

  const agencies = overview?.agencies ?? [];

  const selectedAgency = useMemo(() => {
    if (selectedAgencyId == null) return null;
    return agencies.find(a => String(a.agency_id) === String(selectedAgencyId)) || null;
  }, [agencies, selectedAgencyId]);

  // 用户下拉列表（当前中介）
  const userOptions = selectedAgency?.users ?? [];

  // 当前显示的数据行（用户优先，否则中介汇总）
  const activeNode = useMemo(() => {
    if (!selectedAgency) return null;
    if (selectedUserId !== "ALL") {
      const u = selectedAgency.users.find(
        x => String(x.user_id) === String(selectedUserId)
      );
      if (u) {
        return {
          title: u.user_name || u.user_email || `User #${u.user_id}`,
          metrics: u.metrics,
          pie: u.pie,
          scope: "user",
        };
      }
    }
    return {
      title: selectedAgency.agency_name || `Agency #${selectedAgency.agency_id}`,
      metrics: selectedAgency.metrics,
      pie: selectedAgency.pie,
      scope: "agency",
    };
  }, [selectedAgency, selectedUserId]);

  // 顶部 5 个数字
  const {
    total_property_count = 0,
    completed_property_count = 0,
    incomplete_total_count = 0,
    incomplete_water_heater_count = 0,
    incomplete_air_conditioner_count = 0,
  } = activeNode?.metrics || {};

  // 饼图数据
  const pieData = useMemo(() => {
    const pie = activeNode?.pie || {
      ac_done_count: 0,
      ac_not_count: 0,
      wh_done_count: 0,
      wh_not_count: 0,
    };
    return [
      { name: "AC Done", value: Number(pie.ac_done_count || 0) },
      { name: "AC Not", value: Number(pie.ac_not_count || 0) },
      { name: "Heat Pump Done", value: Number(pie.wh_done_count || 0) },
      { name: "Heat Pump Not", value: Number(pie.wh_not_count || 0) },
    ];
  }, [activeNode]);

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!overview) return <div className="p-6">Loading...</div>;
  if (!selectedAgency) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-8">
      {/* 选择器 */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">Agency:</label>
          <select
            className="border rounded-md px-3 py-2 bg-white"
            value={selectedAgencyId ?? ""}
            onChange={(e) => {
              setSelectedAgencyId(e.target.value === "" ? null : Number(e.target.value));
              setSelectedUserId("ALL");
            }}
          >
            {agencies.map((a) => (
              <option key={a.agency_id ?? `ag-${a.agency_name}`} value={a.agency_id ?? ""}>
                {a.agency_name || `Agency #${a.agency_id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">User:</label>
          <select
            className="border rounded-md px-3 py-2 bg-white"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="ALL">All users in this agency</option>
            {userOptions.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.user_name || u.user_email || `User #${u.user_id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 顶部五个统计（来自 overview 的 agency/user 节点） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Properties" value={total_property_count} tone="slate" />
        <Card title="Completed Properties" value={completed_property_count} tone="green" />
        <Card title="Incomplete Properties" value={incomplete_total_count} tone="amber" />
        <Card title="Incomplete Heat Pump" value={incomplete_water_heater_count} tone="orange" />
        <Card title="Incomplete Air Conditioner" value={incomplete_air_conditioner_count} tone="cyan" />
      </div>

      {/* 饼图 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-lg font-semibold mb-4">
          {activeNode?.scope === "user" ? "User Summary" : "Agency Summary"} — {activeNode?.title}
        </div>
        <div className="w-full h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={140} label>
                {pieData.map((_, idx) => (
                  <Cell
                    key={`slice-${idx}`}
                    fill={["#34D399", "#F87171", "#60A5FA", "#F59E0B"][idx % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, tone = "slate" }) {
  const tones =
    {
      slate:  { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-700" },
      green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700" },
      amber:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
      cyan:   { bg: "bg-cyan-50",   border: "border-cyan-200",   text: "text-cyan-700" },
    }[tone] || { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" };

  return (
    <div className={`p-5 rounded-xl border ${tones.border} ${tones.bg}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-3xl font-semibold mt-2 ${tones.text}`}>{value}</div>
    </div>
  );
}