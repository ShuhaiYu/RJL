// src/pages/Dashboard/blocks/TasksDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";

// 定义颜色样式
const statusColorClasses = {
  UNKNOWN: "bg-amber-50 text-amber-700 border-amber-200",
  INCOMPLETE: "bg-orange-50 text-orange-700 border-orange-200",
  PROCESSING: "bg-sky-50 text-sky-700 border-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DUE_SOON: "bg-red-50 text-red-700 border-red-200",
  EXPIRED: "bg-red-100 text-red-700 border-red-200",
  AGENCY: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PROPERTY: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function TasksDashboard() {
  const navigate = useNavigate();
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const isAgencyUser = !!currentUser?.agency_id;

  // 定义统计数据初始值
  const [counts, setCounts] = useState({
    UNKNOWN: 0,
    INCOMPLETE: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    DUE_SOON: 0,
    EXPIRED: 0,
    AGENCY: 0,
    PROPERTY: 0,
  });

  // 根据用户角色设置卡片配置
  let cardConfigs = [];
  if (isAgencyUser) {
    // agency 用户显示：Incomplete, Processing, Completed, Due Soon, Expired, Properties
    cardConfigs = [
      { key: "INCOMPLETE", label: "Incomplete", route: "/property/tasks?status=INCOMPLETE" },
      { key: "PROCESSING", label: "Processing", route: "/property/tasks?status=PROCESSING" },
      { key: "COMPLETED", label: "Completed", route: "/property/tasks?status=COMPLETED" },
      { key: "DUE_SOON", label: "Due Soon", route: "/property/tasks?status=DUE_SOON" },
      { key: "EXPIRED", label: "Expired", route: "/property/tasks?status=EXPIRED" },
      { key: "PROPERTY", label: "Properties", route: "/property/my-properties" },
    ];
  } else {
    // admin/superuser显示：Unknown, Incomplete, Processing, Due Soon, Expired, Agencies, Properties
    cardConfigs = [
      { key: "UNKNOWN", label: "Unknown", route: "/property/tasks?status=UNKNOWN" },
      { key: "INCOMPLETE", label: "Incomplete", route: "/property/tasks?status=INCOMPLETE" },
      { key: "PROCESSING", label: "Processing", route: "/property/tasks?status=PROCESSING" },
      { key: "DUE_SOON", label: "Due Soon", route: "/property/tasks?status=DUE_SOON" },
      { key: "EXPIRED", label: "Expired", route: "/property/tasks?status=EXPIRED" },
      { key: "AGENCY", label: "Agencies", route: "/agencies/my-agencies" },
      { key: "PROPERTY", label: "Properties", route: "/property/my-properties" },
    ];
  }

  const fetchCounts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${baseApi}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (isAgencyUser) {
        setCounts({
          UNKNOWN: 0,
          INCOMPLETE: data.incomplete_count || 0,
          PROCESSING: data.processing_count || 0,
          COMPLETED: data.completed_count || 0,
          DUE_SOON: data.due_soon_count || 0,
          EXPIRED: data.expired_count || 0,
          PROPERTY: data.property_count || 0,
        });
      } else {
        setCounts({
          UNKNOWN: data.unknown_count || 0,
          INCOMPLETE: data.incomplete_count || 0,
          PROCESSING: data.processing_count || 0,
          DUE_SOON: data.due_soon_count || 0,
          EXPIRED: data.expired_count || 0,
          AGENCY: data.agency_count || 0,
          PROPERTY: data.property_count || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard counts:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [token]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cardConfigs.map((item) => {
          const count = counts[item.key] || 0;
          const colorClass = statusColorClasses[item.key] || "bg-gray-50 text-gray-700 border-gray-200";
          return (
            <div
              key={item.key}
              className={`border rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition ${colorClass}`}
              onClick={() => handleCardClick(item.route)}
            >
              <div className="text-xl font-semibold mb-2">{item.label}</div>
              <div className="text-3xl font-bold">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
