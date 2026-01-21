import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { getRegionLabel } from "@/components/custom/RegionSelect";
import RegionSelect from "@/components/custom/RegionSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "closed", label: "Closed" },
];

function ScheduleCard({ schedule, onClick }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUpcoming = new Date(schedule.schedule_date) >= new Date().setHours(0, 0, 0, 0);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isUpcoming ? "bg-blue-100" : "bg-gray-100"}`}>
            <KeenIcon icon="calendar" className={`text-2xl ${isUpcoming ? "text-blue-600" : "text-gray-500"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{formatDate(schedule.schedule_date)}</h3>
            <p className="text-sm text-gray-500">{getRegionLabel(schedule.region)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          schedule.status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}>
          {schedule.status === "published" ? "Published" : "Closed"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{schedule.slots_count}</p>
          <p className="text-xs text-gray-500">Time Slots</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{schedule.notifications_count}</p>
          <p className="text-xs text-gray-500">Notifications</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{schedule.start_time}</p>
          <p className="text-xs text-gray-500">to {schedule.end_time}</p>
        </div>
      </div>

      {schedule.note && (
        <p className="mt-4 text-sm text-gray-600 border-t pt-3">
          {schedule.note}
        </p>
      )}
    </div>
  );
}

export default function InspectionSchedulesPage() {
  const navigate = useNavigate();
  const { baseApi, auth, currentUser } = useAuthContext();
  const token = auth?.accessToken;

  // Check if user can manage inspections (create/update/delete)
  const canManageInspection = ['superuser', 'admin'].includes(currentUser?.role);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: "",
    status: "all",
  });

  useEffect(() => {
    if (token) {
      fetchSchedules();
    }
  }, [filters, token]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.region) params.append("region", filters.region);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);

      // axios interceptor will auto-add Authorization header
      const res = await axios.get(`${baseApi}/inspection/schedules?${params.toString()}`);
      setSchedules(res.data || []);
    } catch (error) {
      console.error("Failed to load schedules:", error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="calendar-tick" className="text-xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inspection Schedules</h1>
              <p className="text-gray-600">Manage inspection schedules by region and date</p>
            </div>
          </div>
          {canManageInspection && (
            <Button
              onClick={() => navigate("/inspection/schedules/create")}
              className="flex items-center gap-2"
            >
              <KeenIcon icon="plus" className="text-sm" />
              Create Schedule
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <RegionSelect
                value={filters.region}
                onChange={(value) => setFilters((f) => ({ ...f, region: value }))}
                placeholder="All Regions"
                allowClear
              />
            </div>
            <div className="w-40">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((f) => ({ ...f, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeenIcon icon="calendar-remove" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules Found</h3>
            <p className="text-gray-500 mb-4">
              {filters.region || filters.status !== "all"
                ? "No schedules match the current filters"
                : canManageInspection
                  ? "Create your first inspection schedule to get started"
                  : "No inspection schedules available"}
            </p>
            {canManageInspection && (
              <Button onClick={() => navigate("/inspection/schedules/create")}>
                Create Schedule
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onClick={() => navigate(`/inspection/schedules/${schedule.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
