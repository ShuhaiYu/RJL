import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { getRegionLabel } from "@/components/custom/RegionSelect";

const REGIONS = ["EAST", "SOUTH", "WEST", "NORTH", "CENTRAL"];

function RegionConfigCard({ config, onUpdate, loading }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    start_time: config.start_time || "",
    end_time: config.end_time || "",
    slot_duration: config.slot_duration || 150,
    max_capacity: config.max_capacity || 1,
  });

  useEffect(() => {
    setFormData({
      start_time: config.start_time || "",
      end_time: config.end_time || "",
      slot_duration: config.slot_duration || 150,
      max_capacity: config.max_capacity || 1,
    });
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "slot_duration" || name === "max_capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.start_time || !formData.end_time) {
      toast.error("Start time and end time are required");
      return;
    }
    if (formData.slot_duration < 15) {
      toast.error("Slot duration must be at least 15 minutes");
      return;
    }
    await onUpdate(config.region, formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      start_time: config.start_time || "",
      end_time: config.end_time || "",
      slot_duration: config.slot_duration || 150,
      max_capacity: config.max_capacity || 1,
    });
    setEditing(false);
  };

  // Calculate slots preview
  const calculateSlots = () => {
    if (!formData.start_time || !formData.end_time || !formData.slot_duration) return [];

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    const slots = [];
    let current = parseTime(formData.start_time);
    const end = parseTime(formData.end_time);

    while (current + formData.slot_duration <= end && slots.length < 10) {
      slots.push({
        start: formatTime(current),
        end: formatTime(current + formData.slot_duration),
      });
      current += formData.slot_duration;
    }

    return slots;
  };

  const slots = calculateSlots();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`px-6 py-4 border-b ${config.is_configured ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.is_configured ? "bg-green-100" : "bg-gray-200"}`}>
              <KeenIcon icon="geolocation" className={`text-xl ${config.is_configured ? "text-green-600" : "text-gray-500"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getRegionLabel(config.region)}</h3>
              <p className="text-sm text-gray-500">
                {config.is_configured ? "Configured" : "Not configured"}
              </p>
            </div>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1"
            >
              <KeenIcon icon="pencil" className="text-sm" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot Duration (minutes)
                </label>
                <Input
                  type="number"
                  name="slot_duration"
                  value={formData.slot_duration}
                  onChange={handleChange}
                  min={15}
                  max={480}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity per Slot
                </label>
                <Input
                  type="number"
                  name="max_capacity"
                  value={formData.max_capacity}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  className="w-full"
                />
              </div>
            </div>

            {/* Slots Preview */}
            {slots.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700 mb-2">
                  Time Slots Preview ({slots.length} slots):
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                      {slot.start} - {slot.end}
                    </span>
                  ))}
                  {calculateSlots().length >= 10 && (
                    <span className="px-2 py-1 text-xs text-gray-500">...</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {config.is_configured ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Work Hours</p>
                    <p className="font-medium text-gray-900">
                      {config.start_time} - {config.end_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Slot Duration</p>
                    <p className="font-medium text-gray-900">
                      {config.slot_duration} minutes
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Capacity</p>
                  <p className="font-medium text-gray-900">
                    {config.max_capacity} booking(s) per slot
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">
                Click "Edit" to configure inspection times for this region
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InspectionConfigPage() {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (token) {
      fetchConfigs();
    }
  }, [token]);

  const fetchConfigs = async () => {
    try {
      // axios interceptor will auto-add Authorization header
      const res = await axios.get(`${baseApi}/inspection/config`);
      setConfigs(res.data || []);
    } catch (error) {
      console.error("Failed to load inspection configs:", error);
      toast.error("Failed to load inspection configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (region, data) => {
    setUpdating(region);
    try {
      // axios interceptor will auto-add Authorization header
      await axios.put(`${baseApi}/inspection/config/${region}`, data);
      toast.success(`${getRegionLabel(region)} configuration updated`);
      await fetchConfigs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update configuration");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="calendar" className="text-xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inspection Configuration</h1>
              <p className="text-gray-600">Configure inspection time slots for each region</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <KeenIcon icon="information-circle" className="text-xl text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Configure the inspection hours and slot duration for each region.
              When you create an inspection schedule for a specific date, time slots will be automatically
              generated based on these settings.
            </p>
          </div>
        </div>

        {/* Region Config Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REGIONS.map((region) => {
            const config = configs.find((c) => c.region === region) || {
              region,
              is_configured: false,
            };
            return (
              <RegionConfigCard
                key={region}
                config={config}
                onUpdate={handleUpdateConfig}
                loading={updating === region}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
